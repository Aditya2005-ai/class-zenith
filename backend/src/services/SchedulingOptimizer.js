import Faculty from '../models/Faculty.js';
import Classroom from '../models/Classroom.js';
import Subject from '../models/Subject.js';
import Batch from '../models/Batch.js';
import Timetable from '../models/Timetable.js';
import { logger } from '../utils/logger.js';

class SchedulingOptimizer {
  constructor(options = {}) {
    this.algorithm = options.algorithm || 'genetic';
    this.populationSize = options.populationSize || 50;
    this.generations = options.generations || 100;
    this.mutationRate = options.mutationRate || 0.1;
    this.crossoverRate = options.crossoverRate || 0.8;
    this.objectives = options.objectives || [
      { type: 'minimize_conflicts', weight: 0.4 },
      { type: 'maximize_utilization', weight: 0.3 },
      { type: 'balance_workload', weight: 0.2 },
      { type: 'minimize_gaps', weight: 0.1 }
    ];
  }

  async generateTimetable(batchId, constraints = {}) {
    try {
      logger.info(`Starting timetable generation for batch: ${batchId}`);

      // Fetch required data
      const batch = await this.fetchBatchData(batchId);
      const faculty = await this.fetchFacultyData(batch.department);
      const classrooms = await this.fetchClassroomData();
      const subjects = await this.fetchSubjectData(batch);

      // Initialize scheduling context
      const context = {
        batch,
        faculty,
        classrooms,
        subjects,
        constraints: this.mergeConstraints(batch, constraints),
        timeSlots: this.generateTimeSlots(batch.workingDays, batch.classTimings)
      };

      // Generate timetable based on selected algorithm
      let schedule;
      switch (this.algorithm) {
        case 'genetic':
          schedule = await this.geneticAlgorithm(context);
          break;
        case 'constraint_satisfaction':
          schedule = await this.constraintSatisfaction(context);
          break;
        case 'simulated_annealing':
          schedule = await this.simulatedAnnealing(context);
          break;
        default:
          schedule = await this.geneticAlgorithm(context);
      }

      // Create timetable document
      const timetable = await this.createTimetableDocument(batch, schedule, context);

      logger.info(`Timetable generation completed for batch: ${batchId}`);
      return timetable;

    } catch (error) {
      logger.error('Timetable generation failed:', error);
      throw error;
    }
  }

  async fetchBatchData(batchId) {
    return await Batch.findById(batchId)
      .populate('department')
      .populate('subjects.subject')
      .populate('subjects.faculty')
      .populate('classCoordinator');
  }

  async fetchFacultyData(departmentId) {
    return await Faculty.find({ 
      department: departmentId, 
      isActive: true 
    }).populate('subjects');
  }

  async fetchClassroomData() {
    return await Classroom.find({ isActive: true });
  }

  async fetchSubjectData(batch) {
    const subjectIds = batch.subjects.map(s => s.subject._id);
    return await Subject.find({ _id: { $in: subjectIds } });
  }

  generateTimeSlots(workingDays, classTimings) {
    const slots = [];
    const { startTime, endTime, breakDuration, lunchBreak } = classTimings;
    
    workingDays.forEach(day => {
      const daySlots = this.createDayTimeSlots(day, startTime, endTime, breakDuration, lunchBreak);
      slots.push(...daySlots);
    });

    return slots;
  }

  createDayTimeSlots(day, startTime, endTime, breakDuration, lunchBreak) {
    const slots = [];
    let currentTime = this.parseTime(startTime);
    const endTimeMinutes = this.parseTime(endTime);
    const slotDuration = 60; // 1 hour slots

    while (currentTime < endTimeMinutes) {
      const slotEnd = currentTime + slotDuration;
      
      // Check if this is lunch break time
      if (lunchBreak && this.isLunchTime(currentTime, slotEnd, lunchBreak)) {
        slots.push({
          day,
          startTime: this.formatTime(currentTime),
          endTime: this.formatTime(slotEnd),
          type: 'Lunch',
          isFixed: true
        });
      } else {
        slots.push({
          day,
          startTime: this.formatTime(currentTime),
          endTime: this.formatTime(slotEnd),
          type: 'Available'
        });
      }

      currentTime = slotEnd + (breakDuration || 0);
    }

    return slots;
  }

