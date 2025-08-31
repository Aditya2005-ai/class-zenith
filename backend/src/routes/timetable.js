import express from 'express';
import { body, query, validationResult } from 'express-validator';
import Timetable from '../models/Timetable.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/timetables
// @desc    Get all timetables
// @access  Private
router.get('/', authenticate, [
  query('department').optional().isMongoId(),
  query('batch').optional().isMongoId(),
  query('type').optional().isIn(['batch', 'faculty', 'classroom', 'master']),
  query('status').optional().isIn(['draft', 'generated', 'under_review', 'approved', 'published', 'archived']),
  query('academicYear').optional().trim(),
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

    const { 
      department, 
      batch, 
      type, 
      status, 
      academicYear, 
      page = 1, 
      limit = 10 
    } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    
    if (department) query.department = department;
    if (batch) query.batch = batch;
    if (type) query.type = type;
    if (status) query.status = status;
    if (academicYear) query.academicYear = academicYear;

    const timetables = await Timetable.find(query)
      .populate('department', 'name code')
      .populate('batch', 'name code program year semester section')
      .populate('workflow.createdBy', 'username profile.firstName profile.lastName')
      .populate('workflow.approvedBy', 'username profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Timetable.countDocuments(query);

    res.json({
      success: true,
      data: {
        timetables,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Get timetables error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetables',
      error: error.message
    });
  }
});

// @route   GET /api/timetables/:id
// @desc    Get timetable by ID
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('department', 'name code')
      .populate('batch', 'name code program year semester section students')
      .populate('schedule.timeSlots.subject', 'name code type')
      .populate('schedule.timeSlots.faculty', 'name code designation')
      .populate('schedule.timeSlots.classroom', 'name code type capacity location')
      .populate('workflow.createdBy', 'username profile')
      .populate('workflow.reviewers.user', 'username profile')
      .populate('workflow.approvedBy', 'username profile');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    res.json({
      success: true,
      data: { timetable }
    });
  } catch (error) {
    logger.error('Get timetable by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetable',
      error: error.message
    });
  }
});

// @route   PUT /api/timetables/:id
// @desc    Update timetable
// @access  Private (Admin/Coordinator)
router.put('/:id', authenticate, authorize('admin', 'coordinator'), async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('department', 'name code')
     .populate('batch', 'name code');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    logger.info(`Timetable updated: ${timetable.name} by ${req.user.username}`);

    res.json({
      success: true,
      message: 'Timetable updated successfully',
      data: { timetable }
    });
  } catch (error) {
    logger.error('Update timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update timetable',
      error: error.message
    });
  }
});

// @route   POST /api/timetables/:id/submit-review
// @desc    Submit timetable for review
// @access  Private (Admin/Coordinator)
router.post('/:id/submit-review', authenticate, authorize('admin', 'coordinator'), [
  body('reviewers').isArray(),
  body('reviewers.*.user').isMongoId(),
  body('reviewers.*.role').notEmpty().trim()
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

    const { reviewers } = req.body;

    const timetable = await Timetable.findById(req.params.id);
    
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    if (timetable.status !== 'generated' && timetable.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Timetable cannot be submitted for review in current status'
      });
    }

    timetable.status = 'under_review';
    timetable.workflow.reviewers = reviewers.map(reviewer => ({
      ...reviewer,
      status: 'pending'
    }));

    await timetable.save();

    logger.info(`Timetable submitted for review: ${timetable.name}`);

    res.json({
      success: true,
      message: 'Timetable submitted for review successfully',
      data: { timetable }
    });
  } catch (error) {
    logger.error('Submit timetable for review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit timetable for review',
      error: error.message
    });
  }
});

// @route   POST /api/timetables/:id/review
// @desc    Review timetable
// @access  Private
router.post('/:id/review', authenticate, [
  body('status').isIn(['approved', 'rejected', 'changes_requested']),
  body('comments').optional().trim()
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

    const { status, comments } = req.body;

    const timetable = await Timetable.findById(req.params.id);
    
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    // Find reviewer
    const reviewerIndex = timetable.workflow.reviewers.findIndex(
      reviewer => reviewer.user.equals(req.user._id)
    );

    if (reviewerIndex === -1) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to review this timetable'
      });
    }

    // Update reviewer status
    timetable.workflow.reviewers[reviewerIndex].status = status;
    timetable.workflow.reviewers[reviewerIndex].comments = comments;
    timetable.workflow.reviewers[reviewerIndex].reviewedAt = new Date();

    // Check if all reviewers have completed
    const allReviewed = timetable.workflow.reviewers.every(
      reviewer => reviewer.status !== 'pending'
    );

    if (allReviewed) {
      const allApproved = timetable.workflow.reviewers.every(
        reviewer => reviewer.status === 'approved'
      );

      if (allApproved) {
        timetable.status = 'approved';
        timetable.workflow.approvedBy = req.user._id;
        timetable.workflow.approvedAt = new Date();
      } else {
        timetable.status = 'draft'; // Back to draft for changes
      }
    }

    await timetable.save();

    logger.info(`Timetable reviewed: ${timetable.name} by ${req.user.username} - ${status}`);

    res.json({
      success: true,
      message: 'Review submitted successfully',
      data: { timetable }
    });
  } catch (error) {
    logger.error('Review timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message
    });
  }
});

// @route   POST /api/timetables/:id/publish
// @desc    Publish approved timetable
// @access  Private (Admin)
router.post('/:id/publish', authenticate, authorize('admin'), async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    if (timetable.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved timetables can be published'
      });
    }

    timetable.status = 'published';
    timetable.workflow.publishedAt = new Date();
    await timetable.save();

    logger.info(`Timetable published: ${timetable.name} by ${req.user.username}`);

    res.json({
      success: true,
      message: 'Timetable published successfully',
      data: { timetable }
    });
  } catch (error) {
    logger.error('Publish timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish timetable',
      error: error.message
    });
  }
});

// @route   GET /api/timetables/:id/conflicts
// @desc    Get timetable conflicts
// @access  Private
router.get('/:id/conflicts', authenticate, async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('conflicts.affectedEntities.entityId');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    // Refresh conflicts detection
    const currentConflicts = timetable.detectConflicts();
    
    res.json({
      success: true,
      data: {
        conflicts: currentConflicts,
        summary: {
          total: currentConflicts.length,
          critical: currentConflicts.filter(c => c.severity === 'critical').length,
          high: currentConflicts.filter(c => c.severity === 'high').length,
          medium: currentConflicts.filter(c => c.severity === 'medium').length,
          low: currentConflicts.filter(c => c.severity === 'low').length
        }
      }
    });
  } catch (error) {
    logger.error('Get timetable conflicts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conflicts',
      error: error.message
    });
  }
});

// @route   GET /api/timetables/:id/statistics
// @desc    Get timetable statistics
// @access  Private
router.get('/:id/statistics', authenticate, async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('schedule.timeSlots.faculty', 'name workload')
      .populate('schedule.timeSlots.classroom', 'name capacity');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    const statistics = timetable.calculateStatistics();

    res.json({
      success: true,
      data: { statistics }
    });
  } catch (error) {
    logger.error('Get timetable statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// @route   DELETE /api/timetables/:id
// @desc    Archive timetable
// @access  Private (Admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'archived',
        isActive: false 
      },
      { new: true }
    );

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    logger.info(`Timetable archived: ${timetable.name} by ${req.user.username}`);

    res.json({
      success: true,
      message: 'Timetable archived successfully'
    });
  } catch (error) {
    logger.error('Archive timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive timetable',
      error: error.message
    });
  }
});

export default router;
