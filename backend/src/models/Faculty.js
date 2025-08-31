import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
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
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: String,
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  designation: {
    type: String,
    enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Guest Faculty'],
    required: true
  },
  qualification: [String],
  specialization: [String],
  experience: {
    total: Number,
    teaching: Number
  },
  workload: {
    maxHoursPerWeek: {
      type: Number,
      default: 20
    },
    maxHoursPerDay: {
      type: Number,
      default: 6
    },
    currentHours: {
      type: Number,
      default: 0
    },
    preferredHours: Number
  },
  availability: {
    workingDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    timeSlots: [{
      day: String,
      startTime: String,
      endTime: String,
      isAvailable: { type: Boolean, default: true }
    }],
    unavailableSlots: [{
      day: String,
      startTime: String,
      endTime: String,
      reason: String,
      isRecurring: { type: Boolean, default: false }
    }]
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  preferences: {
    preferredTimeSlots: [String],
    avoidTimeSlots: [String],
    maxConsecutiveClasses: {
      type: Number,
      default: 3
    },
    minBreakBetweenClasses: {
      type: Number,
      default: 15
    },
    preferredClassrooms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom'
    }]
  },
  leaves: [{
    startDate: Date,
    endDate: Date,
    type: {
      type: String,
      enum: ['sick', 'casual', 'earned', 'maternity', 'paternity', 'conference', 'other']
    },
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    appliedDate: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  joinDate: Date,
  profileImage: String
}, {
  timestamps: true
});

// Calculate current workload
facultySchema.methods.calculateWorkload = function() {
  // This will be implemented with actual timetable data
  return {
    hoursPerWeek: this.workload.currentHours,
    utilizationPercentage: (this.workload.currentHours / this.workload.maxHoursPerWeek) * 100
  };
};

// Check availability for a specific time slot
facultySchema.methods.isAvailableAt = function(day, startTime, endTime) {
  // Check working days
  if (!this.availability.workingDays.includes(day)) {
    return false;
  }

  // Check unavailable slots
  const isUnavailable = this.availability.unavailableSlots.some(slot => {
    return slot.day === day && 
           ((startTime >= slot.startTime && startTime < slot.endTime) ||
            (endTime > slot.startTime && endTime <= slot.endTime));
  });

  return !isUnavailable;
};

export default mongoose.model('Faculty', facultySchema);
