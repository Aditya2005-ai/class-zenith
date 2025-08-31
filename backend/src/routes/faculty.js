import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Faculty from '../models/Faculty.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/faculty
// @desc    Get all faculty members
// @access  Private
router.get('/', authenticate, [
  query('department').optional().isMongoId(),
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

    const { department, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };
    
    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const faculty = await Faculty.find(query)
      .populate('department', 'name code')
      .populate('subjects', 'name code type')
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Faculty.countDocuments(query);

    res.json({
      success: true,
      data: {
        faculty,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Get faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty',
      error: error.message
    });
  }
});

// @route   GET /api/faculty/:id
// @desc    Get faculty by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id)
      .populate('department', 'name code')
      .populate('subjects', 'name code type hoursPerWeek')
      .populate('preferences.preferredClassrooms', 'name code type');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    res.json({
      success: true,
      data: { faculty }
    });
  } catch (error) {
    logger.error('Get faculty by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty',
      error: error.message
    });
  }
});

// @route   POST /api/faculty
// @desc    Create new faculty
// @access  Private (Admin/Coordinator)
router.post('/', authenticate, authorize('admin', 'coordinator'), [
  body('employeeId').notEmpty().trim(),
  body('name').notEmpty().trim(),
  body('code').notEmpty().trim().toUpperCase(),
  body('email').isEmail().normalizeEmail(),
  body('department').isMongoId(),
  body('designation').isIn(['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Guest Faculty'])
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

    const faculty = new Faculty(req.body);
    await faculty.save();

    await faculty.populate('department', 'name code');

    logger.info(`New faculty created: ${faculty.name} (${faculty.code})`);

    res.status(201).json({
      success: true,
      message: 'Faculty created successfully',
      data: { faculty }
    });
  } catch (error) {
    logger.error('Create faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create faculty',
      error: error.message
    });
  }
});

// @route   PUT /api/faculty/:id
// @desc    Update faculty
// @access  Private (Admin/Coordinator)
router.put('/:id', authenticate, authorize('admin', 'coordinator'), async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('department', 'name code');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    logger.info(`Faculty updated: ${faculty.name} (${faculty.code})`);

    res.json({
      success: true,
      message: 'Faculty updated successfully',
      data: { faculty }
    });
  } catch (error) {
    logger.error('Update faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update faculty',
      error: error.message
    });
  }
});

// @route   DELETE /api/faculty/:id
// @desc    Delete faculty (soft delete)
// @access  Private (Admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    logger.info(`Faculty deactivated: ${faculty.name} (${faculty.code})`);

    res.json({
      success: true,
      message: 'Faculty deactivated successfully'
    });
  } catch (error) {
    logger.error('Delete faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete faculty',
      error: error.message
    });
  }
});

// @route   GET /api/faculty/:id/workload
// @desc    Get faculty workload details
// @access  Private
router.get('/:id/workload', authenticate, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    const workload = faculty.calculateWorkload();

    res.json({
      success: true,
      data: { workload }
    });
  } catch (error) {
    logger.error('Get faculty workload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workload',
      error: error.message
    });
  }
});

// @route   POST /api/faculty/:id/leave
// @desc    Apply for leave
// @access  Private
router.post('/:id/leave', authenticate, [
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('type').isIn(['sick', 'casual', 'earned', 'maternity', 'paternity', 'conference', 'other']),
  body('reason').notEmpty().trim()
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

    const faculty = await Faculty.findById(req.params.id);
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    const leaveApplication = {
      ...req.body,
      appliedDate: new Date()
    };

    faculty.leaves.push(leaveApplication);
    await faculty.save();

    logger.info(`Leave application submitted for faculty: ${faculty.name}`);

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: { leave: leaveApplication }
    });
  } catch (error) {
    logger.error('Apply leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply for leave',
      error: error.message
    });
  }
});

// @route   GET /api/faculty/availability/:day/:startTime/:endTime
// @desc    Check faculty availability for specific time slot
// @access  Private
router.get('/availability/:day/:startTime/:endTime', authenticate, async (req, res) => {
  try {
    const { day, startTime, endTime } = req.params;
    
    const availableFaculty = await Faculty.find({ isActive: true })
      .populate('department', 'name code');

    const available = availableFaculty.filter(faculty => 
      faculty.isAvailableAt(day, startTime, endTime)
    );

    res.json({
      success: true,
      data: { 
        available,
        total: availableFaculty.length,
        availableCount: available.length
      }
    });
  } catch (error) {
    logger.error('Check faculty availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error.message
    });
  }
});

export default router;
