import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ApplicationCard from '../components/ApplicationCard';

const TaskApplications = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [myApplications, setMyApplications] = useState([]);
  const [receivedApplications, setReceivedApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('sent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchApplications();
  }, [currentUser, navigate]);

  const fetchApplications = async () => {
    try {
      const [myAppsRes, receivedAppsRes] = await Promise.all([
        api.get('/applications/my-applications'),
        api.get('/applications/received')
      ]);

      setMyApplications(myAppsRes.data);
      setReceivedApplications(receivedAppsRes.data);
    } catch (error) {
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToApplication = async (applicationId, responseData) => {
    try {
      setError('');
      setSuccess('');
      
      await api.put(`/applications/${applicationId}/respond`, responseData);
      
      if (responseData.status === 'accepted') {
        setSuccess('🎉 Application accepted! A booking has been created and you can now chat with the helper.');
      } else {
        setSuccess('📝 Application response sent to the helper.');
      }
      
      // Refresh applications
      await fetchApplications();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to respond to application');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleWithdrawApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      await api.put(`/applications/${applicationId}/withdraw`);
      setSuccess('Application withdrawn successfully.');
      
      // Refresh applications
      await fetchApplications();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to withdraw application');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return <div className="text-center">Loading applications...</div>;
  }

  const pendingReceived = receivedApplications.filter(app => app.status === 'pending');
  const respondedReceived = receivedApplications.filter(app => app.status !== 'pending');

  const pendingSent = myApplications.filter(app => app.status === 'pending');
  const respondedSent = myApplications.filter(app => app.status !== 'pending');

  return (
    <div>
      <h1 className="mb-2">📝 Task Applications Management</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '2px solid #e1e5e9'
      }}>
        <button
          onClick={() => setActiveTab('sent')}
          className={`btn ${activeTab === 'sent' ? 'btn-success' : 'btn-secondary'}`}
          style={{ borderRadius: '8px 8px 0 0', border: 'none', padding: '1rem 2rem' }}
        >
          📤 My Applications ({myApplications.length})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`btn ${activeTab === 'received' ? 'btn-success' : 'btn-secondary'}`}
          style={{ borderRadius: '8px 8px 0 0', border: 'none', padding: '1rem 2rem' }}
        >
          📥 Received Applications ({receivedApplications.length})
          {pendingReceived.length > 0 && (
            <span style={{ 
              marginLeft: '0.5rem', 
              backgroundColor: '#dc3545', 
              color: 'white',
              borderRadius: '50%',
              padding: '0.2rem 0.5rem',
              fontSize: '0.8rem'
            }}>
              {pendingReceived.length} pending
            </span>
          )}
        </button>
      </div>

      {activeTab === 'sent' && (
        <div>
          <h2>📤 Applications I've Sent</h2>
          
          {myApplications.length === 0 ? (
            <div className="card text-center">
              <h3>No applications sent yet</h3>
              <p>Browse available tasks and apply to help others!</p>
              <div style={{ marginTop: '1rem' }}>
                <button 
                  onClick={() => navigate('/browse-tasks')}
                  className="btn btn-success"
                >
                  Browse Available Tasks
                </button>
              </div>
            </div>
          ) : (
            <>
              {pendingSent.length > 0 && (
                <div className="mb-2">
                  <h3>⏳ Pending Applications ({pendingSent.length})</h3>
                  <p style={{ color: '#666', marginBottom: '1rem' }}>
                    Waiting for task providers to review and respond.
                  </p>
                  <div className="card-grid">
                    {pendingSent.map(application => (
                      <div key={application._id} className="card">
                        <ApplicationCard
                          application={application}
                          showResponseOptions={false}
                        />
                        <div className="mt-1" style={{ borderTop: '1px solid #e1e5e9', paddingTop: '1rem' }}>
                          <button
                            onClick={() => handleWithdrawApplication(application._id)}
                            className="btn btn-danger"
                            style={{ width: '100%' }}
                          >
                            🗑️ Withdraw Application
                          </button>
                          <small style={{ display: 'block', marginTop: '0.5rem', color: '#666', textAlign: 'center' }}>
                            You can withdraw this application if you're no longer interested
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {respondedSent.length > 0 && (
                <div className="mb-2">
                  <h3>📋 Responded Applications ({respondedSent.length})</h3>
                  <div className="card-grid">
                    {respondedSent.map(application => (
                      <ApplicationCard
                        key={application._id}
                        application={application}
                        showResponseOptions={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'received' && (
        <div>
          <h2>📥 Applications I've Received</h2>
          
          {receivedApplications.length === 0 ? (
            <div className="card text-center">
              <h3>No applications received yet</h3>
              <p>Post interesting and clear tasks to start receiving applications from helpers!</p>
              <div style={{ marginTop: '1rem' }}>
                <button 
                  onClick={() => navigate('/create-task')}
                  className="btn btn-success"
                >
                  Post Your First Task
                </button>
              </div>
            </div>
          ) : (
            <>
              {pendingReceived.length > 0 && (
                <div className="mb-2">
                  <h3>⚡ Pending Applications - Need Your Response ({pendingReceived.length})</h3>
                  <div style={{ 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffeaa7', 
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    <strong>⚠️ Action Required:</strong> You have {pendingReceived.length} application{pendingReceived.length !== 1 ? 's' : ''} waiting for your response. 
                    Review and respond quickly to keep helpers engaged!
                  </div>
                  
                  <div className="card-grid">
                    {pendingReceived.map(application => (
                      <ApplicationCard
                        key={application._id}
                        application={application}
                        onRespond={handleRespondToApplication}
                        showResponseOptions={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {respondedReceived.length > 0 && (
                <div className="mb-2">
                  <h3>✅ Responded Applications ({respondedReceived.length})</h3>
                  <div className="card-grid">
                    {respondedReceived.map(application => (
                      <ApplicationCard
                        key={application._id}
                        application={application}
                        showResponseOptions={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tips Section */}
      <div className="card mt-2" style={{ backgroundColor: '#f8f9fa' }}>
        <h4>💡 Application Management Tips:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>For Task Providers:</strong>
            <ul style={{ marginLeft: '1rem', color: '#666' }}>
              <li>Respond to applications quickly to keep helpers engaged</li>
              <li>Review helper profiles thoroughly before accepting</li>
              <li>Communicate clearly in your response messages</li>
              <li>Consider negotiating credits if needed</li>
            </ul>
          </div>
          <div>
            <strong>For Helpers:</strong>
            <ul style={{ marginLeft: '1rem', color: '#666' }}>
              <li>Write detailed application messages explaining your expertise</li>
              <li>Propose reasonable credit amounts</li>
              <li>Be patient while waiting for responses</li>
              <li>Only withdraw applications if you're no longer available</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskApplications;