import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    enum: ['Odd', 'Even'],
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  },
  type: {
    type: String,
    enum: ['batch', 'faculty', 'classroom', 'master'],
    required: true
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    timeSlots: [{
      startTime: {
        type: String,
        required: true
      },
      endTime: {
        type: String,
        required: true
      },
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      },
      faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
      },
      classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom'
      },
      batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch'
      },
      type: {
        type: String,
        enum: ['Theory', 'Practical', 'Tutorial', 'Break', 'Lunch', 'Free'],
        default: 'Theory'
      },
      isFixed: {
        type: Boolean,
        default: false
      },
      notes: String
    }]
  }],
  constraints: {
    maxClassesPerDay: Number,
    maxConsecutiveClasses: Number,
    minBreakBetweenClasses: Number,
    lunchBreak: {
      startTime: String,
      endTime: String,
      isFixed: Boolean
    },
    workingHours: {
      startTime: String,
      endTime: String
    }
  },
  optimization: {
    algorithm: {
      type: String,
      enum: ['genetic', 'constraint_satisfaction', 'simulated_annealing', 'hybrid'],
      default: 'genetic'
    },
    objectives: [{
      type: String,
      enum: ['minimize_conflicts', 'maximize_utilization', 'balance_workload', 'minimize_gaps'],
      weight: Number
    }],
    parameters: {
      populationSize: Number,
      generations: Number,
      mutationRate: Number,
      crossoverRate: Number
    },
    score: {
      overall: Number,
      conflicts: Number,
      utilization: Number,
      workloadBalance: Number
    }
  },
  status: {
    type: String,
    enum: ['draft', 'generated', 'under_review', 'approved', 'published', 'archived'],
    default: 'draft'
  },
  workflow: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reviewers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'changes_requested']
      },
      comments: String,
      reviewedAt: Date
    }],
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    publishedAt: Date
  },
  conflicts: [{
    type: {
      type: String,
      enum: ['faculty_conflict', 'classroom_conflict', 'batch_conflict', 'resource_conflict']
    },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    affectedEntities: [{
      entityType: String,
      entityId: mongoose.Schema.Types.ObjectId,
      timeSlot: {
        day: String,
        startTime: String,
        endTime: String
      }
    }],
    isResolved: {
      type: Boolean,
      default: false
    },
    resolution: String
  }],
  statistics: {
    totalClasses: Number,
    utilizationRates: {
      faculty: Number,
      classrooms: Number,
      overall: Number
    },
    workloadDistribution: [{
      faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
      },
      hoursAssigned: Number,
      utilizationPercentage: Number
    }]
  },
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate timetable statistics
timetableSchema.methods.calculateStatistics = function() {
  let totalClasses = 0;
  const facultyHours = new Map();
  const classroomHours = new Map();

  this.schedule.forEach(day => {
    day.timeSlots.forEach(slot => {
      if (slot.type !== 'Break' && slot.type !== 'Lunch' && slot.type !== 'Free') {
        totalClasses++;
        
        if (slot.faculty) {
          const current = facultyHours.get(slot.faculty.toString()) || 0;
          facultyHours.set(slot.faculty.toString(), current + 1);
        }
        
        if (slot.classroom) {
          const current = classroomHours.get(slot.classroom.toString()) || 0;
          classroomHours.set(slot.classroom.toString(), current + 1);
        }
      }
    });
  });

  return {
    totalClasses,
    facultyHours: Object.fromEntries(facultyHours),
    classroomHours: Object.fromEntries(classroomHours)
  };
};

// Detect conflicts in the timetable
timetableSchema.methods.detectConflicts = function() {
  const conflicts = [];
  const timeSlotMap = new Map();

  this.schedule.forEach(day => {
    day.timeSlots.forEach(slot => {
      if (slot.type !== 'Break' && slot.type !== 'Lunch' && slot.type !== 'Free') {
        const key = `${day.day}-${slot.startTime}-${slot.endTime}`;
        
        if (!timeSlotMap.has(key)) {
          timeSlotMap.set(key, []);
        }
        
        timeSlotMap.get(key).push({
          faculty: slot.faculty,
          classroom: slot.classroom,
          batch: slot.batch,
          subject: slot.subject
        });
      }
    });
  });

  // Check for conflicts
  timeSlotMap.forEach((slots, timeKey) => {
    const [day, startTime, endTime] = timeKey.split('-');
    
    // Faculty conflicts
    const facultyMap = new Map();
    slots.forEach(slot => {
      if (slot.faculty) {
        if (facultyMap.has(slot.faculty.toString())) {
          conflicts.push({
            type: 'faculty_conflict',
            description: `Faculty double booking at ${day} ${startTime}-${endTime}`,
            severity: 'high',
            affectedEntities: [
              { entityType: 'Faculty', entityId: slot.faculty, timeSlot: { day, startTime, endTime } }
            ]
          });
        }
        facultyMap.set(slot.faculty.toString(), true);
      }
    });

    // Classroom conflicts
    const classroomMap = new Map();
    slots.forEach(slot => {
      if (slot.classroom) {
        if (classroomMap.has(slot.classroom.toString())) {
          conflicts.push({
            type: 'classroom_conflict',
            description: `Classroom double booking at ${day} ${startTime}-${endTime}`,
            severity: 'high',
            affectedEntities: [
              { entityType: 'Classroom', entityId: slot.classroom, timeSlot: { day, startTime, endTime } }
            ]
          });
        }
        classroomMap.set(slot.classroom.toString(), true);
      }
    });
  });

  return conflicts;
};

export default mongoose.model('Timetable', timetableSchema);
