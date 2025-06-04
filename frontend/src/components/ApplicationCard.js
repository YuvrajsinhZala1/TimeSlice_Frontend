import React, { useState } from 'react';
import { formatDuration } from '../utils/durationUtils';

const ApplicationCard = ({ application, onRespond, showResponseOptions = false }) => {
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseData, setResponseData] = useState({
    status: 'accepted',
    responseMessage: '',
    agreedCredits: application.proposedCredits
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#28a745';
      case 'rejected': return '#dc3545';
      case 'withdrawn': return '#6c757d';
      default: return '#ffc107';
    }
  };

  const getExperienceLevel = (completedTasks, memberSince) => {
    const monthsSince = Math.floor((new Date() - new Date(memberSince)) / (1000 * 60 * 60 * 24 * 30));
    
    if (completedTasks >= 50) return '🏆 Expert';
    if (completedTasks >= 20) return '⭐ Experienced';
    if (completedTasks >= 5) return '👍 Intermediate';
    if (monthsSince >= 3) return '🌱 Beginner';
    return '🆕 New Member';
  };

  const handleSubmitResponse = (e) => {
    e.preventDefault();
    onRespond(application._id, responseData);
    setShowResponseForm(false);
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-1">
        <h4>{application.taskId?.title || 'Task Application'}</h4>
        <span 
          className="badge" 
          style={{ backgroundColor: getStatusColor(application.status) }}
        >
          {application.status}
        </span>
      </div>

      <div className="mb-1">
        <strong>From:</strong> {application.applicantId.username}
        <span className="rating ml-1">
          ★ {application.applicantId.rating ? application.applicantId.rating.toFixed(1) : 'New'}
        </span>
        <span style={{ marginLeft: '1rem', fontSize: '0.9rem' }}>
          {getExperienceLevel(application.applicantId.completedTasks, application.applicantId.createdAt)}
        </span>
      </div>

      <div className="mb-1">
        <strong>Skills:</strong>
        {application.applicantId.skills?.map((skill, index) => (
          <span key={index} className="badge">
            {skill}
          </span>
        ))}
      </div>

      <div className="mb-1">
        <strong>Completed Tasks:</strong> {application.applicantId.completedTasks || 0}
      </div>

      <div className="mb-1">
        <strong>Proposed Credits:</strong> {application.proposedCredits}
      </div>

      {application.taskId && (
        <div className="mb-1">
          <strong>Task Duration:</strong> {formatDuration(application.taskId.duration)}
        </div>
      )}

      <div className="mb-1">
        <strong>Message:</strong>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: '8px',
          fontStyle: 'italic',
          marginTop: '0.5rem',
          border: '1px solid #e1e5e9'
        }}>
          "{application.message}"
        </div>
      </div>

      <div className="mb-1">
        <strong>Applied:</strong> {formatDate(application.createdAt)}
      </div>

      {application.responseMessage && (
        <div className="mb-1">
          <strong>Response:</strong>
          <div style={{ 
            background: application.status === 'accepted' ? '#d4edda' : '#f8d7da', 
            padding: '1rem', 
            borderRadius: '8px',
            marginTop: '0.5rem',
            border: `1px solid ${application.status === 'accepted' ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {application.responseMessage}
          </div>
        </div>
      )}

      {showResponseOptions && application.status === 'pending' && (
        <div className="flex gap-1">
          <button 
            onClick={() => setShowResponseForm(!showResponseForm)}
            className="btn btn-success"
          >
            📝 Respond to Application
          </button>
        </div>
      )}

      {showResponseForm && (
        <form onSubmit={handleSubmitResponse} style={{ 
          marginTop: '1.5rem', 
          padding: '1.5rem', 
          border: '2px solid #667eea', 
          borderRadius: '8px',
          backgroundColor: '#f8f9ff'
        }}>
          <h5>Respond to Application</h5>
          
          <div className="form-group">
            <label>Decision:</label>
            <select
              value={responseData.status}
              onChange={(e) => setResponseData({ ...responseData, status: e.target.value })}
              required
            >
              <option value="accepted">✅ Accept Application</option>
              <option value="rejected">❌ Reject Application</option>
            </select>
          </div>

          {responseData.status === 'accepted' && (
            <div className="form-group">
              <label>Agreed Credits:</label>
              <input
                type="number"
                value={responseData.agreedCredits}
                onChange={(e) => setResponseData({ ...responseData, agreedCredits: e.target.value })}
                min="1"
                required
              />
              <small style={{ color: '#666' }}>
                Helper proposed {application.proposedCredits} credits
              </small>
            </div>
          )}

          <div className="form-group">
            <label>Message to applicant:</label>
            <textarea
              value={responseData.responseMessage}
              onChange={(e) => setResponseData({ ...responseData, responseMessage: e.target.value })}
              placeholder={responseData.status === 'accepted' 
                ? "Welcome aboard! Looking forward to working with you. Here are the next steps..."
                : "Thank you for your interest. We've decided to go with another applicant because..."
              }
              rows="3"
              required
            />
          </div>

          <div className="flex gap-1">
            <button type="submit" className="btn btn-success">
              Send Response
            </button>
            <button 
              type="button" 
              onClick={() => setShowResponseForm(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ApplicationCard;