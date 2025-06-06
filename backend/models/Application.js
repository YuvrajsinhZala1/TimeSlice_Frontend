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
  proposal: {
    type: String,
    required: true,
    maxlength: 2000,
    alias: 'message' // For backward compatibility
  },
  proposedCredits: {
    type: Number,
    required: true,
    min: 1
  },
  timeline: {
    type: String,
    maxlength: 200
  },
  experience: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'interviewed'],
    default: 'pending'
  },
  responseMessage: {
    type: String,
    default: '',
    maxlength: 500
  },
  respondedAt: {
    type: Date
  },
  feedback: {
    type: String,
    maxlength: 500
  },
  interviewScheduled: {
    date: Date,
    notes: String,
    completed: {
      type: Boolean,
      default: false
    },
    outcome: {
      type: String,
      enum: ['pending', 'passed', 'failed']
    }
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  coverLetter: {
    type: String,
    maxlength: 1500
  },
  availability: {
    startDate: Date,
    endDate: Date,
    hoursPerWeek: Number,
    timezone: String
  },
  pricing: {
    rateType: {
      type: String,
      enum: ['fixed', 'hourly'],
      default: 'fixed'
    },
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  portfolio: [{
    title: String,
    description: String,
    url: String,
    images: [String]
  }],
  questions: [{
    question: String,
    answer: String
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  source: {
    type: String,
    enum: ['direct', 'referral', 'search'],
    default: 'direct'
  },
  viewedByClient: {
    type: Boolean,
    default: false
  },
  viewedAt: Date,
  clientNotes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ApplicationSchema.index({ 
  taskId: 1, 
  applicantId: 1 
}, { unique: true });
ApplicationSchema.index({ 
  applicantId: 1, 
  status: 1, 
  createdAt: -1 
});
ApplicationSchema.index({ 
  taskProviderId: 1, 
  status: 1, 
  createdAt: -1 
});
ApplicationSchema.index({ 
  status: 1, 
  matchScore: -1 
});
ApplicationSchema.index({ 
  createdAt: -1 
});

// Virtual for application age in hours
ApplicationSchema.virtual('ageInHours').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60));
});

// Virtual for response time in hours (if responded)
ApplicationSchema.virtual('responseTimeInHours').get(function() {
  if (!this.respondedAt) return null;
  return Math.floor((this.respondedAt - this.createdAt) / (1000 * 60 * 60));
});

// Virtual for checking if application is recent (within 24 hours)
ApplicationSchema.virtual('isRecent').get(function() {
  return this.ageInHours <= 24;
});

// Virtual for checking if application needs urgent response (older than 72 hours)
ApplicationSchema.virtual('needsUrgentResponse').get(function() {
  return this.status === 'pending' && this.ageInHours > 72;
});

// Method to calculate match score
ApplicationSchema.methods.calculateMatchScore = async function() {
  try {
    const task = await mongoose.model('Task').findById(this.taskId);
    const applicant = await mongoose.model('User').findById(this.applicantId);
    
    if (!task || !applicant) return 0;
    
    let score = 0;
    const factors = [];
    
    // Skills match (40% weight)
    const skillsMatch = task.calculateMatchScore(applicant.skills);
    score += skillsMatch * 0.4;
    factors.push({ factor: 'skills', score: skillsMatch, weight: 0.4 });
    
    // Experience level (20% weight)
    const experienceScore = Math.min(applicant.completedTasks * 10, 100);
    score += experienceScore * 0.2;
    factors.push({ factor: 'experience', score: experienceScore, weight: 0.2 });
    
    // Rating (20% weight)
    const ratingScore = applicant.rating ? (applicant.rating / 5) * 100 : 50;
    score += ratingScore * 0.2;
    factors.push({ factor: 'rating', score: ratingScore, weight: 0.2 });
    
    // Response time/availability (10% weight)
    const responseScore = applicant.responseTime === '< 1 hour' ? 100 : 
                         applicant.responseTime === '< 4 hours' ? 80 : 
                         applicant.responseTime === '< 24 hours' ? 60 : 40;
    score += responseScore * 0.1;
    factors.push({ factor: 'response', score: responseScore, weight: 0.1 });
    
    // Proposal quality (10% weight)
    const proposalScore = this.proposal ? Math.min((this.proposal.length / 500) * 100, 100) : 0;
    score += proposalScore * 0.1;
    factors.push({ factor: 'proposal', score: proposalScore, weight: 0.1 });
    
    this.matchScore = Math.round(score);
    return this.save();
    
  } catch (error) {
    console.error('Error calculating match score:', error);
    return this;
  }
};

