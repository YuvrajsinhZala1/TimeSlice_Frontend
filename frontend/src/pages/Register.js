import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, currentUser } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Role & Profile
    primaryRole: '',
    bio: '',
    skills: [],
    // Step 3: Preferences
    agreedToTerms: false,
    agreeToMarketing: false
  });

  const [newSkill, setNewSkill] = useState('');
  
  const availableSkills = [
    'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
    'Content Writing', 'Digital Marketing', 'SEO', 'Data Analysis',
    'Video Editing', 'Photography', 'Translation', 'Virtual Assistant',
    'Accounting', 'Legal Consulting', 'Tutoring', 'Research',
    'Social Media Management', 'E-commerce', 'Project Management'
  ];

  const totalSteps = 3;

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addPredefinedSkill = (skill) => {
    if (!formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.username.trim()) {
          setError('Username is required');
          return false;
        }
        if (formData.username.length < 3) {
          setError('Username must be at least 3 characters');
          return false;
        }
        if (!formData.email.trim()) {
          setError('Email is required');
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        if (!formData.password) {
          setError('Password is required');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        break;
      case 2:
        if (!formData.primaryRole) {
          setError('Please select your primary role');
          return false;
        }
        break;
      case 3:
        if (!formData.agreedToTerms) {
          setError('You must agree to the Terms of Service');
          return false;
        }
        break;
      default:
        break;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    setError('');

    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        primaryRole: formData.primaryRole,
        bio: formData.bio,
        skills: formData.skills
      };

      await register(registrationData);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3].map(step => (
        <div key={step} className="step-indicator-item">
          <div className={`step-circle ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
            {currentStep > step ? '✓' : step}
          </div>
          <span className="step-label">
            {step === 1 && 'Account'}
            {step === 2 && 'Profile'}
            {step === 3 && 'Finish'}
          </span>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="step-content">
      <div className="step-header">
        <h2>Create Your Account</h2>
        <p>Let's start with your basic information</p>
      </div>

      <div className="form-group">
        <label htmlFor="username" className="form-label">
          Username <span className="required">*</span>
        </label>
        <div className="input-wrapper">
          <div className="input-icon">👤</div>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Choose a unique username"
            className="form-input"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email Address <span className="required">*</span>
        </label>
        <div className="input-wrapper">
          <div className="input-icon">📧</div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email address"
            className="form-input"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password <span className="required">*</span>
        </label>
        <div className="input-wrapper">
          <div className="input-icon">🔒</div>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Create a strong password"
            className="form-input"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="password-toggle"
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label">
          Confirm Password <span className="required">*</span>
        </label>
        <div className="input-wrapper">
          <div className="input-icon">🔒</div>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            className="form-input"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="password-toggle"
          >
            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <div className="step-header">
        <h2>Tell Us About Yourself</h2>
        <p>Help us understand your role and expertise</p>
      </div>

      <div className="form-group">
        <label className="form-label">
          What's your primary role? <span className="required">*</span>
        </label>
        <div className="role-selection">
          <div 
            className={`role-card ${formData.primaryRole === 'helper' ? 'selected' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, primaryRole: 'helper' }))}
          >
            <div className="role-icon">🛠️</div>
            <div className="role-content">
              <h3>I'm a Helper</h3>
              <p>I want to offer my skills and work on exciting projects</p>
              <ul className="role-benefits">
                <li>✓ Find projects that match your skills</li>
                <li>✓ Build your professional reputation</li>
                <li>✓ Earn credits for your expertise</li>
              </ul>
            </div>
          </div>
          
          <div 
            className={`role-card ${formData.primaryRole === 'taskProvider' ? 'selected' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, primaryRole: 'taskProvider' }))}
          >
            <div className="role-icon">📋</div>
            <div className="role-content">
              <h3>I'm a Task Provider</h3>
              <p>I have projects and need skilled professionals to help</p>
              <ul className="role-benefits">
                <li>✓ Access to verified professionals</li>
                <li>✓ Secure payment system</li>
                <li>✓ Project management tools</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="bio" className="form-label">
          Bio (Optional)
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          placeholder="Tell us about yourself, your experience, and what you're passionate about..."
          className="form-textarea"
          rows="4"
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Skills & Expertise (Optional)
        </label>
        
        <div className="skills-input-section">
          <div className="skill-input-wrapper">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill..."
              className="form-input"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <button type="button" onClick={addSkill} className="add-skill-btn">
              Add
            </button>
          </div>
        </div>

        <div className="predefined-skills">
          <h4>💡 Popular Skills:</h4>
          <div className="skills-suggestions">
            {availableSkills.filter(skill => !formData.skills.includes(skill)).slice(0, 8).map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => addPredefinedSkill(skill)}
                className="skill-suggestion"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>

        {formData.skills.length > 0 && (
          <div className="selected-skills">
            <h4>✅ Your Skills:</h4>
            <div className="skills-list">
              {formData.skills.map(skill => (
                <div key={skill} className="skill-tag">
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="skill-remove"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <div className="step-header">
        <h2>Almost Done!</h2>
        <p>Just a few final details to complete your registration</p>
      </div>

      <div className="summary-section">
        <h3>📋 Account Summary</h3>
        <div className="summary-content">
          <div className="summary-item">
            <span className="summary-label">Username:</span>
            <span className="summary-value">{formData.username}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Email:</span>
            <span className="summary-value">{formData.email}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Role:</span>
            <span className="summary-value">
              {formData.primaryRole === 'helper' ? '🛠️ Helper' : '📋 Task Provider'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Skills:</span>
            <span className="summary-value">
              {formData.skills.length > 0 ? formData.skills.join(', ') : 'None specified'}
            </span>
          </div>
        </div>
      </div>

      <div className="terms-section">
        <label className="checkbox-wrapper large">
          <input
            type="checkbox"
            name="agreedToTerms"
            checked={formData.agreedToTerms}
            onChange={handleInputChange}
            className="checkbox"
            required
          />
          <span className="checkmark"></span>
          <span className="checkbox-label">
            I agree to the <Link to="/terms" target="_blank" className="link">Terms of Service</Link> and <Link to="/privacy" target="_blank" className="link">Privacy Policy</Link> <span className="required">*</span>
          </span>
        </label>

        <label className="checkbox-wrapper large">
          <input
            type="checkbox"
            name="agreeToMarketing"
            checked={formData.agreeToMarketing}
            onChange={handleInputChange}
            className="checkbox"
          />
          <span className="checkmark"></span>
          <span className="checkbox-label">
            I'd like to receive updates about new features and opportunities
          </span>
        </label>
      </div>

      <div className="welcome-message">
        <div className="welcome-icon">🎉</div>
        <h3>Welcome to TimeSlice!</h3>
        <p>You're about to join a community of talented professionals who are shaping the future of work. Get ready to discover amazing opportunities and build meaningful collaborations!</p>
      </div>
    </div>
  );

  return (
    <div className="register-container">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
        <div className="gradient-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="register-content">
        <div className="form-container">
          <div className="form-header">
            <Link to="/" className="brand-logo">
              <div className="logo-icon">⏰</div>
              <span className="brand-name">TimeSlice</span>
            </Link>
            
            <h1>Join TimeSlice</h1>
            <p>Create your account and start your journey</p>
          </div>

          <StepIndicator />

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="step-container">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>

            <div className="form-navigation">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="nav-button secondary"
                  disabled={loading}
                >
                  ← Previous
                </button>
              )}
              
              <div className="nav-spacer"></div>
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="nav-button primary"
                  disabled={loading}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  className="nav-button success"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <span className="button-icon">🚀</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="login-prompt">
            <p>Already have an account?</p>
            <Link to="/login" className="login-link">
              Sign In Instead
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .register-container {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 0;
        }

        .background-animation {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
        }

        .floating-shapes {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(102, 126, 234, 0.1);
          animation: float 10s ease-in-out infinite;
        }

        .shape-1 {
          width: 100px;
          height: 100px;
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 150px;
          height: 150px;
          top: 60%;
          right: 20%;
          animation-delay: 2s;
        }

        .shape-3 {
          width: 80px;
          height: 80px;
          bottom: 30%;
          left: 15%;
          animation-delay: 4s;
        }

        .shape-4 {
          width: 120px;
          height: 120px;
          top: 10%;
          right: 10%;
          animation-delay: 1s;
        }

        .shape-5 {
          width: 60px;
          height: 60px;
          bottom: 20%;
          right: 30%;
          animation-delay: 3s;
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          33% { 
            transform: translateY(-30px) rotate(120deg);
            opacity: 0.6;
          }
          66% { 
            transform: translateY(15px) rotate(240deg);
            opacity: 0.4;
          }
        }

        .gradient-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          opacity: 0.9;
        }

        .register-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .form-container {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          border-radius: 25px;
          padding: 3rem;
          box-shadow: 0 25px 50px rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.3);
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .brand-logo {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: #333;
          font-weight: 700;
          font-size: 1.3rem;
          margin-bottom: 1.5rem;
          transition: transform 0.3s ease;
        }

        .brand-logo:hover {
          transform: scale(1.05);
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          color: white;
        }

        .brand-name {
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .form-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 0.5rem 0;
        }

        .form-header p {
          color: #666;
          font-size: 1.1rem;
          margin: 0;
        }

        .step-indicator {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          margin: 2rem 0;
          position: relative;
        }

        .step-indicator::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 25%;
          right: 25%;
          height: 2px;
          background: rgba(102,126,234,0.2);
          z-index: 1;
        }

        .step-indicator-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(102,126,234,0.1);
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
          border: 2px solid rgba(102,126,234,0.2);
        }

        .step-circle.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: #667eea;
        }

        .step-circle.completed {
          background: linear-gradient(135deg, #2ecc71, #27ae60);
          border-color: #2ecc71;
        }

        .step-label {
          font-size: 0.85rem;
          color: #666;
          font-weight: 500;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #ff4757, #c44569);
          color: white;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .error-icon {
          font-size: 1.2rem;
        }

        .register-form {
          display: flex;
          flex-direction: column;
        }

        .step-container {
          min-height: 400px;
          margin-bottom: 2rem;
        }

        .step-content {
          animation: fadeInUp 0.5s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .step-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .step-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 0.5rem 0;
        }

        .step-header p {
          color: #666;
          margin: 0;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }

        .required {
          color: #e74c3c;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          z-index: 1;
          font-size: 1.1rem;
          color: #666;
        }

        .form-input, .form-textarea {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid rgba(0,0,0,0.1);
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: rgba(255,255,255,0.8);
          outline: none;
        }

        .form-input:focus, .form-textarea:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
          background: white;
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
          font-family: inherit;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.1rem;
          color: #666;
          transition: color 0.3s ease;
        }

        .password-toggle:hover {
          color: #667eea;
        }

        .role-selection {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .role-card {
          flex: 1;
          background: white;
          border: 2px solid rgba(0,0,0,0.1);
          border-radius: 15px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .role-card:hover {
          border-color: #667eea;
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .role-card.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1));
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102,126,234,0.2);
        }

        .role-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .role-content h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
        }

        .role-content p {
          margin: 0 0 1rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .role-benefits {
          list-style: none;
          padding: 0;
          margin: 0;
          text-align: left;
        }

        .role-benefits li {
          color: #666;
          font-size: 0.85rem;
          margin-bottom: 0.25rem;
        }

        .skills-input-section {
          margin-bottom: 1rem;
        }

        .skill-input-wrapper {
          display: flex;
          gap: 0.75rem;
        }

        .add-skill-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .add-skill-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102,126,234,0.3);
        }

        .predefined-skills {
          margin: 1rem 0;
        }

        .predefined-skills h4 {
          margin: 0 0 0.75rem 0;
          color: #333;
          font-size: 0.95rem;
        }

        .skills-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-suggestion {
          background: rgba(102,126,234,0.1);
          border: 1px solid rgba(102,126,234,0.3);
          color: #667eea;
          padding: 0.5rem 0.75rem;
          border-radius: 15px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }

        .skill-suggestion:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }

        .selected-skills {
          margin-top: 1rem;
        }

        .selected-skills h4 {
          margin: 0 0 0.75rem 0;
          color: #333;
          font-size: 0.95rem;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 15px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .skill-remove {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          transition: background 0.2s ease;
        }

        .skill-remove:hover {
          background: rgba(255,255,255,0.3);
        }

        .summary-section {
          background: rgba(102,126,234,0.05);
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .summary-section h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.1rem;
        }

        .summary-content {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: white;
          border-radius: 8px;
        }

        .summary-label {
          font-weight: 600;
          color: #667eea;
        }

        .summary-value {
          color: #333;
          text-align: right;
          max-width: 60%;
          word-break: break-word;
        }

        .terms-section {
          margin-bottom: 2rem;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
          margin-bottom: 1rem;
        }

        .checkbox-wrapper.large {
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .checkbox {
          display: none;
        }

        .checkmark {
          width: 20px;
          height: 20px;
          border: 2px solid #ddd;
          border-radius: 4px;
          position: relative;
          transition: all 0.3s ease;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .checkbox:checked + .checkmark {
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-color: #667eea;
        }

        .checkbox:checked + .checkmark::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .checkbox-label {
          color: #666;
        }

        .link {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }

        .link:hover {
          text-decoration: underline;
        }

        .welcome-message {
          text-align: center;
          background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1));
          border-radius: 15px;
          padding: 2rem;
          margin-top: 2rem;
        }

        .welcome-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .welcome-message h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.3rem;
        }

        .welcome-message p {
          margin: 0;
          color: #666;
          line-height: 1.6;
        }

        .form-navigation {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(0,0,0,0.1);
        }

        .nav-spacer {
          flex: 1;
        }

        .nav-button {
          padding: 1rem 2rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 140px;
          justify-content: center;
        }

        .nav-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .nav-button.primary {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 5px 15px rgba(102,126,234,0.3);
        }

        .nav-button.primary:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102,126,234,0.4);
        }

        .nav-button.secondary {
          background: rgba(102,126,234,0.1);
          color: #667eea;
          border: 2px solid #667eea;
        }

        .nav-button.secondary:not(:disabled):hover {
          background: #667eea;
          color: white;
        }

        .nav-button.success {
          background: linear-gradient(135deg, #2ecc71, #27ae60);
          color: white;
          box-shadow: 0 5px 15px rgba(46,204,113,0.3);
        }

        .nav-button.success:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(46,204,113,0.4);
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .button-icon {
          font-size: 1.2rem;
        }

        .login-prompt {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(0,0,0,0.1);
        }

        .login-prompt p {
          color: #666;
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
        }

        .login-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          transition: color 0.3s ease;
        }

        .login-link:hover {
          color: #5a6fd8;
          text-decoration: underline;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .register-container {
            padding: 1rem 0;
          }

          .register-content {
            padding: 0 1rem;
          }

          .form-container {
            padding: 2rem;
          }

          .role-selection {
            flex-direction: column;
          }

          .skill-input-wrapper {
            flex-direction: column;
          }

          .form-navigation {
            flex-direction: column-reverse;
            gap: 1rem;
          }

          .nav-spacer {
            display: none;
          }

          .summary-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .summary-value {
            max-width: 100%;
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;