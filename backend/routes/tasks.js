const express = require('express');
const Task = require('../models/Task');
const Application = require('../models/Application');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create task (Anyone can create now)
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user.canCreateTasks) {
      return res.status(403).json({ message: 'You are not allowed to create tasks' });
    }

    const { title, description, skillsRequired, dateTime, duration, credits, urgency } = req.body;

    const task = new Task({
      taskProviderId: req.user.id,
      title,
      description,
      skillsRequired: skillsRequired || [],
      dateTime,
      duration,
      credits,
      urgency: urgency || 'medium'
    });

    await task.save();
    await task.populate('taskProviderId', 'username rating');

    // Update user's tasks created count
    await User.findByIdAndUpdate(req.user.id, { $inc: { tasksCreated: 1 } });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks (with smart filtering)
router.get('/', auth, async (req, res) => {
  try {
    const {
      search,
      skillRequired,
      urgency,
      duration,
      minCredits,
      maxCredits,
      sortBy = 'dateTime',
      sortOrder = 'asc',
      showAll = 'false'
    } = req.query;

    // Build query object
    let query = {
      status: 'open',
      dateTime: { $gte: new Date() },
      taskProviderId: { $ne: req.user.id } // Exclude user's own tasks
    };

    // If user has skills and not showing all, filter by skills
    if (showAll !== 'true' && req.user.skills.length > 0) {
      query.skillsRequired = { $in: req.user.skills };
    }

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by specific skill
    if (skillRequired) {
      query.skillsRequired = { $in: [skillRequired] };
    }

    // Filter by urgency
    if (urgency) {
      query.urgency = urgency;
    }

    // Filter by duration
    if (duration) {
      query.duration = parseInt(duration);
    }

    // Filter by credits range
    if (minCredits || maxCredits) {
      query.credits = {};
      if (minCredits) query.credits.$gte = parseInt(minCredits);
      if (maxCredits) query.credits.$lte = parseInt(maxCredits);
    }

    // Build sort object
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(query)
      .populate('taskProviderId', 'username rating isOnline')
      .populate('applicants')
      .sort(sortOptions);

    // Add application status for current user
    const tasksWithApplicationStatus = await Promise.all(
      tasks.map(async (task) => {
        const userApplication = await Application.findOne({
          taskId: task._id,
          applicantId: req.user.id
        });
        
        return {
          ...task.toObject(),
          userApplicationStatus: userApplication ? userApplication.status : null,
          applicantCount: task.applicants.length
        };
      })
    );

    res.json(tasksWithApplicationStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all unique skills for filter dropdown
router.get('/skills', async (req, res) => {
  try {
    const skills = await Task.distinct('skillsRequired', {
      status: 'open',
      dateTime: { $gte: new Date() }
    });
    
    res.json(skills.filter(skill => skill && skill.trim() !== ''));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's tasks
router.get('/my-tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ taskProviderId: req.user.id })
      .populate('taskProviderId', 'username rating')
      .populate('selectedHelper', 'username rating')
      .populate({
        path: 'applicants',
        populate: {
          path: 'applicantId',
          select: 'username rating skills'
        }
      })
      .sort({ dateTime: 1 });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single task with applications
router.get('/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('taskProviderId', 'username rating')
      .populate('selectedHelper', 'username rating')
      .populate({
        path: 'applicants',
        populate: {
          path: 'applicantId',
          select: 'username rating skills completedTasks'
        }
      });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task
router.put('/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.taskProviderId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (task.status !== 'open') {
      return res.status(400).json({ message: 'Cannot update task that is not open' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.taskId,
      req.body,
      { new: true }
    ).populate('taskProviderId', 'username rating');

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete task
router.delete('/:taskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.taskProviderId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (task.status !== 'open') {
      return res.status(400).json({ message: 'Cannot delete task that is not open' });
    }

    await Task.findByIdAndDelete(req.params.taskId);
    
    // Delete related applications
    await Application.deleteMany({ taskId: req.params.taskId });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;