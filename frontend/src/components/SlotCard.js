import React from 'react';

const SlotCard = ({ slot, onBook, showBookButton = true }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-1">
        <h3>{slot.description}</h3>
        <span className="badge">{slot.credits} credits</span>
      </div>
      
      <div className="mb-1">
        <strong>Provider:</strong> {slot.userId.username}
        <span className="rating ml-1">
          ★ {slot.userId.rating ? slot.userId.rating.toFixed(1) : 'No rating'}
        </span>
      </div>
      
      <div className="mb-1">
        <strong>Time:</strong> {formatDate(slot.dateTime)}
      </div>
      
      <div className="mb-1">
        <strong>Duration:</strong> {slot.duration} minutes
      </div>
      
      {slot.skillTags && slot.skillTags.length > 0 && (
        <div className="mb-1">
          <strong>Skills:</strong>
          {slot.skillTags.map((skill, index) => (
            <span key={index} className="badge">
              {skill}
            </span>
          ))}
        </div>
      )}
      
      {showBookButton && !slot.isBooked && (
        <button 
          onClick={() => onBook(slot._id)} 
          className="btn btn-success"
        >
          Book This Slot
        </button>
      )}
      
      {slot.isBooked && (
        <span style={{ color: '#6c757d' }}>Already Booked</span>
      )}
    </div>
  );
};

export default SlotCard;