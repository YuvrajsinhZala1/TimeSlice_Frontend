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
          color: '#EF4444', 
          bg: '#FEF2F2', 
          icon: '🔴', 
          label: 'Urgent' 
        };
      case 'medium': 
        return { 
          color: '#F59E0B', 
          bg: '#FFFBEB', 
          icon: '🟡', 
          label: 'Normal' 
        };
      case 'low': 
        return { 
          color: '#10B981', 
          bg: '#F0FDF4', 
          icon: '🟢', 
          label: 'Flexible' 
        };
      default: 
        return { 
          color: '#6B7280', 
          bg: '#F9FAFB', 
          icon: '⚪', 
          label: 'Standard' 
        };
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'open': 
        return { 
          color: '#10B981', 
          bg: '#D1FAE5', 
          label: 'Open' 
        };
      case 'in-review': 
        return { 
          color: '#F59E0B', 
          bg: '#FEF3C7', 
          label: 'In Review' 
        };
      case 'assigned': 
        return { 
          color: '#3B82F6', 
          bg: '#DBEAFE', 
          label: 'Assigned' 
        };
      case 'in-progress': 
        return { 
          color: '#8B5CF6', 
          bg: '#EDE9FE', 
          label: 'In Progress' 
        };
      case 'completed': 
        return { 
          color: '#6B7280', 
          bg: '#F3F4F6', 
          label: 'Completed' 
        };
      case 'cancelled': 
        return { 
          color: '#EF4444', 
          bg: '#FEF2F2', 
          label: 'Cancelled' 
        };
      default: 
        return { 
          color: '#6B7280', 
          bg: '#F9FAFB', 
          label: status 
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
    <div style={{
      background: 'white',
      borderRadius: '1rem',
      padding: '1.5rem',
      border: '1px solid #E5E7EB',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      e.currentTarget.style.borderColor = '#00D4FF';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = '#E5E7EB';
    }}>
      {/* Top Border Accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
        opacity: task.status === 'open' ? 1 : 0.5
      }}></div>

      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <h3 style={{ 
          color: '#1F2937',
          fontSize: '1.2rem',
          fontWeight: '700',
          margin: 0,
          lineHeight: '1.4',
          flex: 1,
          marginRight: '1rem'
        }}>
          {task.title}
        </h3>
        
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          alignItems: 'center',
          flexShrink: 0
        }}>
          {/* Urgency Badge */}
          <div style={{
            background: urgencyConfig.bg,
            color: urgencyConfig.color,
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <span>{urgencyConfig.icon}</span>
            {urgencyConfig.label}
          </div>
          
          {/* Status Badge */}
          <div style={{
            background: statusConfig.bg,
            color: statusConfig.color,
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            {statusConfig.label}
          </div>
        </div>
      </div>
      
      {/* Task Description */}
      <p style={{ 
        color: '#4B5563',
        lineHeight: '1.6',
        marginBottom: '1rem',
        fontSize: '0.9rem'
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
        gap: '1rem',
        marginBottom: '1rem',
        padding: '1rem',
        background: '#F9FAFB',
        borderRadius: '0.75rem'
      }}>
        <div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: '#6B7280', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.25rem'
          }}>
            Posted By
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
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
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                {task.taskProviderId.username}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                ⭐ {task.taskProviderId.rating ? task.taskProviderId.rating.toFixed(1) : 'New'}
                {task.taskProviderId.isOnline && (
                  <span style={{ color: '#10B981' }}>● Online</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: '#6B7280', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.25rem'
          }}>
            Credits Offered
          </div>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
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
            color: '#6B7280', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.25rem'
          }}>
            Duration
          </div>
          <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
            {formatDuration(task.duration)}
          </div>
        </div>
        
        <div>
          <div style={{ 
            fontSize: '0.75rem', 
            color: '#6B7280', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.25rem'
          }}>
            Start Date
          </div>
          <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>
            {formatDate(task.dateTime)}
          </div>
        </div>
      </div>
      
      {/* Skills Required */}
      {task.skillsRequired && task.skillsRequired.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ 
            fontSize: '0.75rem', 
            color: '#6B7280', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem'
          }}>
            Skills Required
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {task.skillsRequired.map((skill, index) => (
              <span key={index} style={{
                background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 53, 0.1))',
                color: '#1F2937',
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                fontSize: '0.8rem',
                fontWeight: '500',
                border: '1px solid rgba(0, 212, 255, 0.2)'
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      {task.selectedHelper && (
        <div style={{ 
          marginBottom: '1rem',
          padding: '0.75rem',
          background: '#EBF8FF',
          borderRadius: '0.5rem',
          border: '1px solid #BEE3F8'
        }}>
          <strong style={{ color: '#2B6CB0' }}>Assigned to:</strong> {task.selectedHelper.username}
        </div>
      )}

      {task.applicantCount !== undefined && task.status === 'open' && (
        <div style={{ 
          marginBottom: '1rem',
          padding: '0.75rem',
          background: '#F0FDF4',
          borderRadius: '0.5rem',
          border: '1px solid #BBF7D0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1rem' }}>📥</span>
          <strong style={{ color: '#166534' }}>
            {task.applicantCount} application{task.applicantCount !== 1 ? 's' : ''} received
          </strong>
        </div>
      )}

      {/* Task Status Indicators */}
      {task.completedByHelper && task.status === 'in-progress' && (
        <div style={{ 
          marginBottom: '1rem',
          padding: '1rem',
          background: '#FEF3C7',
          borderRadius: '0.75rem',
          border: '1px solid #F59E0B'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '0.25rem'
          }}>
            <span style={{ fontSize: '1.2rem' }}>✅</span>
            <strong style={{ color: '#92400E' }}>Work Submitted by Helper</strong>
          </div>
          <p style={{ 
            margin: 0, 
            fontSize: '0.9rem',
            color: '#92400E'
          }}>
            Awaiting task provider review and completion confirmation
          </p>
        </div>
      )}
      
      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '0.75rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {canApply && (
          <button 
            onClick={() => setShowApplicationForm(!showApplicationForm)} 
            style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <span>🚀</span>
            Apply for Task
          </button>
        )}

        {userHasApplied && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            background: task.userApplicationStatus === 'accepted' ? '#D1FAE5' : 
                       task.userApplicationStatus === 'rejected' ? '#FEF2F2' : '#FEF3C7',
            color: task.userApplicationStatus === 'accepted' ? '#065F46' : 
                   task.userApplicationStatus === 'rejected' ? '#991B1B' : '#92400E',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
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
              style={{
                background: '#F3F4F6',
                color: '#4B5563',
                border: '1px solid #D1D5DB',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              ✏️ Edit
            </button>
            <button 
              onClick={() => onDelete(task._id)} 
              style={{
                background: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FECACA',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              🗑️ Delete
            </button>
          </>
        )}

        {showViewApplications && (
          <button 
            onClick={() => onViewApplications(task)} 
            style={{
              background: '#EBF8FF',
              color: '#2B6CB0',
              border: '1px solid #BEE3F8',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            📥 View Applications ({task.applicants?.length || 0})
          </button>
        )}
        
        {!canApply && !userHasApplied && task.status !== 'open' && (
          <div style={{ 
            color: '#6B7280',
            fontSize: '0.9rem',
            fontStyle: 'italic',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
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
          marginTop: '1.5rem', 
          padding: '1.5rem', 
          background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)', 
          borderRadius: '1rem',
          border: '2px solid #0EA5E9'
        }}>
          <h4 style={{ 
            marginBottom: '1rem',
            color: '#0C4A6E',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🚀 Apply for this Task
          </h4>
          
          <form onSubmit={handleSubmitApplication}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#0C4A6E',
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
                  padding: '0.75rem',
                  border: '2px solid #E0F2FE',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0EA5E9'}
                onBlur={(e) => e.target.style.borderColor = '#E0F2FE'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#0C4A6E',
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
                  padding: '0.75rem',
                  border: '2px solid #E0F2FE',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0EA5E9'}
                onBlur={(e) => e.target.style.borderColor = '#E0F2FE'}
              />
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#0369A1',
                marginTop: '0.25rem'
              }}>
                Client offered {task.credits} credits (you can propose up to {Math.floor(task.credits * 1.5)})
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="submit" 
                style={{
                  background: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                🚀 Submit Application
              </button>
              <button 
                type="button" 
                onClick={() => setShowApplicationForm(false)}
                style={{
                  background: '#F8FAFC',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
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