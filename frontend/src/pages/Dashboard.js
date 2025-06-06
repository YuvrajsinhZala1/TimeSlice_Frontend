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
      setRecentBookings(bookingsRes.data.slice(0, 5));
      
      // Calculate quick stats for cards
      const data = statsRes.data;
      setQuickStats([
        {
          title: 'Credits Balance',
          value: data.credits,
          change: '+12%',
          changeType: 'positive',
          icon: '💰',
          color: 'var(--primary-gradient)'
        },
        {
          title: 'Success Rate',
          value: `${data.applicationSuccessRate}%`,
          change: '+5%',
          changeType: 'positive',
          icon: '🎯',
          color: 'linear-gradient(135deg, var(--success), #059669)'
        },
        {
          title: 'Rating',
          value: data.rating ? `${data.rating.toFixed(1)}/5` : 'New',
          change: data.totalRatings > 0 ? `${data.totalRatings} reviews` : 'No reviews yet',
          changeType: 'neutral',
          icon: '⭐',
          color: 'linear-gradient(135deg, var(--warning), #D97706)'
        },
        {
          title: 'Tasks Completed',
          value: data.completedTasks,
          change: 'This month',
          changeType: 'neutral',
          icon: '✅',
          color: 'linear-gradient(135deg, #8B5CF6, #EC4899)'
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 'var(--space-lg)'
      }}>
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</p>
      </div>
    );
  }

  const isPrimaryHelper = currentUser.primaryRole === 'helper';

  const QuickActionCard = ({ title, description, icon, link, color }) => (
    <Link 
      to={link}
      style={{
        textDecoration: 'none',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-xl)',
        border: '1px solid var(--border-primary)',
        transition: 'all var(--transition-normal)',
        display: 'block',
        position: 'relative',
        overflow: 'hidden',
        height: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        e.currentTarget.style.borderColor = 'var(--border-accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--border-primary)';
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: color || 'var(--primary-gradient)'
      }}></div>
      
      <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-lg)' }}>{icon}</div>
      <h3 style={{ 
        color: 'var(--text-primary)', 
        marginBottom: 'var(--space-sm)',
        fontSize: '1.2rem',
        fontWeight: '700'
      }}>
        {title}
      </h3>
      <p style={{ 
        color: 'var(--text-secondary)', 
        fontSize: '0.9rem',
        lineHeight: '1.6',
        margin: 0
      }}>
        {description}
      </p>
    </Link>
  );

  const StatCard = ({ stat }) => (
    <div style={{
      background: stat.color,
      color: 'white',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-xl)',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-md)'
    }}>
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: 'var(--space-lg)'
        }}>
          <span style={{ fontSize: '2.5rem' }}>{stat.icon}</span>
          <div style={{
            padding: 'var(--space-xs) var(--space-sm)',
            borderRadius: 'var(--radius-xl)',
            background: 'rgba(255,255,255,0.2)',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {stat.change}
          </div>
        </div>
        
        <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: 'var(--space-xs)' }}>
          {stat.value}
        </div>
        <div style={{ fontSize: '1rem', opacity: 0.9, fontWeight: '500' }}>
          {stat.title}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
            <div>
              <h1 style={{ 
                fontSize: '2.5rem', 
                fontWeight: '800', 
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-sm)'
              }}>
                Welcome back, {currentUser.username}! 👋
              </h1>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)'
              }}>
                <span style={{
                  padding: 'var(--space-xs) var(--space-md)',
                  borderRadius: 'var(--radius-xl)',
                  background: isPrimaryHelper ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  color: isPrimaryHelper ? 'var(--success)' : 'var(--info)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  border: `1px solid ${isPrimaryHelper ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                }}>
                  {isPrimaryHelper ? '🤝 Helper Mode' : '📋 Client Mode'}
                </span>
                Ready to tackle today's opportunities
              </p>
            </div>
            
            {unreadCount > 0 && (
              <Link 
                to="/chat"
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, var(--error), #DC2626)',
                  animation: 'pulse 2s infinite'
                }}
              >
                💬 {unreadCount} New Message{unreadCount !== 1 ? 's' : ''}
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-2xl)' }}>
          {quickStats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-2" style={{ marginBottom: 'var(--space-2xl)' }}>
          {/* Quick Actions */}
          <div>
            <h2 style={{ 
              fontSize: '1.8rem', 
              fontWeight: '700', 
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-xl)'
            }}>
              Quick Actions
            </h2>
            
            <div className="grid grid-2" style={{ gap: 'var(--space-lg)' }}>
              <QuickActionCard
                title="Browse Premium Tasks"
                description="Discover high-quality projects that match your expertise and interests"
                icon="🔍"
                link="/browse-tasks"
                color="linear-gradient(135deg, #3B82F6, #1E40AF)"
              />
              
              <QuickActionCard
                title="Post a New Project"
                description="Get help from verified professionals in our exclusive community"
                icon="✏️"
                link="/create-task"
                color="linear-gradient(135deg, var(--success), #059669)"
              />
              
              <QuickActionCard
                title="View Applications"
                description="Review and respond to applications for your posted projects"
                icon="📥"
                link="/task-applications"
                color="linear-gradient(135deg, var(--warning), #D97706)"
              />
              
              <QuickActionCard
                title="My Active Bookings"
                description="Manage ongoing collaborations and track project progress"
                icon="📁"
                link="/my-bookings"
                color="linear-gradient(135deg, #8B5CF6, #7C3AED)"
              />
            </div>
          </div>

          {/* Recent Activity & Insights */}
          <div>
            <h2 style={{ 
              fontSize: '1.8rem', 
              fontWeight: '700', 
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-xl)'
            }}>
              Recent Activity
            </h2>
            
            <div className="card" style={{ padding: 0 }}>
              {recentBookings.length > 0 ? (
                <div>
                  {recentBookings.map((booking, index) => (
                    <div key={booking._id} style={{
                      padding: 'var(--space-lg)',
                      borderBottom: index < recentBookings.length - 1 ? '1px solid var(--border-primary)' : 'none'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: 'var(--space-sm)'
                      }}>
                        <h4 style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          margin: 0,
                          lineHeight: '1.4'
                        }}>
                          {booking.taskId.title}
                        </h4>
                        <span className={`badge badge-${
                          booking.status === 'completed' ? 'success' : 
                          booking.status === 'in-progress' ? 'primary' : 'secondary'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <p style={{ 
                        fontSize: '0.9rem', 
                        color: 'var(--text-secondary)',
                        margin: '0 0 var(--space-sm) 0'
                      }}>
                        {booking.helper._id === currentUser.id 
                          ? `Client: ${booking.taskProvider.username}` 
                          : `Helper: ${booking.helper.username}`
                        }
                      </p>
                      <div style={{ 
                        fontSize: '0.8rem', 
                        color: 'var(--text-muted)',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span>{booking.agreedCredits} credits</span>
                        <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  
                  <div style={{ padding: 'var(--space-lg)', textAlign: 'center' }}>
                    <Link 
                      to="/my-bookings"
                      style={{
                        color: 'var(--primary-cyan)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}
                    >
                      View All Activity →
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  padding: 'var(--space-2xl)', 
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}>📋</div>
                  <p style={{ marginBottom: 'var(--space-lg)' }}>No recent activity</p>
                  <Link 
                    to={isPrimaryHelper ? "/browse-tasks" : "/create-task"}
                    className="btn btn-primary"
                  >
                    {isPrimaryHelper ? 'Browse Tasks' : 'Post Your First Task'} →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="card">
          <h2 style={{ 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-xl)'
          }}>
            Performance Insights
          </h2>
          
          <div className="grid grid-4">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--info)', marginBottom: 'var(--space-sm)' }}>
                {stats.applicationsSubmitted}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Applications Sent</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--success)', marginBottom: 'var(--space-sm)' }}>
                {stats.applicationsAccepted}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Applications Accepted</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--warning)', marginBottom: 'var(--space-sm)' }}>
                {stats.tasksCreated}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tasks Created</div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary-cyan)', marginBottom: 'var(--space-sm)' }}>
                {stats.totalBookings}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Collaborations</div>
            </div>
          </div>
        </div>

        {/* Tips Based on Role */}
        <div style={{
          background: isPrimaryHelper 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(167, 243, 208, 0.1))' 
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(191, 219, 254, 0.1))',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-xl)',
          border: `1px solid ${isPrimaryHelper ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
        }}>
          <h3 style={{ 
            color: isPrimaryHelper ? 'var(--success)' : 'var(--info)',
            marginBottom: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            fontSize: '1.3rem',
            fontWeight: '700'
          }}>
            💡 {isPrimaryHelper ? 'Helper Tips' : 'Client Tips'}
          </h3>
          
          {isPrimaryHelper ? (
            <div className="grid grid-2">
              <div style={{ color: 'var(--text-primary)' }}>
                <strong style={{ display: 'block', marginBottom: 'var(--space-sm)' }}>Increase Your Success Rate:</strong>
                <ul style={{ marginLeft: 'var(--space-lg)', color: 'var(--text-secondary)' }}>
                  <li>Write detailed, personalized applications</li>
                  <li>Showcase relevant portfolio pieces</li>
                  <li>Respond to applications quickly</li>
                </ul>
              </div>
              <div style={{ color: 'var(--text-primary)' }}>
                <strong style={{ display: 'block', marginBottom: 'var(--space-sm)' }}>Build Your Reputation:</strong>
                <ul style={{ marginLeft: 'var(--space-lg)', color: 'var(--text-secondary)' }}>
                  <li>Deliver high-quality work consistently</li>
                  <li>Communicate proactively with clients</li>
                  <li>Ask for reviews after successful projects</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="grid grid-2">
              <div style={{ color: 'var(--text-primary)' }}>
                <strong style={{ display: 'block', marginBottom: 'var(--space-sm)' }}>Attract Top Talent:</strong>
                <ul style={{ marginLeft: 'var(--space-lg)', color: 'var(--text-secondary)' }}>
                  <li>Write clear, detailed project descriptions</li>
                  <li>Set realistic budgets and timelines</li>
                  <li>Respond to applications promptly</li>
                </ul>
              </div>
              <div style={{ color: 'var(--text-primary)' }}>
                <strong style={{ display: 'block', marginBottom: 'var(--space-sm)' }}>Ensure Project Success:</strong>
                <ul style={{ marginLeft: 'var(--space-lg)', color: 'var(--text-secondary)' }}>
                  <li>Review helper profiles thoroughly</li>
                  <li>Provide clear feedback and requirements</li>
                  <li>Leave honest reviews to help the community</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        
        @media (max-width: 1024px) {
          .grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 768px) {
          .grid-4 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;