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
          setError('Username must be at least 3 characters long');
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
          setError('Password must be at least 6 characters long');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        return true;
      case 2:
        if (!formData.primaryRole) {
          setError('Please select your primary role');
          return false;
        }
        return true;
      case 3:
        if (!formData.agreedToTerms) {
          setError('You must agree to the Terms of Service');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setError('');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;
    
    setLoading(true);
    setError('');

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        primaryRole: formData.primaryRole,
        bio: formData.bio,
        skills: formData.skills,
        agreeToMarketing: formData.agreeToMarketing
      });
      
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setError(error.message || 'Registration failed. Please try again.');
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
              <h3>I'm a Project Owner</h3>
              <p>I have projects and need skilled professionals</p>
              <ul className="role-benefits">
                <li>✓ Access to verified experts</li>
                <li>✓ Quality-focused marketplace</li>
                <li>✓ Secure payment system</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="bio" className="form-label">
          Tell us about yourself
        </label>
        <div className="input-wrapper">
          <div className="input-icon">✍️</div>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Describe your experience, interests, and what makes you unique..."
            className="form-textarea"
            rows="4"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Skills & Expertise</label>
        <div className="skills-section">
          <div className="skill-input-wrapper">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill..."
              className="form-input"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <button
              type="button"
              onClick={addSkill}
              className="btn btn-secondary add-skill-btn"
            >
              Add
            </button>
          </div>
          
          {formData.skills.length > 0 && (
            <div className="selected-skills">
              {formData.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="remove-skill"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          
          <div className="suggested-skills">
            <p className="suggested-label">Popular skills:</p>
            <div className="suggested-skills-list">
              {availableSkills.filter(skill => !formData.skills.includes(skill)).slice(0, 10).map((skill, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addPredefinedSkill(skill)}
                  className="suggested-skill"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <div className="step-header">
        <h2>Almost Done!</h2>
        <p>Review your information and complete your registration</p>
      </div>

      <div className="summary-section">
        <h3>Account Summary</h3>
        <div className="summary-grid">
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
              {formData.primaryRole === 'helper' ? '🛠️ Helper' : '📋 Project Owner'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Skills:</span>
            <span className="summary-value">
              {formData.skills.length > 0 ? formData.skills.join(', ') : 'None added'}
            </span>
          </div>
        </div>
      </div>

      <div className="agreements-section">
        <div className="form-group">
          <label className="checkbox-wrapper">
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
              I agree to the{' '}
              <Link to="/terms" className="link">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="link">Privacy Policy</Link>
              <span className="required">*</span>
            </span>
          </label>
        </div>

        <div className="form-group">
          <label className="checkbox-wrapper">
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
      </div>
    </div>
  );

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-header">
          <div className="logo-section">
            <div className="brand-icon">⏰</div>
            <h1 className="brand-title">TimeSlice</h1>
          </div>
          <StepIndicator />
        </div>

        <div className="register-content">
          {error && (
            <div className="alert alert-error">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="form-navigation">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn btn-secondary"
                >
                  ← Previous
                </button>
              )}
              
              <div className="nav-spacer"></div>
              
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn btn-primary"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      🚀 Create Account
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="register-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="login-link">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .register-container {
          min-height: 100vh;
          background: var(--bg-primary);
          padding: var(--space-xl);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .register-wrapper {
          max-width: 800px;
          width: 100%;
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          overflow: hidden;
        }

        .register-header {
          background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
          padding: var(--space-2xl);
          text-align: center;
        }

        .logo-section {
          margin-bottom: var(--space-xl);
        }

        .brand-icon {
          width: 60px;
          height: 60px;
          background: var(--primary-gradient);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin: 0 auto var(--space-md);
          box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
        }

        .brand-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .step-indicator {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: var(--space-xl);
          position: relative;
        }

        .step-indicator::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 20%;
          right: 20%;
          height: 2px;
          background: var(--border-primary);
          z-index: 0;
        }

        .step-indicator-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          position: relative;
          z-index: 1;
        }

        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          background: var(--bg-tertiary);
          color: var(--text-muted);
          transition: all var(--transition-normal);
        }

        .step-circle.active {
          background: var(--primary-gradient);
          color: white;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
        }

        .step-circle.completed {
          background: var(--success);
          color: white;
        }

        .step-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .register-content {
          padding: var(--space-2xl);
        }

        .step-content {
          margin-bottom: var(--space-xl);
        }

        .step-header {
          text-align: center;
          margin-bottom: var(--space-2xl);
        }

        .step-header h2 {
          color: var(--text-primary);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: var(--space-sm);
        }

        .step-header p {
          color: var(--text-secondary);
          margin: 0;
        }

        .required {
          color: var(--error);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: var(--space-md);
          z-index: 1;
          font-size: 1.1rem;
          color: var(--text-muted);
        }

        .form-input,
        .form-textarea {
          padding-left: 3rem;
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
          font-family: inherit;
        }

        .password-toggle {
          position: absolute;
          right: var(--space-md);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.1rem;
          color: var(--text-muted);
          transition: color var(--transition-normal);
        }

        .password-toggle:hover {
          color: var(--primary-cyan);
        }

        .role-selection {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-lg);
          margin-top: var(--space-md);
        }

        .role-card {
          background: var(--bg-secondary);
          border: 2px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          cursor: pointer;
          transition: all var(--transition-normal);
          text-align: center;
        }

        .role-card:hover {
          border-color: var(--border-accent);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .role-card.selected {
          border-color: var(--primary-cyan);
          background: rgba(0, 212, 255, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 212, 255, 0.2);
        }

        .role-icon {
          font-size: 2.5rem;
          margin-bottom: var(--space-md);
        }

        .role-content h3 {
          color: var(--text-primary);
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: var(--space-sm);
        }

        .role-content p {
          color: var(--text-secondary);
          margin-bottom: var(--space-md);
          font-size: 0.95rem;
        }

        .role-benefits {
          list-style: none;
          text-align: left;
        }

        .role-benefits li {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin-bottom: var(--space-xs);
        }

        .skills-section {
          space: var(--space-md);
        }

        .skill-input-wrapper {
          display: flex;
          gap: var(--space-md);
          margin-bottom: var(--space-md);
        }

        .add-skill-btn {
          flex-shrink: 0;
          padding: var(--space-md) var(--space-lg);
        }

        .selected-skills {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
          margin-bottom: var(--space-md);
        }

        .skill-tag {
          background: var(--primary-gradient);
          color: white;
          padding: var(--space-xs) var(--space-md);
          border-radius: var(--radius-xl);
          font-size: 0.85rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .remove-skill {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 1.2rem;
          line-height: 1;
          opacity: 0.7;
          transition: opacity var(--transition-normal);
        }

        .remove-skill:hover {
          opacity: 1;
        }

        .suggested-skills {
          margin-top: var(--space-md);
        }

        .suggested-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: var(--space-sm);
        }

        .suggested-skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
        }

        .suggested-skill {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          color: var(--text-secondary);
          padding: var(--space-xs) var(--space-md);
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .suggested-skill:hover {
          background: var(--bg-secondary);
          border-color: var(--border-accent);
          color: var(--primary-cyan);
        }

        .summary-section {
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          margin-bottom: var(--space-xl);
        }

        .summary-section h3 {
          color: var(--text-primary);
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: var(--space-lg);
        }

        .summary-grid {
          display: grid;
          gap: var(--space-md);
        }

        .summary-item {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: var(--space-md);
          align-items: start;
        }

        .summary-label {
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.9rem;
        }

        .summary-value {
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .agreements-section .form-group {
          margin-bottom: var(--space-md);
        }

        .checkbox-wrapper {
          display: flex;
          align-items: flex-start;
          gap: var(--space-md);
          cursor: pointer;
          line-height: 1.5;
        }

        .checkbox {
          display: none;
        }

        .checkmark {
          width: 18px;
          height: 18px;
          border: 2px solid var(--border-primary);
          border-radius: 4px;
          position: relative;
          transition: all var(--transition-normal);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .checkbox:checked + .checkmark {
          background: var(--primary-gradient);
          border-color: var(--primary-cyan);
        }

        .checkbox:checked + .checkmark::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 0.7rem;
          font-weight: bold;
        }

        .checkbox-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .link {
          color: var(--primary-cyan);
          text-decoration: none;
          transition: color var(--transition-normal);
        }

        .link:hover {
          color: var(--primary-orange);
        }

        .form-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--space-xl);
          border-top: 1px solid var(--border-primary);
        }

        .nav-spacer {
          flex: 1;
        }

        .register-footer {
          text-align: center;
          padding-top: var(--space-lg);
          border-top: 1px solid var(--border-primary);
          margin-top: var(--space-lg);
        }

        .register-footer p {
          color: var(--text-secondary);
          margin: 0;
        }

        .login-link {
          color: var(--primary-cyan);
          text-decoration: none;
          font-weight: 600;
          transition: color var(--transition-normal);
        }

        .login-link:hover {
          color: var(--primary-orange);
        }

        @media (max-width: 768px) {
          .register-container {
            padding: var(--space-md);
          }

          .register-header,
          .register-content {
            padding: var(--space-xl);
          }

          .step-indicator {
            flex-direction: column;
            gap: var(--space-md);
          }

          .step-indicator::before {
            display: none;
          }

          .step-indicator-item {
            flex-direction: row;
            text-align: left;
            gap: var(--space-md);
          }

          .step-circle {
            margin-bottom: 0;
            flex-shrink: 0;
          }

          .role-selection {
            grid-template-columns: 1fr;
          }

          .skill-input-wrapper {
            flex-direction: column;
            align-items: stretch;
          }

          .summary-item {
            grid-template-columns: 1fr;
            gap: var(--space-sm);
          }

          .form-navigation {
            flex-direction: column-reverse;
            gap: var(--space-md);
          }

          .nav-spacer {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;