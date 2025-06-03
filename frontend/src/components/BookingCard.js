import React, { useState } from 'react';
import ReviewForm from './ReviewForm';

const BookingCard = ({ booking, onReviewSubmit }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const isProvider = booking.bookedFrom._id === booking.bookedFrom._id;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-1">
        <h3>{booking.slotId.description}</h3>
        <span className={`badge ${booking.status === 'completed' ? 'btn-success' : 'btn-secondary'}`}>
          {booking.status}
        </span>
      </div>
      
      <div className="mb-1">
        <strong>Time:</strong> {formatDate(booking.slotId.dateTime)}
      </div>
      
      <div className="mb-1">
        <strong>Duration:</strong> {booking.slotId.duration} minutes
      </div>
      
      <div className="mb-1">
        <strong>With:</strong> {isProvider ? booking.bookedBy.username : booking.bookedFrom.username}
      </div>
      
      <div className="mb-1">
        <strong>Credits:</strong> {booking.slotId.credits}
      </div>
      
      {booking.review && (
        <div className="mb-1">
          <strong>Review:</strong> {booking.review}
          {booking.rating && (
            <span className="rating ml-1">
              ★ {booking.rating}/5
            </span>
          )}
        </div>
      )}
      
      {booking.status === 'pending' && !booking.rating && (
        <button 
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="btn btn-success"
        >
          Complete & Review
        </button>
      )}
      
      {showReviewForm && (
        <ReviewForm 
          bookingId={booking._id}
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