  async geneticAlgorithm(context) {
    logger.info('Running genetic algorithm for timetable optimization');

    // Initialize population
    let population = this.initializePopulation(context);
    
    for (let generation = 0; generation < this.generations; generation++) {
      // Evaluate fitness for each individual
      const fitnessScores = population.map(individual => 
        this.calculateFitness(individual, context)
      );

      // Selection
      const parents = this.selection(population, fitnessScores);

      // Crossover and Mutation
      const offspring = this.crossoverAndMutation(parents, context);

      // Replace population
      population = this.replacement(population, offspring, fitnessScores);

      // Log progress
      if (generation % 10 === 0) {
        const bestFitness = Math.max(...fitnessScores);
        logger.info(`Generation ${generation}: Best fitness = ${bestFitness.toFixed(3)}`);
      }
    }

    // Return best individual
    const finalFitness = population.map(individual => 
      this.calculateFitness(individual, context)
    );
    const bestIndex = finalFitness.indexOf(Math.max(...finalFitness));
    
    return population[bestIndex];
  }

  initializePopulation(context) {
    const population = [];
    
    for (let i = 0; i < this.populationSize; i++) {
      const individual = this.createRandomSchedule(context);
      population.push(individual);
    }

    return population;
  }

  createRandomSchedule(context) {
    const { batch, subjects, faculty, classrooms, timeSlots } = context;
    const schedule = [];

    // Group time slots by day
    const daySlots = this.groupSlotsByDay(timeSlots);

    Object.keys(daySlots).forEach(day => {
      const availableSlots = daySlots[day].filter(slot => slot.type === 'Available');
      const daySchedule = { day, timeSlots: [] };

      // Add fixed slots (lunch, breaks)
      daySlots[day].forEach(slot => {
        if (slot.isFixed) {
          daySchedule.timeSlots.push({
            startTime: slot.startTime,
            endTime: slot.endTime,
            type: slot.type
          });
        }
      });

      // Randomly assign subjects to available slots
      const shuffledSlots = this.shuffleArray([...availableSlots]);
      const shuffledSubjects = this.shuffleArray([...batch.subjects]);

      shuffledSlots.forEach((slot, index) => {
        if (index < shuffledSubjects.length) {
          const batchSubject = shuffledSubjects[index];
          const subject = subjects.find(s => s._id.equals(batchSubject.subject._id));
          
          if (subject) {
            const availableFaculty = this.getAvailableFaculty(faculty, subject, day, slot.startTime, slot.endTime);
            const availableClassrooms = this.getAvailableClassrooms(classrooms, subject, day, slot.startTime, slot.endTime);

            if (availableFaculty.length > 0 && availableClassrooms.length > 0) {
              daySchedule.timeSlots.push({
                startTime: slot.startTime,
                endTime: slot.endTime,
                subject: subject._id,
                faculty: availableFaculty[0]._id,
                classroom: availableClassrooms[0]._id,
                batch: batch._id,
                type: subject.type
              });
            }
          }
        }
      });

      schedule.push(daySchedule);
    });

    return schedule;
  }

  calculateFitness(individual, context) {
    let totalScore = 0;

    this.objectives.forEach(objective => {
      let score = 0;

      switch (objective.type) {
        case 'minimize_conflicts':
          score = this.evaluateConflicts(individual, context);
          break;
        case 'maximize_utilization':
          score = this.evaluateUtilization(individual, context);
          break;
        case 'balance_workload':
          score = this.evaluateWorkloadBalance(individual, context);
          break;
        case 'minimize_gaps':
          score = this.evaluateGaps(individual, context);
          break;
      }

      totalScore += score * objective.weight;
    });

    return totalScore;
  }

  evaluateConflicts(schedule, context) {
    let conflicts = 0;
    const timeSlotMap = new Map();

    // Check for faculty and classroom conflicts
    schedule.forEach(day => {
      day.timeSlots.forEach(slot => {
        if (slot.type !== 'Break' && slot.type !== 'Lunch' && slot.type !== 'Free') {
          const key = `${day.day}-${slot.startTime}-${slot.endTime}`;
          
          if (!timeSlotMap.has(key)) {
            timeSlotMap.set(key, { faculty: new Set(), classrooms: new Set() });
          }

          const slotData = timeSlotMap.get(key);
          
          if (slot.faculty) {
            if (slotData.faculty.has(slot.faculty.toString())) {
              conflicts++;
            }
            slotData.faculty.add(slot.faculty.toString());
          }

          if (slot.classroom) {
            if (slotData.classrooms.has(slot.classroom.toString())) {
              conflicts++;
            }
            slotData.classrooms.add(slot.classroom.toString());
          }
        }
      });
    });

    return Math.max(0, 1 - (conflicts / 100)); // Normalize to 0-1 range
  }

