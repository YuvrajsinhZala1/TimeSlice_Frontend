import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const TaskApplications = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Initialize with empty arrays to prevent undefined errors
  const [applications, setApplications] = useState([]);
  const [receivedApplications, setReceivedApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sent');
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Safe array check function
  const ensureArray = (value) => {
    return Array.isArray(value) ? value : [];
  };

  // Safe object check function
  const ensureObject = (value) => {
    return value && typeof value === 'object' ? value : {};
  };

  useEffect(() => {
    if (currentUser) {
      fetchApplications();
    }
  }, [currentUser]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [sentResponse, receivedResponse] = await Promise.all([
        api.get('/applications/my-applications'),
        api.get('/applications/received')
      ]);

      // Ensure we always have arrays
      const sentApps = ensureArray(sentResponse?.data);
      const receivedApps = ensureArray(receivedResponse?.data);

      setApplications(sentApps);
      setReceivedApplications(receivedApps);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load applications. Please try again.');
      // Set empty arrays on error to prevent undefined access
      setApplications([]);
      setReceivedApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawApplication = async (applicationId) => {
    if (!applicationId) return;
    
    try {
      setError('');
      await api.put(`/applications/${applicationId}/withdraw`);
      await fetchApplications();
    } catch (error) {
      console.error('Error withdrawing application:', error);
      setError('Failed to withdraw application. Please try again.');
    }
  };

  const handleRespondToApplication = async (applicationId, status, responseMessage = '') => {
    if (!applicationId || !status) return;
    
    try {
      setError('');
      await api.put(`/applications/${applicationId}/respond`, {
        status,
        responseMessage
      });
      await fetchApplications();
    } catch (error) {
      console.error('Error responding to application:', error);
      setError('Failed to respond to application. Please try again.');
    }
  };

  const getFilteredApplications = (apps) => {
    const appsArray = ensureArray(apps);
    
    let filtered = appsArray;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app && app.status === filterStatus);
    }

    // Sort applications
    filtered.sort((a, b) => {
      if (!a || !b) return 0;
      
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'credits':
          return (b.proposedCredits || 0) - (a.proposedCredits || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'accepted': return '#2ecc71';
      case 'rejected': return '#e74c3c';
      case 'withdrawn': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      case 'withdrawn': return '🔄';
      default: return '❓';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const ApplicationCard = ({ application, type }) => {
    if (!application) return null;
    
    const task = ensureObject(application.taskId);
    const applicant = ensureObject(application.applicantId);
    const taskProvider = ensureObject(application.taskProviderId);
    
    return (
      <div className="application-card">
        <div className="application-header">
          <div className="application-info">
            <h3 className="application-title">
              {task.title || 'Unknown Task'}
            </h3>
            <div className="application-meta">
              <span className="application-user">
                {type === 'sent' ? (
                  <>👤 To: {taskProvider.username || 'Unknown User'}</>
                ) : (
                  <>👤 From: {applicant.username || 'Unknown User'}</>
                )}
              </span>
              <span className="application-date">
                📅 {formatDate(application.createdAt)}
              </span>
            </div>
          </div>
          
          <div className="application-status">
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(application.status) }}
            >
              {getStatusIcon(application.status)} {application.status || 'Unknown'}
            </span>
          </div>
        </div>

        <div className="application-content">
          <div className="application-details">
            <div className="detail-row">
              <span className="detail-label">💰 Proposed Credits:</span>
              <span className="detail-value">{application.proposedCredits || 0}</span>
            </div>
            
            <div className="detail-row">
              <span className="detail-label">📝 Message:</span>
              <span className="detail-value">
                {application.message || 'No message provided'}
              </span>
            </div>
            
            {application.responseMessage && (
              <div className="detail-row">
                <span className="detail-label">💬 Response:</span>
                <span className="detail-value">{application.responseMessage}</span>
              </div>
            )}

            {type === 'received' && applicant.skills && (
              <div className="detail-row">
                <span className="detail-label">🛠️ Skills:</span>
                <div className="skills-list">
                  {ensureArray(applicant.skills).map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="application-actions">
            {type === 'sent' && (
              <>
                <button
                  onClick={() => navigate(`/tasks/${task._id}`)}
                  className="btn btn-secondary"
                >
                  📋 View Task
                </button>
                
                {application.status === 'pending' && (
                  <button
                    onClick={() => handleWithdrawApplication(application._id)}
                    className="btn btn-danger"
                  >
                    🔄 Withdraw
                  </button>
                )}
                
                {application.status === 'accepted' && (
                  <button
                    onClick={() => navigate('/my-bookings')}
                    className="btn btn-success"
                  >
                    📁 View Booking
                  </button>
                )}
              </>
            )}

            {type === 'received' && (
              <>
                <button
                  onClick={() => navigate(`/tasks/${task._id}`)}
                  className="btn btn-secondary"
                >
                  📋 View Task
                </button>
                
                {application.status === 'pending' && (
                  <div className="response-actions">
                    <button
                      onClick={() => handleRespondToApplication(application._id, 'accepted')}
                      className="btn btn-success"
                    >
                      ✅ Accept
                    </button>
                    <button
                      onClick={() => handleRespondToApplication(application._id, 'rejected')}
                      className="btn btn-danger"
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}

                {applicant._id && (
                  <button
                    onClick={() => navigate(`/profile/${applicant._id}`)}
                    className="btn btn-outline"
                  >
                    👤 View Profile
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = ({ type }) => (
    <div className="empty-state">
      <div className="empty-icon">
        {type === 'sent' ? '📤' : '📥'}
      </div>
      <h3>
        {type === 'sent' ? 'No Applications Sent' : 'No Applications Received'}
      </h3>
      <p>
        {type === 'sent' 
          ? 'You haven\'t applied to any tasks yet. Browse available tasks to get started!'
          : 'No one has applied to your tasks yet. Create more tasks to attract helpers!'
        }
      </p>
      <button
        onClick={() => navigate(type === 'sent' ? '/browse-tasks' : '/create-task')}
        className="btn btn-primary"
      >
        {type === 'sent' ? '🔍 Browse Tasks' : '➕ Create Task'}
      </button>
    </div>
  );

  const currentApplications = activeTab === 'sent' ? applications : receivedApplications;
  const filteredApplications = getFilteredApplications(currentApplications);

  if (loading) {
    return (
      <div className="applications-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-container">
      {error && (
        <div className="error-banner">
          <span className="error-text">{error}</span>
          <button onClick={() => setError('')} className="error-close">✕</button>
        </div>
      )}

      <div className="applications-header">
        <h1>📋 My Applications</h1>
        <p>Manage your task applications and collaboration requests</p>
      </div>

      <div className="applications-controls">
        <div className="tab-controls">
          <button
            onClick={() => setActiveTab('sent')}
            className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
          >
            📤 Sent Applications ({ensureArray(applications).length})
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
          >
            📥 Received Applications ({ensureArray(receivedApplications).length})
          </button>
        </div>

        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">⏳ Pending</option>
            <option value="accepted">✅ Accepted</option>
            <option value="rejected">❌ Rejected</option>
            <option value="withdrawn">🔄 Withdrawn</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">📅 Newest First</option>
            <option value="oldest">📅 Oldest First</option>
            <option value="credits">💰 Highest Credits</option>
          </select>
        </div>
      </div>

      <div className="applications-content">
        {filteredApplications.length === 0 ? (
          <EmptyState type={activeTab} />
        ) : (
          <div className="applications-grid">
            {filteredApplications.map((application, index) => (
              <ApplicationCard
                key={application?._id || index}
                application={application}
                type={activeTab}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .applications-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: calc(100vh - 120px);
        }

        .error-banner {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #ff4757;
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1000;
          box-shadow: 0 5px 15px rgba(255,71,87,0.3);
        }

        .error-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 1.2rem;
          font-weight: bold;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: white;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .applications-header {
          text-align: center;
          margin-bottom: 2rem;
          color: white;
        }

        .applications-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2.5rem;
          font-weight: 700;
        }

        .applications-header p {
          margin: 0;
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .applications-controls {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .tab-controls {
          display: flex;
          gap: 0.5rem;
        }

        .tab-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          background: rgba(255,255,255,0.2);
          color: white;
          backdrop-filter: blur(10px);
        }

        .tab-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }

        .tab-btn.active {
          background: white;
          color: #667eea;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        .filter-controls {
          display: flex;
          gap: 1rem;
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 25px;
          background: rgba(255,255,255,0.9);
          color: #333;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          box-shadow: 0 0 0 3px rgba(255,255,255,0.3);
        }

        .applications-content {
          background: rgba(255,255,255,0.95);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .applications-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
          gap: 1.5rem;
        }

        .application-card {
          background: white;
          border-radius: 15px;
          padding: 1.5rem;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .application-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }

        .application-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid rgba(0,0,0,0.05);
        }

        .application-info {
          flex: 1;
        }

        .application-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
          line-height: 1.4;
        }

        .application-meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.9rem;
          color: #666;
        }

        .application-status {
          flex-shrink: 0;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: capitalize;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .application-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .application-details {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-row {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 1rem;
          align-items: flex-start;
        }

        .detail-label {
          font-weight: 600;
          color: #666;
          font-size: 0.9rem;
        }

        .detail-value {
          color: #333;
          word-wrap: break-word;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .application-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(0,0,0,0.1);
        }

        .response-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn {
          padding: 0.75rem 1.25rem;
          border-radius: 25px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 4px 15px rgba(102,126,234,0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102,126,234,0.4);
        }

        .btn-secondary {
          background: rgba(102,126,234,0.1);
          color: #667eea;
          border: 2px solid #667eea;
        }

        .btn-secondary:hover {
          background: #667eea;
          color: white;
        }

        .btn-success {
          background: linear-gradient(135deg, #2ecc71, #27ae60);
          color: white;
          box-shadow: 0 4px 15px rgba(46,204,113,0.3);
        }

        .btn-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(46,204,113,0.4);
        }

        .btn-danger {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          box-shadow: 0 4px 15px rgba(231,76,60,0.3);
        }

        .btn-danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(231,76,60,0.4);
        }

        .btn-outline {
          background: transparent;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .btn-outline:hover {
          background: #667eea;
          color: white;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 4rem 2rem;
          color: #666;
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0 0 1rem 0;
          font-size: 1.8rem;
          color: #333;
        }

        .empty-state p {
          margin: 0 0 2rem 0;
          font-size: 1.1rem;
          max-width: 500px;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .applications-container {
            padding: 1rem;
          }

          .applications-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .tab-controls, .filter-controls {
            justify-content: center;
          }

          .applications-grid {
            grid-template-columns: 1fr;
          }

          .detail-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .application-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskApplications;