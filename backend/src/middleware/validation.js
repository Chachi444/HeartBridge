const { body, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      status: 'error',
      message: '💔 Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// Request validation rules
const validateRequest = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('💌 Name is required')
    .isLength({ max: 100 })
    .withMessage('💔 Name cannot exceed 100 characters'),
    
  body('age')
    .isInt({ min: 1, max: 120 })
    .withMessage('💔 Age must be between 1 and 120'),
    
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('📞 Phone number is required')
    .matches(/^\(\d{3}\)\s\d{3}-\d{4}$|^\d{10}$/)
    .withMessage('📞 Please provide a valid phone number'),
    
  body('location')
    .trim()
    .notEmpty()
    .withMessage('📍 Location is required')
    .isLength({ max: 200 })
    .withMessage('📍 Location cannot exceed 200 characters'),
    
  body('type')
    .isIn(['shopping', 'medicine', 'daily tasks'])
    .withMessage('💼 Type must be shopping, medicine, or daily tasks'),
    
  body('description')
    .trim()
    .notEmpty()
    .withMessage('📝 Description is required')
    .isLength({ max: 1000 })
    .withMessage('📝 Description cannot exceed 1000 characters'),
    
  body('urgency')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('⚡ Urgency must be low, medium, or high'),
    
  handleValidationErrors
];

// User registration validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('💌 Name is required')
    .isLength({ max: 100 })
    .withMessage('💔 Name cannot exceed 100 characters'),
    
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('📧 Please provide a valid email address'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('🔒 Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('🔒 Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
  body('role')
    .optional()
    .isIn(['elderly', 'volunteer', 'admin'])
    .withMessage('👤 Role must be elderly, volunteer, or admin'),
    
  handleValidationErrors
];

// User login validation rules
const validateUserLogin = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('📧 Please provide a valid email address'),
    
  body('password')
    .notEmpty()
    .withMessage('🔒 Password is required'),
    
  handleValidationErrors
];

// Volunteer assignment validation
const validateVolunteerAssignment = [
  body('volunteerName')
    .trim()
    .notEmpty()
    .withMessage('💝 Volunteer name is required')
    .isLength({ max: 100 })
    .withMessage('💔 Volunteer name cannot exceed 100 characters'),
    
  handleValidationErrors
];

// Update request status validation
const validateStatusUpdate = [
  body('status')
    .isIn(['open', 'assigned', 'completed', 'cancelled'])
    .withMessage('📋 Status must be open, assigned, completed, or cancelled'),
    
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('💔 Name cannot exceed 100 characters'),
    
  body('phone')
    .optional()
    .trim()
    .matches(/^\(\d{3}\)\s\d{3}-\d{4}$|^\d{10}$/)
    .withMessage('📞 Please provide a valid phone number'),
    
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('📍 Location cannot exceed 200 characters'),
    
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('💔 Age must be between 13 and 120'),
    
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('📝 Bio cannot exceed 500 characters'),
    
  handleValidationErrors
];

module.exports = {
  validateRequest,
  validateUserRegistration,
  validateUserLogin,
  validateVolunteerAssignment,
  validateStatusUpdate,
  validateProfileUpdate,
  handleValidationErrors
};