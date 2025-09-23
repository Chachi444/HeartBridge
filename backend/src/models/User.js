const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },

  // User Role
  role: {
    type: String,
    enum: {
      values: ['elderly', 'volunteer', 'admin'],
      message: 'Role must be elderly, volunteer, or admin'
    },
    default: 'volunteer'
  },

  // Contact Information
  phone: {
    type: String,
    trim: true,
    match: [/^\(\d{3}\)\s\d{3}-\d{4}$|^\d{10}$/, 'Please provide a valid phone number']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },

  // Profile Information
  age: {
    type: Number,
    min: [13, 'Age must be at least 13'],
    max: [120, 'Age cannot exceed 120']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  profileImage: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  },

  // Volunteer-specific fields
  volunteerInfo: {
    skills: [{
      type: String,
      enum: ['shopping', 'medicine', 'daily tasks', 'transportation', 'companionship']
    }],
    availability: {
      days: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }],
      timeSlots: [{
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'anytime']
      }]
    },
    maxDistance: {
      type: Number,
      default: 10 // miles
    },
    completedRequests: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    verified: {
      type: Boolean,
      default: false
    }
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },

  // Security
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // Preferences
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    newRequests: {
      type: Boolean,
      default: true
    },
    updates: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ location: 1 });
userSchema.index({ 'volunteerInfo.skills': 1 });

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    location: this.location,
    profileImage: this.profileImage,
    isActive: this.isActive
  };
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash the password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment completed requests (for volunteers)
userSchema.methods.incrementCompletedRequests = function() {
  if (this.role === 'volunteer') {
    this.volunteerInfo.completedRequests += 1;
    return this.save({ validateBeforeSave: false });
  }
};

// Static method to find volunteers by skills
userSchema.statics.findVolunteersBySkills = function(skills) {
  return this.find({
    role: 'volunteer',
    isActive: true,
    'volunteerInfo.skills': { $in: skills }
  }).select('-password');
};

// Static method to find volunteers by location
userSchema.statics.findVolunteersByLocation = function(location, maxDistance = 10) {
  // This is simplified - in a real app you'd use geospatial queries
  return this.find({
    role: 'volunteer',
    isActive: true,
    location: new RegExp(location, 'i')
  }).select('-password');
};

// Static method to get user stats
userSchema.statics.getUserStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    totalUsers: 0,
    elderly: 0,
    volunteers: 0,
    admins: 0
  };

  stats.forEach(stat => {
    result.totalUsers += stat.count;
    result[stat._id] = stat.count;
  });

  return result;
};

module.exports = mongoose.model('User', userSchema);