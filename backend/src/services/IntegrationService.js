import axios from 'axios';
import { logger } from '../utils/logger.js';

class IntegrationService {
  constructor() {
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  }

  // Transform backend data to frontend format
  transformFacultyData(faculty) {
    return faculty.map(f => ({
      id: f._id,
      name: f.name,
      code: f.code,
      department: f.department?.name || 'Unknown',
      subjects: f.subjects?.map(s => s.code || s.name).join(', ') || '',
      maxHours: f.workload.maxHoursPerWeek,
      currentHours: f.workload.currentHours,
      availability: this.calculateAvailabilityStatus(f),
      email: f.email
    }));
  }

  transformClassroomData(classrooms) {
    return classrooms.map(c => ({
      id: c._id,
      name: c.name,
      type: c.type,
      capacity: c.capacity,
      building: c.location.building,
      floor: c.location.floor,
      equipment: c.facilities || [],
      utilization: c.utilization?.utilizationPercentage || 0,
      status: this.getClassroomStatus(c)
    }));
  }

  transformTimetableData(timetable) {
    return {
      id: timetable._id,
      name: timetable.name,
      batch: timetable.batch?.name,
      department: timetable.department?.name,
      status: timetable.status,
      schedule: this.transformScheduleData(timetable.schedule),
      conflicts: timetable.conflicts?.length || 0,
      optimization: {
        algorithm: timetable.optimization?.algorithm,
        score: timetable.optimization?.score?.overall
      },
      createdAt: timetable.createdAt,
      updatedAt: timetable.updatedAt
    };
  }

  transformScheduleData(schedule) {
    return schedule.map(day => ({
      day: day.day,
      timeSlots: day.timeSlots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        subject: slot.subject?.name || slot.subject?.code,
        faculty: slot.faculty?.name || slot.faculty?.code,
        classroom: slot.classroom?.name || slot.classroom?.code,
        type: slot.type
      }))
    }));
  }

  calculateAvailabilityStatus(faculty) {
    const utilization = (faculty.workload.currentHours / faculty.workload.maxHoursPerWeek) * 100;
    
    if (utilization >= 100) return 'Overloaded';
    if (utilization >= 80) return 'High Load';
    if (utilization >= 60) return 'Moderate';
    return 'Available';
  }

  getClassroomStatus(classroom) {
    const utilization = classroom.utilization?.utilizationPercentage || 0;
    
    if (utilization >= 90) return 'High Demand';
    if (utilization >= 70) return 'Moderate Use';
    return 'Available';
  }

  // API response formatters
  formatSuccessResponse(data, message = 'Success') {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  formatErrorResponse(message, error = null, statusCode = 500) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (error && process.env.NODE_ENV === 'development') {
      response.error = error.message;
      response.stack = error.stack;
    }

    return response;
  }

  formatPaginationResponse(data, pagination) {
    return {
      success: true,
      data,
      pagination: {
        current: pagination.current,
        pages: pagination.pages,
        total: pagination.total,
        hasNext: pagination.current < pagination.pages,
        hasPrev: pagination.current > 1
      },
      timestamp: new Date().toISOString()
    };
  }

  // Validation helpers
  validateTimeFormat(time) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  validateDateFormat(date) {
    return !isNaN(Date.parse(date));
  }

  validateObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  // Data conversion utilities
  parseTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  formatMinutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Frontend notification helpers
  async notifyFrontend(event, data) {
    try {
      // This would integrate with WebSocket or Server-Sent Events
      logger.info(`Frontend notification: ${event}`, data);
      
      // For now, just log the notification
      // In production, this would send real-time updates to the frontend
      
    } catch (error) {
      logger.error('Failed to notify frontend:', error);
    }
  }

  // Export utilities for frontend integration
  generateCSVExport(data, headers) {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => `"${row[header] || ''}"`).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  generateJSONExport(data) {
    return JSON.stringify(data, null, 2);
  }

  // Frontend compatibility helpers
  ensureFrontendCompatibility(data) {
    // Convert MongoDB ObjectIds to strings
    if (data && typeof data === 'object') {
      if (data._id) {
        data.id = data._id.toString();
        delete data._id;
      }
      
      // Recursively process nested objects
      Object.keys(data).forEach(key => {
        if (data[key] && typeof data[key] === 'object') {
          if (Array.isArray(data[key])) {
            data[key] = data[key].map(item => this.ensureFrontendCompatibility(item));
          } else {
            data[key] = this.ensureFrontendCompatibility(data[key]);
          }
        }
      });
    }
    
    return data;
  }
}

export default new IntegrationService();
