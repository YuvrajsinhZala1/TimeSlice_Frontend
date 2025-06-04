const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  taskProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  skillsRequired: [{
    type: String,
    required: true
  }],
  dateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: String, // Changed from enum to flexible string
    required: true
  },
  durationInMinutes: {
    type: Number, // For calculations and filtering
    required: true
  },
  credits: {
    type: Number,
    required: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-review', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  selectedHelper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  acceptsApplications: {
    type: Boolean,
    default: true
  },
  maxApplications: {
    type: Number,
    default: 10
  },
  completedByHelper: {
    type: Boolean,
    default: false
  },
  completedByProvider: {
    type: Boolean,
    default: false
  },
  completionNote: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);