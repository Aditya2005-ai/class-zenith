import express from 'express';
import { body, query, validationResult } from 'express-validator';
import SchedulingOptimizer from '../services/SchedulingOptimizer.js';
import Timetable from '../models/Timetable.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @route   POST /api/optimizer/generate
// @desc    Generate optimized timetable
// @access  Private (Admin/Coordinator)
router.post('/generate', authenticate, authorize('admin', 'coordinator'), [
  body('batchId').isMongoId(),
  body('algorithm').optional().isIn(['genetic', 'constraint_satisfaction', 'simulated_annealing', 'hybrid']),
  body('objectives').optional().isArray(),
  body('constraints').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { batchId, algorithm = 'genetic', objectives, constraints = {} } = req.body;

    // Initialize optimizer with custom parameters
    const optimizerOptions = {
      algorithm,
      populationSize: req.body.populationSize || 50,
      generations: req.body.generations || 100,
      mutationRate: req.body.mutationRate || 0.1,
      crossoverRate: req.body.crossoverRate || 0.8
    };

    if (objectives) {
      optimizerOptions.objectives = objectives;
    }

    const optimizer = new SchedulingOptimizer(optimizerOptions);
    
    // Add user context for audit trail
    constraints.userId = req.user._id;

    logger.info(`Starting timetable generation for batch ${batchId} by user ${req.user.username}`);

    const timetable = await optimizer.generateTimetable(batchId, constraints);

    res.status(201).json({
      success: true,
      message: 'Timetable generated successfully',
      data: { 
        timetable,
        optimizationScore: timetable.optimization.score.overall,
        conflictsCount: timetable.conflicts.length
      }
    });

  } catch (error) {
    logger.error('Timetable generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate timetable',
      error: error.message
    });
  }
});

