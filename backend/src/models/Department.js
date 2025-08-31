import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
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
  description: String,
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  building: String,
  floor: String,
  contactInfo: {
    phone: String,
    email: String,
    extension: String
  },
  shifts: [{
    name: String,
    startTime: String,
    endTime: String,
    isActive: { type: Boolean, default: true }
  }],
  workingDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  maxClassesPerDay: {
    type: Number,
    default: 8
  },
  maxClassesPerWeek: {
    type: Number,
    default: 40
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Department', departmentSchema);
