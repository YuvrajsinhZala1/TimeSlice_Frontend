const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  primaryRole: {
    type: String,
    enum: ['helper', 'taskProvider'],
    required: true
  },
  canCreateTasks: {
    type: Boolean,
    default: true // Everyone can create tasks now
  },
  canAcceptTasks: {
    type: Boolean,
    default: true // Everyone can accept tasks now
  },
  bio: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  credits: {
    type: Number,
    default: 100
  },
  rating: {
    type: Number,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  completedTasks: {
    type: Number,
    default: 0
  },
  tasksCreated: {
    type: Number,
    default: 0
  },
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);