const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { hrChat } = require('../controllers/hrChatController');

router.post('/', auth, hrChat);

module.exports = router;