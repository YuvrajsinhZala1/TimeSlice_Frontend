import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CreateTask = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills: [],
    urgency: 'normal',
    duration: '',
    credits: '',
    dateTime: '',
    isRemote: true,
    location: ''
  });
  const [newSkill, setNewSkill] = useState('');

  const totalSteps = 4;

  const categories = [
    { id: 'web-dev', name: 'Web Development', icon: '🌐', popular: true },
    { id: 'mobile-dev', name: 'Mobile Development', icon: '📱', popular: true },
    { id: 'design', name: 'UI/UX Design', icon: '🎨', popular: true },
    { id: 'writing', name: 'Content Writing', icon: '✍️', popular: true },
    { id: 'marketing', name: 'Digital Marketing', icon: '📊', popular: false },
    { id: 'data', name: 'Data Analysis', icon: '📈', popular: false },
    { id: 'video', name: 'Video Editing', icon: '🎬', popular: false },
    { id: 'other', name: 'Other', icon: '💼', popular: false }
  ];

  const urgencyLevels = [
    { id: 'low', name: 'Low Priority', description: 'Flexible timeline', color: '#10B981', days: '7-14 days' },
    { id: 'normal', name: 'Normal', description: 'Standard delivery', color: '#3B82F6', days: '3-7 days' },
    { id: 'high', name: 'High Priority', description: 'Quick turnaround', color: '#F59E0B', days: '1-3 days' },
    { id: 'urgent', name: 'Urgent', description: 'Rush delivery', color: '#EF4444', days: '<24 hours' }
  ];

  const durationOptions = [
    { id: 'short', name: 'Short Term', description: 'Less than 1 week', icon: '⚡' },
    { id: 'medium', name: 'Medium Term', description: '1-4 weeks', icon: '📅' },
    { id: 'long', name: 'Long Term', description: '1+ months', icon: '🗓️' },
    { id: 'ongoing', name: 'Ongoing', description: 'Continuous work', icon: '🔄' }
  ];

  const popularSkills = [
    'React', 'JavaScript', 'Python', 'Node.js', 'UI/UX Design',
    'WordPress', 'SEO', 'Content Writing', 'Social Media', 'Photography'
  ];

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
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

  const addPopularSkill = (skill) => {
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
        if (!formData.title.trim()) {
          setError('Project title is required');
          return false;
        }
        if (formData.title.length < 10) {
          setError('Project title must be at least 10 characters');
          return false;
        }
        if (!formData.description.trim()) {
          setError('Project description is required');
          return false;
        }
        if (formData.description.length < 50) {
          setError('Project description must be at least 50 characters');
          return false;
        }
        return true;
      case 2:
        if (!formData.category) {
          setError('Please select a category');
          return false;
        }
        if (formData.skills.length === 0) {
          setError('Please add at least one skill requirement');
          return false;
        }
        return true;
      case 3:
        if (!formData.duration) {
          setError('Please select project duration');
          return false;
        }
        if (!formData.urgency) {
          setError('Please select urgency level');
          return false;
        }
        return true;
      case 4:
        if (!formData.credits || formData.credits < 10) {
          setError('Credits must be at least 10');
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
    
    if (!validateStep(4)) return;
    
    setLoading(true);
    setError('');

    try {
      await api.post('/tasks', {
        ...formData,
        credits: parseInt(formData.credits)
      });
      
      navigate('/my-tasks', { 
        state: { message: 'Project created successfully!' }
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4].map(step => (
        <div key={step} className="step-indicator-item">
          <div className={`step-circle ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
            {currentStep > step ? '✓' : step}
          </div>
          <span className="step-label">
            {step === 1 && 'Project Details'}
            {step === 2 && 'Description & Skills'}
            {step === 3 && 'Timeline & Duration'}
            {step === 4 && 'Budget & Priority'}
          </span>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="step-content">
      <div className="step-header">
        <h2>🚀 Create New Project</h2>
        <p>Share your project and connect with talented helpers</p>
      </div>

      <div className="form-group">
        <label htmlFor="title" className="form-label">
          Project Title <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g., Build a responsive e-commerce website with payment integration"
          className="form-input"
          maxLength="100"
          required
        />
        <div className="input-help">
          The more specific you are, the better quality applications you'll receive
        </div>
        <div className="char-counter">
          {formData.title.length}/100 characters
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Project Description <span className="required">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your project in detail. Include:&#10;• What you want to build&#10;• Key features and functionality&#10;• Any specific requirements or preferences&#10;• Expected deliverables&#10;• Success criteria"
          className="form-textarea"
          rows="8"
          maxLength="2000"
          required
        />
        <div className="char-counter">
          {formData.description.length}/2000 characters
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <div className="step-header">
        <h2>📝 Description & Skills</h2>
        <p>Help us match you with the right professionals</p>
      </div>

      <div className="form-group">
        <label className="form-label">
          Project Category <span className="required">*</span>
        </label>
        <div className="category-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`category-card ${formData.category === category.id ? 'selected' : ''} ${category.popular ? 'popular' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
            >
              <div className="category-icon">{category.icon}</div>
              <div className="category-name">{category.name}</div>
              {category.popular && <div className="popular-badge">Popular</div>}
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Required Skills <span className="required">*</span>
        </label>
        <div className="skills-section">
          <div className="skill-input-wrapper">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill requirement..."
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
          
          <div className="popular-skills">
            <p className="popular-label">Popular skills:</p>
            <div className="popular-skills-list">
              {popularSkills.filter(skill => !formData.skills.includes(skill)).slice(0, 8).map((skill, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addPopularSkill(skill)}
                  className="popular-skill"
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
        <h2>⏰ Timeline & Duration</h2>
        <p>Set your project timeline and delivery expectations</p>
      </div>

      <div className="form-group">
        <label className="form-label">
          Project Duration <span className="required">*</span>
        </label>
        <div className="duration-grid">
          {durationOptions.map((option) => (
            <div
              key={option.id}
              className={`duration-card ${formData.duration === option.id ? 'selected' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, duration: option.id }))}
            >
              <div className="duration-icon">{option.icon}</div>
              <div className="duration-content">
                <h4>{option.name}</h4>
                <p>{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          Priority Level <span className="required">*</span>
        </label>
        <div className="urgency-grid">
          {urgencyLevels.map((level) => (
            <div
              key={level.id}
              className={`urgency-card ${formData.urgency === level.id ? 'selected' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, urgency: level.id }))}
              style={{ '--urgency-color': level.color }}
            >
              <div className="urgency-header">
                <h4>{level.name}</h4>
                <span className="urgency-timeline">{level.days}</span>
              </div>
              <p>{level.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="dateTime" className="form-label">
          Preferred Deadline (Optional)
        </label>
        <input
          type="datetime-local"
          id="dateTime"
          name="dateTime"
          value={formData.dateTime}
          onChange={handleInputChange}
          className="form-input"
          min={new Date().toISOString().slice(0, 16)}
        />
      </div>

      <div className="form-group">
        <div className="checkbox-group">
          <label className="checkbox-wrapper">
            <input
              type="checkbox"
              name="isRemote"
              checked={formData.isRemote}
              onChange={handleInputChange}
              className="checkbox"
            />
            <span className="checkmark"></span>
            <span className="checkbox-label">This is a remote project</span>
          </label>
        </div>
        
        {!formData.isRemote && (
          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Project Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, Country"
              className="form-input"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="step-content">
      <div className="step-header">
        <h2>💰 Budget & Priority</h2>
        <p>Set your budget and finalize project details</p>
      </div>

      <div className="form-group">
        <label htmlFor="credits" className="form-label">
          Project Budget (Credits) <span className="required">*</span>
        </label>
        <div className="budget-input-wrapper">
          <div className="budget-icon">💎</div>
          <input
            type="number"
            id="credits"
            name="credits"
            value={formData.credits}
            onChange={handleInputChange}
            placeholder="50"
            className="form-input budget-input"
            min="10"
            max="1000"
            required
          />
          <div className="budget-suffix">credits</div>
        </div>
        <div className="budget-help">
          <div className="budget-suggestions">
            <span>💡 Typical ranges:</span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, credits: '25' }))}
              className="budget-suggestion"
            >
              25 (Small tasks)
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, credits: '50' }))}
              className="budget-suggestion"
            >
              50 (Medium projects)
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, credits: '100' }))}
              className="budget-suggestion"
            >
              100 (Large projects)
            </button>
          </div>
        </div>
      </div>

      <div className="project-summary">
        <h3>📋 Project Summary</h3>
        <div className="summary-content">
          <div className="summary-section">
            <h4>Project Details</h4>
            <div className="summary-item">
              <span className="summary-label">Title:</span>
              <span className="summary-value">{formData.title}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Category:</span>
              <span className="summary-value">
                {categories.find(c => c.id === formData.category)?.name || 'Not selected'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Duration:</span>
              <span className="summary-value">
                {durationOptions.find(d => d.id === formData.duration)?.name || 'Not selected'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Priority:</span>
              <span className="summary-value">
                {urgencyLevels.find(u => u.id === formData.urgency)?.name || 'Not selected'}
              </span>
            </div>
          </div>
          
          <div className="summary-section">
            <h4>Requirements</h4>
            <div className="summary-item">
              <span className="summary-label">Skills:</span>
              <div className="summary-skills">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="summary-skill-tag">{skill}</span>
                ))}
              </div>
            </div>
            <div className="summary-item">
              <span className="summary-label">Location:</span>
              <span className="summary-value">
                {formData.isRemote ? 'Remote' : formData.location || 'Not specified'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Budget:</span>
              <span className="summary-value budget-highlight">💎 {formData.credits} credits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="container">
        <div className="create-task-wrapper">
          <div className="create-task-header">
            <StepIndicator />
          </div>

          <div className="create-task-content">
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
              {currentStep === 4 && renderStep4()}

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
                        Creating Project...
                      </>
                    ) : (
                      <>
                        🚀 Create Project
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .create-task-wrapper {
          max-width: 800px;
          margin: 0 auto;
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          overflow: hidden;
        }

        .create-task-header {
          background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
          padding: var(--space-2xl);
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
          left: 15%;
          right: 15%;
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
          text-align: center;
        }

        .step-circle {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1rem;
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
          max-width: 120px;
        }

        .create-task-content {
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
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: var(--space-sm);
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .step-header p {
          color: var(--text-secondary);
          margin: 0;
        }

        .required {
          color: var(--error);
        }

        .input-help {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: var(--space-xs);
        }

        .char-counter {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-align: right;
          margin-top: var(--space-xs);
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-md);
          margin-top: var(--space-md);
        }

        .category-card {
          background: var(--bg-secondary);
          border: 2px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          cursor: pointer;
          transition: all var(--transition-normal);
          text-align: center;
          position: relative;
        }

        .category-card:hover {
          border-color: var(--border-accent);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .category-card.selected {
          border-color: var(--primary-cyan);
          background: rgba(0, 212, 255, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 212, 255, 0.2);
        }

        .category-card.popular::before {
          content: '';
          position: absolute;
          top: -1px;
          right: -1px;
          width: 0;
          height: 0;
          border-left: 20px solid transparent;
          border-top: 20px solid var(--primary-orange);
          border-radius: 0 var(--radius-lg) 0 0;
        }

        .category-icon {
          font-size: 2rem;
          margin-bottom: var(--space-md);
        }

        .category-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .popular-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: var(--primary-orange);
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 0 var(--radius-lg) 0 var(--radius-sm);
        }

        .skills-section {
          margin-top: var(--space-md);
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

        .popular-skills {
          margin-top: var(--space-md);
        }

        .popular-label {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: var(--space-sm);
        }

        .popular-skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
        }

        .popular-skill {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          color: var(--text-secondary);
          padding: var(--space-xs) var(--space-md);
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .popular-skill:hover {
          background: var(--bg-secondary);
          border-color: var(--border-accent);
          color: var(--primary-cyan);
        }

        .duration-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-md);
          margin-top: var(--space-md);
        }

        .duration-card {
          background: var(--bg-secondary);
          border: 2px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          cursor: pointer;
          transition: all var(--transition-normal);
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .duration-card:hover {
          border-color: var(--border-accent);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .duration-card.selected {
          border-color: var(--primary-cyan);
          background: rgba(0, 212, 255, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 212, 255, 0.2);
        }

        .duration-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .duration-content h4 {
          color: var(--text-primary);
          font-weight: 600;
          margin: 0 0 var(--space-xs) 0;
        }

        .duration-content p {
          color: var(--text-secondary);
          margin: 0;
          font-size: 0.9rem;
        }

        .urgency-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-md);
          margin-top: var(--space-md);
        }

        .urgency-card {
          background: var(--bg-secondary);
          border: 2px solid var(--border-primary);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .urgency-card:hover {
          border-color: var(--border-accent);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .urgency-card.selected {
          border-color: var(--urgency-color);
          background: color-mix(in srgb, var(--urgency-color) 5%, transparent);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px color-mix(in srgb, var(--urgency-color) 20%, transparent);
        }

        .urgency-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-sm);
        }

        .urgency-header h4 {
          color: var(--text-primary);
          font-weight: 600;
          margin: 0;
        }

        .urgency-timeline {
          background: var(--urgency-color);
          color: white;
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .urgency-card p {
          color: var(--text-secondary);
          margin: 0;
          font-size: 0.9rem;
        }

        .checkbox-group {
          margin-top: var(--space-md);
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          cursor: pointer;
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
          color: var(--text-primary);
          font-weight: 500;
        }

        .budget-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .budget-icon {
          position: absolute;
          left: var(--space-md);
          font-size: 1.2rem;
          z-index: 1;
        }

        .budget-input {
          padding-left: 3rem;
          padding-right: 5rem;
        }

        .budget-suffix {
          position: absolute;
          right: var(--space-md);
          color: var(--text-muted);
          font-weight: 500;
        }

        .budget-help {
          margin-top: var(--space-md);
        }

        .budget-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
          align-items: center;
        }

        .budget-suggestions span {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-right: var(--space-sm);
        }

        .budget-suggestion {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          color: var(--text-secondary);
          padding: var(--space-xs) var(--space-md);
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .budget-suggestion:hover {
          background: var(--bg-secondary);
          border-color: var(--border-accent);
          color: var(--primary-cyan);
        }

        .project-summary {
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          margin-top: var(--space-xl);
        }

        .project-summary h3 {
          color: var(--text-primary);
          font-size: 1.3rem;
          font-weight: 600;
          margin: 0 0 var(--space-lg) 0;
        }

        .summary-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--space-xl);
        }

        .summary-section h4 {
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 var(--space-md) 0;
        }

        .summary-item {
          display: grid;
          grid-template-columns: 100px 1fr;
          gap: var(--space-md);
          margin-bottom: var(--space-md);
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

        .summary-skills {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-xs);
        }

        .summary-skill-tag {
          background: var(--primary-gradient);
          color: white;
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .budget-highlight {
          font-weight: 600;
          color: var(--primary-cyan);
        }

        .form-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--space-xl);
          border-top: 1px solid var(--border-primary);
          margin-top: var(--space-xl);
        }

        .nav-spacer {
          flex: 1;
        }

        @media (max-width: 768px) {
          .create-task-wrapper {
            margin: var(--space-md);
          }

          .create-task-header,
          .create-task-content {
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

          .category-grid,
          .duration-grid,
          .urgency-grid {
            grid-template-columns: 1fr;
          }

          .skill-input-wrapper {
            flex-direction: column;
            align-items: stretch;
          }

          .summary-content {
            grid-template-columns: 1fr;
          }

          .form-navigation {
            flex-direction: column-reverse;
            gap: var(--space-md);
          }

          .nav-spacer {
            display: none;
          }

          .summary-item {
            grid-template-columns: 1fr;
            gap: var(--space-sm);
          }
        }
      `}</style>
    </div>
  );
};

export default CreateTask;