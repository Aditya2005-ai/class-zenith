import Faculty from '../models/Faculty.js';
import Classroom from '../models/Classroom.js';
import Batch from '../models/Batch.js';
import { logger } from '../utils/logger.js';

class ConflictDetector {
  constructor() {
    this.conflictTypes = {
      FACULTY_DOUBLE_BOOKING: 'faculty_conflict',
      CLASSROOM_DOUBLE_BOOKING: 'classroom_conflict',
      BATCH_OVERLAP: 'batch_conflict',
      RESOURCE_UNAVAILABLE: 'resource_conflict',
      CAPACITY_EXCEEDED: 'capacity_conflict',
      PREFERENCE_VIOLATION: 'preference_violation'
    };
  }

  async detectAllConflicts(schedule, context = {}) {
    const conflicts = [];
    
    try {
      // Detect different types of conflicts
      const facultyConflicts = this.detectFacultyConflicts(schedule);
      const classroomConflicts = this.detectClassroomConflicts(schedule);
      const batchConflicts = this.detectBatchConflicts(schedule);
      const capacityConflicts = await this.detectCapacityConflicts(schedule);
      const availabilityConflicts = await this.detectAvailabilityConflicts(schedule);
      const preferenceViolations = await this.detectPreferenceViolations(schedule, context);

      conflicts.push(
        ...facultyConflicts,
        ...classroomConflicts,
        ...batchConflicts,
        ...capacityConflicts,
        ...availabilityConflicts,
        ...preferenceViolations
      );

      return this.prioritizeConflicts(conflicts);
    } catch (error) {
      logger.error('Conflict detection failed:', error);
      throw error;
    }
  }

  detectFacultyConflicts(schedule) {
    const conflicts = [];
    const facultyTimeMap = new Map();

    schedule.forEach(day => {
      day.timeSlots.forEach(slot => {
        if (slot.faculty && slot.type !== 'Break' && slot.type !== 'Lunch' && slot.type !== 'Free') {
          const key = `${slot.faculty}-${day.day}-${slot.startTime}-${slot.endTime}`;
          
          if (facultyTimeMap.has(key)) {
            const existingSlot = facultyTimeMap.get(key);
            conflicts.push({
              type: this.conflictTypes.FACULTY_DOUBLE_BOOKING,
              severity: 'high',
              description: `Faculty double booking on ${day.day} ${slot.startTime}-${slot.endTime}`,
              affectedEntities: [
                {
                  entityType: 'Faculty',
                  entityId: slot.faculty,
                  timeSlot: { day: day.day, startTime: slot.startTime, endTime: slot.endTime }
                }
              ],
              conflictingSlots: [existingSlot, slot],
              isResolved: false
            });
          } else {
            facultyTimeMap.set(key, slot);
          }
        }
      });
    });

    return conflicts;
  }

  detectClassroomConflicts(schedule) {
    const conflicts = [];
    const classroomTimeMap = new Map();

    schedule.forEach(day => {
      day.timeSlots.forEach(slot => {
        if (slot.classroom && slot.type !== 'Break' && slot.type !== 'Lunch' && slot.type !== 'Free') {
          const key = `${slot.classroom}-${day.day}-${slot.startTime}-${slot.endTime}`;
          
          if (classroomTimeMap.has(key)) {
            const existingSlot = classroomTimeMap.get(key);
            conflicts.push({
              type: this.conflictTypes.CLASSROOM_DOUBLE_BOOKING,
              severity: 'high',
              description: `Classroom double booking on ${day.day} ${slot.startTime}-${slot.endTime}`,
              affectedEntities: [
                {
                  entityType: 'Classroom',
                  entityId: slot.classroom,
                  timeSlot: { day: day.day, startTime: slot.startTime, endTime: slot.endTime }
                }
              ],
              conflictingSlots: [existingSlot, slot],
              isResolved: false
            });
          } else {
            classroomTimeMap.set(key, slot);
          }
        }
      });
    });

    return conflicts;
  }

