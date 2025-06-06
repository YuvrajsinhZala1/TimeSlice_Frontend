import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { unreadCount = 0 } = useChat() || {};
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Mock notifications for demo
  useEffect(() => {
    if (currentUser) {
      setNotifications([
        {
          id: 1,
          type: 'application',
          title: 'New Application Received',
          message: 'John Smith applied to your Web Development project',
          timestamp: new Date(Date.now() - 300000), // 5 minutes ago
          read: false,
          icon: '📋'
        },
        {
          id: 2,
          type: 'message',
          title: 'New Message',
          message: 'You have a new message from Sarah Johnson',
          timestamp: new Date(Date.now() - 900000), // 15 minutes ago
          read: false,
          icon: '💬'
        },
        {
          id: 3,
          type: 'booking',
          title: 'Project Completed',
          message: 'Your project "E-commerce Website" has been completed',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          read: true,
          icon: '✅'
        }
      ]);
    }
  }, [currentUser]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊',
      protected: true
    },
    {
      path: '/browse-tasks',
      label: 'Browse Tasks',
      icon: '🔍',
      protected: true
    },
    {
      path: '/create-task',
      label: 'Post Task',
      icon: '➕',
      protected: true
    },
    {
      path: '/my-tasks',
      label: 'My Tasks',
      icon: '📋',
      protected: true
    },
    {
      path: '/my-bookings',
      label: 'Bookings',
      icon: '📁',
      protected: true
    },
    {
      path: '/task-applications',
      label: 'Applications',
      icon: '📤',
      protected: true
    },
    {
      path: '/chat',
      label: 'Chat',
      icon: '💬',
      protected: true,
      badge: unreadCount > 0 ? unreadCount : null
    }
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.protected || currentUser
  );

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo */}
          <Link to={currentUser ? '/dashboard' : '/'} className="navbar-brand">
            <div className="brand-icon">⏰</div>
            <span className="brand-text">TimeSlice</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-nav">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="navbar-actions">
            {currentUser ? (
              <>
                {/* Credits Display */}
                <div className="credits-display">
                  <span className="credits-icon">💎</span>
                  <span className="credits-amount">{currentUser.credits || 0}</span>
                </div>

                {/* Notifications */}
                <div className="notification-wrapper" ref={notificationRef}>
                  <button
                    className={`notification-btn ${unreadNotifications > 0 ? 'has-unread' : ''}`}
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    🔔
                    {unreadNotifications > 0 && (
                      <span className="notification-count">{unreadNotifications}</span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="notification-dropdown">
                      <div className="notification-header">
                        <h3>Notifications</h3>
                        <span className="notification-count-text">
                          {unreadNotifications} unread
                        </span>
                      </div>
                      
                      <div className="notification-list">
                        {notifications.length === 0 ? (
                          <div className="no-notifications">
                            <span className="no-notif-icon">🔕</span>
                            <p>No notifications yet</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`notification-item ${!notification.read ? 'unread' : ''}`}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className="notification-icon">
                                {notification.icon}
                              </div>
                              <div className="notification-content">
                                <div className="notification-title">
                                  {notification.title}
                                </div>
                                <div className="notification-message">
                                  {notification.message}
                                </div>
                                <div className="notification-time">
                                  {formatTimeAgo(notification.timestamp)}
                                </div>
                              </div>
                              {!notification.read && (
                                <div className="unread-indicator"></div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      <div className="notification-footer">
                        <button className="view-all-btn">
                          View All Notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="user-menu-wrapper" ref={userMenuRef}>
                  <button
                    className="user-menu-btn"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="user-avatar">
                      {currentUser.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="user-name">{currentUser.username}</span>
                    <span className="dropdown-arrow">▼</span>
                  </button>

                  {showUserMenu && (
                    <div className="user-dropdown">
                      <div className="user-info">
                        <div className="user-avatar large">
                          {currentUser.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{currentUser.username}</div>
                          <div className="user-email">{currentUser.email}</div>
                          <div className="user-role">
                            {currentUser.primaryRole === 'helper' ? '🛠️ Helper' : '📋 Task Provider'}
                          </div>
                        </div>
                      </div>

                      <div className="menu-divider"></div>

                      <div className="menu-items">
                        <Link to="/profile" className="menu-item" onClick={() => setShowUserMenu(false)}>
                          <span className="menu-icon">👤</span>
                          <span>My Profile</span>
                        </Link>
                        <Link to="/settings" className="menu-item" onClick={() => setShowUserMenu(false)}>
                          <span className="menu-icon">⚙️</span>
                          <span>Settings</span>
                        </Link>
                        <Link to="/wallet" className="menu-item" onClick={() => setShowUserMenu(false)}>
                          <span className="menu-icon">💳</span>
                          <span>Wallet</span>
                        </Link>
                        <Link to="/help" className="menu-item" onClick={() => setShowUserMenu(false)}>
                          <span className="menu-icon">❓</span>
                          <span>Help & Support</span>
                        </Link>
                      </div>

                      <div className="menu-divider"></div>

                      <button className="menu-item logout-btn" onClick={handleLogout}>
                        <span className="menu-icon">🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="auth-actions">
                <Link to="/login" className="auth-btn login-btn">
                  Login
                </Link>
                <Link to="/register" className="auth-btn register-btn">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <span className={`hamburger ${showMobileMenu ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="mobile-menu">
            <div className="mobile-nav">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </Link>
              ))}
            </div>

            {currentUser && (
              <div className="mobile-user-section">
                <div className="mobile-user-info">
                  <div className="user-avatar">
                    {currentUser.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{currentUser.username}</div>
                    <div className="credits-display">
                      <span className="credits-icon">💎</span>
                      <span className="credits-amount">{currentUser.credits || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mobile-actions">
                  <Link to="/profile" className="mobile-action" onClick={() => setShowMobileMenu(false)}>
                    👤 Profile
                  </Link>
                  <Link to="/settings" className="mobile-action" onClick={() => setShowMobileMenu(false)}>
                    ⚙️ Settings
                  </Link>
                  <button className="mobile-action logout" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          padding: 0.75rem 0;
        }

        .navbar.scrolled {
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(30px);
        }

        .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: #333;
          font-weight: 700;
          font-size: 1.5rem;
          transition: all 0.3s ease;
        }

        .navbar-brand:hover {
          transform: scale(1.05);
        }

        .brand-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .brand-text {
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .navbar-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          text-decoration: none;
          color: #666;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
          white-space: nowrap;
        }

        .nav-link:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          transform: translateY(-2px);
        }

        .nav-link.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .nav-icon {
          font-size: 1.1rem;
        }

        .nav-label {
          font-size: 0.95rem;
        }

        .nav-badge {
          background: #ff4757;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          min-width: 20px;
          text-align: center;
          margin-left: 0.25rem;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .credits-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #333;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          box-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
        }

        .credits-icon {
          font-size: 1.1rem;
        }

        .notification-wrapper, .user-menu-wrapper {
          position: relative;
        }

        .notification-btn {
          background: rgba(102, 126, 234, 0.1);
          border: none;
          color: #667eea;
          padding: 0.75rem;
          border-radius: 12px;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
          position: relative;
        }

        .notification-btn:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: scale(1.1);
        }

        .notification-btn.has-unread {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .notification-count {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4757;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 600;
          min-width: 18px;
          text-align: center;
        }

        .notification-dropdown, .user-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-radius: 15px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          min-width: 320px;
          max-height: 500px;
          overflow: hidden;
          animation: dropdownFade 0.3s ease-out;
        }

        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .notification-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notification-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
        }

        .notification-count-text {
          font-size: 0.85rem;
          color: #666;
        }

        .notification-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .notification-item:hover {
          background: rgba(102, 126, 234, 0.05);
        }

        .notification-item.unread {
          background: rgba(102, 126, 234, 0.02);
        }

        .notification-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
          margin-top: 0.25rem;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.25rem;
        }

        .notification-message {
          font-size: 0.9rem;
          color: #666;
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }

        .notification-time {
          font-size: 0.8rem;
          color: #999;
        }

        .unread-indicator {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 8px;
          height: 8px;
          background: #667eea;
          border-radius: 50%;
        }

        .no-notifications {
          text-align: center;
          padding: 3rem 1.5rem;
          color: #666;
        }

        .no-notif-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .notification-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .view-all-btn {
          width: 100%;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .view-all-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        .user-menu-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(102, 126, 234, 0.1);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #333;
        }

        .user-menu-btn:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: translateY(-2px);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1rem;
        }

        .user-avatar.large {
          width: 48px;
          height: 48px;
          font-size: 1.2rem;
        }

        .user-name {
          font-weight: 600;
          color: #333;
        }

        .dropdown-arrow {
          font-size: 0.8rem;
          color: #666;
          transition: transform 0.3s ease;
        }

        .user-menu-btn:hover .dropdown-arrow {
          transform: rotate(180deg);
        }

        .user-dropdown {
          width: 280px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
        }

        .user-details {
          flex: 1;
        }

        .user-details .user-name {
          font-size: 1.1rem;
          margin-bottom: 0.25rem;
        }

        .user-email {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.25rem;
        }

        .user-role {
          font-size: 0.85rem;
          color: #667eea;
          font-weight: 500;
        }

        .menu-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.1);
          margin: 0 1rem;
        }

        .menu-items {
          padding: 0.5rem 0;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1.5rem;
          text-decoration: none;
          color: #666;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
          background: none;
          width: 100%;
          cursor: pointer;
        }

        .menu-item:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .menu-icon {
          font-size: 1.1rem;
          width: 20px;
          text-align: center;
        }

        .logout-btn {
          color: #e74c3c;
        }

        .logout-btn:hover {
          background: rgba(231, 76, 60, 0.1);
          color: #c0392b;
        }

        .auth-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .auth-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .login-btn {
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          border-color: #667eea;
        }

        .login-btn:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }

        .register-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .register-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }

        .hamburger {
          width: 24px;
          height: 18px;
          position: relative;
          transform: rotate(0deg);
          transition: 0.5s ease-in-out;
          cursor: pointer;
        }

        .hamburger span {
          display: block;
          position: absolute;
          height: 3px;
          width: 100%;
          background: #667eea;
          border-radius: 2px;
          opacity: 1;
          left: 0;
          transform: rotate(0deg);
          transition: 0.25s ease-in-out;
        }

        .hamburger span:nth-child(1) {
          top: 0px;
        }

        .hamburger span:nth-child(2) {
          top: 7px;
        }

        .hamburger span:nth-child(3) {
          top: 14px;
        }

        .hamburger.open span:nth-child(1) {
          top: 7px;
          transform: rotate(135deg);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
          left: -60px;
        }

        .hamburger.open span:nth-child(3) {
          top: 7px;
          transform: rotate(-135deg);
        }

        .mobile-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mobile-nav {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 12px;
          text-decoration: none;
          color: #666;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
        }

        .mobile-nav-link:hover, .mobile-nav-link.active {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .mobile-user-section {
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          padding: 1rem;
        }

        .mobile-user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .mobile-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-action {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          text-decoration: none;
          color: #666;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .mobile-action:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
        }

        .mobile-action.logout {
          color: #e74c3c;
          cursor: pointer;
        }

        .mobile-action.logout:hover {
          background: rgba(231, 76, 60, 0.1);
        }

        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 1rem;
          }

          .navbar-nav {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .auth-actions {
            display: none;
          }

          .credits-display {
            display: none;
          }

          .notification-dropdown, .user-dropdown {
            min-width: 280px;
            right: -50px;
          }
        }

        @media (max-width: 1024px) {
          .nav-label {
            display: none;
          }

          .nav-link {
            padding: 0.75rem;
            min-width: 48px;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;