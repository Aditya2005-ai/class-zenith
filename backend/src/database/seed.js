import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/database.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Faculty from '../models/Faculty.js';
import Classroom from '../models/Classroom.js';
import Subject from '../models/Subject.js';
import Batch from '../models/Batch.js';
import { logger } from '../utils/logger.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Faculty.deleteMany({});
    await Classroom.deleteMany({});
    await Subject.deleteMany({});
    await Batch.deleteMany({});

    logger.info('Cleared existing data');

    // Create Departments
    const departments = await Department.create([
      {
        name: 'Pharmaceutics',
        code: 'PHARM',
        description: 'Department of Pharmaceutics',
        building: 'Pharmacy Block',
        floor: '1st Floor',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        maxClassesPerDay: 8,
        maxClassesPerWeek: 40,
        shifts: [
          { name: 'Morning', startTime: '09:00', endTime: '17:00', isActive: true }
        ]
      },
      {
        name: 'Computer Science',
        code: 'CSE',
        description: 'Department of Computer Science & Engineering',
        building: 'Academic Block',
        floor: '2nd Floor',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        maxClassesPerDay: 6,
        maxClassesPerWeek: 30
      }
    ]);

    logger.info('Created departments');

    // Create Admin User
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@classzenith.com',
      password: 'admin123',
      role: 'admin',
      profile: {
        firstName: 'System',
        lastName: 'Administrator'
      }
    });

    logger.info('Created admin user');

    // Create Faculty
    const faculty = await Faculty.create([
      {
        employeeId: 'EMP001',
        name: 'Dr. Neetu Agrawal',
        code: 'NA',
        email: 'neetu.agrawal@gla.ac.in',
        department: departments[0]._id,
        designation: 'Professor',
        qualification: ['Ph.D. Pharmaceutics'],
        specialization: ['Drug Delivery Systems'],
        workload: {
          maxHoursPerWeek: 20,
          maxHoursPerDay: 6,
          currentHours: 16
        },
        availability: {
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          timeSlots: [
            { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
            { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true }
          ]
        }
      },
      {
        employeeId: 'EMP002',
        name: 'Dr. Poornima Agrawal',
        code: 'PA',
        email: 'poornima.agrawal@gla.ac.in',
        department: departments[0]._id,
        designation: 'Associate Professor',
        qualification: ['Ph.D. Pharmaceutics'],
        workload: {
          maxHoursPerWeek: 18,
          maxHoursPerDay: 6,
          currentHours: 14
        },
        availability: {
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }
      }
    ]);

    logger.info('Created faculty');

    // Create Classrooms
    const classrooms = await Classroom.create([
      {
        name: 'Room 216',
        code: 'R216',
        type: 'Theory',
        capacity: 60,
        location: {
          building: 'Main Block',
          floor: '2nd Floor',
          roomNumber: '216'
        },
        equipment: [
          { name: 'Projector', quantity: 1, condition: 'good' },
          { name: 'Audio System', quantity: 1, condition: 'excellent' }
        ],
        facilities: ['Projector', 'Audio System', 'AC'],
        availability: {
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        department: departments[0]._id
      },
      {
        name: 'P006',
        code: 'P006',
        type: 'Practical Lab',
        capacity: 30,
        location: {
          building: 'Pharmacy Block',
          floor: 'Ground Floor',
          roomNumber: 'P006'
        },
        equipment: [
          { name: 'Lab Equipment', quantity: 15, condition: 'good' },
          { name: 'Fume Hood', quantity: 2, condition: 'excellent' }
        ],
        facilities: ['Lab Equipment', 'Fume Hood', 'Storage'],
        availability: {
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        department: departments[0]._id
      }
    ]);

    logger.info('Created classrooms');

    // Create Subjects
    const subjects = await Subject.create([
      {
        name: 'Pharmaceutical Technology',
        code: 'BP301T',
        shortName: 'Pharm Tech',
        department: departments[0]._id,
        semester: 5,
        year: 3,
        program: 'B.Pharm',
        type: 'Theory',
        credits: 3,
        hoursPerWeek: { theory: 3, practical: 0, tutorial: 0 },
        classroomRequirements: ['Theory'],
        academicYear: '2025-26'
      },
      {
        name: 'Pharmaceutical Technology Practical',
        code: 'BP301P',
        shortName: 'Pharm Tech Prac',
        department: departments[0]._id,
        semester: 5,
        year: 3,
        program: 'B.Pharm',
        type: 'Practical',
        credits: 2,
        hoursPerWeek: { theory: 0, practical: 4, tutorial: 0 },
        classroomRequirements: ['Practical Lab'],
        academicYear: '2025-26'
      }
    ]);

    logger.info('Created subjects');

    // Create Batches
    const batches = await Batch.create([
      {
        name: 'B.Pharm 3rd Year Section A',
        code: 'BP3A',
        program: 'B.Pharm',
        year: 3,
        semester: 5,
        section: 'A',
        department: departments[0]._id,
        students: {
          total: 60,
          enrolled: [
            { rollNumber: 'BP21001', name: 'Student 1', email: 'student1@example.com' },
            { rollNumber: 'BP21002', name: 'Student 2', email: 'student2@example.com' }
          ]
        },
        subjects: [
          { subject: subjects[0]._id, faculty: faculty[0]._id },
          { subject: subjects[1]._id, faculty: faculty[1]._id }
        ],
        classTimings: {
          startTime: '09:00',
          endTime: '17:00',
          breakDuration: 15,
          lunchBreak: { startTime: '13:00', endTime: '14:00' }
        },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        classCoordinator: faculty[0]._id,
        academicYear: '2025-26'
      }
    ]);

    logger.info('Created batches');

    // Update faculty subjects
    await Faculty.findByIdAndUpdate(faculty[0]._id, {
      $push: { subjects: subjects[0]._id }
    });

    await Faculty.findByIdAndUpdate(faculty[1]._id, {
      $push: { subjects: subjects[1]._id }
    });

    logger.info('Database seeded successfully');
    process.exit(0);

  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
