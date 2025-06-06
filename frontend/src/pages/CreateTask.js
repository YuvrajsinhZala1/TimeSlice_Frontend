import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CreateTask = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillsRequired: [],
    dateTime: '',
    duration: '',
    credits: '',
    urgency: 'medium',
    category: 'Web Development'
  });

  const [newSkill, setNewSkill] = useState('');
  const [availableSkills] = useState([
    'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
    'Content Writing', 'Digital Marketing', 'SEO', 'Data Analysis',
    'Video Editing', 'Photography', 'Translation', 'Virtual Assistant',
    'Accounting', 'Legal Consulting', 'Tutoring', 'Research'
  ]);

  const categories = [
    { value: 'Web Development', icon: '💻', color: '#667eea' },
    { value: 'Mobile Development', icon: '📱', color: '#764ba2' },
    { value: 'Design', icon: '🎨', color: '#f093fb' },
    { value: 'Writing', icon: '✍️', color: '#4facfe' },
    { value: 'Marketing', icon: '📈', color: '#43e97b' },
    { value: 'Photography', icon: '📸', color: '#fa709a' },
    { value: 'Video', icon: '🎬', color: '#ff9a9e' },
    { value: 'Business', icon: '💼', color: '#a8edea' },
    { value: 'Education', icon: '📚', color: '#ffecd2' },
    { value: 'Other', icon: '🔧', color: '#d299c2' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', icon: '🟢', description: 'Flexible timeline, no rush' },
    { value: 'medium', label: 'Medium Priority', icon: '🟡', description: 'Standard timeline expected' },
    { value: 'high', label: 'High Priority', icon: '🔴', description: 'Urgent, quick turnaround needed' }
  ];

  const durationOptions = [
    { value: '30 minutes', label: '30 minutes', icon: '⚡' },
    { value: '1 hour', label: '1 hour', icon: '🕐' },
    { value: '2 hours', label: '2 hours', icon: '🕑' },
    { value: '4 hours', label: '4 hours', icon: '🕓' },
    { value: '1 day', label: '1 day', icon: '📅' },
    { value: '2 days', label: '2 days', icon: '📆' },
    { value: '1 week', label: '1 week', icon: '🗓️' },
    { value: '2 weeks', label: '2 weeks', icon: '📋' },
    { value: 'custom', label: 'Custom Duration', icon: '⚙️' }
  ];

  const totalSteps = 4;

  useEffect(() => {
    if (!currentUser?.canCreateTasks) {
      navigate('/browse-tasks');
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skillsRequired.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(skill => skill !== skillToRemove)
    }));
  };

  const addPredefinedSkill = (skill) => {
    if (!formData.skillsRequired.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skill]
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
        if (!formData.category) {
          setError('Please select a category');
          return false;
        }
        break;
      case 2:
        if (!formData.description.trim()) {
          setError('Project description is required');
          return false;
        }
        if (formData.skillsRequired.length === 0) {
          setError('At least one skill is required');
          return false;
        }
        break;
      case 3:
        if (!formData.dateTime) {
          setError('Please set a deadline');
          return false;
        }
        if (!formData.duration) {
          setError('Please select duration');
          return false;
        }
        const selectedDate = new Date(formData.dateTime);
        const now = new Date();
        if (selectedDate <= now) {
          setError('Deadline must be in the future');
          return false;
        }
        break;
      case 4:
        if (!formData.credits || formData.credits < 1) {
          setError('Credits must be at least 1');
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
      const taskData = {
        ...formData,
        credits: parseInt(formData.credits)
      };
      
      const response = await api.post('/tasks', taskData);
      
      setSuccess('Task created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/my-tasks');
      }, 2000);
    } catch (error) {
      console.error('Error creating task:', error);
      setError(error.response?.data?.message || 'Failed to create task. Please try again.');
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
        <h2>📋 Project Details</h2>
        <p>The more specific you are, the better quality applications you'll receive</p>
      </div>

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            🎯 Project Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Build a responsive e-commerce website with payment integration"
            className="form-input large-input"
            maxLength={100}
          />
          <div className="input-helper">
            {formData.title.length}/100 characters
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            📂 Category <span className="required">*</span>
          </label>
          <div className="category-grid">
            {categories.map(category => (
              <div
                key={category.value}
                className={`category-card ${formData.category === category.value ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                style={{ '--category-color': category.color }}
              >
                <div className="category-icon">{category.icon}</div>
                <div className="category-name">{category.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <div className="step-header">
        <h2>📝 Description & Skills</h2>
        <p>Provide detailed information about your project requirements</p>
      </div>

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            📋 Project Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your project in detail. Include specific requirements, deliverables, and any preferences you have..."
            className="form-textarea large-textarea"
            rows="8"
            maxLength={1000}
          />
          <div className="input-helper">
            {formData.description.length}/1000 characters
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            🛠️ Required Skills <span className="required">*</span>
          </label>
          
          <div className="skills-input-section">
            <div className="skill-input-wrapper">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill requirement..."
                className="form-input"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <button type="button" onClick={addSkill} className="btn btn-secondary">
                Add Skill
              </button>
            </div>
          </div>

          <div className="predefined-skills">
            <h4>💡 Suggested Skills:</h4>
            <div className="skills-suggestions">
              {availableSkills.filter(skill => !formData.skillsRequired.includes(skill)).map(skill => (
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

          {formData.skillsRequired.length > 0 && (
            <div className="selected-skills">
              <h4>✅ Selected Skills:</h4>
              <div className="skills-list">
                {formData.skillsRequired.map(skill => (
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
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <div className="step-header">
        <h2>⏰ Timeline & Duration</h2>
        <p>Set your project deadline and estimated duration</p>
      </div>

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="dateTime" className="form-label">
            📅 Project Deadline <span className="required">*</span>
          </label>
          <input
            type="datetime-local"
            id="dateTime"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleInputChange}
            className="form-input large-input"
            min={new Date().toISOString().slice(0, 16)}
          />
          <div className="input-helper">
            When do you need this project completed?
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            ⏱️ Estimated Duration <span className="required">*</span>
          </label>
          <div className="duration-grid">
            {durationOptions.map(option => (
              <div
                key={option.value}
                className={`duration-card ${formData.duration === option.value ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, duration: option.value }))}
              >
                <div className="duration-icon">{option.icon}</div>
                <div className="duration-label">{option.label}</div>
              </div>
            ))}
          </div>
          
          {formData.duration === 'custom' && (
            <div className="custom-duration">
              <input
                type="text"
                placeholder="Enter custom duration (e.g., 3 weeks, 5 days)"
                className="form-input"
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  duration: e.target.value || 'custom' 
                }))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="step-content">
      <div className="step-header">
        <h2>💰 Budget & Priority</h2>
        <p>Set your budget and project priority level</p>
      </div>

      <div className="form-section">
        <div className="form-group">
          <label htmlFor="credits" className="form-label">
            💎 Project Budget (Credits) <span className="required">*</span>
          </label>
          <div className="credits-input-wrapper">
            <div className="credits-icon">💎</div>
            <input
              type="number"
              id="credits"
              name="credits"
              value={formData.credits}
              onChange={handleInputChange}
              min="1"
              max="10000"
              placeholder="100"
              className="form-input credits-input"
            />
            <div className="credits-label">credits</div>
          </div>
          <div className="input-helper">
            💡 Tip: Higher budgets attract more experienced helpers
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            🚨 Priority Level
          </label>
          <div className="urgency-grid">
            {urgencyLevels.map(level => (
              <div
                key={level.value}
                className={`urgency-card ${formData.urgency === level.value ? 'selected' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, urgency: level.value }))}
              >
                <div className="urgency-icon">{level.icon}</div>
                <div className="urgency-content">
                  <div className="urgency-label">{level.label}</div>
                  <div className="urgency-description">{level.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="project-summary">
          <h3>📋 Project Summary</h3>
          <div className="summary-content">
            <div className="summary-item">
              <strong>Title:</strong> {formData.title || 'Not specified'}
            </div>
            <div className="summary-item">
              <strong>Category:</strong> {formData.category}
            </div>
            <div className="summary-item">
              <strong>Skills:</strong> {formData.skillsRequired.join(', ') || 'None specified'}
            </div>
            <div className="summary-item">
              <strong>Duration:</strong> {formData.duration || 'Not specified'}
            </div>
            <div className="summary-item">
              <strong>Budget:</strong> {formData.credits || '0'} credits
            </div>
            <div className="summary-item">
              <strong>Priority:</strong> {formData.urgency}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="create-task-container">
      {(error || success) && (
        <div className={`alert ${error ? 'alert-error' : 'alert-success'}`}>
          <span>{error || success}</span>
          <button onClick={() => { setError(''); setSuccess(''); }} className="alert-close">✕</button>
        </div>
      )}

      <div className="create-task-wrapper">
        <div className="create-task-header">
          <h1>🚀 Create New Project</h1>
          <p>Share your project and connect with talented helpers</p>
        </div>

        <StepIndicator />

        <form onSubmit={handleSubmit} className="create-task-form">
          <div className="form-container">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          <div className="form-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-secondary"
                disabled={loading}
              >
                ← Previous Step
              </button>
            )}
            
            <div className="nav-spacer"></div>
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
                disabled={loading}
              >
                Next Step →
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? 'Creating Project...' : '🚀 Create Project'}
              </button>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        .create-task-container {
          min-height: calc(100vh - 120px);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .alert {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 1rem 1.5rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1000;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
          color: white;
          font-weight: 500;
        }

        .alert-error {
          background: linear-gradient(135deg, #ff4757, #c44569);
        }

        .alert-success {
          background: linear-gradient(135deg, #2ecc71, #27ae60);
        }

        .alert-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 1.2rem;
          font-weight: bold;
        }

        .create-task-wrapper {
          max-width: 900px;
          margin: 0 auto;
          background: rgba(255,255,255,0.95);
          border-radius: 25px;
          padding: 3rem;
          backdrop-filter: blur(10px);
          box-shadow: 0 25px 50px rgba(0,0,0,0.15);
        }

        .create-task-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .create-task-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .create-task-header p {
          margin: 0;
          font-size: 1.2rem;
          color: #666;
        }

        .step-indicator {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3rem;
          position: relative;
        }

        .step-indicator::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 10%;
          right: 10%;
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
          flex: 1;
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
          margin-bottom: 0.75rem;
          transition: all 0.3s ease;
          border: 2px solid rgba(102,126,234,0.2);
        }

        .step-circle.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102,126,234,0.3);
        }

        .step-circle.completed {
          background: linear-gradient(135deg, #2ecc71, #27ae60);
          border-color: #2ecc71;
        }

        .step-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
          text-align: center;
          max-width: 120px;
        }

        .create-task-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-container {
          min-height: 500px;
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
          margin-bottom: 2.5rem;
        }

        .step-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          font-weight: 600;
          color: #333;
        }

        .step-header p {
          margin: 0;
          font-size: 1.1rem;
          color: #666;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-label {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .required {
          color: #e74c3c;
          font-weight: bold;
        }

        .form-input, .form-textarea {
          padding: 1rem 1.25rem;
          border: 2px solid rgba(0,0,0,0.1);
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
          outline: none;
        }

        .large-input {
          padding: 1.25rem 1.5rem;
          font-size: 1.1rem;
        }

        .large-textarea {
          padding: 1.25rem 1.5rem;
          font-size: 1.1rem;
          resize: vertical;
          min-height: 150px;
        }

        .form-input:focus, .form-textarea:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }

        .input-helper {
          font-size: 0.9rem;
          color: #666;
          margin-top: -0.5rem;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .category-card {
          background: white;
          border: 2px solid rgba(0,0,0,0.1);
          border-radius: 15px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .category-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--category-color);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .category-card:hover::before,
        .category-card.selected::before {
          transform: scaleX(1);
        }

        .category-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          border-color: var(--category-color);
        }

        .category-card.selected {
          border-color: var(--category-color);
          background: rgba(102,126,234,0.05);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        .category-icon {
          font-size: 2rem;
          margin-bottom: 0.75rem;
        }

        .category-name {
          font-weight: 600;
          color: #333;
        }

        .skills-input-section {
          margin-bottom: 1.5rem;
        }

        .skill-input-wrapper {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .predefined-skills {
          margin-bottom: 1.5rem;
        }

        .predefined-skills h4 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1rem;
        }

        .skills-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .skill-suggestion {
          background: rgba(102,126,234,0.1);
          border: 1px solid rgba(102,126,234,0.3);
          color: #667eea;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .skill-suggestion:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }

        .selected-skills h4 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1rem;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .skill-tag {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .skill-remove {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          transition: background 0.2s ease;
        }

        .skill-remove:hover {
          background: rgba(255,255,255,0.3);
        }

        .duration-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }

        .duration-card, .urgency-card {
          background: white;
          border: 2px solid rgba(0,0,0,0.1);
          border-radius: 12px;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .duration-card:hover, .urgency-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          border-color: #667eea;
        }

        .duration-card.selected, .urgency-card.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1));
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102,126,234,0.2);
        }

        .duration-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .duration-label {
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
        }

        .custom-duration {
          margin-top: 1rem;
        }

        .credits-input-wrapper {
          display: flex;
          align-items: center;
          background: white;
          border: 2px solid rgba(0,0,0,0.1);
          border-radius: 12px;
          padding: 0.5rem 1rem;
          transition: all 0.3s ease;
        }

        .credits-input-wrapper:focus-within {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
        }

        .credits-icon {
          font-size: 1.25rem;
          margin-right: 0.75rem;
        }

        .credits-input {
          border: none;
          outline: none;
          background: none;
          flex: 1;
          padding: 0.75rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .credits-label {
          color: #666;
          font-weight: 500;
          margin-left: 0.5rem;
        }

        .urgency-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .urgency-card {
          text-align: left;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .urgency-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .urgency-content {
          flex: 1;
        }

        .urgency-label {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.25rem;
        }

        .urgency-description {
          font-size: 0.9rem;
          color: #666;
        }

        .project-summary {
          background: rgba(102,126,234,0.05);
          border-radius: 15px;
          padding: 2rem;
          margin-top: 2rem;
        }

        .project-summary h3 {
          margin: 0 0 1.5rem 0;
          color: #333;
          font-size: 1.3rem;
        }

        .summary-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .summary-item {
          background: white;
          padding: 1rem;
          border-radius: 10px;
          border-left: 4px solid #667eea;
        }

        .summary-item strong {
          color: #667eea;
          display: block;
          margin-bottom: 0.25rem;
        }

        .form-navigation {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-top: 2rem;
          border-top: 2px solid rgba(0,0,0,0.05);
        }

        .nav-spacer {
          flex: 1;
        }

        .btn {
          padding: 1rem 2rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-width: 150px;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 5px 15px rgba(102,126,234,0.3);
        }

        .btn-primary:not(:disabled):hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(102,126,234,0.4);
        }

        .btn-secondary {
          background: rgba(102,126,234,0.1);
          color: #667eea;
          border: 2px solid #667eea;
        }

        .btn-secondary:not(:disabled):hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }

        .btn-success {
          background: linear-gradient(135deg, #2ecc71, #27ae60);
          color: white;
          box-shadow: 0 5px 15px rgba(46,204,113,0.3);
        }

        .btn-success:not(:disabled):hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(46,204,113,0.4);
        }

        @media (max-width: 768px) {
          .create-task-container {
            padding: 1rem;
          }

          .create-task-wrapper {
            padding: 2rem 1.5rem;
          }

          .step-indicator {
            flex-direction: column;
            gap: 1rem;
          }

          .step-indicator::before {
            display: none;
          }

          .step-indicator-item {
            flex-direction: row;
            text-align: left;
            gap: 1rem;
          }

          .step-circle {
            margin-bottom: 0;
            flex-shrink: 0;
          }

          .category-grid {
            grid-template-columns: 1fr 1fr;
          }

          .duration-grid {
            grid-template-columns: 1fr 1fr;
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
            gap: 1rem;
          }

          .nav-spacer {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateTask;