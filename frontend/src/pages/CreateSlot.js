import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CreateSlot = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dateTime: '',
    duration: 30,
    description: '',
    skillTags: '',
    credits: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const slotData = {
        ...formData,
        skillTags: formData.skillTags.split(',').map(tag => tag.trim()).filter(tag => tag),
        credits: parseInt(formData.credits),
        duration: parseInt(formData.duration)
      };

      await api.post('/slots', slotData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create slot');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="form-container">
      <h2 className="text-center mb-2">Create New Time Slot</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Date & Time:</label>
          <input
            type="datetime-local"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Duration:</label>
          <select
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            required
          >
            <option value={30}>30 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What help can you provide? Be specific..."
            required
          />
        </div>
        
        <div className="form-group">
          <label>Skill Tags (comma-separated):</label>
          <input
            type="text"
            name="skillTags"
            value={formData.skillTags}
            onChange={handleChange}
            placeholder="e.g., JavaScript, Career Advice, Design Review"
          />
        </div>
        
        <div className="form-group">
          <label>Credits to Earn:</label>
          <input
            type="number"
            name="credits"
            value={formData.credits}
            onChange={handleChange}
            min="1"
            max="100"
            required
          />
        </div>
        
        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Creating...' : 'Create Slot'}
        </button>
      </form>
    </div>
  );
};

export default CreateSlot;