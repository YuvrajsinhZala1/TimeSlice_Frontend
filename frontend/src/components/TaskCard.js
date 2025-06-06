import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TaskCard = ({ 
  task, 
  onApply, 
  showApplyButton = true, 
  viewMode = 'card',
  showApplicationStatus = false,
  isBooking = false,
  onStatusUpdate
}) => {
  const { currentUser } = useAuth();
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    proposal: '',
    proposedCredits: task?.credits || '',
    timeline: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B', 
      high: '#EF4444'
    };
    return colors[urgency] || '#6B7280';
  };

  const getUrgencyIcon = (urgency) => {
    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🔴'
    };
    return icons[urgency] || '⚪';
  };

  const calculateMatchScore = () => {
    if (!currentUser?.skills || !task?.skillsRequired) return 0;
    
    let matches = 0;
    task.skillsRequired.forEach(skill => {
      if (currentUser.skills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )) {
        matches++;
      }
    });
    
    return Math.round((matches / task.skillsRequired.length) * 100);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onApply(task._id, applicationData);
      setShowApplicationModal(false);
      setApplicationData({
        proposal: '',
        proposedCredits: task.credits,
        timeline: '',
        experience: ''
      });
    } catch (error) {
      console.error('Error applying to task:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDeadlineApproaching = () => {
    if (!task?.dateTime) return false;
    const deadline = new Date(task.dateTime);
    const now = new Date();
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    return daysLeft <= 3 && daysLeft >= 0;
  };

  const isOverdue = () => {
    if (!task?.dateTime) return false;
    return new Date(task.dateTime) < new Date();
  };

  const matchScore = calculateMatchScore();
  const hasApplied = task?.userApplicationStatus;
  const deadlineApproaching = isDeadlineApproaching();
  const overdue = isOverdue();

  const ApplicationModal = () => (
    <div className="modal-overlay" onClick={() => setShowApplicationModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🚀 Apply for Project</h3>
          <button 
            onClick={() => setShowApplicationModal(false)}
            className="modal-close"
          >
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          <div className="project-summary">
            <h4>{task.title}</h4>
            <div className="summary-meta">
              <span className="credits">💰 {task.credits} credits</span>
              <span className="urgency" style={{ color: getUrgencyColor(task.urgency) }}>
                {getUrgencyIcon(task.urgency)} {task.urgency} priority
              </span>
            </div>
          </div>
          
          <form onSubmit={handleApplySubmit}>
            <div className="form-group">
              <label>💬 Your Proposal *</label>
              <textarea
                value={applicationData.proposal}
                onChange={(e) => setApplicationData(prev => ({ ...prev, proposal: e.target.value }))}
                placeholder="Explain why you're the perfect fit for this project. Highlight your relevant experience and approach..."
                rows="5"
                required
                className="form-input"
              />
              <small>Be specific about how you'll tackle this project</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>💰 Your Quote (Credits)</label>
                <input
                  type="number"
                  value={applicationData.proposedCredits}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, proposedCredits: e.target.value }))}
                  min="1"
                  max={task.credits}
                  placeholder={task.credits}
                  className="form-input"
                />
                <small>Max: {task.credits} credits</small>
              </div>
              
              <div className="form-group">
                <label>⏰ Timeline</label>
                <input
                  type="text"
                  value={applicationData.timeline}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, timeline: e.target.value }))}
                  placeholder="e.g., 3-5 days"
                  className="form-input"
                />
                <small>When can you complete this?</small>
              </div>
            </div>

            <div className="form-group">
              <label>🏆 Relevant Experience</label>
              <textarea
                value={applicationData.experience}
                onChange={(e) => setApplicationData(prev => ({ ...prev, experience: e.target.value }))}
                placeholder="Describe your relevant experience, past projects, or skills that make you qualified..."
                rows="3"
                className="form-input"
              />
              <small>Help the client understand your expertise</small>
            </div>

            {matchScore > 0 && (
              <div className="match-info">
                <span className="match-icon">🎯</span>
                <span className="match-text">{matchScore}% skill match</span>
              </div>
            )}

            <div className="modal-footer">
              <button 
                type="button"
                onClick={() => setShowApplicationModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading || !applicationData.proposal.trim()}
                className="btn btn-primary"
              >
                {loading ? '⏳ Applying...' : '🚀 Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <>
        <div className={`task-card-list ${deadlineApproaching ? 'deadline-warning' : ''} ${overdue ? 'overdue' : ''}`}>
          <div className="list-main-content">
            <div className="list-header">
              <div className="task-meta">
                <h3 className="task-title">
                  <Link to={`/tasks/${task._id}`}>{task.title}</Link>
                </h3>
                <div className="task-badges">
                  <span 
                    className="urgency-badge"
                    style={{ '--urgency-color': getUrgencyColor(task.urgency) }}
                  >
                    {getUrgencyIcon(task.urgency)} {task.urgency}
                  </span>
                  {matchScore > 0 && (
                    <span className="match-badge">🎯 {matchScore}% match</span>
                  )}
                  {deadlineApproaching && (
                    <span className="deadline-badge">⚠️ Due soon</span>
                  )}
                </div>
              </div>
              
              <div className="task-value">
                <div className="credits-display">
                  <span className="credits-amount">{task.credits}</span>
                  <span className="credits-label">credits</span>
                </div>
                <div className="estimated-value">
                  ≈ ${Math.round(task.credits * 5)} USD
                </div>
              </div>
            </div>

            <div className="list-content">
              <p className="task-description">
                {task.description.length > 150 
                  ? `${task.description.substring(0, 150)}...` 
                  : task.description}
              </p>
              
              <div className="task-details">
                <div className="detail-group">
                  <span className="detail-label">Skills:</span>
                  <div className="skills-inline">
                    {task.skillsRequired.slice(0, 4).map(skill => (
                      <span key={skill} className="skill-chip">{skill}</span>
                    ))}
                    {task.skillsRequired.length > 4 && (
                      <span className="skill-more">+{task.skillsRequired.length - 4}</span>
                    )}
                  </div>
                </div>
                
                <div className="detail-group">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{task.duration || 'Flexible'}</span>
                </div>
                
                {task.dateTime && (
                  <div className="detail-group">
                    <span className="detail-label">Deadline:</span>
                    <span className={`detail-value ${overdue ? 'overdue' : deadlineApproaching ? 'warning' : ''}`}>
                      {new Date(task.dateTime).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="list-actions">
            <div className="task-posted">
              Posted {formatTimeAgo(task.createdAt)}
            </div>
            
            {showApplicationStatus && hasApplied && (
              <div className={`application-status status-${hasApplied}`}>
                {hasApplied === 'pending' && '⏳ Applied'}
                {hasApplied === 'accepted' && '✅ Accepted'}
                {hasApplied === 'rejected' && '❌ Rejected'}
              </div>
            )}
            
            {showApplyButton && !hasApplied && (
              <button
                onClick={() => setShowApplicationModal(true)}
                className="btn btn-primary"
              >
                🚀 Apply Now
              </button>
            )}
          </div>
        </div>
        
        {showApplicationModal && <ApplicationModal />}
      </>
    );
  }

  return (
    <>
      <div className={`task-card ${deadlineApproaching ? 'deadline-warning' : ''} ${overdue ? 'overdue' : ''}`}>
        {/* Card Header */}
        <div className="card-header">
          <div className="header-badges">
            <span 
              className="urgency-badge"
              style={{ '--urgency-color': getUrgencyColor(task.urgency) }}
            >
              {getUrgencyIcon(task.urgency)} {task.urgency}
            </span>
            
            {matchScore > 0 && (
              <span className="match-badge">🎯 {matchScore}%</span>
            )}
            
            {deadlineApproaching && (
              <span className="deadline-badge">⚠️ Due soon</span>
            )}
            
            {overdue && (
              <span className="overdue-badge">🚨 Overdue</span>
            )}
          </div>
          
          <div className="posted-time">
            {formatTimeAgo(task.createdAt)}
          </div>
        </div>

        {/* Card Content */}
        <div className="card-content">
          <h3 className="task-title">
            <Link to={`/tasks/${task._id}`}>{task.title}</Link>
          </h3>
          
          <p className="task-description">
            {task.description.length > 120 
              ? `${task.description.substring(0, 120)}...` 
              : task.description}
          </p>

          <div className="task-skills">
            {task.skillsRequired.slice(0, 5).map(skill => (
              <span key={skill} className="skill-tag">{skill}</span>
            ))}
            {task.skillsRequired.length > 5 && (
              <span className="skill-more">+{task.skillsRequired.length - 5}</span>
            )}
          </div>

          <div className="task-meta-info">
            <div className="meta-item">
              <span className="meta-icon">⏱️</span>
              <span className="meta-text">{task.duration || 'Flexible timeline'}</span>
            </div>
            
            {task.dateTime && (
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <span className={`meta-text ${overdue ? 'overdue' : deadlineApproaching ? 'warning' : ''}`}>
                  Due {new Date(task.dateTime).toLocaleDateString()}
                </span>
              </div>
            )}
            
            <div className="meta-item">
              <span className="meta-icon">👤</span>
              <span className="meta-text">{task.taskProvider?.username || 'Client'}</span>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="card-footer">
          <div className="credits-section">
            <div className="credits-main">
              <span className="credits-amount">{task.credits}</span>
              <span className="credits-label">credits</span>
            </div>
            <div className="credits-usd">
              ≈ ${Math.round(task.credits * 5)} USD
            </div>
          </div>

          <div className="card-actions">
            {showApplicationStatus && hasApplied && (
              <div className={`application-status status-${hasApplied}`}>
                {hasApplied === 'pending' && (
                  <>
                    <span className="status-icon">⏳</span>
                    <span>Applied</span>
                  </>
                )}
                {hasApplied === 'accepted' && (
                  <>
                    <span className="status-icon">✅</span>
                    <span>Accepted</span>
                  </>
                )}
                {hasApplied === 'rejected' && (
                  <>
                    <span className="status-icon">❌</span>
                    <span>Rejected</span>
                  </>
                )}
              </div>
            )}
            
            {showApplyButton && !hasApplied && (
              <button
                onClick={() => setShowApplicationModal(true)}
                className="apply-btn"
              >
                <span className="btn-icon">🚀</span>
                <span className="btn-text">Apply</span>
              </button>
            )}
            
            <Link 
              to={`/tasks/${task._id}`}
              className="view-btn"
            >
              <span className="btn-icon">👁️</span>
              <span className="btn-text">View</span>
            </Link>
          </div>
        </div>
      </div>
      
      {showApplicationModal && <ApplicationModal />}

      <style jsx>{`
        .task-card {
          background: var(--bg-card);
          border: 2px solid var(--border-primary);
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .task-card:hover {
          border-color: var(--border-accent);
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }

        .task-card.deadline-warning {
          border-color: var(--warning);
          background: rgba(245, 158, 11, 0.05);
        }

        .task-card.overdue {
          border-color: var(--error);
          background: rgba(239, 68, 68, 0.05);
        }

        .task-card-list {
          background: var(--bg-card);
          border: 2px solid var(--border-primary);
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .task-card-list:hover {
          border-color: var(--border-accent);
          box-shadow: var(--shadow-md);
        }

        .task-card-list.deadline-warning {
          border-color: var(--warning);
          background: rgba(245, 158, 11, 0.05);
        }

        .task-card-list.overdue {
          border-color: var(--error);
          background: rgba(239, 68, 68, 0.05);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .header-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .urgency-badge {
          background: color-mix(in srgb, var(--urgency-color) 15%, transparent);
          color: var(--urgency-color);
          border: 1px solid color-mix(in srgb, var(--urgency-color) 30%, transparent);
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .match-badge {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .deadline-badge {
          background: rgba(245, 158, 11, 0.15);
          color: var(--warning);
          border: 1px solid rgba(245, 158, 11, 0.3);
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .overdue-badge {
          background: rgba(239, 68, 68, 0.15);
          color: var(--error);
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .posted-time {
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 600;
        }

        .card-content {
          margin-bottom: 1.5rem;
        }

        .task-title {
          margin-bottom: 1rem;
        }

        .task-title a {
          color: var(--text-primary);
          text-decoration: none;
          font-size: 1.2rem;
          font-weight: 700;
          line-height: 1.4;
          transition: all 0.3s ease;
        }

        .task-title a:hover {
          color: var(--primary-cyan);
        }

        .task-description {
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .task-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .skill-tag {
          background: rgba(0, 212, 255, 0.15);
          color: var(--primary-cyan);
          border: 1px solid rgba(0, 212, 255, 0.3);
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .skill-more {
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
        }

        .task-meta-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .meta-icon {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .meta-text {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .meta-text.warning {
          color: var(--warning);
          font-weight: 600;
        }

        .meta-text.overdue {
          color: var(--error);
          font-weight: 600;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border-primary);
        }

        .credits-section {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .credits-main {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .credits-amount {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--primary-cyan);
        }

        .credits-label {
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 600;
        }

        .credits-usd {
          color: var(--text-secondary);
          font-size: 0.8rem;
        }

        .card-actions {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .apply-btn,
        .view-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
          border: none;
          cursor: pointer;
        }

        .apply-btn {
          background: var(--primary-gradient);
          color: white;
          box-shadow: var(--shadow-sm);
        }

        .apply-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .view-btn {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-muted);
        }

        .view-btn:hover {
          background: var(--bg-input);
          border-color: var(--border-accent);
        }

        .btn-icon {
          font-size: 1rem;
        }

        .application-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 1rem;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-pending {
          background: rgba(245, 158, 11, 0.15);
          color: var(--warning);
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .status-accepted {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-rejected {
          background: rgba(239, 68, 68, 0.15);
          color: var(--error);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        /* List View Styles */
        .list-main-content {
          flex: 1;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 2rem;
        }

        .task-meta {
          flex: 1;
        }

        .task-badges {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }

        .task-value {
          text-align: right;
          flex-shrink: 0;
        }

        .list-content {
          margin-bottom: 1rem;
        }

        .task-details {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        .detail-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .detail-label {
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 600;
        }

        .detail-value {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .skills-inline {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .skill-chip {
          background: rgba(0, 212, 255, 0.15);
          color: var(--primary-cyan);
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .list-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1rem;
          flex-shrink: 0;
        }

        .task-posted {
          color: var(--text-muted);
          font-size: 0.8rem;
          text-align: right;
        }

        /* Modal Styles */
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
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: var(--bg-card);
          border-radius: 1rem;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          border: 1px solid var(--border-primary);
          box-shadow: var(--shadow-xl);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 2rem 1rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .modal-header h3 {
          color: var(--text-primary);
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1.5rem;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.3s ease;
        }

        .modal-close:hover {
          background: var(--bg-tertiary);
        }

        .modal-body {
          padding: 2rem;
        }

        .project-summary {
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid var(--border-primary);
          margin-bottom: 2rem;
        }

        .project-summary h4 {
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .summary-meta {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .credits {
          color: var(--primary-cyan);
          font-weight: 700;
        }

        .urgency {
          font-weight: 600;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          color: var(--text-primary);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .form-input {
          width: 100%;
          padding: 1rem;
          background: var(--bg-input);
          border: 2px solid var(--border-primary);
          border-radius: 0.75rem;
          color: var(--text-primary);
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
          transition: all 0.3s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--border-accent);
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
        }

        .form-input::placeholder {
          color: var(--text-muted);
        }

        .form-group small {
          color: var(--text-muted);
          font-size: 0.8rem;
          margin-top: 0.25rem;
          display: block;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .match-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(16, 185, 129, 0.1);
          color: var(--success);
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(16, 185, 129, 0.3);
          margin-bottom: 1.5rem;
        }

        .match-icon {
          font-size: 1.2rem;
        }

        .match-text {
          font-weight: 600;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-primary);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          border: none;
          border-radius: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .btn-primary {
          background: var(--primary-gradient);
          color: white;
          box-shadow: var(--shadow-sm);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-muted);
        }

        .btn-secondary:hover {
          background: var(--bg-input);
          border-color: var(--border-accent);
        }

        @media (max-width: 768px) {
          .task-card {
            padding: 1rem;
          }

          .task-card-list {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .list-header {
            flex-direction: column;
            gap: 1rem;
          }

          .task-value {
            text-align: left;
          }

          .task-details {
            flex-direction: column;
            gap: 0.5rem;
          }

          .list-actions {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }

          .card-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .card-actions {
            justify-content: center;
          }

          .apply-btn,
          .view-btn {
            flex: 1;
            justify-content: center;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .summary-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .modal-content {
            width: 95%;
          }

          .modal-header,
          .modal-body {
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default TaskCard;