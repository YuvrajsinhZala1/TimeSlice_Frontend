const express = require('express');
const Slot = require('../models/Slot');
const auth = require('../middleware/auth');

const router = express.Router();

// Create slot
router.post('/', auth, async (req, res) => {
  try {
    const { dateTime, duration, description, skillTags, credits } = req.body;

    const slot = new Slot({
      userId: req.user.id,
      dateTime,
      duration,
      description,
      skillTags: skillTags || [],
      credits
    });

    await slot.save();
    await slot.populate('userId', 'username skills rating');

    res.status(201).json(slot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all available slots
router.get('/', async (req, res) => {
  try {
    const slots = await Slot.find({ 
      isBooked: false,
      dateTime: { $gte: new Date() }
    })
    .populate('userId', 'username skills rating')
    .sort({ dateTime: 1 });

    res.json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's slots
router.get('/my-slots', auth, async (req, res) => {
  try {
    const slots = await Slot.find({ userId: req.user.id })
    .populate('userId', 'username skills rating')
    .sort({ dateTime: 1 });

    res.json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;