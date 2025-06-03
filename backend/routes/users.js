const express = require('express');
const User = require('../models/User');
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

module.exports = router;