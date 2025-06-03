const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  proposedCredits: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  responseMessage: {
    type: String,
    default: ''
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure one application per user per task
ApplicationSchema.index({ taskId: 1, applicantId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);