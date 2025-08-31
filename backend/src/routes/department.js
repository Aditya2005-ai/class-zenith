import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Department from '../models/Department.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/departments
// @desc    Get all departments
// @access  Private
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim()
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

    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const departments = await Department.find(query)
      .populate('head', 'name code designation')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Department.countDocuments(query);

    res.json({
      success: true,
      data: {
        departments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments',
      error: error.message
    });
  }
});

// @route   GET /api/departments/:id
// @desc    Get department by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('head', 'name code designation email phone');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: { department }
    });
  } catch (error) {
    logger.error('Get department by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department',
      error: error.message
    });
  }
});

// @route   POST /api/departments
// @desc    Create new department
// @access  Private (Admin)
router.post('/', authenticate, authorize('admin'), [
  body('name').notEmpty().trim(),
  body('code').notEmpty().trim().toUpperCase(),
  body('workingDays').isArray(),
  body('maxClassesPerDay').optional().isInt({ min: 1, max: 12 }),
  body('maxClassesPerWeek').optional().isInt({ min: 1, max: 60 })
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

    const department = new Department(req.body);
    await department.save();

    logger.info(`New department created: ${department.name} (${department.code})`);

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department }
    });
  } catch (error) {
    logger.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create department',
      error: error.message
    });
  }
});

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private (Admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('head', 'name code');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    logger.info(`Department updated: ${department.name} (${department.code})`);

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: { department }
    });
  } catch (error) {
    logger.error('Update department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update department',
      error: error.message
    });
  }
});

// @route   GET /api/departments/:id/shifts
// @desc    Get department shifts
// @access  Private
router.get('/:id/shifts', authenticate, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: { 
        shifts: department.shifts.filter(shift => shift.isActive),
        workingDays: department.workingDays
      }
    });
  } catch (error) {
    logger.error('Get department shifts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shifts',
      error: error.message
    });
  }
});

// @route   POST /api/departments/:id/shifts
// @desc    Add shift to department
// @access  Private (Admin)
router.post('/:id/shifts', authenticate, authorize('admin'), [
  body('name').notEmpty().trim(),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
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

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    department.shifts.push(req.body);
    await department.save();

    logger.info(`Shift added to department: ${department.name}`);

    res.status(201).json({
      success: true,
      message: 'Shift added successfully',
      data: { department }
    });
  } catch (error) {
    logger.error('Add shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add shift',
      error: error.message
    });
  }
});

export default router;
