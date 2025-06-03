import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import RoleSwitcher from './RoleSwitcher';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useChat();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1>TimeSlice</h1>
        </Link>
        
        {currentUser ? (
          <ul className="nav-links">
            <li><Link to="/dashboard">Dashboard</Link></li>
            
            {/* Both types of users can now access both sections */}
            <li><Link to="/browse-tasks">Browse Tasks</Link></li>
            <li><Link to="/create-task">Post Task</Link></li>
            <li><Link to="/my-tasks">My Tasks</Link></li>
            
            <li><Link to="/my-bookings">My Bookings</Link></li>
            <li><Link to="/task-applications">Applications</Link></li>
            
            {/* Chat with unread indicator */}
            <li>
              <Link to="/chat" style={{ position: 'relative' }}>
                Chat
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: '#dc3545',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '0.2rem 0.4rem',
                    fontSize: '0.7rem',
                    minWidth: '18px',
                    textAlign: 'center'
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            </li>
            
            <li><Link to="/profile">Profile</Link></li>
            
            {/* Role Switcher */}
            <li>
              <RoleSwitcher />
            </li>
            
            <li>
              <span style={{ color: '#ffc107' }}>
                Credits: {currentUser.credits}
              </span>
            </li>
            
            <li>
              <span style={{ color: '#17a2b8', fontSize: '0.9rem' }}>
                {currentUser.primaryRole === 'helper' ? '🤝 Helper' : '📋 Provider'}
              </span>
            </li>
            
            <li>
              <button 
                onClick={handleLogout} 
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem' }}
              >
                Logout
              </button>
            </li>
          </ul>
        ) : (
          <ul className="nav-links">
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;