  evaluateUtilization(schedule, context) {
    const { faculty, classrooms } = context;
    let totalUtilization = 0;
    let count = 0;

    // Calculate faculty utilization
    const facultyHours = new Map();
    schedule.forEach(day => {
      day.timeSlots.forEach(slot => {
        if (slot.faculty && slot.type !== 'Break' && slot.type !== 'Lunch') {
          const current = facultyHours.get(slot.faculty.toString()) || 0;
          facultyHours.set(slot.faculty.toString(), current + 1);
        }
      });
    });

    faculty.forEach(f => {
      const hours = facultyHours.get(f._id.toString()) || 0;
      const utilization = hours / f.workload.maxHoursPerWeek;
      totalUtilization += Math.min(utilization, 1);
      count++;
    });

    return count > 0 ? totalUtilization / count : 0;
  }

  evaluateWorkloadBalance(schedule, context) {
    const { faculty } = context;
    const facultyHours = new Map();

    schedule.forEach(day => {
      day.timeSlots.forEach(slot => {
        if (slot.faculty && slot.type !== 'Break' && slot.type !== 'Lunch') {
          const current = facultyHours.get(slot.faculty.toString()) || 0;
          facultyHours.set(slot.faculty.toString(), current + 1);
        }
      });
    });

    const hours = Array.from(facultyHours.values());
    if (hours.length === 0) return 0;

    const mean = hours.reduce((sum, h) => sum + h, 0) / hours.length;
    const variance = hours.reduce((sum, h) => sum + Math.pow(h - mean, 2), 0) / hours.length;
    
    return Math.max(0, 1 - (variance / 100)); // Lower variance = better balance
  }

  evaluateGaps(schedule, context) {
    let totalGaps = 0;
    let totalDays = 0;

    schedule.forEach(day => {
      const classSlots = day.timeSlots
        .filter(slot => slot.type !== 'Break' && slot.type !== 'Lunch' && slot.type !== 'Free')
        .sort((a, b) => this.parseTime(a.startTime) - this.parseTime(b.startTime));

      let gaps = 0;
      for (let i = 1; i < classSlots.length; i++) {
        const prevEnd = this.parseTime(classSlots[i-1].endTime);
        const currentStart = this.parseTime(classSlots[i].startTime);
        if (currentStart - prevEnd > 15) { // Gap > 15 minutes
          gaps++;
        }
      }

      totalGaps += gaps;
      totalDays++;
    });

    return Math.max(0, 1 - (totalGaps / (totalDays * 3))); // Normalize
  }

  selection(population, fitnessScores) {
    const parents = [];
    const tournamentSize = 3;

    for (let i = 0; i < population.length; i++) {
      const tournament = [];
      for (let j = 0; j < tournamentSize; j++) {
        const randomIndex = Math.floor(Math.random() * population.length);
        tournament.push({ individual: population[randomIndex], fitness: fitnessScores[randomIndex] });
      }

      tournament.sort((a, b) => b.fitness - a.fitness);
      parents.push(tournament[0].individual);
    }

    return parents;
  }

  crossoverAndMutation(parents, context) {
    const offspring = [];

    for (let i = 0; i < parents.length; i += 2) {
      let child1 = JSON.parse(JSON.stringify(parents[i]));
      let child2 = JSON.parse(JSON.stringify(parents[i + 1] || parents[0]));

      // Crossover
      if (Math.random() < this.crossoverRate) {
        [child1, child2] = this.crossover(child1, child2);
      }

      // Mutation
      if (Math.random() < this.mutationRate) {
        child1 = this.mutate(child1, context);
      }
      if (Math.random() < this.mutationRate) {
        child2 = this.mutate(child2, context);
      }

      offspring.push(child1, child2);
    }

    return offspring;
  }

  crossover(parent1, parent2) {
    // Single-point crossover
    const crossoverPoint = Math.floor(Math.random() * parent1.length);
    
    const child1 = [
      ...parent1.slice(0, crossoverPoint),
      ...parent2.slice(crossoverPoint)
    ];
    
    const child2 = [
      ...parent2.slice(0, crossoverPoint),
      ...parent1.slice(crossoverPoint)
    ];

    return [child1, child2];
  }

