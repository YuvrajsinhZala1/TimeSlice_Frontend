const express = require('express');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create booking
router.post('/', auth, async (req, res) => {
  try {
    const { slotId } = req.body;

    // Get slot
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: 'Slot already booked' });
    }

    if (slot.userId.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot book your own slot' });
    }

    // Check user credits
    if (req.user.credits < slot.credits) {
      return res.status(400).json({ message: 'Insufficient credits' });
    }

    // Create booking
    const booking = new Booking({
      slotId,
      bookedBy: req.user.id,
      bookedFrom: slot.userId
    });

    // Update slot
    slot.isBooked = true;
    await slot.save();

    // Update user credits
    await User.findByIdAndUpdate(req.user.id, { 
      $inc: { credits: -slot.credits } 
    });
    await User.findByIdAndUpdate(slot.userId, { 
      $inc: { credits: slot.credits } 
    });

    await booking.save();
    await booking.populate([
      { path: 'slotId', populate: { path: 'userId', select: 'username' } },
      { path: 'bookedBy', select: 'username' },
      { path: 'bookedFrom', select: 'username' }
    ]);

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user bookings
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ bookedBy: req.user.id }, { bookedFrom: req.user.id }]
    })
    .populate([
      { path: 'slotId', populate: { path: 'userId', select: 'username' } },
      { path: 'bookedBy', select: 'username' },
      { path: 'bookedFrom', select: 'username' }
    ])
    .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review
router.post('/review/:bookingId', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is part of this booking
    if (booking.bookedBy.toString() !== req.user.id && 
        booking.bookedFrom.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    booking.rating = rating;
    booking.review = review;
    booking.status = 'completed';
    await booking.save();

    // Update provider's rating
    const providerId = booking.bookedFrom;
    const provider = await User.findById(providerId);
    const newTotalRatings = provider.totalRatings + 1;
    const newRating = ((provider.rating * provider.totalRatings) + rating) / newTotalRatings;
    
    provider.rating = newRating;
    provider.totalRatings = newTotalRatings;
    await provider.save();

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;