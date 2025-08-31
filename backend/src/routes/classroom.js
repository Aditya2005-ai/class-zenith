import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Classroom from '../models/Classroom.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/classrooms
// @desc    Get all classrooms
// @access  Private
router.get('/', authenticate, [
  query('type').optional().isIn(['Theory', 'Practical Lab', 'Seminar Hall', 'Auditorium', 'Computer Lab', 'Research Lab']),
  query('building').optional().trim(),
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

    const { type, building, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    
    if (type) query.type = type;
    if (building) query['location.building'] = building;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { 'location.building': { $regex: search, $options: 'i' } }
      ];
    }

    const classrooms = await Classroom.find(query)
      .populate('department', 'name code')
      .sort({ 'location.building': 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Classroom.countDocuments(query);

    res.json({
      success: true,
      data: {
        classrooms,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Get classrooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classrooms',
      error: error.message
    });
  }
});

// @route   GET /api/classrooms/:id
// @desc    Get classroom by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('department', 'name code');

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found'
      });
    }

    res.json({
      success: true,
      data: { classroom }
    });
  } catch (error) {
    logger.error('Get classroom by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classroom',
      error: error.message
    });
  }
});

// @route   POST /api/classrooms
// @desc    Create new classroom
// @access  Private (Admin/Coordinator)
router.post('/', authenticate, authorize('admin', 'coordinator'), [
  body('name').notEmpty().trim(),
  body('code').notEmpty().trim().toUpperCase(),
  body('type').isIn(['Theory', 'Practical Lab', 'Seminar Hall', 'Auditorium', 'Computer Lab', 'Research Lab']),
  body('capacity').isInt({ min: 1 }),
  body('location.building').notEmpty().trim(),
  body('location.floor').notEmpty().trim()
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

    const classroom = new Classroom(req.body);
    await classroom.save();

    logger.info(`New classroom created: ${classroom.name} (${classroom.code})`);

    res.status(201).json({
      success: true,
      message: 'Classroom created successfully',
      data: { classroom }
    });
  } catch (error) {
    logger.error('Create classroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create classroom',
      error: error.message
    });
  }
});

// @route   PUT /api/classrooms/:id
// @desc    Update classroom
// @access  Private (Admin/Coordinator)
router.put('/:id', authenticate, authorize('admin', 'coordinator'), async (req, res) => {
  try {
    const classroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found'
      });
    }

    logger.info(`Classroom updated: ${classroom.name} (${classroom.code})`);

    res.json({
      success: true,
      message: 'Classroom updated successfully',
      data: { classroom }
    });
  } catch (error) {
    logger.error('Update classroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update classroom',
      error: error.message
    });
  }
});

// @route   DELETE /api/classrooms/:id
// @desc    Delete classroom (soft delete)
// @access  Private (Admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const classroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!classroom) {
      return res.status(404).json({
        success: false,
        message: 'Classroom not found'
      });
    }

    logger.info(`Classroom deactivated: ${classroom.name} (${classroom.code})`);

    res.json({
      success: true,
      message: 'Classroom deactivated successfully'
    });
  } catch (error) {
    logger.error('Delete classroom error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete classroom',
      error: error.message
    });
  }
});

// @route   GET /api/classrooms/availability/:day/:startTime/:endTime
// @desc    Check classroom availability for specific time slot
// @access  Private
router.get('/availability/:day/:startTime/:endTime', authenticate, async (req, res) => {
  try {
    const { day, startTime, endTime } = req.params;
    const { type, capacity } = req.query;
    
    let query = { isActive: true };
    if (type) query.type = type;
    if (capacity) query.capacity = { $gte: parseInt(capacity) };

    const classrooms = await Classroom.find(query);

    const available = classrooms.filter(classroom => 
      classroom.isAvailableAt(day, startTime, endTime)
    );

    res.json({
      success: true,
      data: { 
        available,
        total: classrooms.length,
        availableCount: available.length
      }
    });
  } catch (error) {
    logger.error('Check classroom availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error.message
    });
  }
});

// @route   GET /api/classrooms/utilization
// @desc    Get classroom utilization statistics
// @access  Private
router.get('/utilization/stats', authenticate, async (req, res) => {
  try {
    const classrooms = await Classroom.find({ isActive: true });
    
    const utilizationStats = classrooms.map(classroom => ({
      id: classroom._id,
      name: classroom.name,
      type: classroom.type,
      capacity: classroom.capacity,
      utilization: classroom.calculateUtilization(),
      hoursPerWeek: classroom.utilization.hoursPerWeek
    }));

    const avgUtilization = utilizationStats.reduce((sum, stat) => sum + stat.utilization, 0) / utilizationStats.length;

    res.json({
      success: true,
      data: {
        classrooms: utilizationStats,
        averageUtilization: avgUtilization,
        totalClassrooms: classrooms.length
      }
    });
  } catch (error) {
    logger.error('Get utilization stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch utilization statistics',
      error: error.message
    });
  }
});

export default router;
