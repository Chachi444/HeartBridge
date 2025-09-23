const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Remove password from output
  user.password = undefined;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      status: 'success',
      message,
      token,
      data: {
        user: user.profile
      }
    });
};

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, location, age } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: '💔 A user with this email already exists. Please use a different email or try logging in.'
      });
    }

    // Create user data object
    const userData = {
      name,
      email,
      password,
      role: role || 'volunteer',
      phone,
      location,
      age
    };

    // Add volunteer-specific defaults if role is volunteer
    if (userData.role === 'volunteer') {
      userData.volunteerInfo = {
        skills: [],
        availability: {
          days: [],
          timeSlots: []
        },
        maxDistance: 10,
        completedRequests: 0,
        rating: 0,
        verified: false
      };
    }

    // Create user
    const user = await User.create(userData);

    // Update last login
    await user.updateLastLogin();

    sendTokenResponse(user, 201, res, `💖 Welcome to HeartBridge, ${user.name}! Your account has been created successfully.`);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: '💔 Something went wrong during registration. Please try again.'
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: '💔 Invalid email or password. Please check your credentials and try again.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: '💔 Your account has been deactivated. Please contact support for assistance.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: '💔 Invalid email or password. Please check your credentials and try again.'
      });
    }

    // Update last login
    await user.updateLastLogin();

    sendTokenResponse(user, 200, res, `💕 Welcome back, ${user.name}! You've successfully logged in.`);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: '💔 Something went wrong during login. Please try again.'
    });
  }
};

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      status: 'success',
      message: '💕 You have been logged out successfully. Thank you for using HeartBridge!'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: '💔 Something went wrong during logout.'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '💔 User not found.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: user.profile
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      status: 'error',
      message: '💔 Something went wrong retrieving your profile.'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {};
    const allowedFields = ['name', 'phone', 'location', 'age', 'bio'];

    // Only update fields that are provided and allowed
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    });

    // Handle volunteer-specific updates
    if (req.user.role === 'volunteer' && req.body.volunteerInfo) {
      const volunteerFields = ['skills', 'availability', 'maxDistance'];
      volunteerFields.forEach(field => {
        if (req.body.volunteerInfo[field] !== undefined) {
          fieldsToUpdate[`volunteerInfo.${field}`] = req.body.volunteerInfo[field];
        }
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '💔 User not found.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: '💖 Your profile has been updated successfully!',
      data: {
        user: user.profile
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: '💔 Something went wrong updating your profile.'
    });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '💔 User not found.'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: '💔 Current password is incorrect.'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: '💖 Your password has been changed successfully!'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      status: 'error',
      message: '💔 Something went wrong changing your password.'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Public
const getUserStats = async (req, res, next) => {
  try {
    const stats = await User.getUserStats();

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      status: 'error',
      message: '💔 Something went wrong retrieving statistics.'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getUserStats
};