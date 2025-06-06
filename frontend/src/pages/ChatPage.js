import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import api from '../utils/api';

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  
  // Add proper destructuring with default values to prevent undefined errors
  const { 
    chats = [], 
    activeChat = null, 
    messages = {}, 
    setActiveChat = () => {}, 
    sendMessage = () => {}, 
    markAsRead = () => {} 
  } = useChat() || {}; // Add fallback for entire useChat hook

  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const commonEmojis = [
    '👍', '👎', '❤️', '😊', '😂', '😢', '😮', '😡',
    '🎉', '🎊', '👏', '🙌', '💪', '🔥', '⭐', '✅',
    '❌', '⚡', '💰', '🚀', '💡', '📝', '📋', '🎯'
  ];

  // Safe array check function
  const ensureArray = (value) => {
    return Array.isArray(value) ? value : [];
  };

  // Safe object check function
  const ensureObject = (value) => {
    return value && typeof value === 'object' ? value : {};
  };

  useEffect(() => {
    const bookingId = searchParams.get('booking');
    const taskId = searchParams.get('task');
    
    if (bookingId || taskId) {
      handleDirectMessage(bookingId, taskId);
    }
  }, [searchParams]);

  useEffect(() => {
    scrollToBottom();
    if (activeChat && activeChat._id && markAsRead) {
      markAsRead(activeChat._id);
    }
  }, [messages, activeChat, markAsRead]);

  const handleDirectMessage = async (bookingId, taskId) => {
    try {
      setError('');
      const chatsArray = ensureArray(chats);
      let conversation = chatsArray.find(conv => 
        (conv && conv.bookingId === bookingId) || (conv && conv.taskId === taskId)
      );
      
      if (!conversation) {
        const response = await api.post('/chat/conversations', { bookingId, taskId });
        if (response && response.data) {
          conversation = response.data;
        }
      }
      
      if (conversation && setActiveChat) {
        setActiveChat(conversation);
      }
    } catch (error) {
      console.error('Error setting up direct message:', error);
      setError('Failed to start conversation. Please try again.');
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!newMessage || !newMessage.trim()) && !selectedFile) return;
    if (!activeChat || !activeChat._id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const messageData = {
        content: newMessage.trim(),
        file: selectedFile
      };
      
      if (sendMessage) {
        await sendMessage(activeChat._id, messageData);
      }
      setNewMessage('');
      setSelectedFile(null);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => (prev || '') + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target?.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  };

  const getFilteredConversations = () => {
    const chatsArray = ensureArray(chats);
    
    if (!searchQuery || !searchQuery.trim()) {
      return chatsArray;
    }
    
    return chatsArray.filter(conv => {
      if (!conv) return false;
      
      const participants = ensureArray(conv.participants);
      const otherUser = participants.find(p => p && p._id !== currentUser?.id);
      const taskTitle = conv.taskId?.title || '';
      const searchLower = searchQuery.toLowerCase();
      
      return (
        (otherUser?.username || '').toLowerCase().includes(searchLower) ||
        taskTitle.toLowerCase().includes(searchLower)
      );
    });
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return 'now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
      if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (diff < 604800000) return date.toLocaleDateString([], { weekday: 'short' });
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const getOtherUser = (conversation) => {
    if (!conversation) return null;
    const participants = ensureArray(conversation.participants);
    return participants.find(p => p && p._id !== currentUser?.id) || null;
  };

  const ConversationItem = ({ conversation, isActive, onClick }) => {
    if (!conversation) return null;
    
    const otherUser = getOtherUser(conversation);
    const lastMessage = conversation.lastMessage;
    const unreadCount = conversation.unreadCount || 0;
    const isOnline = otherUser?.isOnline || false;
    
    if (!otherUser) return null;
    
    return (
      <div 
        className={`conversation-item ${isActive ? 'active' : ''}`}
        onClick={() => onClick && onClick(conversation)}
      >
        <div className="conversation-avatar">
          <div className="avatar-circle">
            {(otherUser.username || '?').charAt(0).toUpperCase()}
          </div>
          {isOnline && <div className="online-indicator"></div>}
        </div>
        
        <div className="conversation-content">
          <div className="conversation-header">
            <h4 className="conversation-name">{otherUser.username || 'Unknown User'}</h4>
            <span className="conversation-time">
              {lastMessage ? formatMessageTime(lastMessage.createdAt) : ''}
            </span>
          </div>
          
          <div className="conversation-preview">
            <p className="last-message">
              {lastMessage ? (
                lastMessage.sender === currentUser?.id 
                  ? `You: ${lastMessage.content || 'Sent a file'}` 
                  : lastMessage.content || 'Sent a file'
              ) : 'No messages yet'}
            </p>
            
            {conversation.taskId && (
              <div className="project-context">
                📋 {conversation.taskId.title || 'Project'}
              </div>
            )}
          </div>
          
          {unreadCount > 0 && (
            <div className="unread-badge">{unreadCount}</div>
          )}
        </div>
      </div>
    );
  };

  const MessageBubble = ({ message, isOwn, showAvatar = true }) => {
    if (!message) return null;
    
    const sender = ensureObject(message.sender);
    const timestamp = formatMessageTime(message.createdAt);
    
    return (
      <div className={`message-container ${isOwn ? 'own' : 'other'}`}>
        {!isOwn && showAvatar && (
          <div className="message-avatar">
            <div className="avatar-circle">
              {(sender.username || '?').charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        
        <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
          <div className="message-content">
            {message.content && <p className="message-text">{message.content}</p>}
            
            {message.file && (
              <div className="message-file">
                {message.file.type?.startsWith('image/') ? (
                  <img 
                    src={message.file.url} 
                    alt="Shared image"
                    className="message-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="file-attachment">
                    <span className="file-icon">📎</span>
                    <span className="file-name">{message.file.name || 'File'}</span>
                    <a 
                      href={message.file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="file-download"
                    >
                      Download
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="message-meta">
            <span className="message-time">{timestamp}</span>
            {isOwn && message.read && <span className="read-indicator">✓</span>}
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = () => (
    <div className="chat-empty-state">
      <div className="empty-icon">💬</div>
      <h3>Select a conversation</h3>
      <p>Choose a conversation from the sidebar to start messaging</p>
    </div>
  );

  const NoConversations = () => (
    <div className="no-conversations">
      <div className="empty-icon">📭</div>
      <h3>No conversations yet</h3>
      <p>Start collaborating on projects to begin conversations</p>
      <button 
        onClick={() => navigate('/browse-tasks')}
        className="btn btn-primary"
      >
        🔍 Browse Projects
      </button>
    </div>
  );

  // Safe access to current messages
  const getCurrentMessages = () => {
    if (!activeChat || !activeChat._id || !messages) return [];
    const currentMessages = messages[activeChat._id];
    return ensureArray(currentMessages);
  };

  const filteredConversations = getFilteredConversations();
  const currentMessages = getCurrentMessages();

  return (
    <div className="chat-container">
      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span className="error-text">{error}</span>
          <button onClick={() => setError('')} className="error-close">✕</button>
        </div>
      )}

      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <div className="sidebar-controls">
            <button 
              onClick={() => navigate('/browse-tasks')}
              className="new-chat-btn"
              title="Start new conversation"
            >
              ✏️
            </button>
          </div>
        </div>
        
        <div className="search-section">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value || '')}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="conversations-list">
          {filteredConversations.length === 0 ? (
            <NoConversations />
          ) : (
            filteredConversations.map((conversation, index) => (
              conversation ? (
                <ConversationItem
                  key={conversation._id || index}
                  conversation={conversation}
                  isActive={activeChat?._id === conversation._id}
                  onClick={setActiveChat}
                />
              ) : null
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {!activeChat ? (
          <EmptyState />
        ) : (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="user-avatar">
                  <div className="avatar-circle">
                    {(getOtherUser(activeChat)?.username || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="online-status"></div>
                </div>
                <div className="user-details">
                  <h3 className="user-name">
                    {getOtherUser(activeChat)?.username || 'Unknown User'}
                  </h3>
                  <p className="user-status">
                    {getOtherUser(activeChat)?.isOnline ? (
                      <span className="status-online">🟢 Online</span>
                    ) : (
                      <span className="status-offline">⚫ Offline</span>
                    )}
                  </p>
                </div>
              </div>
              
              {activeChat.taskId && (
                <div className="project-info">
                  <div className="project-badge">
                    <span className="project-icon">📋</span>
                    <span className="project-title">
                      {activeChat.taskId.title || 'Project'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowUserInfo(!showUserInfo)}
                    className="info-btn"
                  >
                    ℹ️
                  </button>
                </div>
              )}
            </div>
            
            {/* Project Info Panel */}
            {showUserInfo && activeChat.taskId && (
              <div className="project-info-panel">
                <div className="project-details">
                  <h4>📋 Project Details</h4>
                  <p><strong>Title:</strong> {activeChat.taskId.title || 'N/A'}</p>
                  <p><strong>Budget:</strong> {activeChat.taskId.credits || 0} credits</p>
                  <p><strong>Deadline:</strong> {
                    activeChat.taskId.dateTime 
                      ? new Date(activeChat.taskId.dateTime).toLocaleDateString()
                      : 'Flexible'
                  }</p>
                  <div className="project-actions">
                    <button 
                      onClick={() => navigate(`/tasks/${activeChat.taskId._id}`)}
                      className="btn btn-secondary"
                    >
                      📋 View Project
                    </button>
                    {activeChat.bookingId && (
                      <button 
                        onClick={() => navigate(`/my-bookings`)}
                        className="btn btn-primary"
                      >
                        📁 Manage Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className="messages-container">
              <div className="messages-list">
                {currentMessages.map((message, index) => {
                  if (!message) return null;
                  
                  const isOwn = message.sender?._id === currentUser?.id;
                  const prevMessage = currentMessages[index - 1];
                  const showAvatar = !prevMessage || prevMessage.sender?._id !== message.sender?._id;
                  
                  return (
                    <MessageBubble
                      key={message._id || `msg-${index}`}
                      message={message}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                    />
                  );
                })}
                
                {isTyping && (
                  <div className="typing-indicator">
                    <div className="typing-bubble">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="message-input-container">
              {selectedFile && (
                <div className="file-preview">
                  <div className="file-info">
                    <span className="file-icon">📎</span>
                    <span className="file-name">{selectedFile.name}</span>
                    <button 
                      onClick={() => setSelectedFile(null)}
                      className="remove-file"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="message-form">
                <div className="input-actions">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="action-btn"
                    title="Attach file"
                  >
                    📎
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="action-btn"
                    title="Add emoji"
                  >
                    😊
                  </button>
                </div>
                
                <div className="message-input-wrapper">
                  <textarea
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value || '');
                      handleTyping();
                    }}
                    placeholder="Type your message..."
                    className="message-input"
                    rows="1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  
                  <button
                    type="submit"
                    disabled={loading || ((!newMessage || !newMessage.trim()) && !selectedFile)}
                    className="send-btn"
                  >
                    {loading ? '⏳' : '🚀'}
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
              </form>
              
              {showEmojiPicker && (
                <div className="emoji-picker">
                  <div className="emoji-grid">
                    {commonEmojis.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="emoji-btn"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .chat-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem;
          height: calc(100vh - 120px);
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 1rem;
          overflow: hidden;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .error-banner {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #ff4757;
          color: white;
          padding: 1rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1000;
          box-shadow: 0 5px 15px rgba(255,71,87,0.3);
        }

        .error-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 1.2rem;
        }

        .chat-sidebar {
          background: rgba(255,255,255,0.95);
          border-radius: 15px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .sidebar-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .new-chat-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 0.5rem;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .new-chat-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: scale(1.1);
        }

        .search-section {
          padding: 1rem;
          border-bottom: 1px solid rgba(0,0,0,0.1);
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          z-index: 1;
          opacity: 0.6;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 0.75rem 0.75rem 2.5rem;
          border: 2px solid rgba(0,0,0,0.1);
          border-radius: 25px;
          outline: none;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          background: rgba(255,255,255,0.8);
        }

        .search-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }

        .conversations-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .conversation-item {
          display: flex;
          align-items: center;
          padding: 1rem;
          cursor: pointer;
          border-radius: 12px;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
          background: rgba(255,255,255,0.5);
        }

        .conversation-item:hover {
          background: rgba(102,126,234,0.1);
          transform: translateY(-2px);
        }

        .conversation-item.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 5px 15px rgba(102,126,234,0.3);
        }

        .conversation-avatar {
          position: relative;
          margin-right: 1rem;
        }

        .avatar-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1.2rem;
        }

        .online-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #2ed573;
          border: 2px solid white;
        }

        .conversation-content {
          flex: 1;
          min-width: 0;
        }

        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .conversation-name {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: inherit;
        }

        .conversation-time {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .conversation-preview {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .last-message {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .project-context {
          font-size: 0.8rem;
          background: rgba(102,126,234,0.2);
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          display: inline-block;
          margin-top: 0.25rem;
        }

        .unread-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: #ff4757;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          min-width: 20px;
          text-align: center;
        }

        .chat-main {
          background: rgba(255,255,255,0.95);
          border-radius: 15px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-empty-state, .no-conversations {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          padding: 2rem;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .chat-empty-state h3, .no-conversations h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.5rem;
        }

        .chat-empty-state p, .no-conversations p {
          margin: 0 0 1.5rem 0;
          color: #666;
          font-size: 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 5px 15px rgba(102,126,234,0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102,126,234,0.4);
        }

        .btn-secondary {
          background: rgba(102,126,234,0.1);
          color: #667eea;
          border: 2px solid #667eea;
        }

        .btn-secondary:hover {
          background: #667eea;
          color: white;
        }

        .chat-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
        }

        .chat-user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-avatar {
          position: relative;
        }

        .user-details h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .user-details p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .status-online, .status-offline {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .project-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .project-badge {
          background: rgba(255,255,255,0.2);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .info-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 0.5rem;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .info-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: scale(1.1);
        }

        .project-info-panel {
          padding: 1rem 1.5rem;
          background: rgba(102,126,234,0.1);
          border-bottom: 1px solid rgba(0,0,0,0.1);
        }

        .project-details h4 {
          margin: 0 0 1rem 0;
          color: #333;
        }

        .project-details p {
          margin: 0.5rem 0;
          color: #666;
        }

        .project-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .messages-container {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .messages-list {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message-container {
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .message-container.own {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
        }

        .message-avatar .avatar-circle {
          width: 32px;
          height: 32px;
          font-size: 0.9rem;
        }

        .message-bubble {
          max-width: 70%;
          padding: 1rem;
          border-radius: 20px;
          position: relative;
        }

        .message-bubble.own {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-bottom-right-radius: 5px;
        }

        .message-bubble.other {
          background: rgba(0,0,0,0.05);
          color: #333;
          border-bottom-left-radius: 5px;
        }

        .message-content {
          margin-bottom: 0.5rem;
        }

        .message-text {
          margin: 0;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .message-file {
          margin-top: 0.5rem;
        }

        .message-image {
          max-width: 200px;
          border-radius: 10px;
          cursor: pointer;
        }

        .file-attachment {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }

        .file-download {
          color: inherit;
          text-decoration: none;
          font-weight: 600;
        }

        .message-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .typing-indicator {
          display: flex;
          justify-content: flex-start;
          margin: 0.5rem 0;
        }

        .typing-bubble {
          background: rgba(0,0,0,0.05);
          padding: 1rem;
          border-radius: 20px;
          border-bottom-left-radius: 5px;
        }

        .typing-dots {
          display: flex;
          gap: 0.25rem;
        }

        .typing-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #666;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .message-input-container {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(0,0,0,0.1);
          background: rgba(255,255,255,0.8);
        }

        .file-preview {
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: rgba(102,126,234,0.1);
          border-radius: 10px;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .remove-file {
          background: none;
          border: none;
          color: #ff4757;
          cursor: pointer;
          font-weight: bold;
          margin-left: auto;
        }

        .message-form {
          display: flex;
          align-items: flex-end;
          gap: 1rem;
        }

        .input-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .action-btn {
          background: rgba(102,126,234,0.1);
          border: none;
          padding: 0.75rem;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: rgba(102,126,234,0.2);
          transform: scale(1.1);
        }

        .message-input-wrapper {
          flex: 1;
          display: flex;
          align-items: flex-end;
          gap: 0.5rem;
          background: white;
          border-radius: 25px;
          padding: 0.5rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .message-input {
          flex: 1;
          border: none;
          outline: none;
          padding: 0.75rem;
          font-size: 1rem;
          resize: none;
          max-height: 120px;
          background: transparent;
        }

        .send-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border: none;
          color: white;
          padding: 0.75rem;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          min-width: 48px;
          height: 48px;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-btn:not(:disabled):hover {
          transform: scale(1.1);
          box-shadow: 0 5px 15px rgba(102,126,234,0.3);
        }

        .emoji-picker {
          position: absolute;
          bottom: 100%;
          left: 0;
          background: white;
          border-radius: 15px;
          padding: 1rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          z-index: 1000;
        }

        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 0.5rem;
        }

        .emoji-btn {
          background: none;
          border: none;
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.2s ease;
        }

        .emoji-btn:hover {
          background: rgba(102,126,234,0.1);
          transform: scale(1.2);
        }

        @media (max-width: 768px) {
          .chat-container {
            grid-template-columns: 1fr;
            padding: 0.5rem;
          }
          
          .chat-sidebar {
            display: none;
          }
          
          .message-bubble {
            max-width: 85%;
          }
        }
      `}</style>
    </div>
  );
};

export default Chat;