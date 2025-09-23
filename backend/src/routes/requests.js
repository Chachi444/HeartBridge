const express = require('express');
const router = express.Router();

// Placeholder for request routes - will be implemented next
router.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '💖 Request routes coming soon!'
  });
});

module.exports = router;