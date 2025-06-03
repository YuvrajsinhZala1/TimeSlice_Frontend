import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Profile = () => {
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bio: '',
    skills: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Load current user data
    setFormData({
      bio: currentUser.bio || '',
      skills: currentUser.skills ? currentUser.skills.join(', ') : ''
    });
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
    setSuccess('');

    try {
      const updateData = {
        bio: formData.bio,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };

      const response = await api.put('/users/profile', updateData);
      
      // Update user in context
      updateUser(response.data);
      
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleCapability = async (capability) => {
    try {
      setError('');
      setSuccess('');
      
      await api.put('/users/toggle-capability', { capability });
      
      // Update current user data
      updateUser({
        [capability]: !currentUser[capability]
      });
      
      setSuccess(`${capability === 'canCreateTasks' ? 'Task creation' : 'Task acceptance'} toggled successfully!`);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update capability');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!currentUser) {
    return null;
  }

  const isPrimaryHelper = currentUser.primaryRole === 'helper';

  return (
    <div className="form-container">
      <h2 className="text-center mb-2">My Profile</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <div className="card mb-2">
        <h3>Account Information</h3>
        <p><strong>Username:</strong> {currentUser.username}</p>
        <p><strong>Email:</strong> {currentUser.email}</p>
        <p><strong>Primary Role:</strong> 
          <span style={{ color: isPrimaryHelper ? '#28a745' : '#007bff' }}>
            {isPrimaryHelper ? ' 🤝 Helper' : ' 📋 Task Provider'}
          </span>
        </p>
        <p><strong>Credits:</strong> {currentUser.credits}</p>
        <p><strong>Rating:</strong> 
          <span className="rating">
            ★ {currentUser.rating ? currentUser.rating.toFixed(1) : 'No rating yet'}
          </span>
          {currentUser.totalRatings > 0 && (
            <span style={{ color: '#666', fontSize: '0.9rem' }}>
              ({currentUser.totalRatings} rating{currentUser.totalRatings !== 1 ? 's' : ''})
            </span>
          )}
        </p>
        <p><strong>Completed Tasks:</strong> {currentUser.completedTasks || 0}</p>
        <p><strong>Member Since:</strong> {new Date(currentUser.createdAt).toLocaleDateString()}</p>
      </div>

      {/* Capabilities Settings */}
      <div className="card mb-2">
        <h3>Capabilities</h3>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Control what you can do on the platform:
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}>
            <div>
              <strong>Can Create Tasks</strong>
              <br />
              <small style={{ color: '#666' }}>Post tasks and get help from others</small>
            </div>
            <button
              onClick={() => toggleCapability('canCreateTasks')}
              className={`btn ${currentUser.canCreateTasks ? 'btn-success' : 'btn-secondary'}`}
            >
              {currentUser.canCreateTasks ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '1rem',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}>
            <div>
              <strong>Can Accept Tasks</strong>
              <br />
              <small style={{ color: '#666' }}>Apply for and help with tasks</small>
            </div>
            <button
              onClick={() => toggleCapability('canAcceptTasks')}
              className={`btn ${currentUser.canAcceptTasks ? 'btn-success' : 'btn-secondary'}`}
            >
              {currentUser.canAcceptTasks ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Bio:</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell others about your experience, expertise, and what you enjoy helping with..."
            rows="4"
          />
        </div>
        
        <div className="form-group">
          <label>Your Skills (comma-separated):</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g., JavaScript, React, Design, Writing, Data Analysis, Marketing"
          />
          <small style={{ color: '#666' }}>
            Skills help match you with relevant tasks and improve your application success rate
          </small>
        </div>
        
        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>

      <div className="card mt-2" style={{ backgroundColor: '#f8f9fa' }}>
        <h4>💡 Profile Tips:</h4>
        <ul style={{ marginLeft: '1rem', color: '#666' }}>
          <li>A complete profile with skills gets more task matches</li>
          <li>A good bio helps others understand your expertise</li>
          <li>Both capabilities enabled gives you maximum flexibility</li>
          <li>Higher ratings lead to more task opportunities</li>
        </ul>
      </div>
    </div>
  );
};

export default Profile;