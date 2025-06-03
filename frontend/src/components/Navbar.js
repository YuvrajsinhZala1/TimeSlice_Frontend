import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
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
            <li><Link to="/browse-slots">Browse Slots</Link></li>
            <li><Link to="/create-slot">Create Slot</Link></li>
            <li><Link to="/my-bookings">My Bookings</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li>
              <span style={{ color: '#ffc107' }}>
                Credits: {currentUser.credits}
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