// Method to mark as viewed by client
ApplicationSchema.methods.markAsViewed = function() {
  this.viewedByClient = true;
  this.viewedAt = new Date();
  return this.save();
};

// Method to schedule interview
ApplicationSchema.methods.scheduleInterview = function(date, notes) {
  this.interviewScheduled = {
    date: new Date(date),
    notes: notes || '',
    completed: false,
    outcome: 'pending'
  };
  this.status = 'interviewed';
  return this.save();
};

// Method to update interview outcome
ApplicationSchema.methods.updateInterviewOutcome = function(outcome, notes) {
  if (this.interviewScheduled) {
    this.interviewScheduled.completed = true;
    this.interviewScheduled.outcome = outcome;
    if (notes) {
      this.interviewScheduled.notes += `\n\nOutcome: ${notes}`;
    }
  }
  return this.save();
};

// Static method to get application statistics
ApplicationSchema.statics.getStats = async function(userId, role = 'applicant') {
  const matchField = role === 'applicant' ? 'applicantId' : 'taskProviderId';
  
  const stats = await this.aggregate([
    { $match: { [matchField]: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const total = await this.countDocuments({ [matchField]: userId });
  const pending = stats.find(s => s._id === 'pending')?.count || 0;
  const accepted = stats.find(s => s._id === 'accepted')?.count || 0;
  const rejected = stats.find(s => s._id === 'rejected')?.count || 0;
  
  return {
    total,
    pending,
    accepted,
    rejected,
    successRate: total > 0 ? Math.round((accepted / total) * 100) : 0
  };
};

// Static method to find applications needing attention
ApplicationSchema.statics.findNeedingAttention = function(taskProviderId) {
  return this.find({
    taskProviderId,
    status: 'pending',
    createdAt: { $lt: new Date(Date.now() - 72 * 60 * 60 * 1000) } // Older than 72 hours
  })
  .populate('applicantId', 'username rating completedTasks')
  .populate('taskId', 'title credits')
  .sort({ createdAt: 1 });
};

// Static method for advanced filtering
ApplicationSchema.statics.advancedFilter = function(userId, role, filters = {}) {
  const matchField = role === 'applicant' ? 'applicantId' : 'taskProviderId';
  const query = { [matchField]: userId };
  
  // Status filter
  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  }
  
  // Date range filter
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }
  
  // Match score filter
  if (filters.minMatchScore) {
    query.matchScore = { $gte: filters.minMatchScore };
  }
  
  // Search in proposal
  if (filters.search) {
    query.$or = [
      { proposal: { $regex: filters.search, $options: 'i' } },
      { experience: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  return this.find(query);
};

// Pre-save middleware to calculate match score for new applications
ApplicationSchema.pre('save', async function(next) {
  if (this.isNew) {
    await this.calculateMatchScore();
  }
  next();
});

// Post-save middleware to update task application count
ApplicationSchema.post('save', async function(doc) {
  if (this.isNew) {
    await mongoose.model('Task').findByIdAndUpdate(
      this.taskId,
      { $addToSet: { applicants: this._id } }
    );
  }
});

// Pre-remove middleware to clean up references
ApplicationSchema.pre('remove', async function(next) {
  await mongoose.model('Task').findByIdAndUpdate(
    this.taskId,
    { $pull: { applicants: this._id } }
  );
  next();
});

module.exports = mongoose.model('Application', ApplicationSchema);