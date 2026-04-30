const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', chatController.getChatMessages);
router.post('/', chatController.sendMessage);

module.exports = router;
