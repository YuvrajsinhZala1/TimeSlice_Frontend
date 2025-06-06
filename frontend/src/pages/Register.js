import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserTypeSelector from '../components/UserTypeSelector';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    primaryRole: '',
    bio: '',
    skills: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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

  const validateStep = (step) => {
    setError('');
    
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
        return true;
        
      case 2:
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
        return true;
        
      case 3:
        if (!formData.primaryRole) {
          setError('Please select your primary role');
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;
    
    setError('');
    setLoading(true);

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

  const InputField = ({ label, type, name, value, onChange, placeholder, icon, required = false, textarea = false }) => (
    <div className="form-group">
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        marginBottom: 'var(--space-sm)',
        fontWeight: '600',
        color: 'var(--text-primary)',
        fontSize: '0.9rem'
      }}>
        <span style={{ fontSize: '1rem' }}>{icon}</span>
        {label}
        {required && <span style={{ color: 'var(--error)' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        {textarea ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows="3"
            style={{
              width: '100%',
              padding: 'var(--space-md) var(--space-lg)',
              background: 'var(--bg-input)',
              border: '2px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              transition: 'all var(--transition-normal)',
              outline: 'none',
              resize: 'vertical'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--border-accent)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 212, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-primary)';
              e.target.style.boxShadow = 'none';
            }}
          />
        ) : (
          <input
            type={type === 'password' && showPassword ? 'text' : type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            style={{
              width: '100%',
              padding: 'var(--space-md) var(--space-lg)',
              paddingRight: type === 'password' ? '3rem' : 'var(--space-lg)',
              background: 'var(--bg-input)',
              border: '2px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              transition: 'all var(--transition-normal)',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--border-accent)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 212, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-primary)';
              e.target.style.boxShadow = 'none';
            }}
          />
        )}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 'var(--space-lg)',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: 'var(--text-muted)'
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>
    </div>
  );

  const StepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
          <div 
            className={`step ${step <= currentStep ? 'active' : 'inactive'}`}
            style={{
              background: step <= currentStep ? 'var(--primary-gradient)' : 'var(--bg-tertiary)',
              color: step <= currentStep ? 'white' : 'var(--text-muted)'
            }}
          >
            {step < currentStep ? '✓' : step}
          </div>
          {step < 4 && (
            <div 
              className={`connector ${step < currentStep ? 'completed' : ''}`}
              style={{
                background: step < currentStep ? 'var(--primary-gradient)' : 'var(--border-primary)'
              }}
            ></div>
          )}
        </div>
      ))}
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return '📝 Basic Information';
      case 2: return '🔒 Secure Password';
      case 3: return '🎯 Choose Your Role';
      case 4: return '✨ Complete Profile';
      default: return '';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <InputField
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a unique username"
              icon="👤"
              required
            />
            <InputField
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              icon="📧"
              required
            />
          </div>
        );
        
      case 2:
        return (
          <div>
            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              icon="🔒"
              required
            />
            <InputField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              icon="🔐"
              required
            />
            <div className="alert alert-info">
              <span>💡</span>
              <div>
                <strong>Password Tips:</strong>
                <ul style={{ margin: '0.5rem 0 0 1rem', paddingLeft: '1rem' }}>
                  <li>At least 6 characters long</li>
                  <li>Mix of letters, numbers, and symbols</li>
                  <li>Avoid common words or personal info</li>
                </ul>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div>
            <UserTypeSelector
              selectedType={formData.primaryRole}
              onChange={handleRoleChange}
            />
          </div>
        );
        
      case 4:
        return (
          <div>
            <InputField
              label="Bio (Optional)"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself and your expertise..."
              icon="📝"
              textarea
            />
            <InputField
              label="Skills (Optional)"
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="JavaScript, React, Design, Writing, etc."
              icon="🎯"
            />
            <div className="alert alert-success">
              <span>🚀</span>
              <div>
                <strong>Almost Ready!</strong>
                <p style={{ margin: '0.5rem 0 0 0' }}>
                  Adding skills helps you get matched with relevant opportunities. You can always update these later.
                </p>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-xl) var(--space-md)',
      position: 'relative'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 107, 53, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '550px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-primary)',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-primary), var(--bg-secondary))',
          color: 'white',
          padding: 'var(--space-2xl)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 212, 255, 0.3) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}></div>
          
          <div style={{
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto var(--space-lg)',
              boxShadow: 'var(--shadow-lg)'
            }}>
              {/* Placeholder for your logo */}
              ⧗
            </div>
            
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '800',
              marginBottom: 'var(--space-sm)',
              background: 'var(--primary-gradient)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Join TimeSlice
            </h1>
            <p style={{ 
              opacity: 0.9, 
              fontSize: '1rem',
              margin: 0,
              color: 'var(--text-secondary)'
            }}>
              Join the premium freelance community
            </p>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: 'var(--space-2xl)' }}>
          <StepIndicator />
          
          <h2 style={{
            textAlign: 'center',
            marginBottom: 'var(--space-xl)',
            color: 'var(--text-primary)',
            fontSize: '1.3rem',
            fontWeight: '600'
          }}>
            {getStepTitle()}
          </h2>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-xl)' }}>
              <span>⚠️</span>
              {error}
            </div>
          )}
          
          <form onSubmit={currentStep === 4 ? handleSubmit : (e) => e.preventDefault()}>
            {renderStep()}

            <div style={{ 
              display: 'flex', 
              gap: 'var(--space-lg)',
              marginTop: 'var(--space-2xl)'
            }}>
              {currentStep > 1 && (
                <button 
                  type="button"
                  onClick={prevStep}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  ← Back
                </button>
              )}
              
              <button 
                type={currentStep === 4 ? "submit" : "button"}
                onClick={currentStep === 4 ? undefined : nextStep}
                disabled={loading}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  background: loading ? 'var(--text-muted)' : 'var(--primary-gradient)',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner" style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white'
                    }}></div>
                    Creating Account...
                  </>
                ) : currentStep === 4 ? (
                  <>🚀 Create Account</>
                ) : (
                  <>Continue →</>
                )}
              </button>
            </div>
          </form>

          {currentStep === 1 && (
            <div style={{
              textAlign: 'center',
              marginTop: 'var(--space-xl)',
              padding: 'var(--space-lg)',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)'
            }}>
              <p style={{ 
                margin: 0, 
                color: 'var(--text-secondary)',
                fontSize: '0.9rem'
              }}>
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  style={{
                    color: 'var(--primary-cyan)',
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: 'var(--space-lg) var(--space-2xl)',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-primary)',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-2xl)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <span>🎯</span>
              Premium Community
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <span>💰</span>
              100 Free Credits
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <span>⚡</span>
              Instant Access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;