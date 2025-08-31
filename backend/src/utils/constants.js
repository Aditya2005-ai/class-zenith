// Application constants
export const USER_ROLES = {
  ADMIN: 'admin',
  FACULTY: 'faculty',
  COORDINATOR: 'coordinator',
  VIEWER: 'viewer'
};

export const TIMETABLE_STATUS = {
  DRAFT: 'draft',
  GENERATED: 'generated',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

export const CONFLICT_TYPES = {
  FACULTY_CONFLICT: 'faculty_conflict',
  CLASSROOM_CONFLICT: 'classroom_conflict',
  BATCH_CONFLICT: 'batch_conflict',
  RESOURCE_CONFLICT: 'resource_conflict'
};

export const CONFLICT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const OPTIMIZATION_ALGORITHMS = {
  GENETIC: 'genetic',
  CONSTRAINT_SATISFACTION: 'constraint_satisfaction',
  SIMULATED_ANNEALING: 'simulated_annealing',
  HYBRID: 'hybrid'
};

export const CLASSROOM_TYPES = {
  THEORY: 'Theory',
  PRACTICAL_LAB: 'Practical Lab',
  SEMINAR_HALL: 'Seminar Hall',
  AUDITORIUM: 'Auditorium',
  COMPUTER_LAB: 'Computer Lab',
  RESEARCH_LAB: 'Research Lab'
};

export const SUBJECT_TYPES = {
  THEORY: 'Theory',
  PRACTICAL: 'Practical',
  TUTORIAL: 'Tutorial',
  SEMINAR: 'Seminar',
  PROJECT: 'Project',
  ELECTIVE: 'Elective'
};

export const PROGRAMS = {
  B_PHARM: 'B.Pharm',
  M_PHARM: 'M.Pharm',
  PHARM_D: 'Pharm.D',
  B_TECH: 'B.Tech',
  M_TECH: 'M.Tech',
  BCA: 'BCA',
  MCA: 'MCA',
  MBA: 'MBA'
};

export const FACULTY_DESIGNATIONS = {
  PROFESSOR: 'Professor',
  ASSOCIATE_PROFESSOR: 'Associate Professor',
  ASSISTANT_PROFESSOR: 'Assistant Professor',
  LECTURER: 'Lecturer',
  GUEST_FACULTY: 'Guest Faculty'
};

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const TIME_SLOTS = {
  MORNING_START: '09:00',
  MORNING_END: '12:00',
  AFTERNOON_START: '13:00',
  AFTERNOON_END: '17:00',
  EVENING_START: '17:30',
  EVENING_END: '20:30'
};

export const DEFAULT_CONSTRAINTS = {
  MAX_CLASSES_PER_DAY: 6,
  MAX_CONSECUTIVE_CLASSES: 3,
  MIN_BREAK_BETWEEN_CLASSES: 15,
  LUNCH_BREAK_DURATION: 60,
  CLASS_DURATION: 60
};

export const OPTIMIZATION_OBJECTIVES = {
  MINIMIZE_CONFLICTS: 'minimize_conflicts',
  MAXIMIZE_UTILIZATION: 'maximize_utilization',
  BALANCE_WORKLOAD: 'balance_workload',
  MINIMIZE_GAPS: 'minimize_gaps'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};
