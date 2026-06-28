const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getMyNotifications, getUnreadCount,
  markAsRead, markAllAsRead,
  deleteNotification, clearAll
} = require('../controllers/notificationController');

router.get('/', auth, getMyNotifications);
router.get('/unread-count', auth, getUnreadCount);
router.put('/:id/read', auth, markAsRead);
router.put('/mark-all-read', auth, markAllAsRead);
router.delete('/clear-all', auth, clearAll);
router.delete('/:id', auth, deleteNotification);

module.exports = router;