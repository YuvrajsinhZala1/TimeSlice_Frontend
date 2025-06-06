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
    default: true
  },
  canAcceptTasks: {
    type: Boolean,
    default: true
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  skills: [{
    type: String,
    trim: true
  }],
  hourlyRate: {
    type: Number,
    min: 0
  },
  availability: {
    type: String,
    default: ''
  },
  portfolioLinks: [{
    title: {
      type: String,
      required: true,
      maxlength: 100
    },
    url: {
      type: String,
      required: true
    },
    description: {
      type: String,
      maxlength: 300
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  socialLinks: {
    website: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    projectNotifications: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false }
  },
  credits: {
    type: Number,
    default: 100
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
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
  totalEarnings: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  responseTime: {
    type: String,
    default: '< 1 hour'
  },
  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  avatar: {
    filename: String,
    url: String
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
  },
  verificationStatus: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    identity: { type: Boolean, default: false }
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'pending'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
UserSchema.index({ skills: 1, primaryRole: 1, isOnline: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ rating: -1, totalRatings: -1 });

// Virtual for profile completion calculation
UserSchema.virtual('calculatedProfileCompletion').get(function() {
  let completion = 0;
  const checks = [
    this.username,
    this.email,
    this.bio && this.bio.length > 20,
    this.skills && this.skills.length > 0,
    this.hourlyRate,
    this.availability,
    this.portfolioLinks && this.portfolioLinks.length > 0,
    this.socialLinks && Object.values(this.socialLinks).some(link => link)
  ];
  
  completion = (checks.filter(Boolean).length / checks.length) * 100;
  return Math.round(completion);
});

// Method to update profile completion
UserSchema.methods.updateProfileCompletion = function() {
  this.profileCompletion = this.calculatedProfileCompletion;
  return this.save();
};

// Method to calculate success rate
UserSchema.methods.calculateSuccessRate = async function() {
  const Application = mongoose.model('Application');
  const totalApplications = await Application.countDocuments({ 
    applicantId: this._id 
  });
  const acceptedApplications = await Application.countDocuments({ 
    applicantId: this._id, 
    status: 'accepted' 
  });
  
  this.successRate = totalApplications > 0 
    ? Math.round((acceptedApplications / totalApplications) * 100) 
    : 0;
  
  return this.save();
};

// Method to update user rating
UserSchema.methods.updateRating = function(newRating) {
  const totalRatings = this.totalRatings + 1;
  const newAvgRating = ((this.rating * this.totalRatings) + newRating) / totalRatings;
  
  this.rating = Math.round(newAvgRating * 10) / 10; // Round to 1 decimal
  this.totalRatings = totalRatings;
  
  return this.save();
};

// Method to update online status
UserSchema.methods.setOnlineStatus = function(isOnline) {
  this.isOnline = isOnline;
  this.lastSeen = new Date();
  return this.save();
};

// Static method to find users by skills
UserSchema.statics.findBySkills = function(skills) {
  return this.find({
    skills: { $in: skills },
    accountStatus: 'active'
  }).sort({ rating: -1, totalRatings: -1 });
};

// Pre-save middleware to update profile completion
UserSchema.pre('save', function(next) {
  if (this.isModified(['bio', 'skills', 'hourlyRate', 'availability', 'portfolioLinks', 'socialLinks'])) {
    this.profileCompletion = this.calculatedProfileCompletion;
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);