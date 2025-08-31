import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Theory', 'Practical Lab', 'Seminar Hall', 'Auditorium', 'Computer Lab', 'Research Lab'],
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  location: {
    building: {
      type: String,
      required: true
    },
    floor: {
      type: String,
      required: true
    },
    wing: String,
    roomNumber: String
  },
  equipment: [{
    name: String,
    quantity: Number,
    condition: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor', 'out-of-order'],
      default: 'good'
    },
    lastMaintenance: Date
  }],
  facilities: [{
    type: String,
    enum: ['Projector', 'Smart Board', 'Audio System', 'AC', 'WiFi', 'Computer', 'Microscope', 'Lab Equipment', 'Whiteboard', 'Blackboard']
  }],
  utilization: {
    hoursPerWeek: {
      type: Number,
      default: 0
    },
    utilizationPercentage: {
      type: Number,
      default: 0
    },
    peakHours: [String]
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
    blockedSlots: [{
      day: String,
      startTime: String,
      endTime: String,
      reason: String,
      blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      isRecurring: { type: Boolean, default: false }
    }]
  },
  maintenance: [{
    scheduledDate: Date,
    type: {
      type: String,
      enum: ['routine', 'repair', 'upgrade', 'cleaning']
    },
    description: String,
    duration: Number, // in hours
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled'
    }
  }],
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  images: [String],
  notes: String
}, {
  timestamps: true
});

// Calculate utilization percentage
classroomSchema.methods.calculateUtilization = function() {
  const maxHoursPerWeek = this.availability.workingDays.length * 8; // Assuming 8 hours per day
  return (this.utilization.hoursPerWeek / maxHoursPerWeek) * 100;
};

// Check if classroom is available at specific time
classroomSchema.methods.isAvailableAt = function(day, startTime, endTime) {
  // Check if day is in working days
  if (!this.availability.workingDays.includes(day)) {
    return false;
  }

  // Check blocked slots
  const isBlocked = this.availability.blockedSlots.some(slot => {
    return slot.day === day && 
           ((startTime >= slot.startTime && startTime < slot.endTime) ||
            (endTime > slot.startTime && endTime <= slot.endTime));
  });

  // Check maintenance schedule
  const hasMaintenance = this.maintenance.some(maintenance => {
    const maintenanceDate = new Date(maintenance.scheduledDate);
    const today = new Date();
    return maintenanceDate.toDateString() === today.toDateString() &&
           maintenance.status === 'scheduled';
  });

  return !isBlocked && !hasMaintenance;
};

export default mongoose.model('Classroom', classroomSchema);
