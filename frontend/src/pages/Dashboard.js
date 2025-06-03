import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import api from '../utils/api';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { unreadCount } = useChat();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    credits: 0,
    totalBookings: 0,
    completedTasks: 0,
    rating: 0,
    tasksCreated: 0,
    tasksCompleted: 0,
    applicationsSubmitted: 0,
    applicationsAccepted: 0,
    applicationSuccessRate: 0
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
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/users/stats'),
        api.get('/bookings')
      ]);

      setStats(statsRes.data);
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

  const isPrimaryHelper = currentUser.primaryRole === 'helper';

  return (
    <div>
      <h1 className="mb-2">
        Welcome back, {currentUser.username}! 
        <span style={{ color: '#666', fontSize: '0.8em', fontWeight: 'normal' }}>
          {isPrimaryHelper ? ' (🤝 Helper)' : ' (📋 Task Provider)'}
        </span>
      </h1>

      {/* Key Stats */}
      <div className="dashboard mb-2">
        <div className="card stats-card">
          <h3>Credits</h3>
          <h2>{stats.credits}</h2>
        </div>
        
        <div className="card stats-card">
          <h3>My Rating</h3>
          <h2>★ {stats.rating ? stats.rating.toFixed(1) : 'N/A'}</h2>
          <small>({stats.totalRatings} ratings)</small>
        </div>
        
        <div className="card stats-card">
          <h3>Tasks Completed</h3>
          <h2>{stats.completedTasks}</h2>
          <small>as helper</small>
        </div>
        
        <div className="card stats-card">
          <h3>Tasks Posted</h3>
          <h2>{stats.tasksCreated}</h2>
          <small>as provider</small>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="card-grid mb-2">
        <div className="card">
          <h3>Application Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <strong>Submitted:</strong> {stats.applicationsSubmitted}
            </div>
            <div>
              <strong>Accepted:</strong> {stats.applicationsAccepted}
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <strong>Success Rate:</strong> {stats.applicationSuccessRate}%
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
            <Link to="/browse-tasks" className="btn">
              Browse Tasks
            </Link>
            <Link to="/create-task" className="btn btn-secondary">
              Post New Task
            </Link>
            <Link to="/task-applications" className="btn btn-success">
              View Applications
            </Link>
            {unreadCount > 0 && (
              <Link to="/chat" className="btn" style={{ position: 'relative' }}>
                Chat ({unreadCount} unread)
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity & Tips */}
      <div className="card-grid">
        <div className="card">
          <h3>Recent Activity</h3>
          {recentBookings.length > 0 ? (
            <div>
              {recentBookings.map(booking => (
                <div key={booking._id} style={{ 
                  borderBottom: '1px solid #eee', 
                  paddingBottom: '0.5rem', 
                  marginBottom: '0.5rem' 
                }}>
                  <strong>{booking.taskId.title}</strong>
                  <br />
                  <small>Status: {booking.status}</small>
                  <br />
                  <small>
                    {booking.helper._id === currentUser.id 
                      ? `Task by: ${booking.taskProvider.username}` 
                      : `Helper: ${booking.helper.username}`
                    }
                  </small>
                </div>
              ))}
              <Link to="/my-bookings" className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
                View All Activity
              </Link>
            </div>
          ) : (
            <p>
              No recent activity. 
              <Link to="/browse-tasks"> Browse tasks</Link> or 
              <Link to="/create-task"> post a task</Link> to get started!
            </p>
          )}
        </div>
        
        <div className="card">
          <h3>💡 Platform Tips</h3>
          <ul style={{ marginLeft: '1rem', color: '#666' }}>
            <li><strong>Dual Role:</strong> You can both help others AND post tasks!</li>
            <li><strong>Applications:</strong> Apply for tasks that match your skills</li>
            <li><strong>Chat:</strong> Communicate with task partners directly</li>
            <li><strong>Credits:</strong> Earn by helping, spend to get help</li>
            <li><strong>Rating:</strong> Build reputation through quality work</li>
          </ul>
        </div>
      </div>

      {/* Skill-based tips */}
      {currentUser.skills.length === 0 && (
        <div className="card" style={{ backgroundColor: '#fff3cd', borderColor: '#ffeaa7' }}>
          <h3>🎯 Action Needed</h3>
          <p>
            Add your skills in your <Link to="/profile">profile</Link> to see relevant tasks 
            and increase your chances of getting applications accepted!
          </p>
        </div>
      )}

      {isPrimaryHelper && stats.applicationsSubmitted === 0 && (
        <div className="card" style={{ backgroundColor: '#d1ecf1', borderColor: '#bee5eb' }}>
          <h3>🚀 Get Started</h3>
          <p>
            Ready to help others? <Link to="/browse-tasks">Browse available tasks</Link> and 
            start applying for ones that match your skills!
          </p>
        </div>
      )}

      {!isPrimaryHelper && stats.tasksCreated === 0 && (
        <div className="card" style={{ backgroundColor: '#d4edda', borderColor: '#c3e6cb' }}>
          <h3>📝 Get Started</h3>
          <p>
            Need help with something? <Link to="/create-task">Post your first task</Link> and 
            let skilled helpers apply to assist you!
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;