import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const ChatPage = () => {
  const { currentUser } = useAuth();
  const { messages, sendMessage, markAsRead } = useChat();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    fetchConversations();
  }, [currentUser, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat, messages]);

  const fetchConversations = async () => {
    try {
      // Mock conversations data - replace with actual API call
      const mockConversations = [
        {
          _id: 'conv1',
          participants: [
            {
              _id: 'user1',
              username: 'designpro',
              avatar: '🎨',
              lastSeen: new Date(Date.now() - 5 * 60 * 1000),
              isOnline: true
            }
          ],
          taskId: {
            _id: 'task1',
            title: 'E-commerce Website Design',
            status: 'in-progress'
          },
          lastMessage: {
            content: 'I\'ve uploaded the latest mockups for review',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            sender: 'user1'
          },
          unreadCount: 2
        },
        {
          _id: 'conv2',
          participants: [
            {
              _id: 'user2',
              username: 'johndeveloper',
              avatar: '👨‍💻',
              lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
              isOnline: false
            }
          ],
          taskId: {
            _id: 'task2',
            title: 'React Dashboard Development',
            status: 'completed'
          },
          lastMessage: {
            content: 'Thanks for the feedback! Project delivered successfully.',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            sender: 'user2'
          },
          unreadCount: 0
        },
        {
          _id: 'conv3',
          participants: [
            {
              _id: 'user3',
              username: 'contentwriter',
              avatar: '✍️',
              lastSeen: new Date(Date.now() - 6 * 60 * 60 * 1000),
              isOnline: false
            }
          ],
          taskId: {
            _id: 'task3',
            title: 'Blog Content Creation',
            status: 'pending'
          },
          lastMessage: {
            content: 'When would you like me to start on the blog posts?',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            sender: 'user3'
          },
          unreadCount: 1
        }
      ];
      
      setConversations(mockConversations);
      
      // Auto-select first conversation if available
      if (mockConversations.length > 0) {
        setActiveChat(mockConversations[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    try {
      const messageData = {
        conversationId: activeChat._id,
        content: newMessage.trim(),
        timestamp: new Date()
      };

      await sendMessage(messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInHours = Math.abs(now - messageDate) / 36e5;

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) { // 7 days
      return messageDate.toLocaleDateString('en-US', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'in-progress': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const currentMessages = [
    {
      _id: 'msg1',
      content: 'Hi! I\'ve started working on your e-commerce design project.',
      sender: { _id: 'user1', username: 'designpro' },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isOwn: false
    },
    {
      _id: 'msg2',
      content: 'Great! I\'m excited to see what you come up with. Do you have any initial questions about the requirements?',
      sender: { _id: currentUser?.id, username: currentUser?.username },
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      isOwn: true
    },
    {
      _id: 'msg3',
      content: 'I\'ve uploaded the latest mockups for review. Please check them out and let me know your thoughts!',
      sender: { _id: 'user1', username: 'designpro' },
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isOwn: false
    }
  ];

  const MessageBubble = ({ message, isOwn, showAvatar }) => (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && showAvatar && (
        <div className="message-avatar">
          {message.sender?.username?.charAt(0).toUpperCase() || '?'}
        </div>
      )}
      <div className="message-content">
        <div className="message-text">
          {message.content}
        </div>
        <div className="message-timestamp">
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );

  const ConversationItem = ({ conversation, isActive, onClick }) => {
    const otherUser = conversation.participants[0];
    const hasUnread = conversation.unreadCount > 0;

    return (
      <div 
        className={`conversation-item ${isActive ? 'active' : ''} ${hasUnread ? 'unread' : ''}`}
        onClick={onClick}
      >
        <div className="conversation-avatar">
          <div className="avatar-icon">
            {otherUser.avatar}
          </div>
          {otherUser.isOnline && <div className="online-indicator"></div>}
        </div>
        
        <div className="conversation-content">
          <div className="conversation-header">
            <span className="conversation-name">{otherUser.username}</span>
            <span className="conversation-time">
              {formatTimestamp(conversation.lastMessage.timestamp)}
            </span>
          </div>
          
          <div className="conversation-preview">
            <span className="project-title">{conversation.taskId.title}</span>
            <p className="last-message">{conversation.lastMessage.content}</p>
          </div>
          
          <div className="conversation-meta">
            <span 
              className="project-status"
              style={{ color: getStatusColor(conversation.taskId.status) }}
            >
              {conversation.taskId.status}
            </span>
            {hasUnread && (
              <span className="unread-count">{conversation.unreadCount}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participants[0].username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.taskId.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">💬 Messages</h1>
          <p className="page-subtitle">Communicate with your project collaborators</p>
        </div>

        <div className="chat-container">
          {/* Conversations Sidebar */}
          <div className="conversations-sidebar">
            <div className="sidebar-header">
              <h3>Conversations</h3>
              <div className="search-wrapper">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>

            <div className="conversations-list">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation._id}
                    conversation={conversation}
                    isActive={activeChat?._id === conversation._id}
                    onClick={() => setActiveChat(conversation)}
                  />
                ))
              ) : (
                <div className="no-conversations">
                  <div className="no-conversations-icon">💬</div>
                  <p>No conversations found</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="chat-area">
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="chat-header">
                  <div className="chat-user-info">
                    <div className="chat-avatar">
                      <div className="avatar-icon">
                        {activeChat.participants[0].avatar}
                      </div>
                      {activeChat.participants[0].isOnline && (
                        <div className="online-indicator"></div>
                      )}
                    </div>
                    <div className="chat-user-details">
                      <h3>{activeChat.participants[0].username}</h3>
                      <p className="user-status">
                        {activeChat.participants[0].isOnline 
                          ? 'Online' 
                          : `Last seen ${formatTimestamp(activeChat.participants[0].lastSeen)}`
                        }
                      </p>
                    </div>
                  </div>

                  <div className="chat-actions">
                    <button className="action-btn" title="Project Details">
                      📋
                    </button>
                    <button className="action-btn" title="Video Call">
                      📹
                    </button>
                    <button className="action-btn" title="More Options">
                      ⋯
                    </button>
                  </div>
                </div>

                {/* Project Info */}
                <div className="project-info-bar">
                  <div className="project-details">
                    <span className="project-icon">📋</span>
                    <div className="project-text">
                      <span className="project-name">{activeChat.taskId.title}</span>
                      <span 
                        className="project-status"
                        style={{ color: getStatusColor(activeChat.taskId.status) }}
                      >
                        {activeChat.taskId.status}
                      </span>
                    </div>
                  </div>
                  <button className="btn btn-secondary btn-sm">
                    📋 View Project
                  </button>
                </div>

                {/* Messages Area */}
                <div className="messages-container">
                  <div className="messages-list">
                    {currentMessages.map((message, index) => {
                      const prevMessage = currentMessages[index - 1];
                      const showAvatar = !prevMessage || prevMessage.sender?._id !== message.sender?._id;
                      
                      return (
                        <MessageBubble
                          key={message._id}
                          message={message}
                          isOwn={message.isOwn}
                          showAvatar={showAvatar}
                        />
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input */}
                <div className="message-input-container">
                  <div className="message-input-wrapper">
                    <button className="attachment-btn" title="Attach File">
                      📎
                    </button>
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="message-input"
                      rows="1"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="send-btn"
                      title="Send Message"
                    >
                      🚀
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-chat-selected">
                <div className="no-chat-icon">💬</div>
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the sidebar to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .chat-container {
          display: grid;
          grid-template-columns: 350px 1fr;
          height: 600px;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-primary);
          overflow: hidden;
        }

        .conversations-sidebar {
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-primary);
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: var(--space-xl);
          border-bottom: 1px solid var(--border-primary);
        }

        .sidebar-header h3 {
          color: var(--text-primary);
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 var(--space-md) 0;
        }

        .search-wrapper {
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: var(--space-md) var(--space-md) var(--space-md) 2.5rem;
          background: var(--bg-input);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 0.9rem;
          outline: none;
          transition: all var(--transition-normal);
        }

        .search-input:focus {
          border-color: var(--border-accent);
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
        }

        .search-icon {
          position: absolute;
          left: var(--space-md);
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .conversations-list {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-md);
        }

        .conversation-item {
          display: flex;
          gap: var(--space-md);
          padding: var(--space-md);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-normal);
          margin-bottom: var(--space-sm);
        }

        .conversation-item:hover {
          background: var(--bg-tertiary);
        }

        .conversation-item.active {
          background: var(--primary-gradient);
          color: white;
        }

        .conversation-item.unread {
          background: rgba(0, 212, 255, 0.05);
          border-left: 3px solid var(--primary-cyan);
        }

        .conversation-avatar {
          position: relative;
          flex-shrink: 0;
        }

        .avatar-icon {
          width: 45px;
          height: 45px;
          background: var(--bg-tertiary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .conversation-item.active .avatar-icon {
          background: rgba(255, 255, 255, 0.2);
        }

        .online-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          background: var(--success);
          border: 2px solid var(--bg-card);
          border-radius: 50%;
        }

        .conversation-content {
          flex: 1;
          min-width: 0;
        }

        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-xs);
        }

        .conversation-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .conversation-item.active .conversation-name {
          color: white;
        }

        .conversation-time {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .conversation-item.active .conversation-time {
          color: rgba(255, 255, 255, 0.8);
        }

        .conversation-preview {
          margin-bottom: var(--space-xs);
        }

        .project-title {
          font-size: 0.85rem;
          color: var(--text-accent);
          font-weight: 500;
          display: block;
          margin-bottom: var(--space-xs);
        }

        .conversation-item.active .project-title {
          color: rgba(255, 255, 255, 0.9);
        }

        .last-message {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .conversation-item.active .last-message {
          color: rgba(255, 255, 255, 0.8);
        }

        .conversation-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .project-status {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .unread-count {
          background: var(--error);
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .no-conversations {
          text-align: center;
          padding: var(--space-2xl);
          color: var(--text-muted);
        }

        .no-conversations-icon {
          font-size: 3rem;
          margin-bottom: var(--space-md);
          opacity: 0.5;
        }

        .chat-area {
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-lg) var(--space-xl);
          border-bottom: 1px solid var(--border-primary);
          background: var(--bg-secondary);
        }

        .chat-user-info {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .chat-avatar {
          position: relative;
        }

        .chat-user-details h3 {
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 var(--space-xs) 0;
        }

        .user-status {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin: 0;
        }

        .chat-actions {
          display: flex;
          gap: var(--space-sm);
        }

        .action-btn {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          color: var(--text-secondary);
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-normal);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .action-btn:hover {
          background: var(--bg-card);
          border-color: var(--border-accent);
          color: var(--text-primary);
        }

        .project-info-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-md) var(--space-xl);
          background: rgba(0, 212, 255, 0.05);
          border-bottom: 1px solid rgba(0, 212, 255, 0.2);
        }

        .project-details {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .project-icon {
          font-size: 1.2rem;
        }

        .project-text {
          display: flex;
          flex-direction: column;
        }

        .project-name {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .btn-sm {
          padding: var(--space-sm) var(--space-md);
          font-size: 0.8rem;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-lg);
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .message-bubble {
          display: flex;
          gap: var(--space-md);
          max-width: 70%;
        }

        .message-bubble.own {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-bubble.other {
          align-self: flex-start;
        }

        .message-avatar {
          width: 35px;
          height: 35px;
          background: var(--primary-gradient);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .message-content {
          flex: 1;
        }

        .message-text {
          background: var(--bg-secondary);
          color: var(--text-primary);
          padding: var(--space-md) var(--space-lg);
          border-radius: var(--radius-lg);
          line-height: 1.5;
          word-wrap: break-word;
        }

        .message-bubble.own .message-text {
          background: var(--primary-gradient);
          color: white;
        }

        .message-timestamp {
          color: var(--text-muted);
          font-size: 0.75rem;
          margin-top: var(--space-xs);
          text-align: right;
        }

        .message-bubble.other .message-timestamp {
          text-align: left;
        }

        .message-input-container {
          padding: var(--space-lg) var(--space-xl);
          border-top: 1px solid var(--border-primary);
          background: var(--bg-secondary);
        }

        .message-input-wrapper {
          display: flex;
          align-items: flex-end;
          gap: var(--space-md);
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: var(--space-md);
        }

        .attachment-btn,
        .send-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1.2rem;
          transition: color var(--transition-normal);
          flex-shrink: 0;
        }

        .attachment-btn:hover,
        .send-btn:hover:not(:disabled) {
          color: var(--primary-cyan);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .message-input {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 0.9rem;
          resize: none;
          outline: none;
          min-height: 20px;
          max-height: 100px;
          line-height: 1.4;
        }

        .message-input::placeholder {
          color: var(--text-muted);
        }

        .no-chat-selected {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-muted);
          text-align: center;
        }

        .no-chat-icon {
          font-size: 4rem;
          margin-bottom: var(--space-lg);
          opacity: 0.5;
        }

        .no-chat-selected h3 {
          color: var(--text-primary);
          font-size: 1.5rem;
          margin: 0 0 var(--space-md) 0;
        }

        .no-chat-selected p {
          margin: 0;
          font-size: 1rem;
        }

        .loading-container {
          text-align: center;
          padding: var(--space-2xl);
          color: var(--text-secondary);
        }

        .loading-container p {
          margin-top: var(--space-lg);
          font-size: 1.1rem;
        }

        @media (max-width: 1024px) {
          .chat-container {
            grid-template-columns: 300px 1fr;
            height: 500px;
          }
        }

        @media (max-width: 768px) {
          .chat-container {
            grid-template-columns: 1fr;
            height: 600px;
          }

          .conversations-sidebar {
            display: ${activeChat ? 'none' : 'flex'};
          }

          .chat-area {
            display: ${activeChat ? 'flex' : 'none'};
          }

          .message-bubble {
            max-width: 85%;
          }

          .chat-header {
            padding: var(--space-md) var(--space-lg);
          }

          .project-info-bar {
            padding: var(--space-sm) var(--space-lg);
            flex-direction: column;
            gap: var(--space-sm);
            align-items: stretch;
          }

          .messages-container {
            padding: var(--space-md);
          }

          .message-input-container {
            padding: var(--space-md) var(--space-lg);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;