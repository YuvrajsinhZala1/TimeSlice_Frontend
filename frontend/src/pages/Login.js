import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }
      
      if (!formData.password) {
        throw new Error('Password is required');
      }

      await login(formData.email, formData.password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setError(error.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Left Side - Features */}
        <div className="login-features">
          <div className="features-content">
            <div className="logo-section">
              <div className="brand-icon">⏰</div>
              <h1 className="brand-title">TimeSlice</h1>
              <p className="brand-subtitle">Premium Freelance Marketplace</p>
            </div>

            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <div className="feature-content">
                  <h3>Smart Project Matching</h3>
                  <p>Get matched with perfect opportunities</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">💎</div>
                <div className="feature-content">
                  <h3>Secure Credit System</h3>
                  <p>Fair payments with escrow protection</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">💬</div>
                <div className="feature-content">
                  <h3>Real-time Communication</h3>
                  <p>Chat and collaborate seamlessly</p>
                </div>
              </div>
            </div>

            <div className="testimonial">
              <div className="testimonial-content">
                <p>"TimeSlice transformed how I work with clients. The platform is intuitive and the community is amazing!"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">👩‍💻</div>
                  <div className="author-info">
                    <span className="author-name">Sarah Johnson</span>
                    <span className="author-role">Full-stack Developer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-section">
          <div className="form-container">
            <div className="form-header">
              <h2>Sign In to Your Account</h2>
              <p>Enter your credentials to access your dashboard</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="input-wrapper">
                  <div className="input-icon">📧</div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="input-wrapper">
                  <div className="input-icon">🔒</div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
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

              <div className="form-options">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="checkbox"
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-label">Remember me</span>
                </label>
                
                <Link to="/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary submit-button"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    🚀 Sign In
                  </>
                )}
              </button>

              <div className="form-divider">
                <span>or</span>
              </div>

              <div className="demo-accounts">
                <p className="demo-text">Try TimeSlice with demo accounts:</p>
                <div className="demo-buttons">
                  <button
                    type="button"
                    className="btn btn-outline demo-btn"
                    onClick={() => setFormData({ email: 'helper@demo.com', password: 'demo123' })}
                  >
                    🛠️ Demo Helper
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline demo-btn"
                    onClick={() => setFormData({ email: 'provider@demo.com', password: 'demo123' })}
                  >
                    📋 Demo Provider
                  </button>
                </div>
              </div>

              <div className="form-footer">
                <p>
                  Don't have an account?{' '}
                  <Link to="/register" className="signup-link">
                    Create Account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          background: var(--bg-primary);
          display: flex;
          align-items: center;
          padding: var(--space-xl);
        }

        .login-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-xl);
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 600px;
        }

        .login-features {
          background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
          padding: var(--space-2xl);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .features-content {
          max-width: 400px;
        }

        .logo-section {
          text-align: center;
          margin-bottom: var(--space-2xl);
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
          margin-bottom: var(--space-sm);
        }

        .brand-subtitle {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .features-list {
          margin-bottom: var(--space-2xl);
        }

        .feature-item {
          display: flex;
          gap: var(--space-lg);
          margin-bottom: var(--space-xl);
        }

        .feature-icon {
          width: 50px;
          height: 50px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .feature-content h3 {
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: var(--space-xs);
        }

        .feature-content p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .testimonial {
          background: rgba(0, 212, 255, 0.05);
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
        }

        .testimonial-content p {
          color: var(--text-primary);
          font-style: italic;
          margin-bottom: var(--space-lg);
          font-size: 1.05rem;
          line-height: 1.6;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .author-avatar {
          width: 45px;
          height: 45px;
          background: var(--primary-gradient);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .author-info {
          display: flex;
          flex-direction: column;
        }

        .author-name {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.95rem;
        }

        .author-role {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .login-form-section {
          background: var(--bg-card);
          padding: var(--space-2xl);
          display: flex;
          align-items: center;
        }

        .form-container {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }

        .form-header {
          text-align: center;
          margin-bottom: var(--space-2xl);
        }

        .form-header h2 {
          color: var(--text-primary);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: var(--space-sm);
        }

        .form-header p {
          color: var(--text-secondary);
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
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

        .form-input {
          padding-left: 3rem;
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

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--text-secondary);
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

        .forgot-password {
          color: var(--primary-cyan);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color var(--transition-normal);
        }

        .forgot-password:hover {
          color: var(--primary-orange);
        }

        .submit-button {
          width: 100%;
          padding: var(--space-lg);
          font-size: 1rem;
          font-weight: 600;
        }

        .form-divider {
          position: relative;
          text-align: center;
          margin: var(--space-lg) 0;
        }

        .form-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--border-primary);
        }

        .form-divider span {
          background: var(--bg-card);
          color: var(--text-muted);
          padding: 0 var(--space-md);
          font-size: 0.9rem;
        }

        .demo-accounts {
          text-align: center;
        }

        .demo-text {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: var(--space-md);
        }

        .demo-buttons {
          display: flex;
          gap: var(--space-md);
        }

        .demo-btn {
          flex: 1;
          font-size: 0.85rem;
          padding: var(--space-sm) var(--space-md);
        }

        .form-footer {
          text-align: center;
          padding-top: var(--space-lg);
          border-top: 1px solid var(--border-primary);
        }

        .form-footer p {
          color: var(--text-secondary);
          margin: 0;
        }

        .signup-link {
          color: var(--primary-cyan);
          text-decoration: none;
          font-weight: 600;
          transition: color var(--transition-normal);
        }

        .signup-link:hover {
          color: var(--primary-orange);
        }

        @media (max-width: 1024px) {
          .login-wrapper {
            grid-template-columns: 1fr;
            max-width: 500px;
          }

          .login-features {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .login-container {
            padding: var(--space-md);
          }

          .login-form-section {
            padding: var(--space-xl);
          }

          .demo-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;