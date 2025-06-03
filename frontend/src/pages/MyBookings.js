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

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setError('');
      setSuccess('');
      
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      setSuccess(`Task status updated to ${newStatus}!`);
      
      // Update booking in state
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReviewSubmit = async (bookingId, reviewData) => {
    try {
      setError('');
      setSuccess('');
      
      await api.post(`/bookings/review/${bookingId}`, reviewData);
      setSuccess('Review submitted successfully!');
      
      // Refresh bookings to get updated reviews
      fetchBookings();
      
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

  const isHelper = currentUser.userType === 'helper';
  const pageTitle = isHelper ? 'My Accepted Tasks' : 'My Task Bookings';

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => b.status === 'in-progress');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  return (
    <div>
      <h1 className="mb-2">{pageTitle}</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {bookings.length === 0 ? (
        <div className="card text-center">
          <h3>No bookings found</h3>
          <p>
            {isHelper 
              ? "You haven't accepted any tasks yet. Browse available tasks to get started!"
              : "No one has accepted your tasks yet. Make sure your tasks are clear and well-described!"
            }
          </p>
        </div>
      ) : (
        <>
          {/* Pending Bookings */}
          {pendingBookings.length > 0 && (
            <div className="mb-2">
              <h2>Pending Tasks ({pendingBookings.length})</h2>
              <div className="card-grid">
                {pendingBookings.map(booking => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onStatusUpdate={handleStatusUpdate}
                    onReviewSubmit={handleReviewSubmit}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Active Bookings */}
          {activeBookings.length > 0 && (
            <div className="mb-2">
              <h2>Active Tasks ({activeBookings.length})</h2>
              <div className="card-grid">
                {activeBookings.map(booking => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onStatusUpdate={handleStatusUpdate}
                    onReviewSubmit={handleReviewSubmit}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Bookings */}
          {completedBookings.length > 0 && (
            <div className="mb-2">
              <h2>Completed Tasks ({completedBookings.length})</h2>
              <div className="card-grid">
                {completedBookings.map(booking => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onStatusUpdate={handleStatusUpdate}
                    onReviewSubmit={handleReviewSubmit}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Cancelled Bookings */}
          {cancelledBookings.length > 0 && (
            <div className="mb-2">
              <h2>Cancelled Tasks ({cancelledBookings.length})</h2>
              <div className="card-grid">
                {cancelledBookings.map(booking => (
                  <BookingCard
                    key={booking._id}
                    booking={booking}
                    onStatusUpdate={handleStatusUpdate}
                    onReviewSubmit={handleReviewSubmit}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyBookings;