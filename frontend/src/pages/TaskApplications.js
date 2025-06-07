import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const TaskApplications = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    fetchApplications();
  }, [currentUser, navigate, activeTab]);

  const fetchApplications = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockApplications = [
        {
          _id: '1',
          taskId: {
            _id: 't1',
            title: 'React Dashboard Development',
            description: 'Build a comprehensive admin dashboard with React',
            credits: 75,
            category: 'web-dev',
            skills: ['React', 'JavaScript', 'CSS']
          },
          applicant: {
            _id: 'u1',
            username: 'johndeveloper',
            rating: 4.8,
            skills: ['React', 'Node.js', 'MongoDB'],
            completedTasks: 23
          },
          proposedCredits: 70,
          message: 'I have 5+ years of React experience and have built similar dashboards. I can deliver this within your timeline with clean, maintainable code.',
          status: 'pending',
          appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          estimatedDuration: '2 weeks'
        },
        {
          _id: '2',
          taskId: {
            _id: 't2',
            title: 'E-commerce Website Design',
            description: 'Modern UI/UX design for online store',
            credits: 120,
            category: 'design',
            skills: ['UI/UX', 'Figma', 'Prototyping']
          },
          applicant: {
            _id: 'u2',
            username: 'designpro',
            rating: 4.9,
            skills: ['UI/UX Design', 'Figma', 'Adobe XD'],
            completedTasks: 45
          },
          proposedCredits: 110,
          message: 'I specialize in e-commerce design and have created 20+ successful online stores. I can provide wireframes, mockups, and interactive prototypes.',
          status: 'accepted',
          appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          estimatedDuration: '3 weeks',
          response: 'Welcome aboard! Looking forward to working with you.'
        },
        {
          _id: '3',
          taskId: {
            _id: 't3',
            title: 'Mobile App Backend',
            description: 'Node.js API for mobile application',
            credits: 90,
            category: 'mobile-dev',
            skills: ['Node.js', 'Express', 'MongoDB']
          },
          applicant: {
            _id: 'u3',
            username: 'backendexpert',
            rating: 4.7,
            skills: ['Node.js', 'Express', 'MongoDB', 'AWS'],
            completedTasks: 31
          },
          proposedCredits: 95,
          message: 'I can build a scalable API with proper authentication, data validation, and documentation. I have experience with similar mobile backends.',
          status: 'rejected',
          appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          estimatedDuration: '2-3 weeks',
          response: 'Thank you for your application. We decided to go with someone who has more specific mobile API experience.'
        }
      ];
      
      setApplications(mockApplications);
    } catch (error) {
      setError('Failed to fetch applications');
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationResponse = async (applicationId, status, response = '') => {
    try {
      setError('');
      setSuccess('');
      
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setApplications(prev => prev.map(app => 
        app._id === applicationId 
          ? { ...app, status, response, respondedAt: new Date() }
          : app
      ));
      
      setSuccess(`Application ${status} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(`Failed to ${status} application`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'accepted': return '#10B981';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getFilterCounts = () => {
    return {
      all: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
  };

  const counts = getFilterCounts();

  const ApplicationCard = ({ application }) => {
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [responseType, setResponseType] = useState('');

    const task = application.taskId;
    const applicant = application.applicant;

    const openResponseModal = (type) => {
      setResponseType(type);
      setResponseMessage('');
      setShowResponseModal(true);
    };

    const submitResponse = async () => {
      await handleApplicationResponse(application._id, responseType, responseMessage);
      setShowResponseModal(false);
    };

    return (
      <div className="application-card">
        <div className="application-header">
          <div className="application-info">
            <h3 className="application-title">{task.title}</h3>
            <div className="application-meta">
              <span className="applicant-info">
                👤 {applicant.username}
              </span>
              <span className="application-date">
                📅 {new Date(application.appliedAt).toLocaleDateString()}
              </span>
              <span className="application-duration">
                ⏱️ {application.estimatedDuration}
              </span>
            </div>
          </div>
          
          <div className="application-status">
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(application.status) }}
            >
              {getStatusIcon(application.status)} {application.status}
            </span>
          </div>
        </div>

        <div className="applicant-details">
          <div className="applicant-stats">
            <div className="stat-item">
              <span className="stat-value">⭐ {applicant.rating}</span>
              <span className="stat-label">Rating</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">✅ {applicant.completedTasks}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">💎 {application.proposedCredits}</span>
              <span className="stat-label">Proposed</span>
            </div>
          </div>

          <div className="applicant-skills">
            <span className="skills-label">Skills:</span>
            <div className="skills-list">
              {applicant.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="application-message">
          <h4>Application Message:</h4>
          <p>{application.message}</p>
        </div>

        {application.response && (
          <div className="application-response">
            <h4>Your Response:</h4>
            <p>{application.response}</p>
          </div>
        )}

        <div className="application-actions">
          {application.status === 'pending' && activeTab === 'received' && (
            <div className="response-actions">
              <button
                onClick={() => openResponseModal('accepted')}
                className="btn btn-success"
              >
                ✅ Accept
              </button>
              <button
                onClick={() => openResponseModal('rejected')}
                className="btn btn-danger"
              >
                ❌ Decline
              </button>
            </div>
          )}
          
          <Link to={`/tasks/${task._id}`} className="btn btn-secondary">
            📋 View Project
          </Link>
          
          <Link to="/chat" className="btn btn-outline">
            💬 Message
          </Link>
        </div>

        {/* Response Modal */}
        {showResponseModal && (
          <div className="modal-overlay" onClick={() => setShowResponseModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {responseType === 'accepted' ? '✅ Accept Application' : '❌ Decline Application'}
                </h3>
                <button onClick={() => setShowResponseModal(false)} className="close-btn">×</button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    Message to {applicant.username}:
                  </label>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder={
                      responseType === 'accepted' 
                        ? "Welcome aboard! Let me know if you have any questions..."
                        : "Thank you for your application. Unfortunately..."
                    }
                    className="form-textarea"
                    rows="4"
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button onClick={() => setShowResponseModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={submitResponse} className="btn btn-primary">
                  Send Response
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📤 Task Applications</h1>
          <p className="page-subtitle">Manage your task applications and collaboration requests</p>
        </div>

        <div className="applications-container">
          {/* Tab Controls */}
          <div className="applications-controls">
            <div className="tab-controls">
              <button
                className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
                onClick={() => setActiveTab('received')}
              >
                📥 Received Applications
                <span className="tab-count">{applications.length}</span>
              </button>
              <button
                className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
                onClick={() => setActiveTab('sent')}
              >
                📤 Sent Applications
                <span className="tab-count">0</span>
              </button>
            </div>

            <div className="filter-controls">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({counts.all})
              </button>
              <button
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending ({counts.pending})
              </button>
              <button
                className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
                onClick={() => setFilter('accepted')}
              >
                Accepted ({counts.accepted})
              </button>
              <button
                className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                onClick={() => setFilter('rejected')}
              >
                Declined ({counts.rejected})
              </button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="alert alert-error">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span className="success-icon">✅</span>
              <span>{success}</span>
            </div>
          )}

          {/* Applications Content */}
          <div className="applications-content">
            {activeTab === 'received' ? (
              filteredApplications.length > 0 ? (
                <div className="applications-grid">
                  {filteredApplications.map((application) => (
                    <ApplicationCard key={application._id} application={application} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📥</div>
                  <h3>No applications found</h3>
                  <p>
                    {filter === 'all' 
                      ? "You haven't received any applications yet. Create more projects to attract talented helpers!"
                      : `No ${filter} applications at the moment.`
                    }
                  </p>
                  {filter === 'all' && (
                    <Link to="/create-task" className="btn btn-primary">
                      📝 Create Project
                    </Link>
                  )}
                </div>
              )
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📤</div>
                <h3>No sent applications</h3>
                <p>You haven't applied to any projects yet. Browse available projects and start applying!</p>
                <Link to="/browse-tasks" className="btn btn-primary">
                  🔍 Browse Projects
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .applications-container {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-primary);
          overflow: hidden;
        }

        .applications-controls {
          background: var(--bg-secondary);
          padding: var(--space-xl);
          border-bottom: 1px solid var(--border-primary);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--space-lg);
        }

        .tab-controls {
          display: flex;
          gap: var(--space-md);
        }

        .tab-btn {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          color: var(--text-secondary);
          padding: var(--space-md) var(--space-lg);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-normal);
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-weight: 500;
        }

        .tab-btn:hover {
          background: var(--bg-card);
          border-color: var(--border-accent);
          color: var(--text-primary);
        }

        .tab-btn.active {
          background: var(--primary-gradient);
          border-color: var(--primary-cyan);
          color: white;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
        }

        .tab-count {
          background: rgba(255, 255, 255, 0.2);
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-xl);
          font-size: 0.8rem;
          font-weight: 600;
        }

        .tab-btn.active .tab-count {
          background: rgba(255, 255, 255, 0.3);
        }

        .filter-controls {
          display: flex;
          gap: var(--space-sm);
        }

        .filter-btn {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          color: var(--text-secondary);
          padding: var(--space-sm) var(--space-md);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-normal);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .filter-btn:hover {
          background: var(--bg-card);
          border-color: var(--border-accent);
          color: var(--text-primary);
        }

        .filter-btn.active {
          background: var(--primary-gradient);
          border-color: var(--primary-cyan);
          color: white;
        }

        .applications-content {
          padding: var(--space-xl);
        }

        .applications-grid {
          display: grid;
          gap: var(--space-lg);
        }

        .application-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          transition: all var(--transition-normal);
        }

        .application-card:hover {
          border-color: var(--border-accent);
          box-shadow: var(--shadow-md);
        }

        .application-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-lg);
          gap: var(--space-md);
        }

        .application-info {
          flex: 1;
        }

        .application-title {
          color: var(--text-primary);
          font-size: 1.3rem;
          font-weight: 600;
          margin: 0 0 var(--space-sm) 0;
          line-height: 1.3;
        }

        .application-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-md);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .applicant-info,
        .application-date,
        .application-duration {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .application-status {
          flex-shrink: 0;
        }

        .status-badge {
          color: white;
          padding: var(--space-xs) var(--space-md);
          border-radius: var(--radius-xl);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }

        .applicant-details {
          background: var(--bg-tertiary);
          border-radius: var(--radius-md);
          padding: var(--space-lg);
          margin-bottom: var(--space-lg);
        }

        .applicant-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-lg);
          margin-bottom: var(--space-lg);
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--space-xs);
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .applicant-skills {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: var(--space-md);
        }

        .skills-label {
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
        }

        .skill-tag {
          background: var(--primary-gradient);
          color: white;
          padding: var(--space-xs) var(--space-md);
          border-radius: var(--radius-xl);
          font-size: 0.8rem;
          font-weight: 500;
        }

        .application-message {
          margin-bottom: var(--space-lg);
        }

        .application-message h4,
        .application-response h4 {
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 var(--space-sm) 0;
        }

        .application-message p,
        .application-response p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .application-response {
          background: rgba(0, 212, 255, 0.05);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: var(--radius-md);
          padding: var(--space-lg);
          margin-bottom: var(--space-lg);
        }

        .application-actions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-md);
          padding-top: var(--space-lg);
          border-top: 1px solid var(--border-primary);
        }

        .response-actions {
          display: flex;
          gap: var(--space-sm);
        }

        .empty-state {
          text-align: center;
          padding: var(--space-2xl);
          color: var(--text-muted);
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: var(--space-lg);
          opacity: 0.5;
        }

        .empty-state h3 {
          color: var(--text-primary);
          font-size: 1.5rem;
          margin: 0 0 var(--space-md) 0;
        }

        .empty-state p {
          margin: 0 0 var(--space-xl) 0;
          font-size: 1rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--space-md);
        }

        .modal-content {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          max-width: 500px;
          width: 100%;
          box-shadow: var(--shadow-xl);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-xl);
          border-bottom: 1px solid var(--border-primary);
          background: var(--bg-secondary);
        }

        .modal-header h3 {
          color: var(--text-primary);
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--text-muted);
          cursor: pointer;
          transition: color var(--transition-normal);
        }

        .close-btn:hover {
          color: var(--text-primary);
        }

        .modal-body {
          padding: var(--space-xl);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-md);
          padding: var(--space-xl);
          border-top: 1px solid var(--border-primary);
          background: var(--bg-secondary);
        }

        .loading-container {
          text-align: center;
          padding: var(--space-2xl);
          color: var(--text-secondary);
        }

        .loading-container p {
          margin-top: var(--space-lg);
          font-size: 1.1rem;
        }

        @media (max-width: 1024px) {
          .applications-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .tab-controls,
          .filter-controls {
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .application-header {
            flex-direction: column;
            gap: var(--space-md);
          }

          .application-meta {
            flex-direction: column;
            gap: var(--space-sm);
          }

          .applicant-stats {
            grid-template-columns: 1fr;
            gap: var(--space-md);
          }

          .application-actions {
            flex-direction: column;
          }

          .response-actions {
            flex-direction: column;
          }

          .modal-content {
            margin: var(--space-md);
          }

          .tab-controls,
          .filter-controls {
            flex-direction: column;
          }

          .filter-controls {
            gap: var(--space-sm);
          }
        }
      `}</style>
    </div>
  );
};

export default TaskApplications;