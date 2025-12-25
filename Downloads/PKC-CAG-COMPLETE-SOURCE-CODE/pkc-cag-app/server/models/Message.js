// server/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'order_update', 'system', 'bot', 'admin_response'],
      default: 'text',
    },
    attachments: [
      {
        url: String,
        type: String, // 'image', 'file', etc
      },
    ],
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: mongoose.Schema.Types.Mixed, // {orderId, ticketId, etc}
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
