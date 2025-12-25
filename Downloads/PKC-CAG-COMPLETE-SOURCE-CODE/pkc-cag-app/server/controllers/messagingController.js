// server/controllers/messagingController.js
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { sendMessageNotificationEmail } = require('../utils/email');

// =============================
// CREATE NEW CONVERSATION
// =============================
exports.createConversation = async (req, res) => {
  try {
    const { participantId, subject, category, isWithBot } = req.body;
    const userId = req.user._id;

    // Validate subject
    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required',
      });
    }

    let finalParticipantId = participantId;

    // If not with bot and no participant, use admin as default
    if (!isWithBot && !participantId) {
      // Auto-assign to admin for support conversations
      const adminUser = await User.findOne({ isAdmin: true });
      if (!adminUser) {
        return res.status(400).json({
          success: false,
          message: 'No admin available for support',
        });
      }
      finalParticipantId = adminUser._id;
    }

    // Only check self-conversation for non-bot conversations
    if (!isWithBot && userId.toString() === finalParticipantId?.toString?.()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot start conversation with yourself',
      });
    }

    const conversation = new Conversation({
      userId, // Conversation creator
      participantId: isWithBot ? null : finalParticipantId,
      isWithBot: isWithBot || false,
      subject: subject.trim(),
      category: category || 'general',
      status: 'open',
      priority: 'medium',
    });

    await conversation.save();
    await conversation.populate('participantId', 'name email photo');

    res.json({
      success: true,
      message: 'Conversation created',
      data: conversation,
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation',
      error: error.message,
    });
  }
};

// =============================
// GET CONVERSATIONS FOR USER
// =============================
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({
      $or: [{ userId }, { participantId: userId }],
    })
      .populate('userId participantId', 'name email photo')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Conversation.countDocuments({
      $or: [{ userId }, { participantId: userId }],
    });

    // Count unread
    const unreadCount = await Conversation.countDocuments({
      $or: [
        { userId, unreadCount: { $gt: 0 } },
        { participantId: userId, unreadCount: { $gt: 0 } },
      ],
    });

    res.json({
      success: true,
      data: conversations,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
    });
  }
};

// =============================
// GET CONVERSATION MESSAGES
// =============================
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = 30;
    const skip = (page - 1) * limit;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Check authorization - ensure proper ID comparison
    const conversationUserId = conversation.userId ? conversation.userId.toString() : null;
    const conversationParticipantId = conversation.participantId ? conversation.participantId.toString() : null;
    const userIdStr = userId.toString();
    
    const isAuthorized = 
      conversationUserId === userIdStr ||
      conversationParticipantId === userIdStr ||
      req.user.isAdmin;
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name email photo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ conversationId });

    res.json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
    });
  }
};

// =============================
// SEND MESSAGE
// =============================
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, messageType } = req.body;
    const senderId = req.user._id;

    // Validate text
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required',
      });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Check authorization - ensure proper ID comparison
    const conversationUserId = conversation.userId ? conversation.userId.toString() : null;
    const conversationParticipantId = conversation.participantId ? conversation.participantId.toString() : null;
    const userIdStr = senderId.toString();
    
    // User is authorized if they are:
    // 1. The conversation creator (userId)
    // 2. The participant (participantId) 
    // 3. An admin
    const isAuthorized = 
      conversationUserId === userIdStr ||
      conversationParticipantId === userIdStr ||
      req.user.isAdmin;
    
    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send message in this conversation',
      });
    }

    const message = new Message({
      conversationId,
      senderId,
      text: text.trim(),
      messageType: messageType || 'text',
      isRead: false,
      timestamp: new Date(),
    });

    await message.save();
    await message.populate('senderId', 'name email photo');

    // Update conversation
    conversation.messageCount = (conversation.messageCount || 0) + 1;
    conversation.lastMessage = text.trim().substring(0, 50);
    conversation.lastMessageAt = new Date();

    // Mark other participant's messages as having unread
    if (conversation.userId.toString() === senderId) {
      conversation.participantUnreadCount = (conversation.participantUnreadCount || 0) + 1;
    } else {
      conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    }

    await conversation.save();

    // 📧 Send email notification to recipient
    const sender = await User.findById(senderId);
    let recipient = null;
    
    if (conversation.userId.toString() === senderId.toString()) {
      // Sender is the conversation creator, send to participant
      recipient = await User.findById(conversation.participantId);
    } else {
      // Sender is the participant, send to conversation creator
      recipient = await User.findById(conversation.userId);
    }
    
    if (recipient && sender) {
      await sendMessageNotificationEmail(recipient.email, recipient.name, sender.name, conversation.subject);
    }

    res.json({
      success: true,
      message: 'Message sent',
      data: message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

// =============================
// MARK MESSAGE AS READ
// =============================
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      { conversationId, senderId: { $ne: userId } },
      { isRead: true, readAt: new Date() }
    );

    const conversation = await Conversation.findById(conversationId);
    if (conversation.userId.toString() === userId) {
      conversation.unreadCount = 0;
    } else {
      conversation.participantUnreadCount = 0;
    }
    await conversation.save();

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark as read',
    });
  }
};

