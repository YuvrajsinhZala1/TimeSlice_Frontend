import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CreateTask = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillsRequired: '',
    dateTime: '',
    duration: 30,
    credits: 20,
    urgency: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (!currentUser.canCreateTasks) {
      navigate('/dashboard');
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
      const taskData = {
        ...formData,
        skillsRequired: formData.skillsRequired.split(',').map(skill => skill.trim()).filter(skill => skill),
        credits: parseInt(formData.credits),
        duration: parseInt(formData.duration)
      };

      await api.post('/tasks', taskData);
      navigate('/my-tasks');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || !currentUser.canCreateTasks) {
    return null;
  }

  return (
    <div className="form-container">
      <h2 className="text-center mb-2">Post a New Task</h2>
      <p className="text-center" style={{ color: '#666', marginBottom: '2rem' }}>
        Describe what you need help with and let helpers apply!
      </p>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Task Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="What do you need help with?"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Detailed Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the task in detail, including any specific requirements, expected outcomes, and any context that would help helpers understand what you need..."
            required
            rows="4"
          />
        </div>
        
        <div className="form-group">
          <label>Skills Required (comma-separated):</label>
          <input
            type="text"
            name="skillsRequired"
            value={formData.skillsRequired}
            onChange={handleChange}
            placeholder="e.g., JavaScript, Design, Writing, Data Analysis"
            required
          />
          <small style={{ color: '#666' }}>
            Helpers with these skills will see your task first
          </small>
        </div>
        
        <div className="form-group">
          <label>Scheduled Date & Time:</label>
          <input
            type="datetime-local"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
            required
          />
          <small style={{ color: '#666' }}>
            When would you like to work on this task?
          </small>
        </div>
        
        <div className="form-group">
          <label>Estimated Duration:</label>
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
          <label>Credits to Pay:</label>
          <input
            type="number"
            name="credits"
            value={formData.credits}
            onChange={handleChange}
            min="1"
            max={currentUser.credits}
            required
          />
          <small style={{ color: '#666' }}>
            You have {currentUser.credits} credits available. Helpers can propose different amounts.
          </small>
        </div>
        
        <div className="form-group">
          <label>Urgency Level:</label>
          <select
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
          >
            <option value="low">Low - Can wait</option>
            <option value="medium">Medium - Normal priority</option>
            <option value="high">High - Urgent</option>
          </select>
        </div>
        
        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Posting Task...' : 'Post Task & Accept Applications'}
        </button>
      </form>
      
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
        <h4>💡 How it works:</h4>
        <ol style={{ marginLeft: '1rem' }}>
          <li>Post your task with clear requirements</li>
          <li>Helpers with matching skills will see and apply</li>
          <li>Review applications and choose the best helper</li>
          <li>Chat with your chosen helper</li>
          <li>Complete the task together!</li>
        </ol>
      </div>
    </div>
  );
};

export default CreateTask;