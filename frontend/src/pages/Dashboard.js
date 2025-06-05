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
          color: 'from-blue-500 to-cyan-500'
        },
        {
          title: 'Success Rate',
          value: `${data.applicationSuccessRate}%`,
          change: '+5%',
          changeType: 'positive',
          icon: '🎯',
          color: 'from-green-500 to-emerald-500'
        },
        {
          title: 'Rating',
          value: data.rating ? `${data.rating.toFixed(1)}/5` : 'New',
          change: data.totalRatings > 0 ? `${data.totalRatings} reviews` : 'No reviews yet',
          changeType: 'neutral',
          icon: '⭐',
          color: 'from-yellow-500 to-orange-500'
        },
        {
          title: 'Tasks Completed',
          value: data.completedTasks,
          change: 'This month',
          changeType: 'neutral',
          icon: '✅',
          color: 'from-purple-500 to-pink-500'
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
        minHeight: '400px',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #00D4FF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6B7280' }}>Loading your dashboard...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const isPrimaryHelper = currentUser.primaryRole === 'helper';

  const QuickActionCard = ({ title, description, icon, link, color }) => (
    <Link 
      to={link}
      style={{
        textDecoration: 'none',
        background: 'white',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid #E5E7EB',
        transition: 'all 0.3s ease',
        display: 'block',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-4px)';
        e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
        e.target.style.borderColor = color || '#00D4FF';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
        e.target.style.borderColor = '#E5E7EB';
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: `linear-gradient(135deg, ${color || '#00D4FF'}, ${color || '#FF6B35'})`,
        opacity: 0,
        transition: 'opacity 0.3s ease'
      }} className="card-accent"></div>
      
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ 
        color: '#1F2937', 
        marginBottom: '0.5rem',
        fontSize: '1.1rem',
        fontWeight: '600'
      }}>
        {title}
      </h3>
      <p style={{ 
        color: '#6B7280', 
        fontSize: '0.9rem',
        lineHeight: '1.5',
        margin: 0
      }}>
        {description}
      </p>
      
      <style jsx>{`
        .quick-action-card:hover .card-accent {
          opacity: 1 !important;
        }
      `}</style>
    </Link>
  );

  const StatCard = ({ stat }) => (
    <div style={{
      background: `linear-gradient(135deg, ${
        stat.color === 'from-blue-500 to-cyan-500' ? '#3B82F6, #06B6D4' :
        stat.color === 'from-green-500 to-emerald-500' ? '#10B981, #059669' :
        stat.color === 'from-yellow-500 to-orange-500' ? '#F59E0B, #EA580C' :
        '#8B5CF6, #EC4899'
      })`,
      color: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '1rem'
        }}>
          <span style={{ fontSize: '2rem' }}>{stat.icon}</span>
          <div style={{
            padding: '0.25rem 0.5rem',
            borderRadius: '1rem',
            background: 'rgba(255,255,255,0.2)',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {stat.change}
          </div>
        </div>
        
        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          {stat.value}
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          {stat.title}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#1F2937',
              marginBottom: '0.5rem'
            }}>
              Welcome back, {currentUser.username}! 👋
            </h1>
            <p style={{ 
              color: '#6B7280', 
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                background: isPrimaryHelper ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                color: isPrimaryHelper ? '#10B981' : '#3B82F6',
                fontSize: '0.8rem',
                fontWeight: '600'
              }}>
                {isPrimaryHelper ? '🤝 Helper Mode' : '📋 Client Mode'}
              </span>
              Ready to tackle today's opportunities
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Link 
              to="/chat"
              style={{
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                color: 'white',
                textDecoration: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '1rem',
                fontWeight: '600',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                animation: 'pulse 2s infinite'
              }}
            >
              💬 {unreadCount} New Message{unreadCount !== 1 ? 's' : ''}
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {quickStats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Quick Actions */}
        <div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#1F2937',
            marginBottom: '1rem'
          }}>
            Quick Actions
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1rem'
          }}>
            <QuickActionCard
              title="Browse Premium Tasks"
              description="Discover high-quality projects that match your expertise and interests"
              icon="🔍"
              link="/browse-tasks"
              color="#3B82F6"
            />
            
            <QuickActionCard
              title="Post a New Project"
              description="Get help from verified professionals in our exclusive community"
              icon="✏️"
              link="/create-task"
              color="#10B981"
            />
            
            <QuickActionCard
              title="View Applications"
              description="Review and respond to applications for your posted projects"
              icon="📥"
              link="/task-applications"
              color="#F59E0B"
            />
            
            <QuickActionCard
              title="My Active Bookings"
              description="Manage ongoing collaborations and track project progress"
              icon="📁"
              link="/my-bookings"
              color="#8B5CF6"
            />
          </div>
        </div>

        {/* Recent Activity & Insights */}
        <div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#1F2937',
            marginBottom: '1rem'
          }}>
            Recent Activity
          </h2>
          
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            border: '1px solid #E5E7EB',
            overflow: 'hidden'
          }}>
            {recentBookings.length > 0 ? (
              <div>
                {recentBookings.map((booking, index) => (
                  <div key={booking._id} style={{
                    padding: '1rem',
                    borderBottom: index < recentBookings.length - 1 ? '1px solid #F3F4F6' : 'none',
                    transition: 'background-color 0.2s ease'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem'
                    }}>
                      <h4 style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: '600',
                        color: '#1F2937',
                        margin: 0,
                        lineHeight: '1.4'
                      }}>
                        {booking.taskId.title}
                      </h4>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.5rem',
                        background: booking.status === 'completed' ? '#D1FAE5' : 
                                   booking.status === 'in-progress' ? '#DBEAFE' : '#F3F4F6',
                        color: booking.status === 'completed' ? '#065F46' : 
                               booking.status === 'in-progress' ? '#1E40AF' : '#374151',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        {booking.status}
                      </span>
                    </div>
                    <p style={{ 
                      fontSize: '0.8rem', 
                      color: '#6B7280',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {booking.helper._id === currentUser.id 
                        ? `Client: ${booking.taskProvider.username}` 
                        : `Helper: ${booking.helper.username}`
                      }
                    </p>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#9CA3AF',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}>
                      <span>{booking.agreedCredits} credits</span>
                      <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <Link 
                    to="/my-bookings"
                    style={{
                      color: '#00D4FF',
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
                padding: '2rem', 
                textAlign: 'center',
                color: '#6B7280'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
                <p style={{ marginBottom: '1rem' }}>No recent activity</p>
                <Link 
                  to={isPrimaryHelper ? "/browse-tasks" : "/create-task"}
                  style={{
                    color: '#00D4FF',
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}
                >
                  {isPrimaryHelper ? 'Browse Tasks' : 'Post Your First Task'} →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        border: '1px solid #E5E7EB',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#1F2937',
          marginBottom: '1rem'
        }}>
          Performance Insights
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1.5rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3B82F6' }}>
              {stats.applicationsSubmitted}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Applications Sent</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10B981' }}>
              {stats.applicationsAccepted}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Applications Accepted</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#F59E0B' }}>
              {stats.tasksCreated}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Tasks Created</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8B5CF6' }}>
              {stats.totalBookings}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Total Collaborations</div>
          </div>
        </div>
      </div>

      {/* Tips Based on Role */}
      <div style={{
        background: isPrimaryHelper ? 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' : 'linear-gradient(135deg, #DBEAFE, #BFDBFE)',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: `1px solid ${isPrimaryHelper ? '#A7F3D0' : '#BFDBFE'}`
      }}>
        <h3 style={{ 
          color: isPrimaryHelper ? '#065F46' : '#1E40AF',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          💡 {isPrimaryHelper ? 'Helper Tips' : 'Client Tips'}
        </h3>
        
        {isPrimaryHelper ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1rem',
            color: '#065F46'
          }}>
            <div>
              <strong>Increase Your Success Rate:</strong>
              <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                <li>Write detailed, personalized applications</li>
                <li>Showcase relevant portfolio pieces</li>
                <li>Respond to applications quickly</li>
              </ul>
            </div>
            <div>
              <strong>Build Your Reputation:</strong>
              <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                <li>Deliver high-quality work consistently</li>
                <li>Communicate proactively with clients</li>
                <li>Ask for reviews after successful projects</li>
              </ul>
            </div>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1rem',
            color: '#1E40AF'
          }}>
            <div>
              <strong>Attract Top Talent:</strong>
              <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                <li>Write clear, detailed project descriptions</li>
                <li>Set realistic budgets and timelines</li>
                <li>Respond to applications promptly</li>
              </ul>
            </div>
            <div>
              <strong>Ensure Project Success:</strong>
              <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                <li>Review helper profiles thoroughly</li>
                <li>Provide clear feedback and requirements</li>
                <li>Leave honest reviews to help the community</li>
              </ul>
            </div>
          </div>
        )}
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
            opacity: 0.7;
          }
        }
        
        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .performance-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;