// =============================
// UPDATE CONVERSATION STATUS
// =============================
exports.updateConversationStatus = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { status, priority } = req.body;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    // Only admin or conversation creator can update
    if (
      conversation.userId.toString() !== userId.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (status && ['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
      conversation.status = status;
    }

    if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      conversation.priority = priority;
    }

    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation updated',
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update conversation',
    });
  }
};

// =============================
// GET ADMIN CONVERSATIONS
// =============================
exports.getAdminConversations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;
    const { status, priority } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const conversations = await Conversation.find(query)
      .populate('userId participantId', 'name email phone')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Conversation.countDocuments(query);

    res.json({
      success: true,
      data: conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin conversations',
    });
  }
};

// =============================
// SEND ADMIN RESPONSE
// =============================
exports.sendAdminResponse = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;
    const senderId = req.user._id;

    console.log('📤 Admin Response Request:');
    console.log('  - Conversation ID:', conversationId);
    console.log('  - Sender ID:', senderId);
    console.log('  - Is Admin:', req.user.isAdmin);
    console.log('  - Text:', text?.substring(0, 50));

    // Validate text
    if (!text || !text.trim()) {
      console.log('❌ Validation failed: Empty text');
      return res.status(400).json({
        success: false,
        message: 'Message text is required',
      });
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      console.log('❌ Auth failed: User is not admin');
      return res.status(403).json({
        success: false,
        message: 'Only admins can send responses',
      });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      console.log('❌ Conversation not found:', conversationId);
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    console.log('✓ Conversation found');

    const message = new Message({
      conversationId,
      senderId,
      text: text.trim(),
      messageType: 'admin_response',
      isRead: false,
      timestamp: new Date(),
    });

    await message.save();
    console.log('✓ Message saved');

    await message.populate('senderId', 'name email photo');
    console.log('✓ Message populated');

    // Update conversation to in-progress
    if (conversation.status === 'open') {
      conversation.status = 'in-progress';
    }

    conversation.adminId = senderId;
    conversation.lastMessage = text.trim().substring(0, 50);
    conversation.lastMessageAt = new Date();
    conversation.messageCount = (conversation.messageCount || 0) + 1;
    conversation.participantUnreadCount = (conversation.participantUnreadCount || 0) + 1;

    await conversation.save();
    console.log('✓ Conversation updated');

    res.json({
      success: true,
      message: 'Admin response sent',
      data: message,
    });
  } catch (error) {
    console.error('❌ Send admin response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send response',
      error: error.message,
    });
  }
};

// =============================
// CLOSE CONVERSATION
// =============================
exports.closeConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    if (
      conversation.userId.toString() !== userId.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    conversation.status = 'closed';
    conversation.closedAt = new Date();
    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation closed',
      data: conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to close conversation',
    });
  }
};
