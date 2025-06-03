import React, { useState } from 'react';

const ReviewForm = ({ bookingId, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating: parseInt(rating), review });
  };

  return (
    <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h4>Complete Session & Leave Review</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Rating:</label>
          <select value={rating} onChange={(e) => setRating(e.target.value)} required>
            <option value={5}>5 - Excellent</option>
            <option value={4}>4 - Good</option>
            <option value={3}>3 - Average</option>
            <option value={2}>2 - Poor</option>
            <option value={1}>1 - Very Poor</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Review:</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience..."
            required
          />
        </div>
        
        <div className="flex gap-1">
          <button type="submit" className="btn btn-success">
            Submit Review
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;