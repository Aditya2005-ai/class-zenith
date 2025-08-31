import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Subject from '../models/Subject.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Private
router.get('/', authenticate, [
  query('department').optional().isMongoId(),
  query('program').optional().isIn(['B.Pharm', 'M.Pharm', 'Pharm.D', 'B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA']),
  query('year').optional().isInt({ min: 1, max: 4 }),
  query('semester').optional().isInt({ min: 1, max: 8 }),
  query('type').optional().isIn(['Theory', 'Practical', 'Tutorial', 'Seminar', 'Project', 'Elective']),
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

    const { department, program, year, semester, type, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    
    if (department) query.department = department;
    if (program) query.program = program;
    if (year) query.year = parseInt(year);
    if (semester) query.semester = parseInt(semester);
    if (type) query.type = type;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { shortName: { $regex: search, $options: 'i' } }
      ];
    }

    const subjects = await Subject.find(query)
      .populate('department', 'name code')
      .sort({ program: 1, year: 1, semester: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Subject.countDocuments(query);

    res.json({
      success: true,
      data: {
        subjects,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: error.message
    });
  }
});

// @route   GET /api/subjects/:id
// @desc    Get subject by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('department', 'name code');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.json({
      success: true,
      data: { subject }
    });
  } catch (error) {
    logger.error('Get subject by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject',
      error: error.message
    });
  }
});

// @route   POST /api/subjects
// @desc    Create new subject
// @access  Private (Admin/Coordinator)
router.post('/', authenticate, authorize('admin', 'coordinator'), [
  body('name').notEmpty().trim(),
  body('code').notEmpty().trim().toUpperCase(),
  body('department').isMongoId(),
  body('semester').isInt({ min: 1, max: 8 }),
  body('year').isInt({ min: 1, max: 4 }),
  body('program').isIn(['B.Pharm', 'M.Pharm', 'Pharm.D', 'B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA']),
  body('type').isIn(['Theory', 'Practical', 'Tutorial', 'Seminar', 'Project', 'Elective']),
  body('credits').isNumeric()
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

    const subject = new Subject(req.body);
    await subject.save();

    await subject.populate('department', 'name code');

    logger.info(`New subject created: ${subject.name} (${subject.code})`);

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: { subject }
    });
  } catch (error) {
    logger.error('Create subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subject',
      error: error.message
    });
  }
});

// @route   PUT /api/subjects/:id
// @desc    Update subject
// @access  Private (Admin/Coordinator)
router.put('/:id', authenticate, authorize('admin', 'coordinator'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('department', 'name code');

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    logger.info(`Subject updated: ${subject.name} (${subject.code})`);

    res.json({
      success: true,
      message: 'Subject updated successfully',
      data: { subject }
    });
  } catch (error) {
    logger.error('Update subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subject',
      error: error.message
    });
  }
});

// @route   DELETE /api/subjects/:id
// @desc    Delete subject (soft delete)
// @access  Private (Admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    logger.info(`Subject deactivated: ${subject.name} (${subject.code})`);

    res.json({
      success: true,
      message: 'Subject deactivated successfully'
    });
  } catch (error) {
    logger.error('Delete subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subject',
      error: error.message
    });
  }
});

export default router;
