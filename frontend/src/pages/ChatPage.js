import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import ChatWindow from '../components/ChatWindow';

const ChatPage = () => {
  const { currentUser } = useAuth();
  const { chats, activeChat, joinChat, leaveChat, fetchChats } = useChat();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchChats().finally(() => setLoading(false));
  }, [currentUser, navigate, fetchChats]);

  const handleChatSelect = (chat) => {
    joinChat(chat);
  };

  const handleCloseChat = () => {
    leaveChat();
  };

  const formatLastActivity = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getOtherParticipant = (chat) => {
    return chat.participants.find(p => p._id !== currentUser.id);
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return <div className="text-center">Loading your chats...</div>;
  }

  return (
    <div>
      <h1 className="mb-2">Messages</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', height: '600px' }}>
        {/* Chat List */}
        <div className="card" style={{ padding: '1rem', overflow: 'auto' }}>
          <h3>Your Conversations</h3>
          
          {chats.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem', color: '#666' }}>
              <p>No conversations yet.</p>
              <p>When you accept a task or have your task accepted, you'll be able to chat here!</p>
            </div>
          ) : (
            <div>
              {chats.map(chat => {
                const otherUser = getOtherParticipant(chat);
                const isSelected = activeChat?._id === chat._id;
                
                return (
                  <div
                    key={chat._id}
                    onClick={() => handleChatSelect(chat)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginBottom: '0.5rem',
                      backgroundColor: isSelected ? '#e3f2fd' : '#f8f9fa',
                      border: isSelected ? '2px solid #2196f3' : '1px solid #ddd',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{otherUser?.username}</strong>
                        {otherUser?.isOnline && (
                          <span style={{ color: '#28a745', fontSize: '0.8rem' }}> • Online</span>
                        )}
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          {chat.taskId?.title}
                        </div>
                        {chat.lastMessage && (
                          <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>
                            {chat.lastMessage.content?.length > 50 
                              ? chat.lastMessage.content.substring(0, 50) + '...'
                              : chat.lastMessage.content}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {formatLastActivity(chat.lastActivity)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat Window */}
        <ChatWindow 
          chat={activeChat} 
          onClose={handleCloseChat}
        />
      </div>

      <div className="card mt-2" style={{ padding: '1rem', backgroundColor: '#f8f9fa' }}>
        <h4>💡 Chat Tips:</h4>
        <ul style={{ marginLeft: '1rem', color: '#666' }}>
          <li>Chats are automatically created when tasks are accepted</li>
          <li>Use chat to coordinate task details, timing, and requirements</li>
          <li>Be respectful and professional in all communications</li>
          <li>You can see when the other person is online</li>
        </ul>
      </div>
    </div>
  );
};

export default ChatPage;