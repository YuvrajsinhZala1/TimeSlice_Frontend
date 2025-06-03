import React from 'react';
import { useAuth } from '../context/AuthContext';

const MessageList = ({ messages }) => {
  const { currentUser } = useAuth();

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="text-center" style={{ color: '#666', padding: '2rem' }}>
        No messages yet. Start the conversation!
      </div>
    );
  }

  let lastMessageDate = null;

  return (
    <div>
      {messages.map((message, index) => {
        const messageDate = new Date(message.createdAt).toDateString();
        const showDateSeparator = messageDate !== lastMessageDate;
        lastMessageDate = messageDate;

        const isOwnMessage = message.senderId._id === currentUser.id;

        return (
          <div key={message._id}>
            {/* Date Separator */}
            {showDateSeparator && (
              <div style={{ 
                textAlign: 'center', 
                margin: '1rem 0', 
                color: '#666',
                fontSize: '0.9rem'
              }}>
                {formatDate(message.createdAt)}
              </div>
            )}

            {/* Message */}
            <div style={{ 
              display: 'flex', 
              justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
              marginBottom: '0.5rem'
            }}>
              <div style={{
                maxWidth: '70%',
                padding: '0.5rem 1rem',
                borderRadius: '18px',
                backgroundColor: isOwnMessage ? '#007bff' : '#f1f3f4',
                color: isOwnMessage ? 'white' : '#333',
                wordWrap: 'break-word'
              }}>
                {!isOwnMessage && (
                  <div style={{ 
                    fontSize: '0.8rem', 
                    opacity: 0.8, 
                    marginBottom: '0.25rem' 
                  }}>
                    {message.senderId.username}
                  </div>
                )}
                <div>{message.content}</div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  opacity: 0.7, 
                  marginTop: '0.25rem',
                  textAlign: 'right'
                }}>
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;