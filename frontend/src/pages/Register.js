import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserTypeSelector from '../components/UserTypeSelector';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    primaryRole: '',
    bio: '',
    skills: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (primaryRole) => {
    setFormData({
      ...formData,
      primaryRole
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.primaryRole) {
      setError('Please select your primary role');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };
      
      await signup(userData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="text-center mb-2">Join TimeSlice Community</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* Primary Role Selection */}
        <UserTypeSelector
          selectedType={formData.primaryRole}
          onChange={handleRoleChange}
        />
        
        <div className="form-group">
          <label>Bio:</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell others about yourself..."
          />
        </div>
        
        <div className="form-group">
          <label>Your Skills (comma-separated):</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g., JavaScript, React, Design, Writing, Data Analysis"
          />
          <small style={{ color: '#666' }}>
            Add skills you have OR skills you might need help with
          </small>
        </div>
        
        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Creating Account...' : 'Join TimeSlice'}
        </button>
      </form>
      
      <p className="text-center mt-1">
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;