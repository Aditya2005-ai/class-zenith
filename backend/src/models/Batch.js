import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  program: {
    type: String,
    enum: ['B.Pharm', 'M.Pharm', 'Pharm.D', 'B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA'],
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  section: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  students: {
    total: {
      type: Number,
      required: true,
      min: 1
    },
    present: {
      type: Number,
      default: 0
    },
    enrolled: [{
      rollNumber: String,
      name: String,
      email: String,
      phone: String,
      isActive: { type: Boolean, default: true }
    }]
  },
  subjects: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty'
    },
    isElective: {
      type: Boolean,
      default: false
    },
    electiveGroup: String
  }],
  classTimings: {
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    breakDuration: {
      type: Number,
      default: 15
    },
    lunchBreak: {
      startTime: String,
      endTime: String
    }
  },
  workingDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  shift: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening'],
    default: 'Morning'
  },
  classCoordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  preferences: {
    maxClassesPerDay: {
      type: Number,
      default: 6
    },
    maxConsecutiveClasses: {
      type: Number,
      default: 3
    },
    preferredStartTime: String,
    avoidTimeSlots: [String],
    preferredClassrooms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom'
    }]
  },
  academicYear: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate batch strength
batchSchema.virtual('strength').get(function() {
  return this.students.enrolled.filter(student => student.isActive).length;
});

export default mongoose.model('Batch', batchSchema);