// @route   POST /api/optimizer/batch-generate
// @desc    Generate timetables for multiple batches
// @access  Private (Admin)
router.post('/batch-generate', authenticate, authorize('admin'), [
  body('batchIds').isArray(),
  body('batchIds.*').isMongoId(),
  body('algorithm').optional().isIn(['genetic', 'constraint_satisfaction', 'simulated_annealing'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { batchIds, algorithm = 'genetic', constraints = {} } = req.body;
    const results = [];
    const optimizer = new SchedulingOptimizer({ algorithm });

    logger.info(`Starting batch timetable generation for ${batchIds.length} batches`);

    for (const batchId of batchIds) {
      try {
        const timetable = await optimizer.generateTimetable(batchId, {
          ...constraints,
          userId: req.user._id
        });
        
        results.push({
          batchId,
          success: true,
          timetableId: timetable._id,
          score: timetable.optimization.score.overall,
          conflicts: timetable.conflicts.length
        });
      } catch (error) {
        logger.error(`Failed to generate timetable for batch ${batchId}:`, error);
        results.push({
          batchId,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    res.json({
      success: true,
      message: `Generated ${successCount}/${batchIds.length} timetables successfully`,
      data: { results }
    });

  } catch (error) {
    logger.error('Batch timetable generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate batch timetables',
      error: error.message
    });
  }
});

// @route   POST /api/optimizer/optimize-existing
// @desc    Optimize existing timetable
// @access  Private (Admin/Coordinator)
router.post('/optimize-existing', authenticate, authorize('admin', 'coordinator'), [
  body('timetableId').isMongoId(),
  body('objectives').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { timetableId, objectives } = req.body;

    const existingTimetable = await Timetable.findById(timetableId)
      .populate('batch');

    if (!existingTimetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    // Create new version with optimization
    const optimizer = new SchedulingOptimizer({
      algorithm: existingTimetable.optimization.algorithm,
      objectives: objectives || existingTimetable.optimization.objectives
    });

    const optimizedTimetable = await optimizer.generateTimetable(
      existingTimetable.batch._id,
      existingTimetable.constraints
    );

    // Update version number
    optimizedTimetable.version = existingTimetable.version + 1;
    await optimizedTimetable.save();

    logger.info(`Timetable optimized: ${timetableId} -> ${optimizedTimetable._id}`);

    res.json({
      success: true,
      message: 'Timetable optimized successfully',
      data: { 
        originalTimetable: existingTimetable,
        optimizedTimetable,
        improvement: {
          scoreImprovement: optimizedTimetable.optimization.score.overall - existingTimetable.optimization.score.overall,
          conflictReduction: existingTimetable.conflicts.length - optimizedTimetable.conflicts.length
        }
      }
    });

  } catch (error) {
    logger.error('Timetable optimization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize timetable',
      error: error.message
    });
  }
});

// @route   GET /api/optimizer/algorithms
// @desc    Get available optimization algorithms and their parameters
// @access  Private
router.get('/algorithms', authenticate, (req, res) => {
  const algorithms = [
    {
      name: 'genetic',
      displayName: 'Genetic Algorithm',
      description: 'Uses evolutionary principles to find optimal solutions',
      parameters: [
        { name: 'populationSize', type: 'number', default: 50, min: 10, max: 200 },
        { name: 'generations', type: 'number', default: 100, min: 10, max: 500 },
        { name: 'mutationRate', type: 'number', default: 0.1, min: 0.01, max: 0.5 },
        { name: 'crossoverRate', type: 'number', default: 0.8, min: 0.1, max: 1.0 }
      ],
      objectives: [
        'minimize_conflicts',
        'maximize_utilization',
        'balance_workload',
        'minimize_gaps'
      ]
    },
    {
      name: 'constraint_satisfaction',
      displayName: 'Constraint Satisfaction',
      description: 'Systematically satisfies all constraints',
      parameters: [
        { name: 'backtrackLimit', type: 'number', default: 1000, min: 100, max: 10000 }
      ],
      objectives: [
        'minimize_conflicts',
        'maximize_utilization'
      ]
    },
    {
      name: 'simulated_annealing',
      displayName: 'Simulated Annealing',
      description: 'Probabilistic optimization technique',
      parameters: [
        { name: 'initialTemperature', type: 'number', default: 100, min: 10, max: 1000 },
        { name: 'coolingRate', type: 'number', default: 0.95, min: 0.8, max: 0.99 },
        { name: 'iterations', type: 'number', default: 1000, min: 100, max: 5000 }
      ],
      objectives: [
        'minimize_conflicts',
        'maximize_utilization',
        'balance_workload'
      ]
    }
  ];

  res.json({
    success: true,
    data: { algorithms }
  });
});

// @route   GET /api/optimizer/objectives
// @desc    Get available optimization objectives
// @access  Private
router.get('/objectives', authenticate, (req, res) => {
  const objectives = [
    {
      type: 'minimize_conflicts',
      name: 'Minimize Conflicts',
      description: 'Reduce faculty and classroom scheduling conflicts',
      weight: { default: 0.4, min: 0.1, max: 1.0 }
    },
    {
      type: 'maximize_utilization',
      name: 'Maximize Utilization',
      description: 'Optimize faculty and classroom utilization rates',
      weight: { default: 0.3, min: 0.1, max: 1.0 }
    },
    {
      type: 'balance_workload',
      name: 'Balance Workload',
      description: 'Distribute teaching load evenly among faculty',
      weight: { default: 0.2, min: 0.1, max: 1.0 }
    },
    {
      type: 'minimize_gaps',
      name: 'Minimize Gaps',
      description: 'Reduce gaps between classes for students',
      weight: { default: 0.1, min: 0.1, max: 1.0 }
    }
  ];

  res.json({
    success: true,
    data: { objectives }
  });
});

// @route   POST /api/optimizer/validate-schedule
// @desc    Validate a schedule for conflicts and constraints
// @access  Private
router.post('/validate-schedule', authenticate, [
  body('schedule').isArray(),
  body('batchId').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { schedule, batchId } = req.body;

    // Create temporary timetable for validation
    const tempTimetable = new Timetable({
      name: 'Validation',
      schedule,
      batch: batchId,
      type: 'batch'
    });

    // Detect conflicts
    const conflicts = tempTimetable.detectConflicts();
    
    // Calculate statistics
    const statistics = tempTimetable.calculateStatistics();

    res.json({
      success: true,
      data: {
        isValid: conflicts.length === 0,
        conflicts,
        statistics,
        recommendations: conflicts.length > 0 ? [
          'Consider adjusting time slots to resolve conflicts',
          'Check faculty availability and workload',
          'Verify classroom capacity and type requirements'
        ] : []
      }
    });

  } catch (error) {
    logger.error('Schedule validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate schedule',
      error: error.message
    });
  }
});

export default router;
