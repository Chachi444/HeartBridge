const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const requestRoutes = require('./src/routes/requests');
const userRoutes = require('./src/routes/users');
const uploadRoutes = require('./src/routes/upload');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] // Replace with your production domain
    : ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '💖 HeartBridge API is running with love!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Welcome endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: '💕 Welcome to HeartBridge API - Connecting hearts, building community!',
    version: '1.0.0',
    endpoints: {
      requests: '/api/requests',
      users: '/api/users',
      upload: '/api/upload',
      health: '/api/health'
    }
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found 😔'
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/heartbridge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('💖 Connected to MongoDB with love!');
  
  // Start server only after database connection
  app.listen(PORT, () => {
    console.log(`💝 HeartBridge server is running on port ${PORT}`);
    console.log(`🌟 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💌 API available at: http://localhost:${PORT}/api`);
  });
})
.catch((error) => {
  console.error('💔 Failed to connect to MongoDB:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('💕 SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('💖 Database connection closed. Goodbye!');
    process.exit(0);
  });
});

module.exports = app;