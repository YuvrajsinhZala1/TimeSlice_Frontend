import React, { useState } from 'react';
import HelperProfileModal from './HelperProfileModal';

const ApplicantsList = ({ task, onRespondToApplication }) => {
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  if (!task.applicants || task.applicants.length === 0) {
    return (
      <div className="card text-center">
        <h3>No Applications Yet</h3>
        <p>No one has applied for this task yet. Make sure your task description is clear and attractive!</p>
      </div>
    );
  }

  const handleHelperClick = (helper, application) => {
    setSelectedHelper(helper);
    setSelectedApplication(application);
    setShowProfileModal(true);
  };

  const handleCloseModal = () => {
    setShowProfileModal(false);
    setSelectedHelper(null);
    setSelectedApplication(null);
  };

  const handleQuickRespond = async (applicationId, status, agreedCredits = null) => {
    const responseData = {
      status,
      responseMessage: status === 'accepted' 
        ? `Welcome aboard! Looking forward to working with you.`
        : `Thank you for your interest. We've decided to go with another applicant.`,
      agreedCredits: agreedCredits || null
    };
    
    await onRespondToApplication(applicationId, responseData);
    handleCloseModal();
  };

  const pendingApplications = task.applicants.filter(app => app.status === 'pending');
  const respondedApplications = task.applicants.filter(app => app.status !== 'pending');

  return (
    <div>
      {pendingApplications.length > 0 && (
        <div className="mb-2">
          <h3>📥 Pending Applications ({pendingApplications.length})</h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Click on any applicant to view their detailed profile and respond to their application.
          </p>
          
          {/* Vertical Layout for Applications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingApplications.map(application => (
              <div
                key={application._id}
                onClick={() => handleHelperClick(application.applicantId, application)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '2px solid #e1e5e9',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                  minHeight: '120px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e1e5e9';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
                }}
              >
                {/* Helper Avatar */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#667eea',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginRight: '1.5rem',
                  flexShrink: 0
                }}>
                  {application.applicantId.username.charAt(0).toUpperCase()}
                </div>

                {/* Helper Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, marginRight: '1rem' }}>
                      {application.applicantId.username}
                    </h4>
                    <span className="rating">
                      ★ {application.applicantId.rating ? application.applicantId.rating.toFixed(1) : 'New'}
                    </span>
                    <span style={{ 
                      marginLeft: '1rem', 
                      fontSize: '0.9rem', 
                      color: '#666' 
                    }}>
                      {application.applicantId.completedTasks || 0} tasks completed
                    </span>
                  </div>

                  {/* Skills Preview */}
                  <div style={{ marginBottom: '0.5rem' }}>
                    {application.applicantId.skills?.slice(0, 3).map((skill, index) => (
                      <span key={index} className="badge" style={{ fontSize: '0.8rem' }}>
                        {skill}
                      </span>
                    ))}
                    {application.applicantId.skills?.length > 3 && (
                      <span style={{ color: '#666', fontSize: '0.8rem' }}>
                        +{application.applicantId.skills.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Application Preview */}
                  <p style={{ 
                    margin: 0, 
                    color: '#666', 
                    fontSize: '0.9rem',
                    fontStyle: 'italic'
                  }}>
                    "{application.message.length > 100 
                      ? application.message.substring(0, 100) + '...' 
                      : application.message}"
                  </p>
                </div>

                {/* Credits and Quick Actions */}
                <div style={{ 
                  textAlign: 'right', 
                  marginLeft: '1rem',
                  flexShrink: 0 
                }}>
                  <div style={{ 
                    fontSize: '1.2rem', 
                    fontWeight: 'bold', 
                    color: '#667eea',
                    marginBottom: '0.5rem'
                  }}>
                    {application.proposedCredits} credits
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickRespond(application._id, 'accepted', application.proposedCredits);
                      }}
                      className="btn btn-success"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      Quick Accept
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickRespond(application._id, 'rejected');
                      }}
                      className="btn btn-danger"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      Reject
                    </button>
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#666', 
                    marginTop: '0.5rem' 
                  }}>
                    Click for full profile
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {respondedApplications.length > 0 && (
        <div className="mb-2">
          <h3>📋 Previous Applications ({respondedApplications.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {respondedApplications.map(application => (
              <div
                key={application._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e1e5e9',
                  opacity: 0.8
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  marginRight: '1rem'
                }}>
                  {application.applicantId.username.charAt(0).toUpperCase()}
                </div>
                
                <div style={{ flex: 1 }}>
                  <strong>{application.applicantId.username}</strong>
                  <span style={{ marginLeft: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    {application.proposedCredits} credits
                  </span>
                </div>
                
                <span 
                  className="badge" 
                  style={{ 
                    backgroundColor: application.status === 'accepted' ? '#28a745' : '#dc3545' 
                  }}
                >
                  {application.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper Profile Modal */}
      <HelperProfileModal
        helper={selectedHelper}
        application={selectedApplication}
        isOpen={showProfileModal}
        onClose={handleCloseModal}
        onRespond={handleQuickRespond}
      />
    </div>
  );
};

export default ApplicantsList;