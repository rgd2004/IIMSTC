// client/src/pages/MessagingPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import API from '../utils/api';
import Toast from 'react-hot-toast';
import '../pages/MessagingPage.css';

const MessagingPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConvSubject, setNewConvSubject] = useState('');
  const [newConvCategory, setNewConvCategory] = useState('general');
  const [newConvIsBot, setNewConvIsBot] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      // Mark as read
      API.put(`/messaging/conversations/${selectedConversation._id}/read`).catch(() => {});
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await API.get('/messaging/conversations');
      setConversations(response.data.data);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true);
      const response = await API.get(
        `/messaging/conversations/${conversationId}/messages`
      );
      setMessages(response.data.data);
    } catch (error) {
      Toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) {
      Toast.error('Please enter a message');
      return;
    }

    // 🚫 Block money-related discussions in chat
    const moneyKeywords = [
      'payment', 'pay', 'money', 'price', 'cost', 'charge', 'rate', 'amount',
      'rupee', 'upi', 'bank', 'transfer', 'transaction', 'credit', 'debit',
      'wallet', 'balance', 'invoice', 'bill', 'receipt', 'discount', 'negotiat',
      'deal', 'bargain', 'fee', 'cash', 'check', 'wire', 'refund', 'deposit'
    ];
    
    const messageTextLower = messageText.toLowerCase();
    const foundKeyword = moneyKeywords.some(keyword => 
      messageTextLower.includes(keyword)
    );

    if (foundKeyword) {
      Toast.error('❌ Money discussions are not allowed in chat. Please use the payment system to handle all payments and refunds.');
      return;
    }

    try {
      const response = await API.post(
        `/messaging/conversations/${selectedConversation._id}/messages`,
        { text: messageText, messageType: 'text' }
      );

      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.data]);
        setMessageText('');
        scrollToBottom();
        Toast.success('Message sent!');
      }
    } catch (error) {
      console.error('Send message error:', error);
      Toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };

  const handleCreateConversation = async (e) => {
    e.preventDefault();
    if (!newConvSubject.trim()) {
      Toast.error('Subject is required');
      return;
    }

    try {
      const response = await API.post('/messaging/conversations', {
        subject: newConvSubject,
        category: newConvCategory,
        isWithBot: newConvIsBot,
      });

      if (response.data.success) {
        setConversations((prev) => [response.data.data, ...prev]);
        setSelectedConversation(response.data.data);
        setNewConvSubject('');
        setNewConvCategory('general');
        setNewConvIsBot(false);
        setShowNewConversation(false);
        Toast.success('Conversation created!');
      }
    } catch (error) {
      Toast.error(error.response?.data?.message || 'Failed to create conversation');
    }
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation) return;

    try {
      const response = await API.put(
        `/messaging/conversations/${selectedConversation._id}/close`
      );

      if (response.data.success) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === selectedConversation._id
              ? { ...conv, status: 'closed' }
              : conv
          )
        );
        setSelectedConversation(null);
        Toast.success('Conversation closed');
      }
    } catch (error) {
      Toast.error('Failed to close conversation');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#4caf50',
      'in-progress': '#ff9800',
      resolved: '#2196f3',
      closed: '#999',
    };
    return colors[status] || '#667eea';
  };

  const getUnreadCount = () => {
    return conversations.reduce(
      (count, conv) => count + (conv.unreadCount || 0),
      0
    );
  };

  return (
    <div className="messaging-page">
      <div className="messaging-container">
        {/* SIDEBAR - CONVERSATIONS */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h2>💬 Messages</h2>
            {getUnreadCount() > 0 && (
              <span className="unread-badge">{getUnreadCount()}</span>
            )}
          </div>

          <button
            className="new-conversation-btn"
            onClick={() => setShowNewConversation(true)}
          >
            ➕ New Chat
          </button>

          {/* NEW CONVERSATION FORM */}
          {showNewConversation && (
            <form className="new-conversation-form" onSubmit={handleCreateConversation}>
              <input
                type="text"
                placeholder="Subject"
                value={newConvSubject}
                onChange={(e) => setNewConvSubject(e.target.value)}
                className="form-input"
                required
              />

              <select
                value={newConvCategory}
                onChange={(e) => setNewConvCategory(e.target.value)}
                className="form-input"
              >
                <option value="general">General</option>
                <option value="billing">Billing</option>
                <option value="support">Support</option>
                <option value="feedback">Feedback</option>
              </select>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newConvIsBot}
                  onChange={(e) => setNewConvIsBot(e.target.checked)}
                />
                Chat with Bot
              </label>

              <button type="submit" className="form-submit">
                Create
              </button>
              <button
                type="button"
                className="form-cancel"
                onClick={() => setShowNewConversation(false)}
              >
                Cancel
              </button>
            </form>
          )}

          {/* CONVERSATIONS LIST */}
          <div className="conversations-list">
            {conversations.length === 0 ? (
              <p className="empty-message">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv._id}
                  className={`conversation-item ${
                    selectedConversation?._id === conv._id ? 'active' : ''
                  } ${conv.status === 'closed' ? 'closed' : ''}`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="conversation-info">
                    <h4>{conv.subject}</h4>
                    <p className="last-message">{conv.lastMessage || 'No messages'}</p>
                  </div>
                  <div className="conversation-meta">
                    <span
                      className="status-dot"
                      style={{ backgroundColor: getStatusColor(conv.status) }}
                    ></span>
                    {conv.unreadCount > 0 && (
                      <span className="unread-count">{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div className="chat-area">
          {selectedConversation ? (
            <>
              {/* CHAT HEADER */}
              <div className="chat-header">
                <div>
                  <h3>{selectedConversation.subject}</h3>
                  <span
                    className={`status-badge ${selectedConversation.status}`}
                    style={{
                      backgroundColor: getStatusColor(selectedConversation.status),
                    }}
                  >
                    {selectedConversation.status}
                  </span>
                </div>
                {selectedConversation.status !== 'closed' && (
                  <button
                    className="close-btn"
                    onClick={handleCloseConversation}
                    title="Close conversation"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* MESSAGES */}
              <div className="messages-container">
                {loading ? (
                  <div className="loading">⏳ Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="empty-messages">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`message ${
                        message.messageType === 'admin_response'
                          ? 'admin'
                          : 'user'
                      }`}
                    >
                      <div className="message-content">
                        <p className="message-text">{message.text}</p>
                        <span className="message-time">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* MESSAGE INPUT */}
              {selectedConversation.status !== 'closed' && (
                <form className="message-form" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="message-input"
                  />
                  <button type="submit" className="send-btn" disabled={!messageText.trim()}>
                    Send
                  </button>
                </form>
              )}
              {selectedConversation.status === 'closed' && (
                <div className="closed-message">
                  🔒 This conversation is closed
                </div>
              )}
            </>
          ) : (
            <div className="no-selection">
              <div className="no-selection-content">
                <span className="emoji">💬</span>
                <h2>Select a conversation to start chatting</h2>
                <p>or create a new one to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
