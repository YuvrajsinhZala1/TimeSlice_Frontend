import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, type, name, value, onChange, placeholder, icon, required = false }) => (
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
        maxWidth: '450px',
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
              Welcome Back
            </h1>
            <p style={{ 
              opacity: 0.9, 
              fontSize: '1rem',
              margin: 0,
              color: 'var(--text-secondary)'
            }}>
              Sign in to your TimeSlice account
            </p>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: 'var(--space-2xl)' }}>
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-xl)' }}>
              <span>⚠️</span>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <InputField
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              icon="📧"
              required
            />

            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              icon="🔒"
              required
            />

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                background: loading ? 'var(--text-muted)' : 'var(--primary-gradient)',
                color: 'white',
                border: 'none',
                padding: 'var(--space-lg) var(--space-lg)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-normal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-xl)',
                boxShadow: loading ? 'none' : 'var(--shadow-md)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 25px rgba(0, 212, 255, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'var(--shadow-md)';
                }
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
                  Signing in...
                </>
              ) : (
                <>
                  🚀 Sign In
                </>
              )}
            </button>

            <div style={{
              textAlign: 'center',
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
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  style={{
                    color: 'var(--primary-cyan)',
                    textDecoration: 'none',
                    fontWeight: '600'
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  Join TimeSlice
                </Link>
              </p>
            </div>
          </form>
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
              <span>🛡️</span>
              Secure Login
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <span>🔒</span>
              Encrypted
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
              <span>⚡</span>
              Fast Access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;