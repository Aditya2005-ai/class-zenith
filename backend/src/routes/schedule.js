import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Timetable from '../models/Timetable.js';
import Faculty from '../models/Faculty.js';
import Classroom from '../models/Classroom.js';
import Batch from '../models/Batch.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/schedules/faculty/:facultyId
// @desc    Get faculty schedule
// @access  Private
router.get('/faculty/:facultyId', authenticate, [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('academicYear').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { facultyId } = req.params;
    const { startDate, endDate, academicYear } = req.query;

    let query = {
      'schedule.timeSlots.faculty': facultyId,
      status: { $in: ['approved', 'published'] },
      isActive: true
    };

    if (academicYear) {
      query.academicYear = academicYear;
    }

    const timetables = await Timetable.find(query)
      .populate('batch', 'name code program year semester section')
      .populate('schedule.timeSlots.subject', 'name code type')
      .populate('schedule.timeSlots.classroom', 'name code type location')
      .populate('schedule.timeSlots.batch', 'name code');

    // Extract faculty-specific schedule
    const facultySchedule = [];
    timetables.forEach(timetable => {
      timetable.schedule.forEach(day => {
        const facultySlots = day.timeSlots.filter(slot => 
          slot.faculty && slot.faculty.equals(facultyId)
        );
        
        if (facultySlots.length > 0) {
          facultySchedule.push({
            day: day.day,
            timeSlots: facultySlots,
            timetableId: timetable._id,
            batch: timetable.batch
          });
        }
      });
    });

    res.json({
      success: true,
      data: { 
        schedule: facultySchedule,
        summary: {
          totalClasses: facultySchedule.reduce((sum, day) => sum + day.timeSlots.length, 0),
          daysWithClasses: facultySchedule.length
        }
      }
    });
  } catch (error) {
    logger.error('Get faculty schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty schedule',
      error: error.message
    });
  }
});

// @route   GET /api/schedules/classroom/:classroomId
// @desc    Get classroom schedule
// @access  Private
router.get('/classroom/:classroomId', authenticate, [
  query('academicYear').optional().trim()
], async (req, res) => {
  try {
    const { classroomId } = req.params;
    const { academicYear } = req.query;

    let query = {
      'schedule.timeSlots.classroom': classroomId,
      status: { $in: ['approved', 'published'] },
      isActive: true
    };

    if (academicYear) {
      query.academicYear = academicYear;
    }

    const timetables = await Timetable.find(query)
      .populate('batch', 'name code program year semester')
      .populate('schedule.timeSlots.subject', 'name code type')
      .populate('schedule.timeSlots.faculty', 'name code')
      .populate('schedule.timeSlots.batch', 'name code');

    const classroomSchedule = [];
    timetables.forEach(timetable => {
      timetable.schedule.forEach(day => {
        const classroomSlots = day.timeSlots.filter(slot => 
          slot.classroom && slot.classroom.equals(classroomId)
        );
        
        if (classroomSlots.length > 0) {
          classroomSchedule.push({
            day: day.day,
            timeSlots: classroomSlots,
            timetableId: timetable._id
          });
        }
      });
    });

    res.json({
      success: true,
      data: { 
        schedule: classroomSchedule,
        summary: {
          totalBookings: classroomSchedule.reduce((sum, day) => sum + day.timeSlots.length, 0),
          daysBooked: classroomSchedule.length
        }
      }
    });
  } catch (error) {
    logger.error('Get classroom schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classroom schedule',
      error: error.message
    });
  }
});

// @route   GET /api/schedules/batch/:batchId
// @desc    Get batch schedule
// @access  Private
router.get('/batch/:batchId', authenticate, async (req, res) => {
  try {
    const { batchId } = req.params;

    const timetable = await Timetable.findOne({
      batch: batchId,
      status: { $in: ['approved', 'published'] },
      isActive: true
    })
    .populate('batch', 'name code program year semester section')
    .populate('schedule.timeSlots.subject', 'name code type')
    .populate('schedule.timeSlots.faculty', 'name code designation')
    .populate('schedule.timeSlots.classroom', 'name code type location capacity');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'No published timetable found for this batch'
      });
    }

    res.json({
      success: true,
      data: { 
        timetable,
        summary: {
          totalClasses: timetable.statistics?.totalClasses || 0,
          workingDays: timetable.schedule.length,
          conflicts: timetable.conflicts.length
        }
      }
    });
  } catch (error) {
    logger.error('Get batch schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch schedule',
      error: error.message
    });
  }
});

// @route   GET /api/schedules/conflicts
// @desc    Get all scheduling conflicts
// @access  Private
router.get('/conflicts', authenticate, [
  query('department').optional().isMongoId(),
  query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('type').optional().isIn(['faculty_conflict', 'classroom_conflict', 'batch_conflict', 'resource_conflict'])
], async (req, res) => {
  try {
    const { department, severity, type } = req.query;

    let query = {
      status: { $in: ['generated', 'under_review', 'approved', 'published'] },
      isActive: true,
      'conflicts.0': { $exists: true } // Has conflicts
    };

    if (department) {
      query.department = department;
    }

    const timetables = await Timetable.find(query)
      .populate('batch', 'name code')
      .populate('department', 'name code')
      .select('name batch department conflicts status');

    let allConflicts = [];
    timetables.forEach(timetable => {
      const filteredConflicts = timetable.conflicts.filter(conflict => {
        if (severity && conflict.severity !== severity) return false;
        if (type && conflict.type !== type) return false;
        return true;
      });

      filteredConflicts.forEach(conflict => {
        allConflicts.push({
          ...conflict.toObject(),
          timetableId: timetable._id,
          timetableName: timetable.name,
          batch: timetable.batch,
          department: timetable.department
        });
      });
    });

    // Group conflicts by type and severity
    const summary = {
      total: allConflicts.length,
      byType: {},
      bySeverity: {},
      byDepartment: {}
    };

    allConflicts.forEach(conflict => {
      // By type
      summary.byType[conflict.type] = (summary.byType[conflict.type] || 0) + 1;
      
      // By severity
      summary.bySeverity[conflict.severity] = (summary.bySeverity[conflict.severity] || 0) + 1;
      
      // By department
      const deptName = conflict.department?.name || 'Unknown';
      summary.byDepartment[deptName] = (summary.byDepartment[deptName] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        conflicts: allConflicts,
        summary
      }
    });
  } catch (error) {
    logger.error('Get conflicts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conflicts',
      error: error.message
    });
  }
});

