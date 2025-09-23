// Export all middleware from a central location
const errorHandler = require('./errorHandler');
const { protect, restrictTo, optionalAuth } = require('./auth');
const { 
  validateRequest, 
  validateUserRegistration, 
  validateUserLogin,
  validateVolunteerAssignment,
  validateStatusUpdate,
  validateProfileUpdate 
} = require('./validation');
const { uploadSingle, processUploadedFile } = require('./upload');

module.exports = {
  errorHandler,
  protect,
  restrictTo,
  optionalAuth,
  validateRequest,
  validateUserRegistration,
  validateUserLogin,
  validateVolunteerAssignment,
  validateStatusUpdate,
  validateProfileUpdate,
  uploadSingle,
  processUploadedFile
};