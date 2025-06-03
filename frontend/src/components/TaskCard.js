import React, { useState } from 'react';

const TaskCard = ({ 
  task, 
  onApply, 
  onEdit, 
  onDelete, 
  showApplyButton = true, 
  showEditDelete = false,
  showViewApplications = false,
  onViewApplications 
}) => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    message: '',
    proposedCredits: task.credits
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#28a745';
      case 'in-review': return '#ffc107';
      case 'assigned': return '#17a2b8';
      case 'in-progress': return '#6f42c1';
      case 'completed': return '#6c757d';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const handleSubmitApplication = (e) => {
    e.preventDefault();
    onApply(task._id, applicationData);
    setShowApplicationForm(false);
    setApplicationData({ message: '', proposedCredits: task.credits });
  };

  const canApply = showApplyButton && 
    task.status === 'open' && 
    !task.userApplicationStatus;

  const userHasApplied = task.userApplicationStatus;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-1">
        <h3>{task.title}</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span 
            className="badge" 
            style={{ backgroundColor: getUrgencyColor(task.urgency) }}
          >
            {task.urgency}
          </span>
          <span 
            className="badge" 
            style={{ backgroundColor: getStatusColor(task.status) }}
          >
            {task.status}
          </span>
          <span className="badge">{task.credits} credits</span>
        </div>
      </div>
      
      <div className="mb-1">
        <strong>Description:</strong> {task.description}
      </div>
      
      <div className="mb-1">
        <strong>Posted by:</strong> {task.taskProviderId.username}
        <span className="rating ml-1">
          ★ {task.taskProviderId.rating ? task.taskProviderId.rating.toFixed(1) : 'No rating'}
        </span>
        {task.taskProviderId.isOnline && (
          <span style={{ color: '#28a745', fontSize: '0.8rem' }}> • Online</span>
        )}
      </div>
      
      <div className="mb-1">
        <strong>Scheduled time:</strong> {formatDate(task.dateTime)}
      </div>
      
      <div className="mb-1">
        <strong>Duration:</strong> {task.duration} minutes
      </div>
      
      {task.skillsRequired && task.skillsRequired.length > 0 && (
        <div className="mb-1">
          <strong>Skills needed:</strong>
          <br />
          {task.skillsRequired.map((skill, index) => (
            <span key={index} className="badge">
              {skill}
            </span>
          ))}
        </div>
      )}

      {task.selectedHelper && (
        <div className="mb-1">
          <strong>Assigned to:</strong> {task.selectedHelper.username}
        </div>
      )}

      {task.applicantCount !== undefined && (
        <div className="mb-1">
          <strong>Applications received:</strong> {task.applicantCount}
        </div>
      )}
      
      <div className="flex gap-1">
        {canApply && (
          <button 
            onClick={() => setShowApplicationForm(!showApplicationForm)} 
            className="btn btn-success"
          >
            Apply for Task
          </button>
        )}

        {userHasApplied && (
          <span className="badge" style={{ 
            backgroundColor: task.userApplicationStatus === 'accepted' ? '#28a745' : 
                           task.userApplicationStatus === 'rejected' ? '#dc3545' : '#ffc107'
          }}>
            Application {task.userApplicationStatus}
          </span>
        )}
        
        {showEditDelete && task.status === 'open' && (
          <>
            <button 
              onClick={() => onEdit(task._id)} 
              className="btn btn-secondary"
            >
              Edit
            </button>
            <button 
              onClick={() => onDelete(task._id)} 
              className="btn btn-danger"
            >
              Delete
            </button>
          </>
        )}

        {showViewApplications && (
          <button 
            onClick={() => onViewApplications(task)} 
            className="btn btn-secondary"
          >
            View Applications ({task.applicants?.length || 0})
          </button>
        )}
        
        {!canApply && !userHasApplied && task.status !== 'open' && (
          <span style={{ color: '#6c757d' }}>
            {task.status === 'assigned' ? 'Task Assigned' : 
             task.status === 'completed' ? 'Task Completed' :
             task.status === 'cancelled' ? 'Task Cancelled' : 'Task Closed'}
          </span>
        )}
      </div>

      {/* Application Form */}
      {showApplicationForm && (
        <form onSubmit={handleSubmitApplication} style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          border: '1px solid #ddd', 
          borderRadius: '4px' 
        }}>
          <h5>Apply for this Task</h5>
          
          <div className="form-group">
            <label>Why are you the right person for this task?</label>
            <textarea
              value={applicationData.message}
              onChange={(e) => setApplicationData({ 
                ...applicationData, 
                message: e.target.value 
              })}
              placeholder="Explain your relevant experience and why you'd like to help..."
              required
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Proposed Credits:</label>
            <input
              type="number"
              value={applicationData.proposedCredits}
              onChange={(e) => setApplicationData({ 
                ...applicationData, 
                proposedCredits: e.target.value 
              })}
              min="1"
              max={task.credits}
              required
            />
            <small style={{ color: '#666' }}>
              Task provider offered {task.credits} credits
            </small>
          </div>

          <div className="flex gap-1">
            <button type="submit" className="btn btn-success">
              Submit Application
            </button>
            <button 
              type="button" 
              onClick={() => setShowApplicationForm(false)}
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

export default TaskCard;