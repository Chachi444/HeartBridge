const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getUserStats
} = require('../controllers/authController');

const {
  protect,
  validateUserRegistration,
  validateUserLogin,
  validateProfileUpdate
} = require('../middleware');

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.get('/stats', getUserStats);

// Protected routes (authentication required)
router.use(protect); // All routes after this middleware are protected

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/profile', validateProfileUpdate, updateProfile);
router.put('/change-password', changePassword);

module.exports = router;