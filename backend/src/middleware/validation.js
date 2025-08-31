import { body } from 'express-validator';

// Common validation rules
export const validateObjectId = (field) => 
  body(field).isMongoId().withMessage(`${field} must be a valid ObjectId`);

export const validateEmail = (field = 'email') =>
  body(field).isEmail().normalizeEmail().withMessage('Must be a valid email address');

export const validatePassword = (field = 'password') =>
  body(field).isLength({ min: 6 }).withMessage('Password must be at least 6 characters long');

export const validateTimeFormat = (field) =>
  body(field).matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage(`${field} must be in HH:MM format`);

export const validateDateFormat = (field) =>
  body(field).isISO8601().withMessage(`${field} must be a valid date`);

// Faculty validation rules
export const facultyValidation = [
  body('employeeId').notEmpty().trim().withMessage('Employee ID is required'),
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('code').notEmpty().trim().toUpperCase().withMessage('Code is required'),
  validateEmail(),
  validateObjectId('department'),
  body('designation').isIn(['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Guest Faculty'])
    .withMessage('Invalid designation')
];

// Classroom validation rules
export const classroomValidation = [
  body('name').notEmpty().trim().withMessage('Classroom name is required'),
  body('code').notEmpty().trim().toUpperCase().withMessage('Classroom code is required'),
  body('type').isIn(['Theory', 'Practical Lab', 'Seminar Hall', 'Auditorium', 'Computer Lab', 'Research Lab'])
    .withMessage('Invalid classroom type'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  body('location.building').notEmpty().trim().withMessage('Building is required'),
  body('location.floor').notEmpty().trim().withMessage('Floor is required')
];

// Subject validation rules
export const subjectValidation = [
  body('name').notEmpty().trim().withMessage('Subject name is required'),
  body('code').notEmpty().trim().toUpperCase().withMessage('Subject code is required'),
  validateObjectId('department'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
  body('program').isIn(['B.Pharm', 'M.Pharm', 'Pharm.D', 'B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA'])
    .withMessage('Invalid program'),
  body('type').isIn(['Theory', 'Practical', 'Tutorial', 'Seminar', 'Project', 'Elective'])
    .withMessage('Invalid subject type'),
  body('credits').isNumeric().withMessage('Credits must be numeric')
];

// Batch validation rules
export const batchValidation = [
  body('name').notEmpty().trim().withMessage('Batch name is required'),
  body('code').notEmpty().trim().toUpperCase().withMessage('Batch code is required'),
  body('program').isIn(['B.Pharm', 'M.Pharm', 'Pharm.D', 'B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA'])
    .withMessage('Invalid program'),
  body('year').isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8'),
  body('section').notEmpty().trim().toUpperCase().withMessage('Section is required'),
  validateObjectId('department'),
  body('students.total').isInt({ min: 1 }).withMessage('Total students must be positive'),
  body('academicYear').notEmpty().trim().withMessage('Academic year is required')
];

// Timetable validation rules
export const timetableValidation = [
  body('name').notEmpty().trim().withMessage('Timetable name is required'),
  body('academicYear').notEmpty().trim().withMessage('Academic year is required'),
  body('semester').isIn(['Odd', 'Even']).withMessage('Semester must be Odd or Even'),
  validateObjectId('department'),
  body('type').isIn(['batch', 'faculty', 'classroom', 'master']).withMessage('Invalid timetable type')
];
