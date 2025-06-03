const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    enum: [30, 60]
  },
  description: {
    type: String,
    required: true
  },
  skillTags: [{
    type: String
  }],
  credits: {
    type: Number,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Slot', SlotSchema);