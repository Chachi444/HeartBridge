const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [1, 'Age must be at least 1'],
    max: [120, 'Age cannot exceed 120']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\(\d{3}\)\s\d{3}-\d{4}$|^\d{10}$/, 'Please provide a valid phone number']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },

  // Request Details
  type: {
    type: String,
    required: [true, 'Request type is required'],
    enum: {
      values: ['shopping', 'medicine', 'daily tasks'],
      message: 'Type must be shopping, medicine, or daily tasks'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  urgency: {
    type: String,
    required: [true, 'Urgency level is required'],
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Urgency must be low, medium, or high'
    },
    default: 'medium'
  },

  // Status Management
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'in-progress', 'completed', 'cancelled', 'rejected'],
      message: 'Status must be pending, approved, in-progress, completed, cancelled, or rejected'
    },
    default: 'pending'
  },

  // Admin Approval Information
  adminApproval: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: {
      type: Date
    },
    rejectionReason: {
      type: String,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters']
    },
    adminNotes: {
      type: String,
      maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
    }
  },

  // Volunteer Information
  volunteer: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Volunteer name cannot exceed 100 characters']
    },
    email: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    contactedAt: {
      type: Date
    },
    assignedAt: {
      type: Date
    },
    startedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    }
  },

  // Request Creator Information
  requester: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true
    }
  },

  // Image
  profileImage: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  },

  // Timestamps
  dateCreated: {
    type: Date,
    default: Date.now
  },
  dateModified: {
    type: Date,
    default: Date.now
  },
  dateCompleted: {
    type: Date
  },

  // Additional metadata
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
requestSchema.index({ status: 1, dateCreated: -1 });
requestSchema.index({ type: 1, urgency: 1 });
requestSchema.index({ location: 1 });
requestSchema.index({ 'volunteer.name': 1 });

// Virtual for request age (how long ago it was created)
requestSchema.virtual('requestAge').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.dateCreated);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for formatted phone number
requestSchema.virtual('formattedPhone').get(function() {
  if (this.phone && this.phone.length === 10) {
    return `(${this.phone.slice(0, 3)}) ${this.phone.slice(3, 6)}-${this.phone.slice(6)}`;
  }
  return this.phone;
});

// Pre-save middleware to update dateModified
requestSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.dateModified = new Date();
  }
  next();
});

// Pre-save middleware to set completion date
requestSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.dateCompleted) {
    this.dateCompleted = new Date();
  }
  next();
});

// Pre-save middleware to set assignment date
requestSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'assigned' && !this.volunteer.assignedAt) {
    this.volunteer.assignedAt = new Date();
  }
  next();
});

// Instance method to assign volunteer
requestSchema.methods.assignVolunteer = function(volunteerName) {
  this.volunteer.name = volunteerName;
  this.volunteer.assignedAt = new Date();
  this.status = 'assigned';
  return this.save();
};

// Instance method to complete request
requestSchema.methods.complete = function() {
  this.status = 'completed';
  this.dateCompleted = new Date();
  return this.save();
};

// Static method to find open requests
requestSchema.statics.findOpenRequests = function() {
  return this.find({ status: 'open', isActive: true })
    .sort({ urgency: -1, dateCreated: -1 });
};

// Static method to find requests by volunteer
requestSchema.statics.findByVolunteer = function(volunteerName) {
  return this.find({ 
    'volunteer.name': volunteerName,
    isActive: true 
  }).sort({ dateCreated: -1 });
};

module.exports = mongoose.model('Request', requestSchema);