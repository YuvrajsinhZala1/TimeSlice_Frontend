import React, { useState } from 'react';
import { formatDuration } from '../utils/durationUtils';

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
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  const getUrgencyConfig = (urgency) => {
    switch (urgency) {
      case 'high': 
        return { 
          color: 'var(--error)', 
          bg: 'rgba(239, 68, 68, 0.15)', 
          icon: '🔴', 
          label: 'Urgent',
          border: 'rgba(239, 68, 68, 0.3)'
        };
      case 'medium': 
        return { 
          color: 'var(--warning)', 
          bg: 'rgba(245, 158, 11, 0.15)', 
          icon: '🟡', 
          label: 'Normal',
          border: 'rgba(245, 158, 11, 0.3)'
        };
      case 'low': 
        return { 
          color: 'var(--success)', 
          bg: 'rgba(16, 185, 129, 0.15)', 
          icon: '🟢', 
          label: 'Flexible',
          border: 'rgba(16, 185, 129, 0.3)'
        };
      default: 
        return { 
          color: 'var(--text-muted)', 
          bg: 'var(--bg-tertiary)', 
          icon: '⚪', 
          label: 'Standard',
          border: 'var(--border-muted)'
        };
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'open': 
        return { 
          color: 'var(--success)', 
          bg: 'rgba(16, 185, 129, 0.15)', 
          label: 'Open',
          border: 'rgba(16, 185, 129, 0.3)'
        };
      case 'in-review': 
        return { 
          color: 'var(--warning)', 
          bg: 'rgba(245, 158, 11, 0.15)', 
          label: 'In Review',
          border: 'rgba(245, 158, 11, 0.3)'
        };
      case 'assigned': 
        return { 
          color: 'var(--info)', 
          bg: 'rgba(59, 130, 246, 0.15)', 
          label: 'Assigned',
          border: 'rgba(59, 130, 246, 0.3)'
        };
      case 'in-progress': 
        return { 
          color: '#8B5CF6', 
          bg: 'rgba(139, 92, 246, 0.15)', 
          label: 'In Progress',
          border: 'rgba(139, 92, 246, 0.3)'
        };
      case 'completed': 
        return { 
          color: 'var(--text-muted)', 
          bg: 'var(--bg-tertiary)', 
          label: 'Completed',
          border: 'var(--border-muted)'
        };
      case 'cancelled': 
        return { 
          color: 'var(--error)', 
          bg: 'rgba(239, 68, 68, 0.15)', 
          label: 'Cancelled',
          border: 'rgba(239, 68, 68, 0.3)'
        };
      default: 
        return { 
          color: 'var(--text-muted)', 
          bg: 'var(--bg-tertiary)', 
          label: status,
          border: 'var(--border-muted)'
        };
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
  const urgencyConfig = getUrgencyConfig(task.urgency);
  const statusConfig = getStatusConfig(task.status);

  return (
    <div className="card" style={{
      position: 'relative',
      overflow: 'hidden',
      transition: 'all var(--transition-normal)'
    }}>
      {/* Top Border Accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: task.status === 'open' ? 'var(--primary-gradient)' : 'var(--border-muted)',
        opacity: task.status === 'open' ? 1 : 0.5
      }}></div>

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 'var(--space-lg)'
      }}>
        <h3 style={{ 
          color: 'var(--text-primary)',
          fontSize: '1.3rem',
          fontWeight: '700',
          margin: 0,
          lineHeight: '1.4',
          flex: 1,
          marginRight: 'var(--space-lg)'
        }}>
          {task.title}
        </h3>
        
        <div style={{ 
          display: 'flex', 
          gap: 'var(--space-sm)', 
          alignItems: 'center',
          flexShrink: 0
        }}>
          {/* Urgency Badge */}
          <div style={{
            background: urgencyConfig.bg,
            color: urgencyConfig.color,
            padding: 'var(--space-xs) var(--space-md)',
            borderRadius: 'var(--radius-xl)',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
            border: `1px solid ${urgencyConfig.border}`
          }}>
            <span>{urgencyConfig.icon}</span>
            {urgencyConfig.label}
          </div>
          
          {/* Status Badge */}
          <div style={{
            background: statusConfig.bg,
            color: statusConfig.color,
            padding: 'var(--space-xs) var(--space-md)',
            borderRadius: 'var(--radius-xl)',
            fontSize: '0.8rem',
            fontWeight: '600',
            border: `1px solid ${statusConfig.border}`
          }}>
            {statusConfig.label}
          </div>
        </div>
      </div>
      
      {/* Task Description */}
      <p style={{ 
        color: 'var(--text-secondary)',
        lineHeight: '1.6',
        marginBottom: 'var(--space-lg)',
        fontSize: '0.95rem'
      }}>
        {task.description.length > 150 
          ? `${task.description.substring(0, 150)}...` 
          : task.description
        }
      </p>
      
      {/* Task Details Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: 'var(--space-lg)',
        marginBottom: 'var(--space-lg)',
        padding: 'var(--space-lg)',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-primary)'
      }}>
        <div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 'var(--space-xs)'
          }}>
            Posted By
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-sm)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              {task.taskProviderId.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {task.taskProviderId.username}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)'
              }}>
                ⭐ {task.taskProviderId.rating ? task.taskProviderId.rating.toFixed(1) : 'New'}
                {task.taskProviderId.isOnline && (
                  <span style={{ color: 'var(--success)' }}>● Online</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 'var(--space-xs)'
          }}>
            Credits Offered
          </div>
          <div style={{ 
            fontSize: '1.8rem', 
            fontWeight: '800',
            background: 'var(--primary-gradient)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {task.credits}
          </div>
        </div>
        
        <div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 'var(--space-xs)'
          }}>
            Duration
          </div>
          <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {formatDuration(task.duration)}
          </div>
        </div>
        
        <div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 'var(--space-xs)'
          }}>
            Start Date
          </div>
          <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {formatDate(task.dateTime)}
          </div>
        </div>
      </div>
      
      {/* Skills Required */}
      {task.skillsRequired && task.skillsRequired.length > 0 && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ 
            fontSize: '0.75rem', 
            color: 'var(--text-muted)', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 'var(--space-sm)'
          }}>
            Skills Required
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            {task.skillsRequired.map((skill, index) => (
              <span key={index} className="badge badge-primary">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      {task.selectedHelper && (
        <div style={{ 
          marginBottom: 'var(--space-lg)',
          padding: 'var(--space-md)',
          background: 'rgba(59, 130, 246, 0.15)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <strong style={{ color: 'var(--info)' }}>Assigned to:</strong> {task.selectedHelper.username}
        </div>
      )}

      {task.applicantCount !== undefined && task.status === 'open' && (
        <div style={{ 
          marginBottom: 'var(--space-lg)',
          padding: 'var(--space-md)',
          background: 'rgba(16, 185, 129, 0.15)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)'
        }}>
          <span style={{ fontSize: '1.2rem' }}>📥</span>
          <strong style={{ color: 'var(--success)' }}>
            {task.applicantCount} application{task.applicantCount !== 1 ? 's' : ''} received
          </strong>
        </div>
      )}

      {/* Task Status Indicators */}
      {task.completedByHelper && task.status === 'in-progress' && (
        <div style={{ 
          marginBottom: 'var(--space-lg)',
          padding: 'var(--space-lg)',
          background: 'rgba(245, 158, 11, 0.15)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-sm)',
            marginBottom: 'var(--space-sm)'
          }}>
            <span style={{ fontSize: '1.5rem' }}>✅</span>
            <strong style={{ color: 'var(--warning)' }}>Work Submitted by Helper</strong>
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: '0.9rem',
            color: 'var(--warning)'
          }}>
            Awaiting task provider review and completion confirmation
          </p>
        </div>
      )}
      
      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--space-md)',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {canApply && (
          <button 
            onClick={() => setShowApplicationForm(!showApplicationForm)} 
            className="btn btn-primary"
            style={{
              background: 'var(--primary-gradient)',
              border: 'none',
              padding: 'var(--space-md) var(--space-xl)',
              borderRadius: 'var(--radius-md)',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <span>🚀</span>
            Apply for Task
          </button>
        )}

        {userHasApplied && (
          <div className={`badge badge-${
            task.userApplicationStatus === 'accepted' ? 'success' : 
            task.userApplicationStatus === 'rejected' ? 'error' : 'warning'
          }`} style={{
            padding: 'var(--space-md) var(--space-lg)',
            fontSize: '0.9rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)'
          }}>
            <span>
              {task.userApplicationStatus === 'accepted' ? '✅' : 
               task.userApplicationStatus === 'rejected' ? '❌' : '⏳'}
            </span>
            Application {task.userApplicationStatus}
          </div>
        )}
        
        {showEditDelete && task.status === 'open' && (
          <>
            <button 
              onClick={() => onEdit(task._id)} 
              className="btn btn-secondary"
            >
              ✏️ Edit
            </button>
            <button 
              onClick={() => onDelete(task._id)} 
              className="btn btn-danger"
            >
              🗑️ Delete
            </button>
          </>
        )}

        {showViewApplications && (
          <button 
            onClick={() => onViewApplications(task)} 
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)'
            }}
          >
            📥 View Applications ({task.applicants?.length || 0})
          </button>
        )}
        
        {!canApply && !userHasApplied && task.status !== 'open' && (
          <div style={{ 
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            fontStyle: 'italic',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)'
          }}>
            <span>
              {task.status === 'assigned' ? '👤' : 
               task.status === 'in-progress' ? '🚀' :
               task.status === 'completed' ? '✅' :
               task.status === 'cancelled' ? '❌' : '🔒'}
            </span>
            {task.status === 'assigned' ? 'Task Assigned' : 
             task.status === 'in-progress' ? 'Task In Progress' :
             task.status === 'completed' ? 'Task Completed' :
             task.status === 'cancelled' ? 'Task Cancelled' : 'Task Closed'}
          </div>
        )}
      </div>

      {/* Application Form */}
      {showApplicationForm && (
        <div style={{ 
          marginTop: 'var(--space-xl)', 
          padding: 'var(--space-xl)', 
          background: 'rgba(0, 212, 255, 0.1)', 
          borderRadius: 'var(--radius-lg)',
          border: '2px solid rgba(0, 212, 255, 0.3)'
        }}>
          <h4 style={{ 
            marginBottom: 'var(--space-lg)',
            color: 'var(--primary-cyan)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            fontSize: '1.2rem',
            fontWeight: '700'
          }}>
            🚀 Apply for this Task
          </h4>
          
          <form onSubmit={handleSubmitApplication}>
            <div className="form-group">
              <label style={{
                display: 'block',
                marginBottom: 'var(--space-sm)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}>
                Why are you the perfect fit for this task?
              </label>
              <textarea
                value={applicationData.message}
                onChange={(e) => setApplicationData({ 
                  ...applicationData, 
                  message: e.target.value 
                })}
                placeholder="Share your relevant experience, approach to this task, and why you're excited to help. Be specific about how you'll deliver value..."
                required
                rows="4"
                style={{
                  width: '100%',
                  padding: 'var(--space-md)',
                  background: 'var(--bg-input)',
                  border: '2px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color var(--transition-normal)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--border-accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
              />
            </div>

            <div className="form-group">
              <label style={{
                display: 'block',
                marginBottom: 'var(--space-sm)',
                fontWeight: '600',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}>
                Proposed Credits:
              </label>
              <input
                type="number"
                value={applicationData.proposedCredits}
                onChange={(e) => setApplicationData({ 
                  ...applicationData, 
                  proposedCredits: e.target.value 
                })}
                min="1"
                max={task.credits * 1.5}
                required
                style={{
                  width: '100%',
                  padding: 'var(--space-md)',
                  background: 'var(--bg-input)',
                  border: '2px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color var(--transition-normal)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--border-accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
              />
              <div style={{ 
                fontSize: '0.8rem', 
                color: 'var(--text-secondary)',
                marginTop: 'var(--space-xs)'
              }}>
                Client offered {task.credits} credits (you can propose up to {Math.floor(task.credits * 1.5)})
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{
                  background: 'var(--primary-gradient)',
                  border: 'none',
                  fontWeight: '700'
                }}
              >
                🚀 Submit Application
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
        </div>
      )}
    </div>
  );
};

export default TaskCard;