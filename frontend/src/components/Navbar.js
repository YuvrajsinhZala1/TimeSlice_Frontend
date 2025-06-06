import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Don't show navbar on homepage for non-logged in users
  const isHomePage = location.pathname === '/';
  const shouldShowNavbar = currentUser || !isHomePage;

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // If we shouldn't show navbar, return null
  if (!shouldShowNavbar) {
    return null;
  }

  const NavLink = ({ to, children, onClick, className = '', badge = null }) => (
    <Link 
      to={to} 
      onClick={onClick || closeMobileMenu}
      className={`nav-link ${className}`}
      style={{
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        padding: 'var(--space-md) var(--space-lg)',
        borderRadius: 'var(--radius-md)',
        fontWeight: '500',
        fontSize: '0.9rem',
        transition: 'all var(--transition-normal)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        border: location.pathname === to ? '1px solid var(--border-accent)' : '1px solid transparent',
        background: location.pathname === to ? 'rgba(0, 212, 255, 0.1)' : 'transparent'
      }}
    >
      {children}
      {badge && (
        <span style={{
          position: 'absolute',
          top: '0.25rem',
          right: '0.25rem',
          background: 'var(--error)',
          color: 'white',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          fontSize: '0.7rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          minWidth: '18px'
        }}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );

  const Button = ({ onClick, children, variant = 'secondary', className = '' }) => {
    const baseStyle = {
      padding: 'var(--space-sm) var(--space-lg)',
      borderRadius: 'var(--radius-md)',
      fontWeight: '600',
      fontSize: '0.9rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all var(--transition-normal)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-sm)',
      textDecoration: 'none'
    };

    const variants = {
      primary: {
        background: 'var(--primary-gradient)',
        color: 'white'
      },
      secondary: {
        background: 'var(--bg-tertiary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-muted)'
      },
      danger: {
        background: 'rgba(239, 68, 68, 0.1)',
        color: 'var(--error)',
        border: '1px solid rgba(239, 68, 68, 0.2)'
      }
    };

    return (
      <button
        onClick={onClick}
        className={className}
        style={{
          ...baseStyle,
          ...variants[variant]
        }}
      >
        {children}
      </button>
    );
  };

  return (
    <>
      <nav className="navbar">
        <div className="container">
          {/* Logo */}
          <Link 
            to={currentUser ? "/dashboard" : "/"} 
            className="logo"
            onClick={closeMobileMenu}
          >
            <div className="logo-icon">
              {/* Placeholder for your logo - replace this with your actual logo */}
              <span>⧗</span>
            </div>
            <div className="logo-text">
              TimeSlice
            </div>
          </Link>
          
          {currentUser ? (
            <>
              {/* Desktop Navigation */}
              <div className="desktop-nav" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)'
              }}>
                <NavLink to="/dashboard">
                  <span>📊</span>
                  Dashboard
                </NavLink>
                
                <NavLink to="/browse-tasks">
                  <span>🔍</span>
                  Browse Tasks
                </NavLink>
                
                <NavLink to="/create-task">
                  <span>✏️</span>
                  Post Task
                </NavLink>
                
                <NavLink to="/my-tasks">
                  <span>📋</span>
                  My Tasks
                </NavLink>
                
                <NavLink to="/my-bookings">
                  <span>📁</span>
                  Bookings
                </NavLink>
                
                <NavLink to="/task-applications">
                  <span>📥</span>
                  Applications
                </NavLink>
                
                {/* Chat with unread indicator */}
                <NavLink to="/chat" badge={unreadCount > 0 ? unreadCount : null}>
                  <span>💬</span>
                  Chat
                </NavLink>
                
                {/* User Info & Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-lg)',
                  marginLeft: 'var(--space-lg)',
                  paddingLeft: 'var(--space-lg)',
                  borderLeft: '1px solid var(--border-primary)'
                }}>
                  {/* Credits Display */}
                  <div style={{
                    background: 'var(--bg-tertiary)',
                    padding: 'var(--space-sm) var(--space-lg)',
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    border: '1px solid var(--border-muted)'
                  }}>
                    <span style={{ fontSize: '1rem' }}>💰</span>
                    <span style={{ fontWeight: '700', color: 'var(--primary-cyan)' }}>
                      {currentUser.credits}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>credits</span>
                  </div>
                  
                  {/* Role Indicator */}
                  <div style={{
                    background: currentUser.primaryRole === 'helper' 
                      ? 'rgba(16, 185, 129, 0.1)' 
                      : 'rgba(59, 130, 246, 0.1)',
                    color: currentUser.primaryRole === 'helper' ? 'var(--success)' : 'var(--info)',
                    padding: 'var(--space-sm) var(--space-lg)',
                    borderRadius: 'var(--radius-xl)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    border: `1px solid ${currentUser.primaryRole === 'helper' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                  }}>
                    {currentUser.primaryRole === 'helper' ? '🤝 Helper' : '📋 Client'}
                  </div>
                  
                  {/* Profile Menu */}
                  <NavLink to="/profile" style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-muted)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-sm) var(--space-lg)'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'var(--primary-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      color: 'white'
                    }}>
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.8rem' }}>
                      {currentUser.username}
                    </span>
                  </NavLink>
                  
                  <Button variant="danger" onClick={handleLogout}>
                    <span>🚪</span>
                    Logout
                  </Button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="mobile-menu-button"
                style={{
                  display: 'none',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-sm)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </>
          ) : (
            /* Non-authenticated navigation */
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/login">Sign In</NavLink>
              <Link 
                to="/register" 
                className="btn btn-primary"
                style={{
                  background: 'var(--primary-gradient)',
                  color: 'white',
                  textDecoration: 'none',
                  padding: 'var(--space-md) var(--space-xl)',
                  borderRadius: 'var(--radius-xl)',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  transition: 'all var(--transition-normal)'
                }}
              >
                Join Now
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {currentUser && isMobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: 0,
          right: 0,
          background: 'rgba(10, 14, 39, 0.98)',
          backdropFilter: 'blur(20px)',
          zIndex: 999,
          padding: 'var(--space-xl)',
          borderTop: '1px solid var(--border-primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-lg)'
        }}>
          <NavLink to="/dashboard">📊 Dashboard</NavLink>
          <NavLink to="/browse-tasks">🔍 Browse Tasks</NavLink>
          <NavLink to="/create-task">✏️ Post Task</NavLink>
          <NavLink to="/my-tasks">📋 My Tasks</NavLink>
          <NavLink to="/my-bookings">📁 Bookings</NavLink>
          <NavLink to="/task-applications">📥 Applications</NavLink>
          <NavLink to="/chat">
            💬 Chat {unreadCount > 0 && `(${unreadCount})`}
          </NavLink>
          <NavLink to="/profile">👤 Profile</NavLink>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-lg)',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-lg)',
            marginTop: 'var(--space-lg)',
            border: '1px solid var(--border-muted)'
          }}>
            <div>
              <div style={{ color: 'var(--primary-cyan)', fontWeight: 'bold' }}>
                💰 {currentUser.credits} credits
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {currentUser.primaryRole === 'helper' ? '🤝 Helper' : '📋 Client'}
              </div>
            </div>
            <Button variant="danger" onClick={handleLogout}>
              🚪 Logout
            </Button>
          </div>
        </div>
      )}

      {/* CSS for responsive behavior */}
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-button {
            display: flex !important;
          }
        }
        
        .nav-link:hover {
          background: rgba(0, 212, 255, 0.1) !important;
          color: var(--text-primary) !important;
          border-color: var(--border-accent) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </>
  );
};

export default Navbar;