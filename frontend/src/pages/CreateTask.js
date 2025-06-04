import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DurationSelector from '../components/DurationSelector';
import { validateCustomDuration } from '../utils/durationUtils';
import api from '../utils/api';

const CreateTask = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillsRequired: '',
    dateTime: '',
    duration: '',
    credits: 20,
    urgency: 'medium'
  });
  const [durationError, setDurationError] = useState('');
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

  const handleDurationChange = (duration) => {
    setFormData({
      ...formData,
      duration
    });
    
    // Validate duration
    if (duration) {
      const validation = validateCustomDuration(duration);
      if (!validation.isValid) {
        setDurationError(validation.error);
      } else {
        setDurationError('');
      }
    } else {
      setDurationError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate duration
    if (!formData.duration) {
      setDurationError('Duration is required');
      setLoading(false);
      return;
    }

    const durationValidation = validateCustomDuration(formData.duration);
    if (!durationValidation.isValid) {
      setDurationError(durationValidation.error);
      setLoading(false);
      return;
    }

    try {
      const taskData = {
        ...formData,
        skillsRequired: formData.skillsRequired.split(',').map(skill => skill.trim()).filter(skill => skill),
        credits: parseInt(formData.credits)
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
        Create a detailed task description and let qualified helpers apply!
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
            placeholder="Describe the task in detail, including any specific requirements, expected outcomes, deliverables, and any context that would help helpers understand what you need..."
            required
            rows="5"
          />
        </div>
        
        <div className="form-group">
          <label>Skills Required (comma-separated):</label>
          <input
            type="text"
            name="skillsRequired"
            value={formData.skillsRequired}
            onChange={handleChange}
            placeholder="e.g., JavaScript, Design, Writing, Data Analysis, Project Management"
            required
          />
          <small style={{ color: '#666' }}>
            Helpers with these skills will see your task first and can apply
          </small>
        </div>
        
        <div className="form-group">
          <label>Preferred Start Date & Time:</label>
          <input
            type="datetime-local"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleChange}
            min={new Date().toISOString().slice(0, 16)}
            required
          />
          <small style={{ color: '#666' }}>
            When would you like to start working on this task?
          </small>
        </div>
        
        {/* Enhanced Duration Selector */}
        <DurationSelector
          value={formData.duration}
          onChange={handleDurationChange}
          error={durationError}
        />
        
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
            You have {currentUser.credits} credits available. Helpers can propose different amounts in their applications.
          </small>
        </div>
        
        <div className="form-group">
          <label>Urgency Level:</label>
          <select
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
          >
            <option value="low">🟢 Low - Flexible timeline</option>
            <option value="medium">🟡 Medium - Normal priority</option>
            <option value="high">🔴 High - Urgent, need soon</option>
          </select>
        </div>
        
        <button type="submit" className="btn" disabled={loading || durationError} style={{ width: '100%' }}>
          {loading ? 'Posting Task...' : 'Post Task & Accept Applications'}
        </button>
      </form>
      
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <h4>💡 How the application process works:</h4>
        <ol style={{ marginLeft: '1rem', lineHeight: '1.6' }}>
          <li>Post your task with clear requirements and flexible duration</li>
          <li>Helpers with matching skills will see and apply for your task</li>
          <li>Review applications with detailed helper profiles</li>
          <li>Accept the best application and start chatting</li>
          <li>Work together to complete the task</li>
          <li>Mark as completed when satisfied with the work</li>
          <li>Leave reviews to help the community!</li>
        </ol>
      </div>
    </div>
  );
};

export default CreateTask;