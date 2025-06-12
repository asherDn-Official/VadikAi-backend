const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Route for handling chat requests

router.post('/bot', chatbotController.chatWithAI);

module.exports = router;
