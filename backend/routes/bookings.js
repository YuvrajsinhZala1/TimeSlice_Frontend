const express = require('express');
const Booking = require('../models/Booking');
const Task = require('../models/Task');
const User = require('../models/User');
const Application = require('../models/Application');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user bookings
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // Get bookings where user is either helper or task provider
    query.$or = [
      { helper: req.user.id },
      { taskProvider: req.user.id }
    ];

    const bookings = await Booking.find(query)
      .populate([
        { path: 'taskId', populate: { path: 'taskProviderId', select: 'username' } },
        { path: 'helper', select: 'username rating' },
        { path: 'taskProvider', select: 'username rating' },
        { path: 'applicationId' },
        { path: 'chatId' }
      ])
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status
router.put('/:bookingId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (booking.helper.toString() !== req.user.id && 
        booking.taskProvider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const oldStatus = booking.status;
    booking.status = status;

    if (status === 'in-progress' && oldStatus === 'confirmed') {
      booking.startedAt = new Date();
      // Update task status
      await Task.findByIdAndUpdate(booking.taskId, { status: 'in-progress' });
    }

    if (status === 'completed') {
      booking.completedAt = new Date();
      
      // Update task
      await Task.findByIdAndUpdate(booking.taskId, { status: 'completed' });
      
      // Transfer credits from task provider to helper
      await User.findByIdAndUpdate(booking.taskProvider, { 
        $inc: { credits: -booking.agreedCredits } 
      });
      await User.findByIdAndUpdate(booking.helper, { 
        $inc: { credits: booking.agreedCredits, completedTasks: 1 } 
      });
    }

    if (status === 'cancelled') {
      // Update task back to open if cancelled early
      if (oldStatus === 'confirmed') {
        await Task.findByIdAndUpdate(booking.taskId, { 
          status: 'open',
          selectedHelper: null 
        });
      }
    }

    await booking.save();
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review
router.post('/review/:bookingId', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is part of this booking
    const isHelper = booking.helper.toString() === req.user.id;
    const isTaskProvider = booking.taskProvider.toString() === req.user.id;

    if (!isHelper && !isTaskProvider) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    // Update appropriate review
    if (isHelper) {
      if (booking.helperReview.rating) {
        return res.status(400).json({ message: 'You have already reviewed this booking' });
      }
      booking.helperReview = { rating, review };
      // Update task provider's rating
      await updateUserRating(booking.taskProvider, rating);
    } else {
      if (booking.taskProviderReview.rating) {
        return res.status(400).json({ message: 'You have already reviewed this booking' });
      }
      booking.taskProviderReview = { rating, review };
      // Update helper's rating
      await updateUserRating(booking.helper, rating);
    }

    await booking.save();
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update user rating
async function updateUserRating(userId, newRating) {
  const user = await User.findById(userId);
  const totalRatings = user.totalRatings + 1;
  const newAvgRating = ((user.rating * user.totalRatings) + newRating) / totalRatings;
  
  user.rating = newAvgRating;
  user.totalRatings = totalRatings;
  await user.save();
}

module.exports = router;