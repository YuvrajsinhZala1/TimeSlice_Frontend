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

  const NavLink = ({ to, children, onClick, style = {} }) => (
    <Link 
      to={to} 
      onClick={onClick || closeMobileMenu}
      style={{
        color: 'rgba(255, 255, 255, 0.9)',
        textDecoration: 'none',
        padding: '0.75rem 1rem',
        borderRadius: '0.75rem',
        fontWeight: '500',
        fontSize: '0.875rem',
        transition: 'all 0.25s ease',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        ...style
      }}
      className="nav-link"
    >
      {children}
    </Link>
  );

  const Button = ({ onClick, children, variant = 'secondary', style = {} }) => {
    const baseStyle = {
      padding: '0.5rem 1rem',
      borderRadius: '0.75rem',
      fontWeight: '600',
      fontSize: '0.875rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    };

    const variants = {
      primary: {
        background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
        color: 'white'
      },
      secondary: {
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      },
      danger: {
        background: 'rgba(239, 68, 68, 0.1)',
        color: '#EF4444',
        border: '1px solid rgba(239, 68, 68, 0.2)'
      }
    };

    return (
      <button
        onClick={onClick}
        style={{
          ...baseStyle,
          ...variants[variant],
          ...style
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
        }}
      >
        {children}
      </button>
    );
  };

  return (
    <nav className="navbar">
      <div className="container">
        {/* Logo */}
        <Link 
          to={currentUser ? "/dashboard" : "/"} 
          style={{ 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
          onClick={closeMobileMenu}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '0.5rem',
            background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            ⧗
          </div>
          <h1 style={{
            background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.5rem',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            TimeSlice
          </h1>
        </Link>
        
        {currentUser ? (
          <>
            {/* Desktop Navigation */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              '@media (max-width: 768px)': {
                display: 'none'
              }
            }} className="desktop-nav">
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
              <NavLink to="/chat" style={{ position: 'relative' }}>
                <span>💬</span>
                Chat
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '0.25rem',
                    right: '0.25rem',
                    background: '#EF4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </NavLink>
              
              {/* User Info & Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginLeft: '1rem',
                paddingLeft: '1rem',
                borderLeft: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                {/* Credits Display */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '0.5rem 1rem',
                  borderRadius: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <span style={{ fontSize: '1rem' }}>💰</span>
                  <span style={{ fontWeight: '600', color: '#00D4FF' }}>
                    {currentUser.credits}
                  </span>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>credits</span>
                </div>
                
                {/* Role Indicator */}
                <div style={{
                  background: currentUser.primaryRole === 'helper' 
                    ? 'rgba(16, 185, 129, 0.1)' 
                    : 'rgba(59, 130, 246, 0.1)',
                  color: currentUser.primaryRole === 'helper' ? '#10B981' : '#3B82F6',
                  padding: '0.5rem 1rem',
                  borderRadius: '2rem',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  border: `1px solid ${currentUser.primaryRole === 'helper' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                }}>
                  {currentUser.primaryRole === 'helper' ? '🤝 Helper' : '📋 Client'}
                </div>
                
                {/* Profile Menu */}
                <div style={{ position: 'relative' }}>
                  <NavLink to="/profile" style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '2rem',
                    padding: '0.5rem 1rem'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.8rem' }}>
                      {currentUser.username}
                    </span>
                  </NavLink>
                </div>
                
                <Button variant="danger" onClick={handleLogout}>
                  <span>🚪</span>
                  Logout
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              style={{
                display: 'none',
                '@media (max-width: 768px)': {
                  display: 'flex'
                },
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.5rem',
                padding: '0.5rem',
                color: 'white',
                cursor: 'pointer'
              }}
              className="mobile-menu-button"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </>
        ) : (
          /* Non-authenticated navigation */
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/login">Sign In</NavLink>
            <Link 
              to="/register" 
              style={{
                background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
                color: 'white',
                textDecoration: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '2rem',
                fontWeight: '600',
                fontSize: '0.875rem',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 20px rgba(0, 212, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Join Now
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {currentUser && isMobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: 0,
          right: 0,
          background: 'rgba(10, 14, 39, 0.95)',
          backdropFilter: 'blur(20px)',
          zIndex: 999,
          padding: '2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }} className="mobile-menu">
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
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            marginTop: '1rem'
          }}>
            <div>
              <div style={{ color: '#00D4FF', fontWeight: 'bold' }}>
                💰 {currentUser.credits} credits
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                {currentUser.primaryRole === 'helper' ? '🤝 Helper' : '📋 Client'}
              </div>
            </div>
            <Button variant="danger" onClick={handleLogout}>
              🚪 Logout
            </Button>
          </div>
        </div>
      )}

      {/* Custom CSS for responsive behavior */}
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
          background: rgba(255, 255, 255, 0.1) !important;
          transform: translateY(-1px) !important;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;