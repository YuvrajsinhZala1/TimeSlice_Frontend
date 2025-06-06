import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [currentUser, navigate, location]);

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
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (userType) => {
    setLoading(true);
    setError('');
    
    const credentials = {
      helper: { email: 'demo.helper@timeslice.com', password: 'demo123' },
      provider: { email: 'demo.provider@timeslice.com', password: 'demo123' }
    };

    try {
      const { email, password } = credentials[userType];
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setError('Demo login failed. Please try manual login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
          <div className="shape shape-6"></div>
        </div>
        <div className="gradient-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="login-content">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="brand-content">
            <div className="brand-logo">
              <div className="logo-icon">⏰</div>
              <h1 className="brand-name">TimeSlice</h1>
            </div>
            
            <div className="brand-tagline">
              <h2>Welcome Back!</h2>
              <p>Continue your journey of seamless collaboration and professional growth</p>
            </div>

            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <div className="feature-text">
                  <h4>Smart Project Matching</h4>
                  <p>Get matched with perfect opportunities</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">💎</div>
                <div className="feature-text">
                  <h4>Secure Credit System</h4>
                  <p>Fair payments with escrow protection</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">💬</div>
                <div className="feature-text">
                  <h4>Real-time Communication</h4>
                  <p>Chat and collaborate seamlessly</p>
                </div>
              </div>
            </div>

            <div className="testimonial-preview">
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
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
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
                className="submit-button"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="button-icon">🚀</span>
                  </>
                )}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">or</span>
              <div className="divider-line"></div>
            </div>

            <div className="demo-section">
              <p className="demo-text">Try TimeSlice with demo accounts:</p>
              <div className="demo-buttons">
                <button
                  onClick={() => demoLogin('helper')}
                  disabled={loading}
                  className="demo-button helper"
                >
                  <span className="demo-icon">🛠️</span>
                  <span>Demo Helper</span>
                </button>
                <button
                  onClick={() => demoLogin('provider')}
                  disabled={loading}
                  className="demo-button provider"
                >
                  <span className="demo-icon">📋</span>
                  <span>Demo Provider</span>
                </button>
              </div>
            </div>

            <div className="signup-prompt">
              <p>Don't have an account?</p>
              <Link to="/register" className="signup-link">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
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
          animation: float 8s ease-in-out infinite;
        }

        .shape-1 {
          width: 80px;
          height: 80px;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 120px;
          height: 120px;
          top: 20%;
          right: 20%;
          animation-delay: 2s;
        }

        .shape-3 {
          width: 60px;
          height: 60px;
          bottom: 30%;
          left: 15%;
          animation-delay: 4s;
        }

        .shape-4 {
          width: 100px;
          height: 100px;
          bottom: 20%;
          right: 10%;
          animation-delay: 1s;
        }

        .shape-5 {
          width: 140px;
          height: 140px;
          top: 50%;
          left: 5%;
          animation-delay: 3s;
        }

        .shape-6 {
          width: 90px;
          height: 90px;
          top: 70%;
          right: 30%;
          animation-delay: 5s;
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          25% { 
            transform: translateY(-20px) rotate(90deg);
            opacity: 0.5;
          }
          50% { 
            transform: translateY(0px) rotate(180deg);
            opacity: 0.3;
          }
          75% { 
            transform: translateY(15px) rotate(270deg);
            opacity: 0.7;
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

        .login-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
          min-height: 100vh;
        }

        .login-branding {
          color: white;
          z-index: 3;
        }

        .brand-content {
          max-width: 500px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .logo-icon {
          width: 60px;
          height: 60px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          border: 1px solid rgba(255,255,255,0.3);
        }

        .brand-name {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #fff, #f0f0f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .brand-tagline {
          margin-bottom: 3rem;
        }

        .brand-tagline h2 {
          font-size: 2.2rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          line-height: 1.2;
        }

        .brand-tagline p {
          font-size: 1.2rem;
          opacity: 0.9;
          line-height: 1.6;
          margin: 0;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          padding: 1rem;
          border-radius: 15px;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .feature-icon {
          width: 50px;
          height: 50px;
          background: rgba(255,255,255,0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .feature-text h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .feature-text p {
          margin: 0;
          opacity: 0.8;
          font-size: 0.9rem;
        }

        .testimonial-preview {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .testimonial-content p {
          font-size: 1.1rem;
          line-height: 1.6;
          margin: 0 0 1.5rem 0;
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .author-avatar {
          width: 50px;
          height: 50px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .author-info {
          display: flex;
          flex-direction: column;
        }

        .author-name {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .author-role {
          opacity: 0.8;
          font-size: 0.9rem;
        }

        .login-form-section {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .form-container {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(20px);
          border-radius: 25px;
          padding: 3rem;
          box-shadow: 0 25px 50px rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          width: 100%;
          max-width: 450px;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-header h2 {
          font-size: 1.8rem;
          font-weight: 700;
          color: #333;
          margin: 0 0 0.5rem 0;
        }

        .form-header p {
          color: #666;
          font-size: 1rem;
          margin: 0;
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

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-weight: 600;
          color: #333;
          font-size: 0.95rem;
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

        .form-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid rgba(0,0,0,0.1);
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: rgba(255,255,255,0.8);
          outline: none;
        }

        .form-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
          background: white;
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

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.5rem;
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-size: 0.9rem;
          color: #666;
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

        .forgot-password {
          color: #667eea;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.3s ease;
        }

        .forgot-password:hover {
          color: #5a6fd8;
          text-decoration: underline;
        }

        .submit-button {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 1rem;
          box-shadow: 0 8px 25px rgba(102,126,234,0.3);
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(102,126,234,0.4);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
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

        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 2rem 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(0,0,0,0.1);
        }

        .divider-text {
          color: #666;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .demo-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .demo-text {
          color: #666;
          margin: 0 0 1rem 0;
          font-size: 0.9rem;
        }

        .demo-buttons {
          display: flex;
          gap: 1rem;
        }

        .demo-button {
          flex: 1;
          background: rgba(102,126,234,0.1);
          border: 2px solid rgba(102,126,234,0.3);
          color: #667eea;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .demo-button:hover:not(:disabled) {
          background: rgba(102,126,234,0.2);
          transform: translateY(-2px);
        }

        .demo-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .demo-icon {
          font-size: 1rem;
        }

        .signup-prompt {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(0,0,0,0.1);
        }

        .signup-prompt p {
          color: #666;
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
        }

        .signup-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          transition: color 0.3s ease;
        }

        .signup-link:hover {
          color: #5a6fd8;
          text-decoration: underline;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .login-content {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }

          .login-branding {
            order: 2;
          }

          .login-form-section {
            order: 1;
          }

          .brand-content {
            max-width: 600px;
            margin: 0 auto;
          }

          .features-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .login-content {
            padding: 1rem;
            min-height: auto;
            margin-top: 2rem;
            margin-bottom: 2rem;
          }

          .form-container {
            padding: 2rem;
          }

          .brand-tagline h2 {
            font-size: 1.8rem;
          }

          .demo-buttons {
            flex-direction: column;
          }

          .form-options {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default Login;