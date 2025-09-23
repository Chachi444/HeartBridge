const express = require('express');
const router = express.Router();

// Placeholder for upload routes - will be implemented next
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '💖 Upload routes coming soon!'
  });
});

module.exports = router;