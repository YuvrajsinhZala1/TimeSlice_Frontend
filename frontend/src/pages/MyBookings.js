import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import BookingCard from '../components/BookingCard';

const MyBookings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchBookings();
  }, [currentUser, navigate]);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (bookingId, reviewData) => {
    try {
      setError('');
      setSuccess('');
      
      await api.post(`/bookings/review/${bookingId}`, reviewData);
      setSuccess('Review submitted successfully!');
      
      // Update booking in state
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, ...reviewData, status: 'completed' }
          : booking
      ));
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit review');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return <div className="text-center">Loading your bookings...</div>;
  }

  return (
    <div>
      <h1 className="mb-2">My Bookings</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {bookings.length === 0 ? (
        <div className="card text-center">
          <h3>No bookings found</h3>
          <p>You haven't made any bookings yet. Browse available slots to get started!</p>
        </div>
      ) : (
        <div className="card-grid">
          {bookings.map(booking => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onReviewSubmit={handleReviewSubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;