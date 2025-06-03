import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSlots: 0,
    totalBookings: 0,
    credits: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [currentUser, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [slotsRes, bookingsRes, walletRes] = await Promise.all([
        api.get('/slots/my-slots'),
        api.get('/bookings'),
        api.get('/users/wallet')
      ]);

      setStats({
        totalSlots: slotsRes.data.length,
        totalBookings: bookingsRes.data.length,
        credits: walletRes.data.credits
      });

      setRecentBookings(bookingsRes.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return <div className="text-center">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="mb-2">Welcome back, {currentUser.username}!</h1>
      
      <div className="dashboard mb-2">
        <div className="card stats-card">
          <h3>Credits</h3>
          <h2>{stats.credits}</h2>
        </div>
        
        <div className="card stats-card">
          <h3>My Slots</h3>
          <h2>{stats.totalSlots}</h2>
        </div>
        
        <div className="card stats-card">
          <h3>Total Bookings</h3>
          <h2>{stats.totalBookings}</h2>
        </div>
      </div>
      
      <div className="card-grid">
        <div className="card">
          <h3>Quick Actions</h3>
          <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
            <Link to="/create-slot" className="btn">
              Create New Slot
            </Link>
            <Link to="/browse-slots" className="btn btn-secondary">
              Browse Available Slots
            </Link>
            <Link to="/my-bookings" className="btn btn-success">
              View My Bookings
            </Link>
          </div>
        </div>
        
        <div className="card">
          <h3>Recent Bookings</h3>
          {recentBookings.length > 0 ? (
            <div>
              {recentBookings.map(booking => (
                <div key={booking._id} style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                  <strong>{booking.slotId.description}</strong>
                  <br />
                  <small>Status: {booking.status}</small>
                </div>
              ))}
              <Link to="/my-bookings" className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
                View All Bookings
              </Link>
            </div>
          ) : (
            <p>No bookings yet. <Link to="/browse-slots">Browse available slots</Link> to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;