  detectBatchConflicts(schedule) {
    const conflicts = [];
    const batchTimeMap = new Map();

    schedule.forEach(day => {
      day.timeSlots.forEach(slot => {
        if (slot.batch && slot.type !== 'Break' && slot.type !== 'Lunch' && slot.type !== 'Free') {
          const key = `${slot.batch}-${day.day}-${slot.startTime}-${slot.endTime}`;
          
          if (batchTimeMap.has(key)) {
            const existingSlot = batchTimeMap.get(key);
            conflicts.push({
              type: this.conflictTypes.BATCH_OVERLAP,
              severity: 'critical',
              description: `Batch has overlapping classes on ${day.day} ${slot.startTime}-${slot.endTime}`,
              affectedEntities: [
                {
                  entityType: 'Batch',
                  entityId: slot.batch,
                  timeSlot: { day: day.day, startTime: slot.startTime, endTime: slot.endTime }
                }
              ],
              conflictingSlots: [existingSlot, slot],
              isResolved: false
            });
          } else {
            batchTimeMap.set(key, slot);
          }
        }
      });
    });

    return conflicts;
  }

  async detectCapacityConflicts(schedule) {
    const conflicts = [];
    
    try {
      const classroomIds = new Set();
      const batchIds = new Set();

      // Collect unique IDs
      schedule.forEach(day => {
        day.timeSlots.forEach(slot => {
          if (slot.classroom) classroomIds.add(slot.classroom);
          if (slot.batch) batchIds.add(slot.batch);
        });
      });

      // Fetch classroom and batch data
      const classrooms = await Classroom.find({ _id: { $in: Array.from(classroomIds) } });
      const batches = await Batch.find({ _id: { $in: Array.from(batchIds) } });

      const classroomMap = new Map(classrooms.map(c => [c._id.toString(), c]));
      const batchMap = new Map(batches.map(b => [b._id.toString(), b]));

      schedule.forEach(day => {
        day.timeSlots.forEach(slot => {
          if (slot.classroom && slot.batch) {
            const classroom = classroomMap.get(slot.classroom.toString());
            const batch = batchMap.get(slot.batch.toString());

            if (classroom && batch && batch.students.total > classroom.capacity) {
              conflicts.push({
                type: this.conflictTypes.CAPACITY_EXCEEDED,
                severity: 'medium',
                description: `Classroom capacity (${classroom.capacity}) exceeded by batch size (${batch.students.total})`,
                affectedEntities: [
                  {
                    entityType: 'Classroom',
                    entityId: slot.classroom,
                    timeSlot: { day: day.day, startTime: slot.startTime, endTime: slot.endTime }
                  },
                  {
                    entityType: 'Batch',
                    entityId: slot.batch,
                    timeSlot: { day: day.day, startTime: slot.startTime, endTime: slot.endTime }
                  }
                ],
                isResolved: false
              });
            }
          }
        });
      });
    } catch (error) {
      logger.error('Capacity conflict detection failed:', error);
    }

    return conflicts;
  }

  async detectAvailabilityConflicts(schedule) {
    const conflicts = [];
    
    try {
      const facultyIds = new Set();
      const classroomIds = new Set();

      schedule.forEach(day => {
        day.timeSlots.forEach(slot => {
          if (slot.faculty) facultyIds.add(slot.faculty);
          if (slot.classroom) classroomIds.add(slot.classroom);
        });
      });

      const faculty = await Faculty.find({ _id: { $in: Array.from(facultyIds) } });
      const classrooms = await Classroom.find({ _id: { $in: Array.from(classroomIds) } });

      const facultyMap = new Map(faculty.map(f => [f._id.toString(), f]));
      const classroomMap = new Map(classrooms.map(c => [c._id.toString(), c]));

      schedule.forEach(day => {
        day.timeSlots.forEach(slot => {
          // Check faculty availability
          if (slot.faculty) {
            const facultyMember = facultyMap.get(slot.faculty.toString());
            if (facultyMember && !facultyMember.isAvailableAt(day.day, slot.startTime, slot.endTime)) {
              conflicts.push({
                type: this.conflictTypes.RESOURCE_UNAVAILABLE,
                severity: 'high',
                description: `Faculty not available on ${day.day} ${slot.startTime}-${slot.endTime}`,
                affectedEntities: [
                  {
                    entityType: 'Faculty',
                    entityId: slot.faculty,
                    timeSlot: { day: day.day, startTime: slot.startTime, endTime: slot.endTime }
                  }
                ],
                isResolved: false
              });
            }
          }

          // Check classroom availability
          if (slot.classroom) {
            const classroom = classroomMap.get(slot.classroom.toString());
            if (classroom && !classroom.isAvailableAt(day.day, slot.startTime, slot.endTime)) {
              conflicts.push({
                type: this.conflictTypes.RESOURCE_UNAVAILABLE,
                severity: 'high',
                description: `Classroom not available on ${day.day} ${slot.startTime}-${slot.endTime}`,
                affectedEntities: [
                  {
                    entityType: 'Classroom',
                    entityId: slot.classroom,
                    timeSlot: { day: day.day, startTime: slot.startTime, endTime: slot.endTime }
                  }
                ],
                isResolved: false
              });
            }
          }
        });
      });
    } catch (error) {
      logger.error('Availability conflict detection failed:', error);
    }

    return conflicts;
  }