// @route   POST /api/schedules/resolve-conflict
// @desc    Resolve scheduling conflict
// @access  Private (Admin/Coordinator)
router.post('/resolve-conflict', authenticate, authorize('admin', 'coordinator'), [
  body('timetableId').isMongoId(),
  body('conflictId').notEmpty(),
  body('resolution').notEmpty().trim(),
  body('newSchedule').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { timetableId, conflictId, resolution, newSchedule } = req.body;

    const timetable = await Timetable.findById(timetableId);
    
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    // Find and update conflict
    const conflict = timetable.conflicts.id(conflictId);
    if (!conflict) {
      return res.status(404).json({
        success: false,
        message: 'Conflict not found'
      });
    }

    conflict.isResolved = true;
    conflict.resolution = resolution;

    // Update schedule if provided
    if (newSchedule) {
      // Validate new schedule doesn't create new conflicts
      const tempTimetable = new Timetable({
        ...timetable.toObject(),
        schedule: newSchedule
      });
      
      const newConflicts = tempTimetable.detectConflicts();
      if (newConflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Proposed schedule creates new conflicts',
          data: { newConflicts }
        });
      }

      timetable.schedule = newSchedule;
    }

    await timetable.save();

    logger.info(`Conflict resolved in timetable ${timetableId} by ${req.user.username}`);

    res.json({
      success: true,
      message: 'Conflict resolved successfully',
      data: { timetable }
    });
  } catch (error) {
    logger.error('Resolve conflict error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve conflict',
      error: error.message
    });
  }
});

// @route   GET /api/schedules/suggestions/:timetableId
// @desc    Get scheduling suggestions for optimization
// @access  Private
router.get('/suggestions/:timetableId', authenticate, async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.timetableId)
      .populate('batch')
      .populate('schedule.timeSlots.faculty', 'name workload preferences')
      .populate('schedule.timeSlots.classroom', 'name capacity utilization');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    const suggestions = [];

    // Analyze workload distribution
    const facultyWorkload = new Map();
    timetable.schedule.forEach(day => {
      day.timeSlots.forEach(slot => {
        if (slot.faculty && slot.type !== 'Break' && slot.type !== 'Lunch') {
          const current = facultyWorkload.get(slot.faculty._id.toString()) || 0;
          facultyWorkload.set(slot.faculty._id.toString(), current + 1);
        }
      });
    });

    // Suggest workload balancing
    const avgWorkload = Array.from(facultyWorkload.values()).reduce((sum, load) => sum + load, 0) / facultyWorkload.size;
    facultyWorkload.forEach((load, facultyId) => {
      if (load > avgWorkload * 1.2) {
        suggestions.push({
          type: 'workload_balance',
          priority: 'medium',
          description: `Faculty ${facultyId} has high workload (${load} classes vs avg ${avgWorkload.toFixed(1)})`,
          recommendation: 'Consider redistributing some classes to other qualified faculty'
        });
      }
    });

    // Analyze classroom utilization
    const classroomUsage = new Map();
    timetable.schedule.forEach(day => {
      day.timeSlots.forEach(slot => {
        if (slot.classroom && slot.type !== 'Break' && slot.type !== 'Lunch') {
          const current = classroomUsage.get(slot.classroom._id.toString()) || 0;
          classroomUsage.set(slot.classroom._id.toString(), current + 1);
        }
      });
    });

    // Suggest better classroom utilization
    classroomUsage.forEach((usage, classroomId) => {
      if (usage < 10) { // Less than 10 hours per week
        suggestions.push({
          type: 'classroom_utilization',
          priority: 'low',
          description: `Classroom ${classroomId} is underutilized (${usage} hours/week)`,
          recommendation: 'Consider consolidating classes or using this room for other activities'
        });
      }
    });

    // Check for gaps in schedule
    timetable.schedule.forEach(day => {
      const classSlots = day.timeSlots
        .filter(slot => slot.type !== 'Break' && slot.type !== 'Lunch' && slot.type !== 'Free')
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      let gapCount = 0;
      for (let i = 1; i < classSlots.length; i++) {
        const prevEnd = classSlots[i-1].endTime;
        const currentStart = classSlots[i].startTime;
        
        // Simple time comparison (assuming HH:MM format)
        if (currentStart > prevEnd) {
          gapCount++;
        }
      }

      if (gapCount > 2) {
        suggestions.push({
          type: 'schedule_gaps',
          priority: 'medium',
          description: `${day.day} has ${gapCount} gaps between classes`,
          recommendation: 'Consider rearranging classes to minimize gaps'
        });
      }
    });

    res.json({
      success: true,
      data: {
        suggestions,
        summary: {
          total: suggestions.length,
          high: suggestions.filter(s => s.priority === 'high').length,
          medium: suggestions.filter(s => s.priority === 'medium').length,
          low: suggestions.filter(s => s.priority === 'low').length
        }
      }
    });
  } catch (error) {
    logger.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate suggestions',
      error: error.message
    });
  }
});

export default router;
