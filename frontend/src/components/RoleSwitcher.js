import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const RoleSwitcher = () => {
  const { currentUser } = useAuth();
  const [currentMode, setCurrentMode] = useState(currentUser?.primaryRole || 'helper');

  if (!currentUser) return null;

  const handleModeSwitch = (mode) => {
    setCurrentMode(mode);
    // You could also update this in the backend if needed
  };

  return (
    <div style={{ 
      background: '#f8f9fa', 
      padding: '0.5rem 1rem', 
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      <span style={{ fontSize: '0.9rem', color: '#666' }}>Mode:</span>
      
      <button
        onClick={() => handleModeSwitch('helper')}
        className={`btn ${currentMode === 'helper' ? 'btn-success' : 'btn-secondary'}`}
        style={{ 
          padding: '0.25rem 0.75rem', 
          fontSize: '0.8rem',
          borderRadius: '15px'
        }}
      >
        🤝 Helper
      </button>
      
      <button
        onClick={() => handleModeSwitch('taskProvider')}
        className={`btn ${currentMode === 'taskProvider' ? 'btn-success' : 'btn-secondary'}`}
        style={{ 
          padding: '0.25rem 0.75rem', 
          fontSize: '0.8rem',
          borderRadius: '15px'
        }}
      >
        📋 Task Provider
      </button>
    </div>
  );
};

export default RoleSwitcher;