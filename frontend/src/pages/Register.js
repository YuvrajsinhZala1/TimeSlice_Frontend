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
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '600',
        color: '#374151',
        fontSize: '0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span style={{ fontSize: '1rem' }}>{icon}</span>
        {label}
        {required && <span style={{ color: '#EF4444' }}>*</span>}
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
              padding: '0.75rem 1rem',
              border: '2px solid #E5E7EB',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              outline: 'none',
              background: 'white',
              resize: 'vertical'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#00D4FF';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 212, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E5E7EB';
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
              padding: '0.75rem 1rem',
              paddingRight: type === 'password' ? '3rem' : '1rem',
              border: '2px solid #E5E7EB',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
              outline: 'none',
              background: 'white'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#00D4FF';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 212, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E5E7EB';
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
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: '#6B7280'
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>
    </div>
  );

  const StepIndicator = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '2rem'
    }}>
      {[1, 2, 3, 4].map((step) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: step <= currentStep ? 'linear-gradient(135deg, #00D4FF, #FF6B35)' : '#E5E7EB',
            color: step <= currentStep ? 'white' : '#9CA3AF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}>
            {step < currentStep ? '✓' : step}
          </div>
          {step < 4 && (
            <div style={{
              width: '60px',
              height: '2px',
              background: step < currentStep ? 'linear-gradient(135deg, #00D4FF, #FF6B35)' : '#E5E7EB',
              margin: '0 0.5rem'
            }}></div>
          )}
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 style={{ 
              textAlign: 'center', 
              marginBottom: '1.5rem',
              color: '#1F2937',
              fontSize: '1.2rem'
            }}>
              📝 Basic Information
            </h3>
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
            <h3 style={{ 
              textAlign: 'center', 
              marginBottom: '1.5rem',
              color: '#1F2937',
              fontSize: '1.2rem'
            }}>
              🔒 Secure Password
            </h3>
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
            <div style={{
              background: '#F0F9FF',
              border: '1px solid #BAE6FD',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginTop: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span>💡</span>
                <strong style={{ color: '#0C4A6E' }}>Password Tips:</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1rem', color: '#0369A1', fontSize: '0.9rem' }}>
                <li>At least 6 characters long</li>
                <li>Mix of letters, numbers, and symbols</li>
                <li>Avoid common words or personal info</li>
              </ul>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div>
            <h3 style={{ 
              textAlign: 'center', 
              marginBottom: '1.5rem',
              color: '#1F2937',
              fontSize: '1.2rem'
            }}>
              🎯 Choose Your Role
            </h3>
            <UserTypeSelector
              selectedType={formData.primaryRole}
              onChange={handleRoleChange}
            />
          </div>
        );
        
      case 4:
        return (
          <div>
            <h3 style={{ 
              textAlign: 'center', 
              marginBottom: '1.5rem',
              color: '#1F2937',
              fontSize: '1.2rem'
            }}>
              ✨ Complete Your Profile
            </h3>
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
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginTop: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span>🚀</span>
                <strong style={{ color: '#166534' }}>Almost Ready!</strong>
              </div>
              <p style={{ margin: 0, color: '#15803D', fontSize: '0.9rem' }}>
                Adding skills helps you get matched with relevant opportunities. You can always update these later.
              </p>
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
      background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #F9FAFB 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: 'white',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #E5E7EB',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0A0E27, #1A1F3A)',
          color: 'white',
          padding: '2rem',
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
              width: '60px',
              height: '60px',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              margin: '0 auto 1rem'
            }}>
              ⧗
            </div>
            
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0
            }}>
              Join TimeSlice
            </h1>
            <p style={{ 
              opacity: 0.9, 
              fontSize: '0.9rem',
              margin: 0
            }}>
              Join the premium freelance community
            </p>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '2rem' }}>
          <StepIndicator />

          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#B91C1C',
              padding: '0.75rem 1rem',
              borderRadius: '0.75rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem'
            }}>
              <span>⚠️</span>
              {error}
            </div>
          )}
          
          <form onSubmit={currentStep === 4 ? handleSubmit : (e) => e.preventDefault()}>
            {renderStep()}

            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              marginTop: '2rem'
            }}>
              {currentStep > 1 && (
                <button 
                  type="button"
                  onClick={prevStep}
                  style={{
                    flex: 1,
                    background: '#F3F4F6',
                    color: '#374151',
                    border: '1px solid #D1D5DB',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  ← Back
                </button>
              )}
              
              <button 
                type={currentStep === 4 ? "submit" : "button"}
                onClick={currentStep === 4 ? undefined : nextStep}
                disabled={loading}
                style={{
                  flex: 1,
                  background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #00D4FF, #FF6B35)',
                  color: 'white',
                  border: 'none',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 20px rgba(0, 212, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
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
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#F9FAFB',
              borderRadius: '0.75rem',
              border: '1px solid #E5E7EB'
            }}>
              <p style={{ 
                margin: 0, 
                color: '#6B7280',
                fontSize: '0.9rem'
              }}>
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  style={{
                    color: '#00D4FF',
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
          padding: '1rem 2rem',
          background: '#F9FAFB',
          borderTop: '1px solid #E5E7EB',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            fontSize: '0.8rem',
            color: '#6B7280'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>🎯</span>
              Premium Community
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>💰</span>
              100 Free Credits
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>⚡</span>
              Instant Access
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Register;