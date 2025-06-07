import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useChat();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New project match found',
      message: 'A web development project matches your skills',
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false,
      type: 'project'
    },
    {
      id: 2,
      title: 'Payment received',
      message: 'You received 50 credits for completing "React Dashboard"',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      read: false,
      type: 'payment'
    }
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
      setShowUserMenu(false);
      setShowMobileMenu(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
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
                  <span className="credits-amount">90</span>
                </div>

                {/* Notifications */}
                <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
                  <button
                    className={`notification-btn ${unreadNotifications > 0 ? 'has-unread' : ''}`}
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <span className="notification-icon">🔔</span>
                    {unreadNotifications > 0 && (
                      <span className="notification-count">{unreadNotifications}</span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="notification-panel">
                      <div className="notification-header">
                        <h3>Notifications</h3>
                        <span className="notification-badge">{unreadNotifications} new</span>
                      </div>
                      <div className="notification-list">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className="notification-content">
                                <h4>{notification.title}</h4>
                                <p>{notification.message}</p>
                                <span className="notification-time">
                                  {formatTimeAgo(notification.timestamp)}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-notifications">
                            <span className="no-notifications-icon">🔕</span>
                            <p>No notifications yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="user-dropdown" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="user-btn"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="user-avatar">
                      {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="user-name">{currentUser?.username}</span>
                    <span className="dropdown-arrow">▼</span>
                  </button>

                  {showUserMenu && (
                    <div className="user-menu">
                      <Link to="/profile" className="menu-item">
                        <span className="menu-icon">👤</span>
                        Profile
                      </Link>
                      <Link to="/settings" className="menu-item">
                        <span className="menu-icon">⚙️</span>
                        Settings
                      </Link>
                      <div className="menu-divider"></div>
                      <button onClick={handleLogout} className="menu-item logout">
                        <span className="menu-icon">🚪</span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
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
              
              {!currentUser && (
                <div className="mobile-auth-buttons">
                  <Link to="/login" className="btn btn-outline" onClick={() => setShowMobileMenu(false)}>
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-primary" onClick={() => setShowMobileMenu(false)}>
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <style jsx>{`
        /* This component uses the global CSS variables from App.css */
        
        .notification-dropdown {
          position: relative;
        }

        .notification-btn {
          background: none;
          border: none;
          cursor: pointer;
          position: relative;
          padding: var(--space-sm);
          border-radius: var(--radius-md);
          transition: all var(--transition-normal);
        }

        .notification-btn:hover {
          background: rgba(0, 212, 255, 0.1);
        }

        .notification-icon {
          font-size: 1.2rem;
          color: var(--text-secondary);
        }

        .notification-btn.has-unread .notification-icon {
          color: var(--primary-cyan);
        }

        .notification-count {
          position: absolute;
          top: -2px;
          right: -2px;
          background: var(--error);
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .notification-panel {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 350px;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          z-index: 1001;
          max-height: 400px;
          overflow: hidden;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-lg);
          border-bottom: 1px solid var(--border-primary);
        }

        .notification-header h3 {
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .notification-badge {
          background: var(--primary-gradient);
          color: white;
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-xl);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .notification-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .notification-item {
          padding: var(--space-lg);
          border-bottom: 1px solid var(--border-primary);
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .notification-item:hover {
          background: var(--bg-secondary);
        }

        .notification-item.unread {
          background: rgba(0, 212, 255, 0.05);
          border-left: 3px solid var(--primary-cyan);
        }

        .notification-content h4 {
          color: var(--text-primary);
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0 0 var(--space-xs) 0;
        }

        .notification-content p {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin: 0 0 var(--space-xs) 0;
          line-height: 1.4;
        }

        .notification-time {
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .no-notifications {
          text-align: center;
          padding: var(--space-2xl);
          color: var(--text-muted);
        }

        .no-notifications-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: var(--space-md);
        }

        .credits-display {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          background: var(--primary-gradient);
          color: white;
          padding: var(--space-sm) var(--space-md);
          border-radius: var(--radius-xl);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .credits-icon {
          font-size: 1rem;
        }

        .user-dropdown {
          position: relative;
        }

        .user-btn {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-sm);
          border-radius: var(--radius-md);
          transition: all var(--transition-normal);
          color: var(--text-primary);
        }

        .user-btn:hover {
          background: rgba(0, 212, 255, 0.1);
        }

        .user-avatar {
          width: 35px;
          height: 35px;
          background: var(--primary-gradient);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          color: white;
        }

        .user-name {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .dropdown-arrow {
          font-size: 0.7rem;
          color: var(--text-muted);
          transition: transform var(--transition-normal);
        }

        .user-btn:hover .dropdown-arrow {
          transform: rotate(180deg);
        }

        .user-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 200px;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          z-index: 1001;
          overflow: hidden;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md) var(--space-lg);
          color: var(--text-primary);
          text-decoration: none;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: all var(--transition-normal);
          font-size: 0.9rem;
        }

        .menu-item:hover {
          background: var(--bg-secondary);
          color: var(--primary-cyan);
        }

        .menu-item.logout {
          color: var(--error);
        }

        .menu-item.logout:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
        }

        .menu-icon {
          font-size: 1rem;
        }

        .menu-divider {
          height: 1px;
          background: var(--border-primary);
          margin: var(--space-sm) 0;
        }

        .auth-buttons {
          display: flex;
          gap: var(--space-md);
        }

        .auth-buttons .btn {
          padding: var(--space-sm) var(--space-lg);
          font-size: 0.9rem;
        }

        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          justify-content: space-around;
          width: 30px;
          height: 30px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .mobile-menu-btn span {
          width: 100%;
          height: 3px;
          background: var(--text-primary);
          border-radius: 2px;
          transition: all var(--transition-normal);
        }

        .mobile-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-card);
          border-top: 1px solid var(--border-primary);
          box-shadow: var(--shadow-lg);
          z-index: 1000;
        }

        .mobile-menu-content {
          padding: var(--space-lg);
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: var(--space-md) var(--space-lg);
          color: var(--text-primary);
          text-decoration: none;
          border-radius: var(--radius-md);
          margin-bottom: var(--space-sm);
          transition: all var(--transition-normal);
        }

        .mobile-nav-link:hover,
        .mobile-nav-link.active {
          background: var(--primary-gradient);
          color: white;
        }

        .mobile-auth-buttons {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          margin-top: var(--space-lg);
          padding-top: var(--space-lg);
          border-top: 1px solid var(--border-primary);
        }

        .mobile-auth-buttons .btn {
          width: 100%;
          justify-content: center;
        }

        @media (max-width: 1024px) {
          .user-name {
            display: none;
          }
          
          .credits-display {
            padding: var(--space-xs) var(--space-sm);
            font-size: 0.8rem;
          }
        }

        @media (max-width: 768px) {
          .navbar-nav {
            display: none;
          }

          .auth-buttons {
            display: none;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .notification-panel {
            width: 300px;
          }

          .user-menu {
            width: 180px;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;