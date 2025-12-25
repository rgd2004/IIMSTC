// client/src/pages/admin/AdminMessaging.jsx
import React, { useState, useEffect, useRef } from 'react';
import API from '../../utils/api';
import Toast from 'react-hot-toast';
import './AdminMessaging.css';

const AdminMessaging = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchAdminConversations();
    const interval = setInterval(fetchAdminConversations, 5000);
    return () => clearInterval(interval);
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAdminConversations = async () => {
    try {
      let url = '/messaging/admin/conversations';
      const params = [];
      if (statusFilter) params.push(`status=${statusFilter}`);
      if (priorityFilter) params.push(`priority=${priorityFilter}`);
      if (params.length) url += '?' + params.join('&');

      const response = await API.get(url);
      setConversations(response.data.data);
    } catch (error) {
      console.error('Failed to fetch admin conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      console.log('Fetching messages for conversation:', conversationId);
      const response = await API.get(`/messaging/conversations/${conversationId}/messages`);
      console.log('Messages response:', response.data);
      setMessages(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error.response?.data || error.message);
      Toast.error(error.response?.data?.message || 'Failed to load messages');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversation) {
      Toast.error('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending admin reply to:', selectedConversation._id);
      const response = await API.post(
        `/messaging/admin/conversations/${selectedConversation._id}/response`,
        { text: replyText }
      );

      console.log('Admin response:', response.data);
      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.data]);
        setReplyText('');
        Toast.success('Response sent!');
        fetchAdminConversations(); // Refresh list
      }
    } catch (error) {
      console.error('Send reply error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to send response';
      Toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedConversation) return;

    try {
      await API.put(`/messaging/conversations/${selectedConversation._id}/status`, {
        status,
      });

      setSelectedConversation({ ...selectedConversation, status });
      Toast.success(`Status updated to ${status}`);
      fetchAdminConversations();
    } catch (error) {
      Toast.error('Failed to update status');
    }
  };

  const handleUpdatePriority = async (priority) => {
    if (!selectedConversation) return;

    try {
      await API.put(`/messaging/conversations/${selectedConversation._id}/status`, {
        priority,
      });

      setSelectedConversation({ ...selectedConversation, priority });
      Toast.success(`Priority updated to ${priority}`);
      fetchAdminConversations();
    } catch (error) {
      Toast.error('Failed to update priority');
    }
  };

  return (
    <div className="admin-messaging-container">
      <div className="messaging-header">
        <h1>📬 Customer Support Messages</h1>
        <p>Manage and respond to user conversations</p>
      </div>

      <div className="messaging-filters">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <button
          onClick={fetchAdminConversations}
          className="btn-refresh"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="messaging-split">
        {/* Conversations List */}
        <div className="conversations-panel">
          <h2>Conversations ({conversations.length})</h2>
          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="no-conversations">No conversations</div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv._id}
                  className={`conversation-item ${
                    selectedConversation?._id === conv._id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="conv-header">
                    <h4>{conv.subject}</h4>
                    <span className={`status-badge status-${conv.status}`}>
                      {conv.status}
                    </span>
                  </div>
                  <div className="conv-meta">
                    <p>👤 {conv.userId?.name || 'Unknown'}</p>
                    <p className="category">#{conv.category}</p>
                  </div>
                  {conv.lastMessage && (
                    <p className="last-message">
                      {conv.lastMessage.substring(0, 50)}...
                    </p>
                  )}
                  <div className="conv-time">
                    {new Date(conv.lastMessageAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages Panel */}
        <div className="messages-panel">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="selected-conv-header">
                <div>
                  <h3>{selectedConversation.subject}</h3>
                  <p>User: {selectedConversation.userId?.name}</p>
                </div>
                <div className="conv-controls">
                  <select
                    value={selectedConversation.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="status-control"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  <select
                    value={selectedConversation.priority}
                    onChange={(e) => handleUpdatePriority(e.target.value)}
                    className="priority-control"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-display">
                {messages.length === 0 ? (
                  <div className="no-messages">No messages yet</div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`message ${
                        msg.messageType === 'admin_response'
                          ? 'admin-message'
                          : 'user-message'
                      }`}
                    >
                      <div className="message-sender">
                        {msg.messageType === 'admin_response' ? (
                          <span className="admin-badge">🛡️ Admin Response</span>
                        ) : (
                          <span>{msg.senderId?.name || 'User'}</span>
                        )}
                      </div>
                      <div className="message-content">{msg.text}</div>
                      <div className="message-time">
                        {new Date(msg.createdAt || msg.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="reply-form">
                <div className="reply-input-group">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response here..."
                    className="reply-textarea"
                    rows="3"
                  />
                  <button
                    type="submit"
                    disabled={loading || !replyText.trim()}
                    className="btn-send-reply"
                  >
                    {loading ? '⏳ Sending...' : '📤 Send Response'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="no-selection">
              <p>Select a conversation to view and respond to messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessaging;
