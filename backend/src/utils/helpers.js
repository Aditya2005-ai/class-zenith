import { PAGINATION, TIME_SLOTS } from './constants.js';

// Pagination helper
export const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Time utilities
export const parseTime = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

export const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const isValidTimeFormat = (time) => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const getTimeDifference = (startTime, endTime) => {
  return parseTime(endTime) - parseTime(startTime);
};

export const isTimeOverlap = (start1, end1, start2, end2) => {
  const s1 = parseTime(start1);
  const e1 = parseTime(end1);
  const s2 = parseTime(start2);
  const e2 = parseTime(end2);
  
  return s1 < e2 && s2 < e1;
};

// Array utilities
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

// Object utilities
export const removeEmptyFields = (obj) => {
  const cleaned = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Validation utilities
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Statistics utilities
export const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const calculateUtilization = (used, available) => {
  return calculatePercentage(used, available);
};

// Date utilities
export const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

export const isWeekend = (day) => {
  return day === 'Saturday' || day === 'Sunday';
};

export const getAcademicYear = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Academic year starts in July (month 6)
  if (month >= 6) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
};

// Search utilities
export const buildSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return {};
  
  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };
};

// Response utilities
export const buildSuccessResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

export const buildErrorResponse = (message, statusCode = 500) => {
  return {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString()
  };
};

// Conflict resolution utilities
export const findAlternativeTimeSlots = (occupiedSlots, workingHours, duration = 60) => {
  const alternatives = [];
  const startMinutes = parseTime(workingHours.start);
  const endMinutes = parseTime(workingHours.end);
  
  for (let time = startMinutes; time + duration <= endMinutes; time += duration) {
    const slotStart = formatTime(time);
    const slotEnd = formatTime(time + duration);
    
    const isOccupied = occupiedSlots.some(slot => 
      isTimeOverlap(slotStart, slotEnd, slot.startTime, slot.endTime)
    );
    
    if (!isOccupied) {
      alternatives.push({ startTime: slotStart, endTime: slotEnd });
    }
  }
  
  return alternatives;
};

// Workload calculation utilities
export const calculateFacultyWorkload = (schedule, facultyId) => {
  let totalHours = 0;
  
  schedule.forEach(day => {
    day.timeSlots.forEach(slot => {
      if (slot.faculty && slot.faculty.toString() === facultyId.toString() && 
          slot.type !== 'Break' && slot.type !== 'Lunch') {
        totalHours += getTimeDifference(slot.startTime, slot.endTime) / 60;
      }
    });
  });
  
  return totalHours;
};

export const calculateClassroomUtilization = (schedule, classroomId, totalAvailableHours) => {
  let usedHours = 0;
  
  schedule.forEach(day => {
    day.timeSlots.forEach(slot => {
      if (slot.classroom && slot.classroom.toString() === classroomId.toString() && 
          slot.type !== 'Break' && slot.type !== 'Lunch') {
        usedHours += getTimeDifference(slot.startTime, slot.endTime) / 60;
      }
    });
  });
  
  return calculatePercentage(usedHours, totalAvailableHours);
};
