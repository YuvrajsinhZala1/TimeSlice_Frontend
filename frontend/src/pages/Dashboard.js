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
  const [recentActivity, setRecentActivity] = useState([]);
  const [quickStats, setQuickStats] = useState([]);
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
      setRecentActivity(bookingsRes.data.slice(0, 6));
      
      const data = statsRes.data;
      setQuickStats([
        {
          title: 'Active Credits',
          value: data.credits,
          change: '+12% this month',
          trend: 'up',
          icon: '💰',
          color: '#00D4FF',
          bgGradient: 'linear-gradient(135deg, #00D4FF20, #00D4FF10)'
        },
        {
          title: 'Success Rate',
          value: `${data.applicationSuccessRate}%`,
          change: '+5% improvement',
          trend: 'up',
          icon: '🎯',
          color: '#10B981',
          bgGradient: 'linear-gradient(135deg, #10B98120, #10B98110)'
        },
        {
          title: 'Professional Rating',
          value: data.rating ? `${data.rating.toFixed(1)}/5` : 'New',
          change: `${data.totalRatings} reviews`,
          trend: 'neutral',
          icon: '⭐',
          color: '#F59E0B',
          bgGradient: 'linear-gradient(135deg, #F59E0B20, #F59E0B10)'
        },
        {
          title: 'Completed Tasks',
          value: data.completedTasks,
          change: 'This quarter',
          trend: 'neutral',
          icon: '✅',
          color: '#8B5CF6',
          bgGradient: 'linear-gradient(135deg, #8B5CF620, #8B5CF610)'
        }
      ]);
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
    return (
      <div className="dashboard-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  const isPrimaryHelper = currentUser.primaryRole === 'helper';

  const DashboardWidget = ({ title, description, icon, link, color, priority = 'normal' }) => (
    <Link 
      to={link}
      className={`dashboard-widget ${priority === 'high' ? 'priority-high' : ''}`}
    >
      <div className="widget-header">
        <div className="widget-icon" style={{ background: color || 'var(--primary-gradient)' }}>
          {icon}
        </div>
        {priority === 'high' && <div className="priority-badge">Priority</div>}
      </div>
      <div className="widget-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="widget-arrow">→</div>
    </Link>
  );

  const StatCard = ({ stat }) => (
    <div className="stat-card" style={{ background: stat.bgGradient }}>
      <div className="stat-header">
        <div className="stat-icon" style={{ color: stat.color }}>
          {stat.icon}
        </div>
        <div className="stat-trend">
          <span className={`trend-indicator ${stat.trend}`}>
            {stat.trend === 'up' ? '↗' : stat.trend === 'down' ? '↘' : '→'}
          </span>
        </div>
      </div>
      <div className="stat-content">
        <div className="stat-value" style={{ color: stat.color }}>
          {stat.value}
        </div>
        <div className="stat-title">{stat.title}</div>
        <div className="stat-change">{stat.change}</div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity, index }) => (
    <div className="activity-item">
      <div className="activity-avatar">
        <div className="avatar-circle" style={{ '--delay': `${index * 0.1}s` }}>
          {activity.helper._id === currentUser.id 
            ? activity.taskProvider.username.charAt(0).toUpperCase()
            : activity.helper.username.charAt(0).toUpperCase()
          }
        </div>
      </div>
      <div className="activity-content">
        <div className="activity-title">{activity.taskId.title}</div>
        <div className="activity-meta">
          <span className="activity-role">
            {activity.helper._id === currentUser.id ? 'as Helper' : 'as Client'}
          </span>
          <span className="activity-divider">•</span>
          <span className="activity-credits">{activity.agreedCredits} credits</span>
        </div>
        <div className="activity-time">
          {new Date(activity.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div className={`activity-status status-${activity.status}`}>
        {activity.status}
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <div className="welcome-text">
            <h1 className="welcome-title">
              Welcome back, {currentUser.username}
              <span className="wave-emoji">👋</span>
            </h1>
            <p className="welcome-subtitle">
              <span className={`role-indicator ${isPrimaryHelper ? 'helper' : 'client'}`}>
                {isPrimaryHelper ? '🤝 Helper Mode' : '📋 Client Mode'}
              </span>
              Ready to make today productive
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Link to="/chat" className="urgent-notification">
              <div className="notification-icon">💬</div>
              <div className="notification-content">
                <div className="notification-count">{unreadCount}</div>
                <div className="notification-text">New Messages</div>
              </div>
            </Link>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Stats Overview */}
        <div className="stats-section">
          <div className="section-header">
            <h2>Performance Overview</h2>
            <p>Your key metrics at a glance</p>
          </div>
          <div className="stats-grid">
            {quickStats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="actions-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
            <p>Jump into your most important tasks</p>
          </div>
          <div className="actions-grid">
            <DashboardWidget
              title="Browse Premium Projects"
              description="Discover high-quality opportunities from verified clients"
              icon="🔍"
              link="/browse-tasks"
              color="linear-gradient(135deg, #3B82F6, #1E40AF)"
              priority={isPrimaryHelper ? 'high' : 'normal'}
            />
            
            <DashboardWidget
              title="Post New Project"
              description="Get expert help from our verified professional community"
              icon="✏️"
              link="/create-task"
              color="linear-gradient(135deg, #10B981, #059669)"
              priority={!isPrimaryHelper ? 'high' : 'normal'}
            />
            
            <DashboardWidget
              title="Manage Applications"
              description="Review and respond to project applications"
              icon="📥"
              link="/task-applications"
              color="linear-gradient(135deg, #F59E0B, #D97706)"
            />
            
            <DashboardWidget
              title="Active Collaborations"
              description="Track ongoing projects and communicate with your team"
              icon="📁"
              link="/my-bookings"
              color="linear-gradient(135deg, #8B5CF6, #7C3AED)"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="activity-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <Link to="/my-bookings" className="section-link">View All →</Link>
          </div>
          <div className="activity-container">
            {recentActivity.length > 0 ? (
              <div className="activity-list">
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={activity._id} activity={activity} index={index} />
                ))}
              </div>
            ) : (
              <div className="empty-activity">
                <div className="empty-icon">📋</div>
                <h3>No recent activity</h3>
                <p>Start by {isPrimaryHelper ? 'browsing projects' : 'posting your first project'}</p>
                <Link 
                  to={isPrimaryHelper ? "/browse-tasks" : "/create-task"}
                  className="btn btn-primary"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Insights Panel */}
        <div className="insights-section">
          <div className="section-header">
            <h2>Professional Insights</h2>
            <p>Analytics to boost your success</p>
          </div>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-metric">
                <div className="metric-value">{stats.applicationsSubmitted}</div>
                <div className="metric-label">Applications Sent</div>
              </div>
              <div className="insight-chart">📊</div>
            </div>
            
            <div className="insight-card">
              <div className="insight-metric">
                <div className="metric-value">{stats.applicationsAccepted}</div>
                <div className="metric-label">Applications Accepted</div>
              </div>
              <div className="insight-chart">📈</div>
            </div>
            
            <div className="insight-card">
              <div className="insight-metric">
                <div className="metric-value">{stats.tasksCreated}</div>
                <div className="metric-label">Projects Created</div>
              </div>
              <div className="insight-chart">🎯</div>
            </div>
            
            <div className="insight-card">
              <div className="insight-metric">
                <div className="metric-value">{stats.totalBookings}</div>
                <div className="metric-label">Total Collaborations</div>
              </div>
              <div className="insight-chart">🤝</div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="tips-section">
          <div className="tips-card">
            <div className="tips-header">
              <div className="tips-icon">💡</div>
              <h3>{isPrimaryHelper ? 'Helper Success Tips' : 'Client Success Tips'}</h3>
            </div>
            <div className="tips-content">
              {isPrimaryHelper ? (
                <div className="tips-grid">
                  <div className="tip-item">
                    <div className="tip-icon">🎯</div>
                    <div>
                      <strong>Stand Out</strong>
                      <p>Write personalized applications and showcase relevant work</p>
                    </div>
                  </div>
                  <div className="tip-item">
                    <div className="tip-icon">⚡</div>
                    <div>
                      <strong>Apply Smart</strong>
                      <p>Focus on projects matching your skills and respond quickly</p>
                    </div>
                  </div>
                  <div className="tip-item">
                    <div className="tip-icon">🏆</div>
                    <div>
                      <strong>Build Reputation</strong>
                      <p>Deliver consistently and communicate proactively</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="tips-grid">
                  <div className="tip-item">
                    <div className="tip-icon">✨</div>
                    <div>
                      <strong>Attract Top Talent</strong>
                      <p>Write clear descriptions and set realistic budgets</p>
                    </div>
                  </div>
                  <div className="tip-item">
                    <div className="tip-icon">🔍</div>
                    <div>
                      <strong>Choose Wisely</strong>
                      <p>Review helper profiles and past work thoroughly</p>
                    </div>
                  </div>
                  <div className="tip-item">
                    <div className="tip-icon">💬</div>
                    <div>
                      <strong>Ensure Success</strong>
                      <p>Provide clear feedback and maintain good communication</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .dashboard-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }

        .loading-container {
          text-align: center;
        }

        .loading-text {
          margin-top: 1rem;
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .dashboard-header {
          margin-bottom: 3rem;
        }

        .welcome-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .welcome-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .wave-emoji {
          animation: wave 2s ease-in-out infinite;
        }

        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-10deg); }
        }

        .welcome-subtitle {
          color: var(--text-secondary);
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .role-indicator {
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .role-indicator.helper {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .role-indicator.client {
          background: rgba(59, 130, 246, 0.15);
          color: var(--info);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .urgent-notification {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, var(--error), #DC2626);
          color: white;
          border-radius: 1rem;
          text-decoration: none;
          transition: all 0.3s ease;
          animation: pulse 2s infinite;
        }

        .notification-icon {
          font-size: 1.5rem;
        }

        .notification-count {
          font-size: 1.2rem;
          font-weight: 800;
        }

        .notification-text {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .dashboard-grid {
          display: grid;
          gap: 3rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .section-header p {
          color: var(--text-secondary);
          margin: 0;
        }

        .section-link {
          color: var(--primary-cyan);
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .section-link:hover {
          color: var(--primary-orange);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid var(--border-primary);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .stat-icon {
          font-size: 2rem;
        }

        .trend-indicator {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1rem;
        }

        .trend-indicator.up {
          background: rgba(16, 185, 129, 0.2);
          color: var(--success);
        }

        .trend-indicator.down {
          background: rgba(239, 68, 68, 0.2);
          color: var(--error);
        }

        .trend-indicator.neutral {
          background: rgba(156, 163, 175, 0.2);
          color: var(--text-muted);
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .stat-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .stat-change {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .dashboard-widget {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          background: var(--bg-card);
          border: 2px solid var(--border-primary);
          border-radius: 1rem;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .dashboard-widget:hover {
          border-color: var(--border-accent);
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .dashboard-widget.priority-high {
          border-color: var(--warning);
          background: rgba(245, 158, 11, 0.05);
        }

        .widget-header {
          position: relative;
        }

        .widget-icon {
          width: 60px;
          height: 60px;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          color: white;
        }

        .priority-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--warning);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
          white-space: nowrap;
        }

        .widget-content {
          flex: 1;
        }

        .widget-content h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .widget-content p {
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }

        .widget-arrow {
          font-size: 1.5rem;
          color: var(--primary-cyan);
          transition: all 0.3s ease;
        }

        .dashboard-widget:hover .widget-arrow {
          transform: translateX(4px);
        }

        .activity-container {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 1rem;
          overflow: hidden;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-primary);
          transition: all 0.3s ease;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-item:hover {
          background: var(--bg-secondary);
        }

        .activity-avatar {
          position: relative;
        }

        .avatar-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--primary-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .activity-content {
          flex: 1;
        }

        .activity-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .activity-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }

        .activity-divider {
          color: var(--text-muted);
        }

        .activity-credits {
          color: var(--primary-cyan);
          font-weight: 600;
        }

        .activity-time {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .activity-status {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-completed {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
        }

        .status-in-progress {
          background: rgba(139, 92, 246, 0.15);
          color: #8B5CF6;
        }

        .status-confirmed {
          background: rgba(59, 130, 246, 0.15);
          color: var(--info);
        }

        .empty-activity {
          text-align: center;
          padding: 3rem 2rem;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-activity h3 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .empty-activity p {
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .insight-card {
          padding: 2rem;
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        }

        .insight-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .metric-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .metric-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .insight-chart {
          font-size: 2rem;
          opacity: 0.3;
        }

        .tips-section {
          margin-top: 2rem;
        }

        .tips-card {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 53, 0.1));
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 1rem;
          padding: 2rem;
        }

        .tips-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .tips-icon {
          font-size: 2rem;
        }

        .tips-header h3 {
          color: var(--text-primary);
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0;
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .tip-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .tip-icon {
          font-size: 1.5rem;
          margin-top: 0.25rem;
        }

        .tip-item strong {
          display: block;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .tip-item p {
          color: var(--text-secondary);
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }

          .welcome-title {
            font-size: 2rem;
          }

          .stats-grid,
          .actions-grid,
          .insights-grid {
            grid-template-columns: 1fr;
          }

          .welcome-section {
            flex-direction: column;
            align-items: flex-start;
            text-align: center;
          }

          .tips-grid {
            grid-template-columns: 1fr;
          }

          .dashboard-widget {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .widget-arrow {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;