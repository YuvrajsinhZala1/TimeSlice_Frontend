import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReviewForm from './ReviewForm';

const BookingCard = ({ booking, onReviewSubmit, onStatusUpdate }) => {
  const { currentUser } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewType, setReviewType] = useState('');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const isHelper = booking.helper._id === currentUser.id;
  const isTaskProvider = booking.taskProvider._id === currentUser.id;

  const handleStatusUpdate = async (newStatus) => {
    if (onStatusUpdate) {
      await onStatusUpdate(booking._id, newStatus);
    }
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
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
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
          {booking.status}
        </span>
      </div>
      
      <div className="mb-1">
        <strong>Description:</strong> {booking.taskId.description}
      </div>
      
      <div className="mb-1">
        <strong>Scheduled Time:</strong> {formatDate(booking.taskId.dateTime)}
      </div>
      
      <div className="mb-1">
        <strong>Duration:</strong> {booking.taskId.duration} minutes
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

      {/* Status Update Buttons */}
      {booking.status === 'confirmed' && (
        <div className="flex gap-1 mb-1">
          <button 
            onClick={() => handleStatusUpdate('in-progress')}
            className="btn btn-success"
          >
            Start Task
          </button>
          <button 
            onClick={() => handleStatusUpdate('cancelled')}
            className="btn btn-danger"
          >
            Cancel
          </button>
        </div>
      )}

      {booking.status === 'in-progress' && (
        <div className="mb-1">
          <button 
            onClick={() => handleStatusUpdate('completed')}
            className="btn btn-success"
          >
            Mark as Completed
          </button>
        </div>
      )}

      {/* Chat Button */}
      {booking.chatId && ['confirmed', 'in-progress', 'completed'].includes(booking.status) && (
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
                padding: '0.5rem', 
                borderRadius: '4px',
                marginTop: '0.25rem'
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
                padding: '0.5rem', 
                borderRadius: '4px',
                marginTop: '0.25rem'
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
                Review Task Provider
              </button>
            )}
            {isTaskProvider && !booking.taskProviderReview.rating && (
              <button 
                onClick={() => handleReviewClick('taskProvider')}
                className="btn btn-success"
              >
                Review Helper
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