const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  helper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  agreedCredits: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: [
      'confirmed', 
      'in-progress', 
      'work-submitted', 
      'completed', 
      'cancelled',
      'disputed',
      'refunded'
    ],
    default: 'confirmed'
  },
  // Enhanced rating system
  helperReview: {
    rating: { 
      type: Number, 
      min: 1, 
      max: 5 
    },
    review: { 
      type: String, 
      maxlength: 1000 
    },
    reviewDate: {
      type: Date,
      default: Date.now
    },
    aspects: {
      communication: { type: Number, min: 1, max: 5 },
      professionalism: { type: Number, min: 1, max: 5 },
      paymentSpeed: { type: Number, min: 1, max: 5 },
      clarity: { type: Number, min: 1, max: 5 }
    }
  },
  taskProviderReview: {
    rating: { 
      type: Number, 
      min: 1, 
      max: 5 
    },
    review: { 
      type: String, 
      maxlength: 1000 
    },
    reviewDate: {
      type: Date,
      default: Date.now
    },
    aspects: {
      quality: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      timeliness: { type: Number, min: 1, max: 5 },
      professionalism: { type: Number, min: 1, max: 5 }
    }
  },
  // Timeline tracking
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  deadline: {
    type: Date
  },
  estimatedDuration: {
    type: Number // in hours
  },
  actualDuration: {
    type: Number // in hours
  },
  // Milestones
  milestones: [{
    title: {
      type: String,
      required: true,
      maxlength: 100
    },
    description: {
      type: String,
      maxlength: 500
    },
    targetDate: Date,
    completedAt: Date,
    completed: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    },
    deliverables: [{
      name: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  // Communication
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  },
  // Work submission
  workSubmission: {
    note: {
      type: String,
      maxlength: 1000
    },
    deliverables: [{
      name: {
        type: String,
        required: true
      },
      description: String,
      url: {
        type: String,
        required: true
      },
      fileType: String,
      fileSize: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    submittedAt: Date,
    revisionRequests: [{
      requestedAt: Date,
      reason: String,
      details: String,
      resolvedAt: Date
    }]
  },
  // Provider acceptance
  providerAcceptance: {
    acceptedAt: Date,
    note: {
      type: String,
      maxlength: 500
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  // Payment tracking
  payment: {
    method: String,
    transactionId: String,
    paidAt: Date,
    escrowReleased: {
      type: Boolean,
      default: false
    },
    escrowReleasedAt: Date,
    refundAmount: Number,
    refundReason: String,
    refundedAt: Date
  },
  // Disputes
  dispute: {
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    description: String,
    status: {
      type: String,
      enum: ['open', 'in-review', 'resolved', 'closed']
    },
    raisedAt: Date,
    resolvedAt: Date,
    resolution: String,
    mediator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  // Contract terms
  contract: {
    terms: String,
    agreedByHelper: {
      type: Boolean,
      default: false
    },
    agreedByProvider: {
      type: Boolean,
      default: false
    },
    agreedAt: Date,
    amendments: [{
      description: String,
      agreedByHelper: Boolean,
      agreedByProvider: Boolean,
      amendedAt: Date
    }]
  },
  // Metadata
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  visibility: {
    type: String,
    enum: ['private', 'public'],
    default: 'private'
  },
  // Performance metrics
  metrics: {
    responseTime: Number, // Average response time in hours
    completionRate: Number, // Percentage of milestones completed on time
    satisfactionScore: Number, // Overall satisfaction score
    communicationScore: Number
  }
}, {
  timestamps: true
});

// Indexes for better query performance
BookingSchema.index({ 
  helper: 1, 
  taskProvider: 1, 
  status: 1 
});
BookingSchema.index({ 
  status: 1, 
  createdAt: -1 
});
BookingSchema.index({ 
  taskId: 1 
});
BookingSchema.index({ 
  deadline: 1, 
  status: 1 
});

// Virtual for checking if booking is overdue
BookingSchema.virtual('isOverdue').get(function() {
  return this.deadline && 
         this.deadline < new Date() && 
         !['completed', 'cancelled'].includes(this.status);
});

// Virtual for progress percentage
BookingSchema.virtual('progressPercentage').get(function() {
  if (!this.milestones || this.milestones.length === 0) {
    return this.status === 'completed' ? 100 : 0;
  }
  
  const completedMilestones = this.milestones.filter(m => m.completed).length;
  return Math.round((completedMilestones / this.milestones.length) * 100);
});

// Virtual for time remaining
BookingSchema.virtual('timeRemaining').get(function() {
  if (!this.deadline) return null;
  
  const now = new Date();
  const diffMs = this.deadline - now;
  
  if (diffMs <= 0) return 'Overdue';
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days} days`;
  if (hours > 0) return `${hours} hours`;
  return 'Less than 1 hour';
});

// Virtual for total project duration
BookingSchema.virtual('totalDuration').get(function() {
  if (!this.startedAt || !this.completedAt) return null;
  return Math.round((this.completedAt - this.startedAt) / (1000 * 60 * 60)); // in hours
});

// Method to add milestone
BookingSchema.methods.addMilestone = function(milestoneData) {
  this.milestones.push({
    ...milestoneData,
    order: this.milestones.length
  });
  return this.save();
};

// Method to complete milestone
BookingSchema.methods.completeMilestone = function(milestoneId, deliverables = []) {
  const milestone = this.milestones.id(milestoneId);
  if (milestone) {
    milestone.completed = true;
    milestone.completedAt = new Date();
    if (deliverables.length > 0) {
      milestone.deliverables.push(...deliverables);
    }
    return this.save();
  }
  throw new Error('Milestone not found');
};

// Method to submit work
BookingSchema.methods.submitWork = function(submissionData) {
  this.workSubmission = {
    ...submissionData,
    submittedAt: new Date()
  };
  this.status = 'work-submitted';
  return this.save();
};

// Method to accept work
BookingSchema.methods.acceptWork = function(acceptanceData) {
  this.providerAcceptance = {
    ...acceptanceData,
    acceptedAt: new Date()
  };
  this.status = 'completed';
  this.completedAt = new Date();
  
  // Calculate actual duration
  if (this.startedAt) {
    this.actualDuration = Math.round((this.completedAt - this.startedAt) / (1000 * 60 * 60));
  }
  
  return this.save();
};

// Method to request revision
BookingSchema.methods.requestRevision = function(reason, details) {
  if (!this.workSubmission.revisionRequests) {
    this.workSubmission.revisionRequests = [];
  }
  
  this.workSubmission.revisionRequests.push({
    requestedAt: new Date(),
    reason,
    details
  });
  
  this.status = 'in-progress'; // Back to in-progress
  return this.save();
};

// Method to add review
BookingSchema.methods.addReview = function(reviewerRole, reviewData) {
  const reviewField = reviewerRole === 'helper' ? 'helperReview' : 'taskProviderReview';
  
  this[reviewField] = {
    ...reviewData,
    reviewDate: new Date()
  };
  
  return this.save();
};

// Method to calculate satisfaction score
BookingSchema.methods.calculateSatisfactionScore = function() {
  let totalScore = 0;
  let reviewCount = 0;
  
  if (this.helperReview && this.helperReview.rating) {
    totalScore += this.helperReview.rating;
    reviewCount++;
  }
  
  if (this.taskProviderReview && this.taskProviderReview.rating) {
    totalScore += this.taskProviderReview.rating;
    reviewCount++;
  }
  
  return reviewCount > 0 ? Math.round((totalScore / reviewCount) * 20) : 0; // Convert to 0-100 scale
};

// Method to raise dispute
BookingSchema.methods.raiseDispute = function(raisedBy, reason, description) {
  this.dispute = {
    raisedBy,
    reason,
    description,
    status: 'open',
    raisedAt: new Date()
  };
  this.status = 'disputed';
  return this.save();
};

// Method to resolve dispute
BookingSchema.methods.resolveDispute = function(resolution, mediator) {
  if (this.dispute) {
    this.dispute.status = 'resolved';
    this.dispute.resolution = resolution;
    this.dispute.mediator = mediator;
    this.dispute.resolvedAt = new Date();
  }
  return this.save();
};

// Static method to get booking statistics
BookingSchema.statics.getStats = async function(userId, role = 'helper') {
  const matchField = role === 'helper' ? 'helper' : 'taskProvider';
  
  const stats = await this.aggregate([
    { $match: { [matchField]: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalCredits: { $sum: '$agreedCredits' }
      }
    }
  ]);
  
  const completed = await this.find({ 
    [matchField]: userId, 
    status: 'completed' 
  });
  
  const avgRating = completed.length > 0 ? 
    completed.reduce((sum, booking) => {
      const review = role === 'helper' ? booking.taskProviderReview : booking.helperReview;
      return sum + (review?.rating || 0);
    }, 0) / completed.length : 0;
  
  return {
    total: stats.reduce((sum, s) => sum + s.count, 0),
    byStatus: stats,
    avgRating: Math.round(avgRating * 10) / 10,
    totalEarnings: stats.reduce((sum, s) => sum + s.totalCredits, 0)
  };
};

// Static method to find overdue bookings
BookingSchema.statics.findOverdue = function() {
  return this.find({
    deadline: { $lt: new Date() },
    status: { $in: ['confirmed', 'in-progress', 'work-submitted'] }
  })
  .populate('helper', 'username email')
  .populate('taskProvider', 'username email')
  .populate('taskId', 'title');
};

// Pre-save middleware
BookingSchema.pre('save', function(next) {
  // Set deadline if not set and we have estimated duration
  if (!this.deadline && this.estimatedDuration && this.startedAt) {
    this.deadline = new Date(this.startedAt.getTime() + (this.estimatedDuration * 60 * 60 * 1000));
  }
  
  // Update metrics
  this.metrics = {
    ...this.metrics,
    satisfactionScore: this.calculateSatisfactionScore(),
    completionRate: this.progressPercentage
  };
  
  next();
});

// Post-save middleware to update user stats
BookingSchema.post('save', async function(doc) {
  if (this.isModified('status') && this.status === 'completed') {
    // Update helper's completed tasks count
    await mongoose.model('User').findByIdAndUpdate(
      this.helper,
      { 
        $inc: { 
          completedTasks: 1,
          totalEarnings: this.agreedCredits
        }
      }
    );
    
    // Update task provider's stats
    await mongoose.model('User').findByIdAndUpdate(
      this.taskProvider,
      { 
        $inc: { 
          credits: -this.agreedCredits 
        }
      }
    );
  }
});

module.exports = mongoose.model('Booking', BookingSchema);