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
      background: 'rgba(255, 255, 255, 0.1)', 
      padding: '0.5rem 1rem', 
      borderRadius: '25px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>Mode:</span>
      
      <button
        onClick={() => handleModeSwitch('helper')}
        className={`btn ${currentMode === 'helper' ? 'btn-success' : 'btn-secondary'}`}
        style={{ 
          padding: '0.25rem 0.75rem', 
          fontSize: '0.8rem',
          borderRadius: '15px',
          background: currentMode === 'helper' 
            ? 'linear-gradient(135deg, #50C878, #2E8B57)' 
            : 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          color: 'white',
          boxShadow: currentMode === 'helper' 
            ? '0 2px 10px rgba(80, 200, 120, 0.3)' 
            : 'none'
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
          borderRadius: '15px',
          background: currentMode === 'taskProvider' 
            ? 'linear-gradient(135deg, #50C878, #2E8B57)' 
            : 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          color: 'white',
          boxShadow: currentMode === 'taskProvider' 
            ? '0 2px 10px rgba(80, 200, 120, 0.3)' 
            : 'none'
        }}
      >
        📋 Task Provider
      </button>
    </div>
  );
};

export default RoleSwitcher;