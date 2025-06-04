import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDuration } from '../utils/durationUtils';
import ReviewForm from './ReviewForm';

const BookingCard = ({ booking, onReviewSubmit, onStatusUpdate }) => {
  const { currentUser } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewType, setReviewType] = useState('');
  const [workNote, setWorkNote] = useState('');
  const [showWorkSubmission, setShowWorkSubmission] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const isHelper = booking.helper._id === currentUser.id;
  const isTaskProvider = booking.taskProvider._id === currentUser.id;

  const handleStatusUpdate = async (newStatus) => {
    if (onStatusUpdate) {
      await onStatusUpdate(booking._id, newStatus, workNote);
    }
    setShowWorkSubmission(false);
    setWorkNote('');
  };

  const handleReviewClick = (type) => {
    setReviewType(type);
    setShowReviewForm(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'in-progress': return '#6f42c1';
      case 'confirmed': return '#17a2b8';
      case 'work-submitted': return '#ffc107';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in-progress': return '🚀';
      case 'confirmed': return '📋';
      case 'work-submitted': return '📤';
      case 'cancelled': return '❌';
      default: return '📝';
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-1">
        <h3>{booking.taskId.title}</h3>
        <span 
          className="badge" 
          style={{ backgroundColor: getStatusColor(booking.status) }}
        >
          {getStatusIcon(booking.status)} {booking.status}
        </span>
      </div>
      
      <div className="mb-1">
        <strong>Description:</strong> {booking.taskId.description}
      </div>
      
      <div className="mb-1">
        <strong>Scheduled Time:</strong> {formatDate(booking.taskId.dateTime)}
      </div>
      
      <div className="mb-1">
        <strong>Duration:</strong> {formatDuration(booking.taskId.duration)}
      </div>
      
      <div className="mb-1">
        <strong>Agreed Credits:</strong> {booking.agreedCredits}
      </div>
      
      <div className="mb-1">
        <strong>Task Provider:</strong> {booking.taskProvider.username}
        {booking.taskProvider.rating && (
          <span className="rating ml-1">
            ★ {booking.taskProvider.rating.toFixed(1)}
          </span>
        )}
      </div>
      
      <div className="mb-1">
        <strong>Helper:</strong> {booking.helper.username}
        {booking.helper.rating && (
          <span className="rating ml-1">
            ★ {booking.helper.rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Booking Dates */}
      {booking.startedAt && (
        <div className="mb-1">
          <strong>Started:</strong> {formatDate(booking.startedAt)}
        </div>
      )}

      {booking.completedAt && (
        <div className="mb-1">
          <strong>Completed:</strong> {formatDate(booking.completedAt)}
        </div>
      )}

      {/* Work Submission Note */}
      {booking.workSubmissionNote && (
        <div className="mb-1">
          <strong>Work Submission Note:</strong>
          <div style={{ 
            background: '#fff3cd', 
            padding: '0.75rem', 
            borderRadius: '4px',
            marginTop: '0.25rem',
            border: '1px solid #ffeaa7'
          }}>
            "{booking.workSubmissionNote}"
          </div>
        </div>
      )}

      {/* Provider Acceptance Note */}
      {booking.providerAcceptanceNote && (
        <div className="mb-1">
          <strong>Completion Note:</strong>
          <div style={{ 
            background: '#d4edda', 
            padding: '0.75rem', 
            borderRadius: '4px',
            marginTop: '0.25rem',
            border: '1px solid #c3e6cb'
          }}>
            "{booking.providerAcceptanceNote}"
          </div>
        </div>
      )}

      {/* Status Update Buttons for Helper */}
      {isHelper && booking.status === 'confirmed' && (
        <div className="flex gap-1 mb-1">
          <button 
            onClick={() => handleStatusUpdate('in-progress')}
            className="btn btn-success"
          >
            🚀 Start Working
          </button>
          <button 
            onClick={() => handleStatusUpdate('cancelled')}
            className="btn btn-danger"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Work Submission for Helper */}
      {isHelper && booking.status === 'in-progress' && (
        <div className="mb-1">
          {!showWorkSubmission ? (
            <button 
              onClick={() => setShowWorkSubmission(true)}
              className="btn btn-success"
              style={{ width: '100%' }}
            >
              📤 Submit Completed Work
            </button>
          ) : (
            <div style={{ 
              padding: '1rem', 
              border: '2px solid #28a745', 
              borderRadius: '8px',
              backgroundColor: '#f8fff8'
            }}>
              <h4>Submit Your Work</h4>
              <div className="form-group">
                <label>Work Summary & Notes:</label>
                <textarea
                  value={workNote}
                  onChange={(e) => setWorkNote(e.target.value)}
                  placeholder="Describe what you've completed, any deliverables, next steps, or notes for the task provider..."
                  rows="3"
                  required
                />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleStatusUpdate('work-submitted')}
                  className="btn btn-success"
                  disabled={!workNote.trim()}
                >
                  Submit Work
                </button>
                <button 
                  onClick={() => setShowWorkSubmission(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Updates for Task Provider */}
      {isTaskProvider && booking.status === 'confirmed' && (
        <div className="mb-1">
          <button 
            onClick={() => handleStatusUpdate('cancelled')}
            className="btn btn-danger"
          >
            Cancel Booking
          </button>
        </div>
      )}

      {/* Work Submitted Status */}
      {booking.status === 'work-submitted' && (
        <div className="mb-1" style={{ 
          backgroundColor: '#fff3cd', 
          padding: '1rem', 
          borderRadius: '8px',
          border: '1px solid #ffeaa7'
        }}>
          <strong>📤 Work Submitted by Helper</strong>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            {isTaskProvider 
              ? 'Review the work and mark as completed in "My Tasks" when satisfied.'
              : 'Work submitted! Waiting for task provider to review and mark as completed.'
            }
          </p>
        </div>
      )}

      {/* Chat Button */}
      {booking.chatId && ['confirmed', 'in-progress', 'work-submitted', 'completed'].includes(booking.status) && (
        <div className="mb-1">
          <Link 
            to="/chat" 
            className="btn btn-secondary"
          >
            💬 Open Chat
          </Link>
        </div>
      )}
      
      {/* Reviews Section */}
      {booking.status === 'completed' && (
        <div className="mt-1">
          {booking.helperReview.review && (
            <div className="mb-1">
              <strong>Helper's Review of Task Provider:</strong>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '0.75rem', 
                borderRadius: '4px',
                marginTop: '0.25rem',
                border: '1px solid #e1e5e9'
              }}>
                "{booking.helperReview.review}"
                <span className="rating ml-1">
                  ★ {booking.helperReview.rating}/5
                </span>
              </div>
            </div>
          )}
          
          {booking.taskProviderReview.review && (
            <div className="mb-1">
              <strong>Task Provider's Review of Helper:</strong>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '0.75rem', 
                borderRadius: '4px',
                marginTop: '0.25rem',
                border: '1px solid #e1e5e9'
              }}>
                "{booking.taskProviderReview.review}"
                <span className="rating ml-1">
                  ★ {booking.taskProviderReview.rating}/5
                </span>
              </div>
            </div>
          )}

          {/* Review Buttons */}
          <div className="flex gap-1">
            {isHelper && !booking.helperReview.rating && (
              <button 
                onClick={() => handleReviewClick('helper')}
                className="btn btn-success"
              >
                ⭐ Review Task Provider
              </button>
            )}
            {isTaskProvider && !booking.taskProviderReview.rating && (
              <button 
                onClick={() => handleReviewClick('taskProvider')}
                className="btn btn-success"
              >
                ⭐ Review Helper
              </button>
            )}
          </div>
        </div>
      )}
      
      {showReviewForm && (
        <ReviewForm 
          bookingId={booking._id}
          reviewType={reviewType}
          onSubmit={(data) => {
            onReviewSubmit(booking._id, data);
            setShowReviewForm(false);
          }}
          onCancel={() => setShowReviewForm(false)}
        />
      )}
    </div>
  );
};

export default BookingCard;