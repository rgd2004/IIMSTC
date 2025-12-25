// server/routes/messagingRoutes.js
const express = require('express');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  updateConversationStatus,
  getAdminConversations,
  sendAdminResponse,
  closeConversation,
} = require('../controllers/messagingController');

const router = express.Router();

// Protected user routes
router.post('/conversations', protect, createConversation);
router.get('/conversations', protect, getConversations);
router.get('/conversations/:conversationId/messages', protect, getMessages);
router.post('/conversations/:conversationId/messages', protect, sendMessage);
router.put('/conversations/:conversationId/read', protect, markAsRead);
router.put('/conversations/:conversationId/status', protect, updateConversationStatus);
router.put('/conversations/:conversationId/close', protect, closeConversation);

// Admin routes
router.get('/admin/conversations', protect, admin, getAdminConversations);
router.post('/admin/conversations/:conversationId/response', protect, admin, sendAdminResponse);

module.exports = router;
