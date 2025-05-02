const express = require('express');
const router = express.Router();
const { handleEmail } = require('../controllers/emailController');

// Route for handling incoming emails
router.post('/webhook/email', handleEmail);

module.exports = router;
