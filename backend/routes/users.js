const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const Application = require('../models/Application');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

const router = express.Router();

// Get wallet info
router.get('/wallet', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('credits');
    res.json({ credits: user.credits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { bio, skills } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { bio, skills },
      { new: true }
    ).select('-passwordHash');

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get task-related stats
    const tasksCreated = await Task.countDocuments({ taskProviderId: user._id });
    const tasksCompleted = await Task.countDocuments({ 
      taskProviderId: user._id, 
      status: 'completed' 
    });
    
    // Get application stats
    const applicationsSubmitted = await Application.countDocuments({ 
      applicantId: user._id 
    });
    const applicationsAccepted = await Application.countDocuments({ 
      applicantId: user._id, 
      status: 'accepted' 
    });
    
    // Get bookings count
    const totalBookings = await Booking.countDocuments({
      $or: [{ helper: user._id }, { taskProvider: user._id }]
    });

    let stats = {
      credits: user.credits,
      rating: user.rating,
      totalRatings: user.totalRatings,
      completedTasks: user.completedTasks,
      tasksCreated,
      tasksCompleted,
      totalBookings,
      applicationsSubmitted,
      applicationsAccepted,
      applicationSuccessRate: applicationsSubmitted > 0 
        ? ((applicationsAccepted / applicationsSubmitted) * 100).toFixed(1) 
        : 0
    };

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle user capabilities
router.put('/toggle-capability', auth, async (req, res) => {
  try {
    const { capability } = req.body; // 'canCreateTasks' or 'canAcceptTasks'
    
    if (!['canCreateTasks', 'canAcceptTasks'].includes(capability)) {
      return res.status(400).json({ message: 'Invalid capability' });
    }

    const user = await User.findById(req.user.id);
    user[capability] = !user[capability];
    await user.save();

    res.json({ 
      message: `${capability} toggled successfully`,
      [capability]: user[capability]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;