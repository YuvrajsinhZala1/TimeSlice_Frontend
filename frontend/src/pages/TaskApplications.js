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
        setSuccess('Application accepted! A booking has been created.');
      } else {
        setSuccess('Application rejected.');
      }
      
      // Refresh applications
      await fetchApplications();
      
      setTimeout(() => setSuccess(''), 3000);
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
      <h1 className="mb-2">Task Applications</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '1px solid #ddd'
      }}>
        <button
          onClick={() => setActiveTab('sent')}
          className={`btn ${activeTab === 'sent' ? 'btn-success' : 'btn-secondary'}`}
          style={{ borderRadius: '4px 4px 0 0' }}
        >
          My Applications ({myApplications.length})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`btn ${activeTab === 'received' ? 'btn-success' : 'btn-secondary'}`}
          style={{ borderRadius: '4px 4px 0 0' }}
        >
          Received Applications ({receivedApplications.length})
        </button>
      </div>

      {activeTab === 'sent' && (
        <div>
          <h2>Applications I've Sent</h2>
          
          {myApplications.length === 0 ? (
            <div className="card text-center">
              <h3>No applications sent yet</h3>
              <p>Browse available tasks and apply to help others!</p>
            </div>
          ) : (
            <>
              {pendingSent.length > 0 && (
                <div className="mb-2">
                  <h3>Pending Applications ({pendingSent.length})</h3>
                  <div className="card-grid">
                    {pendingSent.map(application => (
                      <div key={application._id} className="card">
                        <ApplicationCard
                          application={application}
                          showResponseOptions={false}
                        />
                        <div className="mt-1">
                          <button
                            onClick={() => handleWithdrawApplication(application._id)}
                            className="btn btn-danger"
                            style={{ width: '100%' }}
                          >
                            Withdraw Application
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {respondedSent.length > 0 && (
                <div className="mb-2">
                  <h3>Responded Applications ({respondedSent.length})</h3>
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
          <h2>Applications I've Received</h2>
          
          {receivedApplications.length === 0 ? (
            <div className="card text-center">
              <h3>No applications received yet</h3>
              <p>Post interesting tasks to start receiving applications from helpers!</p>
            </div>
          ) : (
            <>
              {pendingReceived.length > 0 && (
                <div className="mb-2">
                  <h3>Pending Applications - Need Your Response ({pendingReceived.length})</h3>
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
                  <h3>Responded Applications ({respondedReceived.length})</h3>
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
    </div>
  );
};

export default TaskApplications;