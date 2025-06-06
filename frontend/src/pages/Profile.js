import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Profile = () => {
  const { currentUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    skills: [],
    primaryRole: '',
    hourlyRate: '',
    availability: '',
    portfolioLinks: [],
    socialLinks: {
      website: '',
      linkedin: '',
      github: '',
      twitter: ''
    },
    preferences: {
      emailNotifications: true,
      projectNotifications: true,
      marketingEmails: false
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [newSkill, setNewSkill] = useState('');
  const [newPortfolioLink, setNewPortfolioLink] = useState({ title: '', url: '', description: '' });
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    totalEarnings: 0,
    averageRating: 0,
    responseTime: '< 1 hour',
    successRate: 0,
    totalRatings: 0
  });

  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
        skills: currentUser.skills || [],
        primaryRole: currentUser.primaryRole || '',
        hourlyRate: currentUser.hourlyRate || '',
        availability: currentUser.availability || '',
        portfolioLinks: currentUser.portfolioLinks || [],
        socialLinks: currentUser.socialLinks || {
          website: '',
          linkedin: '',
          github: '',
          twitter: ''
        },
        preferences: currentUser.preferences || {
          emailNotifications: true,
          projectNotifications: true,
          marketingEmails: false
        }
      });
      fetchUserStats();
      calculateProfileCompletion();
    }
  }, [currentUser]);

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/users/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const calculateProfileCompletion = () => {
    let completion = 0;
    const checks = [
      currentUser?.username,
      currentUser?.email,
      currentUser?.bio && currentUser.bio.length > 20,
      currentUser?.skills && currentUser.skills.length > 0,
      currentUser?.hourlyRate,
      currentUser?.availability,
      currentUser?.portfolioLinks && currentUser.portfolioLinks.length > 0,
      currentUser?.socialLinks && Object.values(currentUser.socialLinks).some(link => link)
    ];
    
    completion = (checks.filter(Boolean).length / checks.length) * 100;
    setProfileCompletion(Math.round(completion));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleAddPortfolioLink = (e) => {
    e.preventDefault();
    if (newPortfolioLink.title.trim() && newPortfolioLink.url.trim()) {
      setFormData(prev => ({
        ...prev,
        portfolioLinks: [...prev.portfolioLinks, { ...newPortfolioLink }]
      }));
      setNewPortfolioLink({ title: '', url: '', description: '' });
    }
  };

  const handleRemovePortfolioLink = (index) => {
    setFormData(prev => ({
      ...prev,
      portfolioLinks: prev.portfolioLinks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.put('/users/profile', formData);
      updateUser(response.data);
      setMessage('Profile updated successfully!');
      calculateProfileCompletion();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤', description: 'Profile summary and stats' },
    { id: 'personal', label: 'Personal Info', icon: '📝', description: 'Basic information and bio' },
    { id: 'professional', label: 'Professional', icon: '💼', description: 'Skills and work details' },
    { id: 'portfolio', label: 'Portfolio', icon: '🎨', description: 'Work samples and projects' },
    { id: 'security', label: 'Security', icon: '🔒', description: 'Password and account security' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️', description: 'Notifications and settings' }
  ];

  const TabNavigation = () => (
    <div className="tab-navigation">
      <div className="tab-nav-header">
        <h2>Profile Settings</h2>
        <div className="profile-completion">
          <div className="completion-circle">
            <div className="completion-progress" style={{ '--progress': `${profileCompletion}%` }}>
              <span className="completion-percentage">{profileCompletion}%</span>
            </div>
          </div>
          <div className="completion-text">
            <span>Profile Completion</span>
            <small>Complete your profile to attract better opportunities</small>
          </div>
        </div>
      </div>
      
      <div className="tab-list">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          >
            <div className="tab-icon">{tab.icon}</div>
            <div className="tab-content">
              <div className="tab-label">{tab.label}</div>
              <div className="tab-description">{tab.description}</div>
            </div>
            <div className="tab-arrow">→</div>
          </button>
        ))}
      </div>
    </div>
  );

  const StatCard = ({ icon, label, value, color, trend }) => (
    <div className="stat-card" style={{ '--stat-color': color }}>
      <div className="stat-header">
        <div className="stat-icon">{icon}</div>
        {trend && <div className={`stat-trend ${trend}`}>
          {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
        </div>}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );

  const InputField = ({ label, type = 'text', name, value, onChange, placeholder, required = false, textarea = false, rows = 3, icon, description }) => (
    <div className="input-field">
      <label className="input-label">
        {icon && <span className="label-icon">{icon}</span>}
        <span className="label-text">
          {label}
          {required && <span className="required-asterisk">*</span>}
        </span>
      </label>
      {description && <p className="input-description">{description}</p>}
      {textarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
          className="input-control"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="input-control"
        />
      )}
    </div>
  );

  const renderOverviewTab = () => (
    <div className="tab-content">
      <div className="overview-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {currentUser?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="avatar-info">
            <h1 className="profile-name">{currentUser?.username}</h1>
            <p className="profile-role">
              <span className={`role-badge ${currentUser?.primaryRole}`}>
                {currentUser?.primaryRole === 'helper' ? '🤝 Professional Helper' : '📋 Project Owner'}
              </span>
            </p>
            <div className="profile-metrics">
              <span className="metric">
                ⭐ {stats.averageRating ? stats.averageRating.toFixed(1) : 'New'}
              </span>
              <span className="metric-divider">•</span>
              <span className="metric">
                ✅ {stats.completedProjects} completed
              </span>
              <span className="metric-divider">•</span>
              <span className="metric">
                💰 {stats.totalEarnings} credits earned
              </span>
            </div>
          </div>
        </div>
        
        {currentUser?.bio && (
          <div className="profile-bio">
            <h3>About</h3>
            <p>{currentUser.bio}</p>
          </div>
        )}
      </div>

      <div className="stats-overview">
        <h3>Performance Overview</h3>
        <div className="stats-grid">
          <StatCard
            icon="💰"
            label="Total Credits"
            value={currentUser?.credits || 0}
            color="#00D4FF"
            trend="up"
          />
          <StatCard
            icon="🎯"
            label="Success Rate"
            value={`${stats.successRate || 0}%`}
            color="#10B981"
            trend="up"
          />
          <StatCard
            icon="⭐"
            label="Average Rating"
            value={stats.averageRating ? `${stats.averageRating.toFixed(1)}/5` : 'New'}
            color="#F59E0B"
            trend="neutral"
          />
          <StatCard
            icon="📊"
            label="Total Projects"
            value={stats.totalProjects || 0}
            color="#8B5CF6"
            trend="up"
          />
          <StatCard
            icon="⚡"
            label="Response Time"
            value={stats.responseTime || '< 1 hour'}
            color="#EF4444"
            trend="neutral"
          />
          <StatCard
            icon="📈"
            label="Reviews"
            value={stats.totalRatings || 0}
            color="#3B82F6"
            trend="up"
          />
        </div>
      </div>

      {currentUser?.skills && currentUser.skills.length > 0 && (
        <div className="skills-overview">
          <h3>Skills & Expertise</h3>
          <div className="skills-display">
            {currentUser.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {currentUser?.portfolioLinks && currentUser.portfolioLinks.length > 0 && (
        <div className="portfolio-preview">
          <h3>Featured Work</h3>
          <div className="portfolio-grid">
            {currentUser.portfolioLinks.slice(0, 3).map((item, index) => (
              <div key={index} className="portfolio-item">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                  View Project →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPersonalTab = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Personal Information</h3>
        <p>Basic details about yourself</p>
      </div>

      <form onSubmit={handleSubmitProfile}>
        <div className="form-grid">
          <InputField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Your unique username"
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

        <InputField
          label="Professional Bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell clients about your background, expertise, and what makes you unique..."
          icon="📝"
          textarea
          rows={4}
          description="A compelling bio helps you stand out to potential clients"
        />

        <div className="form-grid">
          <div className="input-field">
            <label className="input-label">
              <span className="label-icon">🎯</span>
              <span className="label-text">Primary Role</span>
            </label>
            <select
              name="primaryRole"
              value={formData.primaryRole}
              onChange={handleChange}
              className="input-control"
            >
              <option value="helper">🤝 Professional Helper</option>
              <option value="client">📋 Project Owner</option>
            </select>
          </div>
          
          <InputField
            label="Availability Status"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            placeholder="e.g., Full-time, Part-time, Weekends only"
            icon="📅"
            description="Let clients know when you're available"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderProfessionalTab = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Professional Details</h3>
        <p>Showcase your expertise and professional information</p>
      </div>

      <form onSubmit={handleSubmitProfile}>
        <InputField
          label="Hourly Rate (USD)"
          type="number"
          name="hourlyRate"
          value={formData.hourlyRate}
          onChange={handleChange}
          placeholder="Your preferred hourly rate"
          icon="💰"
          description="This helps clients understand your pricing"
        />

        <div className="skills-section">
          <div className="section-header">
            <h4>Skills & Expertise</h4>
            <p>Add skills that showcase your capabilities</p>
          </div>
          
          {formData.skills.length > 0 && (
            <div className="current-skills">
              {formData.skills.map(skill => (
                <div key={skill} className="skill-item">
                  <span className="skill-name">{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="skill-remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddSkill} className="skill-form">
            <div className="skill-input-group">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a new skill (e.g., React, Design, SEO)"
                className="skill-input"
              />
              <button type="submit" className="btn btn-secondary">
                Add Skill
              </button>
            </div>
          </form>
        </div>

        <div className="social-links-section">
          <div className="section-header">
            <h4>Professional Links</h4>
            <p>Add links to your professional profiles and portfolio</p>
          </div>
          
          <div className="form-grid">
            <InputField
              label="Website"
              name="socialLinks.website"
              value={formData.socialLinks.website}
              onChange={handleChange}
              placeholder="https://yourwebsite.com"
              icon="🌐"
            />
            <InputField
              label="LinkedIn"
              name="socialLinks.linkedin"
              value={formData.socialLinks.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourprofile"
              icon="💼"
            />
            <InputField
              label="GitHub"
              name="socialLinks.github"
              value={formData.socialLinks.github}
              onChange={handleChange}
              placeholder="https://github.com/yourusername"
              icon="💻"
            />
            <InputField
              label="Twitter"
              name="socialLinks.twitter"
              value={formData.socialLinks.twitter}
              onChange={handleChange}
              placeholder="https://twitter.com/yourusername"
              icon="🐦"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderPortfolioTab = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Portfolio & Work Samples</h3>
        <p>Showcase your best work to attract premium clients</p>
      </div>

      {formData.portfolioLinks.length > 0 && (
        <div className="portfolio-list">
          {formData.portfolioLinks.map((link, index) => (
            <div key={index} className="portfolio-card">
              <div className="portfolio-header">
                <h4>{link.title}</h4>
                <button
                  type="button"
                  onClick={() => handleRemovePortfolioLink(index)}
                  className="portfolio-remove"
                >
                  🗑️
                </button>
              </div>
              <p className="portfolio-description">{link.description}</p>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="portfolio-link"
              >
                🔗 View Project
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="add-portfolio-section">
        <h4>Add New Portfolio Item</h4>
        <form onSubmit={handleAddPortfolioLink} className="portfolio-form">
          <div className="form-grid">
            <InputField
              label="Project Title"
              value={newPortfolioLink.title}
              onChange={(e) => setNewPortfolioLink(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., E-commerce Website Redesign"
              icon="🎯"
              required
            />
            <InputField
              label="Project URL"
              type="url"
              value={newPortfolioLink.url}
              onChange={(e) => setNewPortfolioLink(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://project-url.com"
              icon="🔗"
              required
            />
          </div>
          
          <InputField
            label="Project Description"
            value={newPortfolioLink.description}
            onChange={(e) => setNewPortfolioLink(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe the project, your role, technologies used, and the impact..."
            icon="📝"
            textarea
            rows="3"
          />
          
          <button type="submit" className="btn btn-primary">
            🎨 Add Portfolio Item
          </button>
        </form>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Password & Security</h3>
        <p>Keep your account secure with a strong password</p>
      </div>

      <form onSubmit={handleChangePassword} className="security-form">
        <InputField
          label="Current Password"
          type="password"
          name="currentPassword"
          value={passwordData.currentPassword}
          onChange={handlePasswordChange}
          placeholder="Enter your current password"
          icon="🔒"
          required
        />

        <div className="form-grid">
          <InputField
            label="New Password"
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            placeholder="Enter new password"
            icon="🔑"
            required
          />
          <InputField
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="Confirm new password"
            icon="🔐"
            required
          />
        </div>

        <div className="security-info">
          <h4>Password Requirements</h4>
          <ul>
            <li>At least 6 characters long</li>
            <li>Mix of letters, numbers, and symbols recommended</li>
            <li>Avoid using personal information</li>
          </ul>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Updating...' : '🔒 Update Password'}
        </button>
      </form>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3>Notification Preferences</h3>
        <p>Choose how you want to be notified about platform activities</p>
      </div>

      <form onSubmit={handleSubmitProfile}>
        <div className="preferences-list">
          <div className="preference-item">
            <div className="preference-header">
              <div className="preference-icon">📧</div>
              <div className="preference-content">
                <h4>Email Notifications</h4>
                <p>Receive email updates about important account activities</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="preferences.emailNotifications"
                checked={formData.preferences.emailNotifications}
                onChange={handleChange}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="preference-item">
            <div className="preference-header">
              <div className="preference-icon">🚀</div>
              <div className="preference-content">
                <h4>Project Notifications</h4>
                <p>Get notified about new projects matching your skills</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="preferences.projectNotifications"
                checked={formData.preferences.projectNotifications}
                onChange={handleChange}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="preference-item">
            <div className="preference-header">
              <div className="preference-icon">📬</div>
              <div className="preference-content">
                <h4>Marketing Updates</h4>
                <p>Receive updates about new features and platform improvements</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="preferences.marketingEmails"
                checked={formData.preferences.marketingEmails}
                onChange={handleChange}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : '💾 Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-layout">
        {/* Messages */}
        {message && (
          <div className="alert alert-success">
            <span>✅</span>
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Navigation Sidebar */}
        <div className="profile-sidebar">
          <TabNavigation />
        </div>

        {/* Main Content */}
        <div className="profile-main">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'personal' && renderPersonalTab()}
          {activeTab === 'professional' && renderProfessionalTab()}
          {activeTab === 'portfolio' && renderPortfolioTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'preferences' && renderPreferencesTab()}
        </div>
      </div>

      <style jsx>{`
        .profile-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .profile-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 3rem;
          min-height: 80vh;
        }

        .alert {
          grid-column: 1 / -1;
          margin-bottom: 2rem;
        }

        .profile-sidebar {
          position: sticky;
          top: 2rem;
          height: fit-content;
        }

        .tab-navigation {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 1rem;
          overflow: hidden;
        }

        .tab-nav-header {
          padding: 2rem;
          background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
          border-bottom: 1px solid var(--border-primary);
        }

        .tab-nav-header h2 {
          color: var(--text-primary);
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .profile-completion {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .completion-circle {
          position: relative;
          width: 60px;
          height: 60px;
        }

        .completion-progress {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: conic-gradient(var(--primary-cyan) var(--progress), var(--bg-tertiary) var(--progress));
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .completion-progress::before {
          content: '';
          position: absolute;
          inset: 8px;
          border-radius: 50%;
          background: var(--bg-card);
        }

        .completion-percentage {
          position: relative;
          z-index: 1;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .completion-text span {
          display: block;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .completion-text small {
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        .tab-list {
          display: flex;
          flex-direction: column;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem 2rem;
          background: none;
          border: none;
          border-bottom: 1px solid var(--border-primary);
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .tab-button:last-child {
          border-bottom: none;
        }

        .tab-button:hover {
          background: var(--bg-secondary);
        }

        .tab-button.active {
          background: rgba(0, 212, 255, 0.1);
          border-right: 3px solid var(--primary-cyan);
        }

        .tab-icon {
          font-size: 1.5rem;
          min-width: 32px;
        }

        .tab-content {
          flex: 1;
        }

        .tab-label {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .tab-description {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .tab-arrow {
          margin-left: auto;
          color: var(--text-muted);
          transition: all 0.3s ease;
        }

        .tab-button.active .tab-arrow {
          color: var(--primary-cyan);
          transform: translateX(4px);
        }

        .profile-main {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 1rem;
          padding: 3rem;
          min-height: 600px;
        }

        .tab-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-primary);
        }

        .section-header h3 {
          color: var(--text-primary);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .section-header p {
          color: var(--text-secondary);
          margin: 0;
        }

        .overview-header {
          margin-bottom: 3rem;
        }

        .profile-avatar {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .avatar-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--primary-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 3rem;
          font-weight: 800;
          box-shadow: var(--shadow-lg);
        }

        .profile-name {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .role-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .role-badge.helper {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .role-badge.client {
          background: rgba(59, 130, 246, 0.15);
          color: var(--info);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .profile-metrics {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          color: var(--text-secondary);
        }

        .metric {
          font-weight: 600;
        }

        .metric-divider {
          color: var(--text-muted);
        }

        .profile-bio {
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid var(--border-primary);
        }

        .profile-bio h3 {
          color: var(--text-primary);
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .profile-bio p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .stats-overview,
        .skills-overview,
        .portfolio-preview {
          margin-bottom: 3rem;
        }

        .stats-overview h3,
        .skills-overview h3,
        .portfolio-preview h3 {
          color: var(--text-primary);
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 1rem;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-trend {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 700;
        }

        .stat-trend.up {
          background: rgba(16, 185, 129, 0.2);
          color: var(--success);
        }

        .stat-trend.down {
          background: rgba(239, 68, 68, 0.2);
          color: var(--error);
        }

        .stat-trend.neutral {
          background: var(--bg-tertiary);
          color: var(--text-muted);
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--stat-color);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: var(--text-secondary);
          font-weight: 600;
        }

        .skills-display {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .skill-tag {
          background: rgba(0, 212, 255, 0.15);
          color: var(--primary-cyan);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          border: 1px solid rgba(0, 212, 255, 0.3);
          font-size: 0.9rem;
          font-weight: 600;
        }

        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .portfolio-item {
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid var(--border-primary);
        }

        .portfolio-item h4 {
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .portfolio-item p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .portfolio-link {
          color: var(--primary-cyan);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .input-field {
          margin-bottom: 1.5rem;
        }

        .input-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .label-icon {
          font-size: 1rem;
        }

        .required-asterisk {
          color: var(--error);
        }

        .input-description {
          color: var(--text-muted);
          font-size: 0.8rem;
          margin: 0 0 0.5rem 0;
        }

        .input-control {
          width: 100%;
          padding: 1rem;
          background: var(--bg-input);
          border: 2px solid var(--border-primary);
          border-radius: 0.75rem;
          color: var(--text-primary);
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .input-control:focus {
          outline: none;
          border-color: var(--border-accent);
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
        }

        .input-control::placeholder {
          color: var(--text-muted);
        }

        .skills-section,
        .social-links-section,
        .add-portfolio-section {
          margin-bottom: 2rem;
          padding: 2rem;
          background: var(--bg-secondary);
          border-radius: 1rem;
          border: 1px solid var(--border-primary);
        }

        .current-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .skill-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0, 212, 255, 0.15);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 2rem;
          padding: 0.5rem 1rem;
        }

        .skill-name {
          color: var(--primary-cyan);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .skill-remove {
          background: none;
          border: none;
          color: var(--primary-cyan);
          cursor: pointer;
          font-size: 1.2rem;
          font-weight: 700;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .skill-form {
          margin-top: 1rem;
        }

        .skill-input-group {
          display: flex;
          gap: 1rem;
          align-items: flex-end;
        }

        .skill-input {
          flex: 1;
          padding: 1rem;
          background: var(--bg-input);
          border: 2px solid var(--border-primary);
          border-radius: 0.75rem;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .portfolio-list {
          margin-bottom: 2rem;
        }

        .portfolio-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .portfolio-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .portfolio-header h4 {
          color: var(--text-primary);
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0;
        }

        .portfolio-remove {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.3s ease;
        }

        .portfolio-remove:hover {
          background: rgba(239, 68, 68, 0.15);
        }

        .portfolio-description {
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .security-form {
          max-width: 500px;
        }

        .security-info {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin: 2rem 0;
        }

        .security-info h4 {
          color: var(--info);
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .security-info ul {
          color: var(--text-secondary);
          margin: 0;
          padding-left: 1.5rem;
        }

        .security-info li {
          margin-bottom: 0.5rem;
        }

        .preferences-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .preference-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 1rem;
        }

        .preference-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .preference-icon {
          font-size: 1.5rem;
          width: 40px;
          text-align: center;
        }

        .preference-content h4 {
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .preference-content p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0;
        }

        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 30px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--bg-tertiary);
          border: 2px solid var(--border-primary);
          transition: 0.3s;
          border-radius: 30px;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 3px;
          bottom: 2px;
          background: var(--text-muted);
          transition: 0.3s;
          border-radius: 50%;
        }

        input:checked + .toggle-slider {
          background: var(--primary-cyan);
          border-color: var(--primary-cyan);
        }

        input:checked + .toggle-slider:before {
          background: white;
          transform: translateX(30px);
        }

        .form-actions {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-primary);
          display: flex;
          justify-content: flex-end;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          border: none;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .btn-primary {
          background: var(--primary-gradient);
          color: white;
          box-shadow: var(--shadow-sm);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-muted);
        }

        .btn-secondary:hover {
          background: var(--bg-input);
          border-color: var(--border-accent);
        }

        @media (max-width: 1024px) {
          .profile-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .profile-sidebar {
            position: static;
          }

          .tab-navigation {
            margin-bottom: 2rem;
          }

          .tab-nav-header {
            padding: 1.5rem;
          }

          .profile-completion {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .tab-list {
            flex-direction: row;
            overflow-x: auto;
          }

          .tab-button {
            min-width: 200px;
            border-bottom: none;
            border-right: 1px solid var(--border-primary);
          }

          .tab-button:last-child {
            border-right: none;
          }

          .tab-button.active {
            border-right: 1px solid var(--border-primary);
            border-bottom: 3px solid var(--primary-cyan);
          }
        }

        @media (max-width: 768px) {
          .profile-container {
            padding: 1rem;
          }

          .profile-main {
            padding: 2rem 1.5rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .portfolio-grid {
            grid-template-columns: 1fr;
          }

          .profile-avatar {
            flex-direction: column;
            text-align: center;
          }

          .avatar-circle {
            width: 100px;
            height: 100px;
            font-size: 2.5rem;
          }

          .profile-name {
            font-size: 2rem;
          }

          .skill-input-group {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;