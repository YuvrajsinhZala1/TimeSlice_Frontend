const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  taskProviderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: [
      'web-development', 
      'mobile-development', 
      'design', 
      'writing', 
      'marketing', 
      'data-analysis', 
      'ai-ml', 
      'consulting',
      'other'
    ],
    default: 'other'
  },
  skillsRequired: [{
    type: String,
    required: true,
    trim: true
  }],
  dateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  durationInMinutes: {
    type: Number,
    required: true
  },
  credits: {
    type: Number,
    required: true,
    min: 1
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
    default: 10,
    min: 1,
    max: 50
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
  },
  additionalInfo: {
    type: String,
    maxlength: 1000
  },
  deliverables: {
    type: String,
    maxlength: 500
  },
  communicationPreference: {
    type: String,
    enum: ['chat', 'email', 'video'],
    default: 'chat'
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
  views: {
    type: Number,
    default: 0
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  budget: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  location: {
    type: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid']
    },
    address: String,
    city: String,
    country: String
  },
  requirements: {
    experience: {
      type: String,
      enum: ['entry', 'intermediate', 'expert'],
      default: 'intermediate'
    },
    availability: String,
    timezone: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
TaskSchema.index({ 
  skillsRequired: 1, 
  status: 1, 
  createdAt: -1 
});
TaskSchema.index({ 
  taskProviderId: 1, 
  status: 1 
});
TaskSchema.index({ 
  category: 1, 
  urgency: 1, 
  credits: -1 
});
TaskSchema.index({ 
  dateTime: 1, 
  status: 1 
});
TaskSchema.index({ 
  featured: 1, 
  createdAt: -1 
});

// Text search index
TaskSchema.index({
  title: 'text',
  description: 'text',
  skillsRequired: 'text'
});

// Virtual for checking if task is overdue
TaskSchema.virtual('isOverdue').get(function() {
  return this.dateTime < new Date() && this.status !== 'completed';
});

// Virtual for checking if deadline is approaching (within 3 days)
TaskSchema.virtual('isDeadlineApproaching').get(function() {
  const deadline = new Date(this.dateTime);
  const now = new Date();
  const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  return daysLeft <= 3 && daysLeft >= 0;
});

// Virtual for estimated USD value
TaskSchema.virtual('estimatedUSD').get(function() {
  return Math.round(this.credits * 5); // $5 per credit
});

// Method to increment view count
TaskSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to calculate match score with user skills
TaskSchema.methods.calculateMatchScore = function(userSkills) {
  if (!userSkills || !userSkills.length || !this.skillsRequired.length) {
    return 0;
  }
  
  let matches = 0;
  this.skillsRequired.forEach(skill => {
    if (userSkills.some(userSkill => 
      userSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(userSkill.toLowerCase())
    )) {
      matches++;
    }
  });
  
  return Math.round((matches / this.skillsRequired.length) * 100);
};

// Method to check if user can apply
TaskSchema.methods.canUserApply = function(userId, userSkills) {
  // Basic checks
  if (this.status !== 'open') return { canApply: false, reason: 'Task is not accepting applications' };
  if (this.taskProviderId.toString() === userId.toString()) return { canApply: false, reason: 'Cannot apply to your own task' };
  if (this.applicants.length >= this.maxApplications) return { canApply: false, reason: 'Maximum applications reached' };
  if (!this.acceptsApplications) return { canApply: false, reason: 'Task is not accepting applications' };
  
  // Check if user has required skills (optional but recommended)
  const hasRequiredSkills = this.skillsRequired.some(skill => 
    userSkills?.some(userSkill => 
      userSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );
  
  if (!hasRequiredSkills && userSkills?.length > 0) {
    return { 
      canApply: true, 
      warning: 'You do not have the primary required skills for this task' 
    };
  }
  
  return { canApply: true };
};

// Static method to get category statistics
TaskSchema.statics.getCategoryStats = async function() {
  const stats = await this.aggregate([
    { $match: { status: 'open' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgCredits: { $avg: '$credits' },
        totalCredits: { $sum: '$credits' }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  return stats;
};

// Static method to find similar tasks
TaskSchema.statics.findSimilar = function(taskId, limit = 5) {
  return this.findById(taskId)
    .then(task => {
      if (!task) return [];
      
      return this.find({
        _id: { $ne: taskId },
        status: 'open',
        $or: [
          { category: task.category },
          { skillsRequired: { $in: task.skillsRequired } }
        ]
      })
      .populate('taskProviderId', 'username rating')
      .limit(limit)
      .sort({ createdAt: -1 });
    });
};

// Static method for advanced search
TaskSchema.statics.advancedSearch = function(filters = {}) {
  const query = { status: 'open' };
  
  // Text search
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  // Category filter
  if (filters.category) {
    query.category = filters.category;
  }
  
  // Skills filter
  if (filters.skills && filters.skills.length > 0) {
    query.skillsRequired = { $in: filters.skills };
  }
  
  // Credits range
  if (filters.minCredits || filters.maxCredits) {
    query.credits = {};
    if (filters.minCredits) query.credits.$gte = filters.minCredits;
    if (filters.maxCredits) query.credits.$lte = filters.maxCredits;
  }
  
  // Urgency filter
  if (filters.urgency) {
    query.urgency = filters.urgency;
  }
  
  // Duration filter
  if (filters.minDuration || filters.maxDuration) {
    query.durationInMinutes = {};
    if (filters.minDuration) query.durationInMinutes.$gte = filters.minDuration;
    if (filters.maxDuration) query.durationInMinutes.$lte = filters.maxDuration;
  }
  
  // Date range
  if (filters.startDate || filters.endDate) {
    query.dateTime = {};
    if (filters.startDate) query.dateTime.$gte = new Date(filters.startDate);
    if (filters.endDate) query.dateTime.$lte = new Date(filters.endDate);
  }
  
  // Exclude user's own tasks
  if (filters.excludeUserId) {
    query.taskProviderId = { $ne: filters.excludeUserId };
  }
  
  return this.find(query);
};

// Pre-save middleware
TaskSchema.pre('save', function(next) {
  // Update application count
  this.applicationCount = this.applicants.length;
  
  // Auto-close applications if max reached
  if (this.applicants.length >= this.maxApplications) {
    this.acceptsApplications = false;
  }
  
  next();
});

// Post-save middleware to update user task count
TaskSchema.post('save', async function(doc) {
  if (this.isNew) {
    await mongoose.model('User').findByIdAndUpdate(
      this.taskProviderId,
      { $inc: { tasksCreated: 1 } }
    );
  }
});

module.exports = mongoose.model('Task', TaskSchema);