  async detectPreferenceViolations(schedule, context) {
    const conflicts = [];
    
    try {
      // This would check against faculty and batch preferences
      // Implementation depends on specific preference rules
      
      const facultyIds = new Set();
      schedule.forEach(day => {
        day.timeSlots.forEach(slot => {
          if (slot.faculty) facultyIds.add(slot.faculty);
        });
      });

      const faculty = await Faculty.find({ _id: { $in: Array.from(facultyIds) } });
      const facultyMap = new Map(faculty.map(f => [f._id.toString(), f]));

      schedule.forEach(day => {
        day.timeSlots.forEach(slot => {
          if (slot.faculty) {
            const facultyMember = facultyMap.get(slot.faculty.toString());
            
            if (facultyMember && facultyMember.preferences) {
              // Check avoid time slots
              if (facultyMember.preferences.avoidTimeSlots && 
                  facultyMember.preferences.avoidTimeSlots.includes(slot.startTime)) {
                conflicts.push({
                  type: this.conflictTypes.PREFERENCE_VIOLATION,
                  severity: 'low',
                  description: `Faculty prefers to avoid ${slot.startTime} time slot`,
                  affectedEntities: [
                    {
                      entityType: 'Faculty',
                      entityId: slot.faculty,
                      timeSlot: { day: day.day, startTime: slot.startTime, endTime: slot.endTime }
                    }
                  ],
                  isResolved: false
                });
              }
            }
          }
        });
      });
    } catch (error) {
      logger.error('Preference violation detection failed:', error);
    }

    return conflicts;
  }

  prioritizeConflicts(conflicts) {
    const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    
    return conflicts.sort((a, b) => {
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      
      // Secondary sort by type priority
      const typePriority = {
        [this.conflictTypes.BATCH_OVERLAP]: 5,
        [this.conflictTypes.FACULTY_DOUBLE_BOOKING]: 4,
        [this.conflictTypes.CLASSROOM_DOUBLE_BOOKING]: 3,
        [this.conflictTypes.CAPACITY_EXCEEDED]: 2,
        [this.conflictTypes.RESOURCE_UNAVAILABLE]: 2,
        [this.conflictTypes.PREFERENCE_VIOLATION]: 1
      };
      
      return (typePriority[b.type] || 0) - (typePriority[a.type] || 0);
    });
  }

  generateResolutionSuggestions(conflicts) {
    return conflicts.map(conflict => ({
      ...conflict,
      suggestions: this.getSuggestionsForConflict(conflict)
    }));
  }

  getSuggestionsForConflict(conflict) {
    const suggestions = [];

    switch (conflict.type) {
      case this.conflictTypes.FACULTY_DOUBLE_BOOKING:
        suggestions.push(
          'Assign one of the classes to a different qualified faculty member',
          'Reschedule one of the conflicting classes to a different time slot',
          'Check if the faculty member can handle both classes simultaneously (team teaching)'
        );
        break;

      case this.conflictTypes.CLASSROOM_DOUBLE_BOOKING:
        suggestions.push(
          'Move one class to an available classroom of the same type',
          'Reschedule one of the conflicting classes',
          'Check if a larger classroom can accommodate both groups'
        );
        break;

      case this.conflictTypes.BATCH_OVERLAP:
        suggestions.push(
          'Reschedule one of the overlapping classes',
          'Split the batch if the subject allows',
          'Use different classrooms for parallel sessions'
        );
        break;

      case this.conflictTypes.CAPACITY_EXCEEDED:
        suggestions.push(
          'Move to a larger classroom',
          'Split the batch into smaller groups',
          'Use multiple classrooms with video conferencing'
        );
        break;

      case this.conflictTypes.RESOURCE_UNAVAILABLE:
        suggestions.push(
          'Reschedule to when the resource is available',
          'Find an alternative resource',
          'Adjust the resource availability if possible'
        );
        break;

      case this.conflictTypes.PREFERENCE_VIOLATION:
        suggestions.push(
          'Reschedule to preferred time slots if available',
          'Discuss with faculty about flexibility',
          'Consider the preference as a soft constraint'
        );
        break;

      default:
        suggestions.push('Manual review required for this conflict type');
    }

    return suggestions;
  }
}

export default ConflictDetector;
