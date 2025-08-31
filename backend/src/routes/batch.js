import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Batch from '../models/Batch.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/batches
// @desc    Get all batches
// @access  Private
router.get('/', authenticate, [
  query('department').optional().isMongoId(),
  query('program').optional().isIn(['B.Pharm', 'M.Pharm', 'Pharm.D', 'B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA']),
  query('year').optional().isInt({ min: 1, max: 4 }),
  query('semester').optional().isInt({ min: 1, max: 8 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
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

    const { department, program, year, semester, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    
    if (department) query.department = department;
    if (program) query.program = program;
    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { section: { $regex: search, $options: 'i' } }
      ];
    }

    const batches = await Batch.find(query)
      .populate('department', 'name code')
      .populate('subjects.subject', 'name code type')
      .populate('subjects.faculty', 'name code')
      .populate('classCoordinator', 'name code')
      .sort({ program: 1, year: 1, semester: 1, section: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Batch.countDocuments(query);

    res.json({
      success: true,
      data: {
        batches,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Get batches error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batches',
      error: error.message
    });
  }
});

// @route   GET /api/batches/:id
// @desc    Get batch by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('department', 'name code')
      .populate('subjects.subject', 'name code type hoursPerWeek')
      .populate('subjects.faculty', 'name code designation')
      .populate('classCoordinator', 'name code email')
      .populate('preferences.preferredClassrooms', 'name code type capacity');

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.json({
      success: true,
      data: { batch }
    });
  } catch (error) {
    logger.error('Get batch by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch',
      error: error.message
    });
  }
});

// @route   POST /api/batches
// @desc    Create new batch
// @access  Private (Admin/Coordinator)
router.post('/', authenticate, authorize('admin', 'coordinator'), [
  body('name').notEmpty().trim(),
  body('code').notEmpty().trim().toUpperCase(),
  body('program').isIn(['B.Pharm', 'M.Pharm', 'Pharm.D', 'B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA']),
  body('year').isInt({ min: 1, max: 4 }),
  body('semester').isInt({ min: 1, max: 8 }),
  body('section').notEmpty().trim().toUpperCase(),
  body('department').isMongoId(),
  body('students.total').isInt({ min: 1 }),
  body('academicYear').notEmpty().trim()
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

    const batch = new Batch(req.body);
    await batch.save();

    await batch.populate('department', 'name code');

    logger.info(`New batch created: ${batch.name} (${batch.code})`);

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: { batch }
    });
  } catch (error) {
    logger.error('Create batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create batch',
      error: error.message
    });
  }
});

// @route   PUT /api/batches/:id
// @desc    Update batch
// @access  Private (Admin/Coordinator)
router.put('/:id', authenticate, authorize('admin', 'coordinator'), async (req, res) => {
  try {
    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('department', 'name code');

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    logger.info(`Batch updated: ${batch.name} (${batch.code})`);

    res.json({
      success: true,
      message: 'Batch updated successfully',
      data: { batch }
    });
  } catch (error) {
    logger.error('Update batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update batch',
      error: error.message
    });
  }
});

// @route   POST /api/batches/:id/students
// @desc    Add students to batch
// @access  Private (Admin/Coordinator)
router.post('/:id/students', authenticate, authorize('admin', 'coordinator'), [
  body('students').isArray(),
  body('students.*.rollNumber').notEmpty().trim(),
  body('students.*.name').notEmpty().trim(),
  body('students.*.email').optional().isEmail()
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

    const batch = await Batch.findById(req.params.id);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    batch.students.enrolled.push(...req.body.students);
    batch.students.total = batch.students.enrolled.length;
    await batch.save();

    logger.info(`Students added to batch: ${batch.name}`);

    res.json({
      success: true,
      message: 'Students added successfully',
      data: { batch }
    });
  } catch (error) {
    logger.error('Add students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add students',
      error: error.message
    });
  }
});

export default router;
