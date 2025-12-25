// client/src/pages/MessagesHub.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./MessagesHub.css";

const MessagesHub = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      // Mock messages - In a real app, this would fetch from API
      const mockMessages = [
        {
          id: 1,
          sender: "PKC CAG Support",
          avatar: "🤝",
          subject: "Order #PKC001 - Processing Update",
          message:
            "Your order is being processed and will be completed within 24-48 hours. Thank you for your patience!",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: true,
          type: "order_update",
        },
        {
          id: 2,
          sender: "Admin",
          avatar: "👨‍💼",
          subject: "New Referral Reward Available",
          message:
            "You have earned ₹500 from referrals! Visit your referral dashboard to claim your rewards.",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          read: true,
          type: "reward",
        },
        {
          id: 3,
          sender: "PKC CAG Support",
          avatar: "🤝",
          subject: "Your Account Level Has Been Updated",
          message:
            "Congratulations! You've reached Level 5. Enjoy new benefits and exclusive perks!",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          read: false,
          type: "achievement",
        },
        {
          id: 4,
          sender: "System",
          avatar: "⚙️",
          subject: "Security Alert - New Login",
          message:
            "We detected a new login to your account from Windows. If this wasn't you, please secure your account.",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          read: false,
          type: "security",
        },
        {
          id: 5,
          sender: "Marketing Team",
          avatar: "📢",
          subject: "Exclusive Offer - 30% Off This Weekend",
          message:
            "Don't miss out! Get 30% off on all services this weekend only. Use code WEEKEND30.",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          read: true,
          type: "promotion",
        },
      ];
      setMessages(mockMessages);
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages =
    filter === "all"
      ? messages
      : filter === "unread"
      ? messages.filter((m) => !m.read)
      : messages.filter((m) => m.type === filter);

  const getMessageIcon = (type) => {
    const icons = {
      order_update: "📦",
      reward: "🎁",
      achievement: "⭐",
      security: "🔒",
      promotion: "🎉",
      support: "🤝",
    };
    return icons[type] || "📬";
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-spinner"></div>
        <p>Loading your messages...</p>
      </div>
    );
  }

  return (
    <div className="messages-hub">
      <div className="container">
        <Link to="/user-hub" className="back-btn">
          ← Back to Hub
        </Link>

        <div className="messages-header">
          <h1>Messages</h1>
          <p>Manage all your notifications and messages</p>
        </div>

        {/* FILTER SECTION */}
        <div className="filter-section">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({messages.length})
            </button>
            <button
              className={`filter-btn ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Unread ({messages.filter((m) => !m.read).length})
            </button>
            <button
              className={`filter-btn ${
                filter === "order_update" ? "active" : ""
              }`}
              onClick={() => setFilter("order_update")}
            >
              Orders
            </button>
            <button
              className={`filter-btn ${filter === "reward" ? "active" : ""}`}
              onClick={() => setFilter("reward")}
            >
              Rewards
            </button>
            <button
              className={`filter-btn ${
                filter === "promotion" ? "active" : ""
              }`}
              onClick={() => setFilter("promotion")}
            >
              Promotions
            </button>
          </div>
        </div>

        <div className="messages-wrapper">
          {/* MESSAGES LIST */}
          <div className="messages-list">
            {filteredMessages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No messages</h3>
                <p>You don't have any messages in this category</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`message-item ${
                    selectedMessage?.id === message.id ? "active" : ""
                  } ${!message.read ? "unread" : ""}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="message-avatar">{message.avatar}</div>
                  <div className="message-preview">
                    <div className="message-top">
                      <h4>{message.sender}</h4>
                      <span className="message-time">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="message-subject">{message.subject}</p>
                  </div>
                  {!message.read && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* MESSAGE DETAIL */}
          <div className="message-detail">
            {selectedMessage ? (
              <div className="detail-content">
                <div className="detail-header">
                  <div className="detail-avatar">{selectedMessage.avatar}</div>
                  <div>
                    <h3>{selectedMessage.sender}</h3>
                    <p className="detail-time">
                      {selectedMessage.timestamp.toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="detail-subject">
                  <h2>{selectedMessage.subject}</h2>
                  <span className="message-type">
                    {getMessageIcon(selectedMessage.type)}{" "}
                    {selectedMessage.type.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="detail-body">
                  <p>{selectedMessage.message}</p>
                </div>

                <div className="detail-actions">
                  <button className="btn-primary">Reply</button>
                  <button className="btn-secondary">Archive</button>
                  <button className="btn-secondary">Delete</button>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <div className="no-selection-icon">💬</div>
                <p>Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesHub;
