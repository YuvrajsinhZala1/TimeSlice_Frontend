const express = require('express');
const Application = require('../models/Application');
const Task = require('../models/Task');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply for a task
router.post('/', auth, async (req, res) => {
  try {
    const { taskId, message, proposedCredits } = req.body;

    if (!req.user.canAcceptTasks) {
      return res.status(403).json({ message: 'You are not allowed to apply for tasks' });
    }

    // Get task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.status !== 'open') {
      return res.status(400).json({ message: 'Task is not accepting applications' });
    }

    if (task.taskProviderId.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot apply to your own task' });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      taskId,
      applicantId: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this task' });
    }

    // Check if helper has required skills
    const hasRequiredSkills = task.skillsRequired.some(skill => 
      req.user.skills.includes(skill)
    );

    if (!hasRequiredSkills) {
      return res.status(400).json({ 
        message: 'You do not have the required skills for this task' 
      });
    }

    // Create application
    const application = new Application({
      taskId,
      applicantId: req.user.id,
      taskProviderId: task.taskProviderId,
      message,
      proposedCredits: proposedCredits || task.credits
    });

    await application.save();

    // Add application to task
    task.applicants.push(application._id);
    if (task.applicants.length >= task.maxApplications) {
      task.acceptsApplications = false;
    }
    await task.save();

    await application.populate([
      { path: 'applicantId', select: 'username rating skills' },
      { path: 'taskId', select: 'title' }
    ]);

    res.status(201).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's applications
router.get('/my-applications', auth, async (req, res) => {
  try {
    const applications = await Application.find({ applicantId: req.user.id })
      .populate('taskId', 'title description dateTime credits status')
      .populate('taskProviderId', 'username rating')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get applications for user's tasks
router.get('/received', auth, async (req, res) => {
  try {
    const applications = await Application.find({ taskProviderId: req.user.id })
      .populate('taskId', 'title description dateTime credits')
      .populate('applicantId', 'username rating skills completedTasks')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Respond to application (accept/reject)
router.put('/:applicationId/respond', auth, async (req, res) => {
  try {
    const { status, responseMessage, agreedCredits } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.applicationId)
      .populate('taskId')
      .populate('applicantId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.taskProviderId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Application already processed' });
    }

    application.status = status;
    application.responseMessage = responseMessage || '';
    application.respondedAt = new Date();

    if (status === 'accepted') {
      // Update task
      const task = application.taskId;
      task.status = 'assigned';
      task.selectedHelper = application.applicantId._id;
      await task.save();

      // Create booking
      const booking = new Booking({
        taskId: task._id,
        applicationId: application._id,
        helper: application.applicantId._id,
        taskProvider: req.user.id,
        agreedCredits: agreedCredits || application.proposedCredits
      });

      await booking.save();

      // Create chat for communication
      const chat = new Chat({
        taskId: task._id,
        participants: [req.user.id, application.applicantId._id]
      });

      await chat.save();

      // Link chat to booking
      booking.chatId = chat._id;
      await booking.save();

      // Reject other pending applications for this task
      await Application.updateMany(
        { 
          taskId: task._id, 
          _id: { $ne: application._id },
          status: 'pending' 
        },
        { 
          status: 'rejected',
          responseMessage: 'Task has been assigned to another helper',
          respondedAt: new Date()
        }
      );
    }

    await application.save();

    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Withdraw application
router.put('/:applicationId/withdraw', auth, async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.applicantId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot withdraw non-pending application' });
    }

    application.status = 'withdrawn';
    await application.save();

    // Remove from task applicants
    await Task.findByIdAndUpdate(application.taskId, {
      $pull: { applicants: application._id }
    });

    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;