  mutate(individual, context) {
    // Random slot mutation
    const dayIndex = Math.floor(Math.random() * individual.length);
    const day = individual[dayIndex];
    const classSlots = day.timeSlots.filter(slot => 
      slot.type !== 'Break' && slot.type !== 'Lunch' && slot.type !== 'Free'
    );

    if (classSlots.length > 0) {
      const slotIndex = Math.floor(Math.random() * classSlots.length);
      const slot = classSlots[slotIndex];

      // Randomly change faculty or classroom
      if (Math.random() < 0.5) {
        const availableFaculty = this.getAvailableFaculty(
          context.faculty, 
          { _id: slot.subject }, 
          day.day, 
          slot.startTime, 
          slot.endTime
        );
        if (availableFaculty.length > 0) {
          slot.faculty = availableFaculty[Math.floor(Math.random() * availableFaculty.length)]._id;
        }
      } else {
        const availableClassrooms = this.getAvailableClassrooms(
          context.classrooms,
          { _id: slot.subject },
          day.day,
          slot.startTime,
          slot.endTime
        );
        if (availableClassrooms.length > 0) {
          slot.classroom = availableClassrooms[Math.floor(Math.random() * availableClassrooms.length)]._id;
        }
      }
    }

    return individual;
  }

  replacement(population, offspring, fitnessScores) {
    // Elitist replacement - keep best individuals
    const combined = [...population, ...offspring];
    const combinedFitness = [
      ...fitnessScores,
      ...offspring.map(individual => this.calculateFitness(individual, this.context))
    ];

    const indexed = combined.map((individual, index) => ({
      individual,
      fitness: combinedFitness[index]
    }));

    indexed.sort((a, b) => b.fitness - a.fitness);
    
    return indexed.slice(0, this.populationSize).map(item => item.individual);
  }

  // Helper methods
  getAvailableFaculty(faculty, subject, day, startTime, endTime) {
    return faculty.filter(f => 
      f.subjects.some(s => s.equals(subject._id)) &&
      f.isAvailableAt(day, startTime, endTime)
    );
  }

  getAvailableClassrooms(classrooms, subject, day, startTime, endTime) {
    return classrooms.filter(c => 
      c.type === subject.type || 
      (subject.type === 'Theory' && c.type === 'Seminar Hall') ||
      c.isAvailableAt(day, startTime, endTime)
    );
  }

  groupSlotsByDay(timeSlots) {
    return timeSlots.reduce((acc, slot) => {
      if (!acc[slot.day]) acc[slot.day] = [];
      acc[slot.day].push(slot);
      return acc;
    }, {});
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  isLunchTime(startTime, endTime, lunchBreak) {
    const lunchStart = this.parseTime(lunchBreak.startTime);
    const lunchEnd = this.parseTime(lunchBreak.endTime);
    return startTime >= lunchStart && endTime <= lunchEnd;
  }

  mergeConstraints(batch, additionalConstraints) {
    return {
      maxClassesPerDay: batch.preferences?.maxClassesPerDay || additionalConstraints.maxClassesPerDay || 6,
      maxConsecutiveClasses: batch.preferences?.maxConsecutiveClasses || additionalConstraints.maxConsecutiveClasses || 3,
      minBreakBetweenClasses: additionalConstraints.minBreakBetweenClasses || 15,
      ...additionalConstraints
    };
  }

  async createTimetableDocument(batch, schedule, context) {
    const timetable = new Timetable({
      name: `${batch.name} - ${batch.academicYear}`,
      academicYear: batch.academicYear,
      semester: batch.semester % 2 === 1 ? 'Odd' : 'Even',
      department: batch.department._id,
      batch: batch._id,
      type: 'batch',
      schedule,
      constraints: context.constraints,
      optimization: {
        algorithm: this.algorithm,
        objectives: this.objectives,
        parameters: {
          populationSize: this.populationSize,
          generations: this.generations,
          mutationRate: this.mutationRate,
          crossoverRate: this.crossoverRate
        },
        score: {
          overall: this.calculateFitness(schedule, context)
        }
      },
      status: 'generated',
      workflow: {
        createdBy: context.userId || null
      }
    });

    // Detect and store conflicts
    timetable.conflicts = timetable.detectConflicts();
    
    // Calculate statistics
    const stats = timetable.calculateStatistics();
    timetable.statistics = {
      totalClasses: stats.totalClasses,
      utilizationRates: {
        faculty: this.evaluateUtilization(schedule, context),
        classrooms: 0.8, // Placeholder
        overall: 0.85 // Placeholder
      }
    };

    await timetable.save();
    return timetable;
  }
}

export default SchedulingOptimizer;
