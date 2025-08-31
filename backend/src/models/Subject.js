import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
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
  shortName: String,
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  program: {
    type: String,
    enum: ['B.Pharm', 'M.Pharm', 'Pharm.D', 'B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA'],
    required: true
  },
  type: {
    type: String,
    enum: ['Theory', 'Practical', 'Tutorial', 'Seminar', 'Project', 'Elective'],
    required: true
  },
  credits: {
    type: Number,
    required: true,
    min: 0
  },
  hoursPerWeek: {
    theory: { type: Number, default: 0 },
    practical: { type: Number, default: 0 },
    tutorial: { type: Number, default: 0 }
  },
  totalHours: Number,
  classroomRequirements: {
    type: [{
      type: String,
      enum: ['Theory', 'Practical Lab', 'Computer Lab', 'Seminar Hall']
    }],
    default: ['Theory']
  },
  equipmentRequired: [String],
  facultyRequirements: {
    minQualification: String,
    specialization: [String],
    experience: Number
  },
  syllabus: {
    topics: [String],
    learningOutcomes: [String],
    prerequisites: [String]
  },
  assessment: {
    internal: {
      type: Number,
      default: 30
    },
    external: {
      type: Number,
      default: 70
    },
    practical: {
      type: Number,
      default: 0
    }
  },
  isElective: {
    type: Boolean,
    default: false
  },
  electiveGroup: String,
  isActive: {
    type: Boolean,
    default: true
  },
  academicYear: String
}, {
  timestamps: true
});

// Calculate total weekly hours
subjectSchema.virtual('totalWeeklyHours').get(function() {
  return this.hoursPerWeek.theory + this.hoursPerWeek.practical + this.hoursPerWeek.tutorial;
});

export default mongoose.model('Subject', subjectSchema);
