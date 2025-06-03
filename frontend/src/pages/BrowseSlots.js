import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import SlotCard from '../components/SlotCard';

const BrowseSlots = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchSlots();
  }, [currentUser, navigate]);

  const fetchSlots = async () => {
    try {
      const response = await api.get('/slots');
      // Filter out user's own slots
      const availableSlots = response.data.filter(slot => slot.userId._id !== currentUser.id);
      setSlots(availableSlots);
    } catch (error) {
      setError('Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (slotId) => {
    try {
      setError('');
      setSuccess('');
      
      await api.post('/bookings', { slotId });
      setSuccess('Slot booked successfully!');
      
      // Remove booked slot from list
      setSlots(slots.filter(slot => slot._id !== slotId));
      
      // Refresh user credits (you might want to update context)
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to book slot');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return <div className="text-center">Loading available slots...</div>;
  }

  return (
    <div>
      <h1 className="mb-2">Browse Available Slots</h1>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {slots.length === 0 ? (
        <div className="card text-center">
          <h3>No available slots found</h3>
          <p>Check back later for new opportunities, or create your own slot to help others!</p>
        </div>
      ) : (
        <div className="card-grid">
          {slots.map(slot => (
            <SlotCard
              key={slot._id}
              slot={slot}
              onBook={handleBook}
              showBookButton={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseSlots;