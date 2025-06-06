import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CreateTask = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skillsRequired: [],
    credits: '',
    duration: {
      value: '',
      unit: 'hours'
    },
    urgency: 'medium',
    dateTime: '',
    additionalInfo: '',
    deliverables: '',
    communicationPreference: 'chat'
  });

  const categories = [
    { value: 'web-development', label: '💻 Web Development', popular: true },
    { value: 'mobile-development', label: '📱 Mobile Development', popular: true },
    { value: 'design', label: '🎨 Design & Creative', popular: true },
    { value: 'writing', label: '✍️ Writing & Content', popular: true },
    { value: 'marketing', label: '📈 Digital Marketing', popular: true },
    { value: 'data-analysis', label: '📊 Data & Analytics', popular: false },
    { value: 'video-editing', label: '🎬 Video & Animation', popular: false },
    { value: 'photography', label: '📸 Photography', popular: false },
    { value: 'translation', label: '🌍 Translation', popular: false },
    { value: 'consulting', label: '💼 Business Consulting', popular: false },
    { value: 'ai-ml', label: '🤖 AI & Machine Learning', popular: true },
    { value: 'blockchain', label: '⛓️ Blockchain & Web3', popular: false },
    { value: 'other', label: '📦 Other', popular: false }
  ];

  const popularSkills = {
    'web-development': ['JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 'Vue.js', 'Angular', 'PHP'],
    'mobile-development': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Xamarin', 'Ionic'],
    'design': ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'Sketch', 'InVision', 'Canva'],
    'writing': ['Copywriting', 'Technical Writing', 'Blog Writing', 'SEO Writing', 'Content Strategy'],
    'marketing': ['Google Ads', 'Facebook Ads', 'SEO', 'Social Media', 'Email Marketing', 'Analytics'],
    'data-analysis': ['Python', 'SQL', 'Excel', 'Tableau', 'Power BI', 'R', 'Machine Learning'],
    'ai-ml': ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenAI', 'Computer Vision'],
    'other': []
  };

  const urgencyOptions = [
    { value: 'low', label: '🟢 Flexible', description: 'No rush, quality over speed', color: 'var(--success)' },
    { value: 'medium', label: '🟡 Normal', description: 'Standard timeline, balanced approach', color: 'var(--warning)' },
    { value: 'high', label: '🔴 Urgent', description: 'Time-sensitive, needs quick delivery', color: 'var(--error)' }
  ];

  const durationUnits = [
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
    { value: 'months', label: 'Months' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSkillAdd = (skill) => {
    if (!formData.skillsRequired.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skill]
      }));
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleCustomSkillAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      handleSkillAdd(e.target.value.trim());
      e.target.value = '';
    }
  };

  const validateStep = (step) => {
    setError('');
    
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          setError('Project title is required');
          return false;
        }
        if (formData.title.length < 10) {
          setError('Title should be at least 10 characters for clarity');
          return false;
        }
        if (!formData.description.trim()) {
          setError('Project description is required');
          return false;
        }
        if (formData.description.length < 50) {
          setError('Description should be at least 50 characters to attract quality helpers');
          return false;
        }
        if (!formData.category) {
          setError('Please select a category');
          return false;
        }
        return true;
        
      case 2:
        if (formData.skillsRequired.length === 0) {
          setError('Please add at least one required skill');
          return false;
        }
        if (!formData.credits || formData.credits < 1) {
          setError('Credits must be at least 1');
          return false;
        }
        if (formData.credits > currentUser.credits) {
          setError(`You only have ${currentUser.credits} credits available`);
          return false;
        }
        return true;
        
      case 3:
        if (!formData.duration.value || formData.duration.value < 1) {
          setError('Please specify project duration');
          return false;
        }
        if (!formData.dateTime) {
          setError('Please specify when you need this completed');
          return false;
        }
        const selectedDate = new Date(formData.dateTime);
        const now = new Date();
        if (selectedDate <= now) {
          setError('Completion date must be in the future');
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
    
    setLoading(true);
    setError('');

    try {
      const taskData = {
        ...formData,
        credits: parseInt(formData.credits),
        duration: `${formData.duration.value} ${formData.duration.unit}`
      };
      
      const response = await api.post('/tasks', taskData);
      navigate('/my-tasks');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

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
      case 1: return '📝 Project Details';
      case 2: return '🎯 Skills & Budget';
      case 3: return '⏰ Timeline & Urgency';
      case 4: return '✨ Final Review';
      default: return '';
    }
  };

  const renderStep1 = () => (
    <div>
      {/* Title */}
      <div className="form-group">
        <label>Project Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Build a responsive e-commerce website with React"
          style={{
            width: '100%',
            padding: 'var(--space-md)',
            background: 'var(--bg-input)',
            border: '2px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color var(--transition-normal)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--border-accent)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
        />
        <small style={{ color: 'var(--text-muted)' }}>
          {formData.title.length}/100 characters
        </small>
      </div>

      {/* Category */}
      <div className="form-group">
        <label>Category *</label>
        
        {/* Popular Categories First */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
            🔥 Popular Categories
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-sm)' }}>
            {categories.filter(cat => cat.popular).map(category => (
              <label key={category.value} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                padding: 'var(--space-md)',
                border: `2px solid ${formData.category === category.value ? 'var(--border-accent)' : 'var(--border-primary)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)',
                background: formData.category === category.value ? 'rgba(0, 212, 255, 0.1)' : 'var(--bg-input)'
              }}>
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={formData.category === category.value}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '0.9rem' }}>{category.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* All Categories */}
        <details style={{ marginTop: 'var(--space-lg)' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            📂 All Categories
          </summary>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
            {categories.filter(cat => !cat.popular).map(category => (
              <label key={category.value} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                padding: 'var(--space-md)',
                border: `2px solid ${formData.category === category.value ? 'var(--border-accent)' : 'var(--border-primary)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)',
                background: formData.category === category.value ? 'rgba(0, 212, 255, 0.1)' : 'var(--bg-input)'
              }}>
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={formData.category === category.value}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '0.9rem' }}>{category.label}</span>
              </label>
            ))}
          </div>
        </details>
      </div>

      {/* Description */}
      <div className="form-group">
        <label>Project Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your project in detail. What do you need help with? What are your expectations? The more detail you provide, the better quality applications you'll receive."
          rows="6"
          style={{
            width: '100%',
            padding: 'var(--space-md)',
            background: 'var(--bg-input)',
            border: '2px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color var(--transition-normal)',
            resize: 'vertical'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--border-accent)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
        />
        <small style={{ color: 'var(--text-muted)' }}>
          {formData.description.length}/2000 characters
        </small>
      </div>

      {/* Pro Tips */}
      <div className="alert alert-info">
        <span>💡</span>
        <div>
          <strong>Pro Tips for Better Results:</strong>
          <ul style={{ margin: '0.5rem 0 0 1rem', paddingLeft: '1rem' }}>
            <li>Be specific about what you want to achieve</li>
            <li>Include examples or references if helpful</li>
            <li>Mention any technical requirements or preferences</li>
            <li>Explain the context and purpose of the project</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      {/* Skills Required */}
      <div className="form-group">
        <label>Required Skills *</label>
        
        {/* Selected Skills */}
        {formData.skillsRequired.length > 0 && (
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
              Selected Skills:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
              {formData.skillsRequired.map(skill => (
                <span key={skill} className="badge badge-primary" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-sm) var(--space-md)'
                }}>
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleSkillRemove(skill)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Popular Skills for Selected Category */}
        {formData.category && popularSkills[formData.category]?.length > 0 && (
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>
              🔥 Popular for {categories.find(c => c.value === formData.category)?.label}:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
              {popularSkills[formData.category].map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSkillAdd(skill)}
                  disabled={formData.skillsRequired.includes(skill)}
                  className="btn btn-secondary"
                  style={{
                    opacity: formData.skillsRequired.includes(skill) ? 0.5 : 1,
                    cursor: formData.skillsRequired.includes(skill) ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                    padding: 'var(--space-sm) var(--space-md)'
                  }}
                >
                  {skill} {formData.skillsRequired.includes(skill) ? '✓' : '+'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Skill Input */}
        <div>
          <input
            type="text"
            placeholder="Type a skill and press Enter to add (e.g., Node.js, Figma, SEO)"
            onKeyPress={handleCustomSkillAdd}
            style={{
              width: '100%',
              padding: 'var(--space-md)',
              background: 'var(--bg-input)',
              border: '2px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Credits Budget */}
      <div className="form-group">
        <label>Budget (Credits) *</label>
        <div style={{ position: 'relative' }}>
          <input
            type="number"
            name="credits"
            value={formData.credits}
            onChange={handleChange}
            min="1"
            max={currentUser.credits}
            placeholder="How many credits are you willing to spend?"
            style={{
              width: '100%',
              padding: 'var(--space-md)',
              paddingRight: '6rem',
              background: 'var(--bg-input)',
              border: '2px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color var(--transition-normal)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--border-accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
          />
          <div style={{
            position: 'absolute',
            right: 'var(--space-lg)',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--primary-gradient)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '700',
            fontSize: '0.9rem'
          }}>
            credits
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'var(--space-xs)' }}>
          <span>Available: {currentUser.credits} credits</span>
          <span>Min: 1 credit</span>
        </div>
      </div>

      {/* Credit Guide */}
      <div className="alert alert-success">
        <span>💰</span>
        <div>
          <strong>Credit Pricing Guide:</strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)', fontSize: '0.8rem' }}>
            <div>🚀 Simple tasks: 5-25</div>
            <div>🔧 Medium projects: 25-100</div>
            <div>🏗️ Complex work: 100-500+</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      {/* Duration */}
      <div className="form-group">
        <label>Estimated Duration *</label>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-sm)' }}>
          <input
            type="number"
            name="duration.value"
            value={formData.duration.value}
            onChange={handleChange}
            min="1"
            placeholder="e.g., 2"
            style={{
              padding: 'var(--space-md)',
              background: 'var(--bg-input)',
              border: '2px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <select
            name="duration.unit"
            value={formData.duration.unit}
            onChange={handleChange}
            style={{
              padding: 'var(--space-md)',
              background: 'var(--bg-input)',
              border: '2px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              outline: 'none'
            }}
          >
            {durationUnits.map(unit => (
              <option key={unit.value} value={unit.value}>{unit.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Completion Date */}
      <div className="form-group">
        <label>Needed By *</label>
        <input
          type="datetime-local"
          name="dateTime"
          value={formData.dateTime}
          onChange={handleChange}
          min={new Date().toISOString().slice(0, 16)}
          style={{
            width: '100%',
            padding: 'var(--space-md)',
            background: 'var(--bg-input)',
            border: '2px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color var(--transition-normal)'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--border-accent)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-primary)'}
        />
      </div>

      {/* Urgency */}
      <div className="form-group">
        <label>Project Urgency *</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {urgencyOptions.map(option => (
            <label key={option.value} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-lg)',
              padding: 'var(--space-lg)',
              border: `2px solid ${formData.urgency === option.value ? option.color : 'var(--border-primary)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
              background: formData.urgency === option.value ? `${option.color}20` : 'var(--bg-input)'
            }}>
              <input
                type="radio"
                name="urgency"
                value={option.value}
                checked={formData.urgency === option.value}
                onChange={handleChange}
                style={{ display: 'none' }}
              />
              <div>
                <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{option.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="form-group">
        <label>Additional Information (Optional)</label>
        <textarea
          name="additionalInfo"
          value={formData.additionalInfo}
          onChange={handleChange}
          placeholder="Any specific requirements, preferences, or additional context that would help potential helpers understand your project better..."
          rows="4"
          style={{
            width: '100%',
            padding: 'var(--space-md)',
            background: 'var(--bg-input)',
            border: '2px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            outline: 'none',
            resize: 'vertical'
          }}
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <div className="card" style={{
        background: 'var(--bg-secondary)',
        padding: 'var(--space-xl)',
        marginBottom: 'var(--space-xl)'
      }}>
        <h3 style={{ marginBottom: 'var(--space-xl)', color: 'var(--text-primary)' }}>Review Your Project</h3>
        
        <div style={{ display: 'grid', gap: 'var(--space-lg)' }}>
          <div>
            <strong>Title:</strong> {formData.title}
          </div>
          
          <div>
            <strong>Category:</strong> {categories.find(c => c.value === formData.category)?.label}
          </div>
          
          <div>
            <strong>Description:</strong>
            <div style={{ 
              marginTop: 'var(--space-sm)', 
              padding: 'var(--space-lg)', 
              background: 'var(--bg-tertiary)', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              color: 'var(--text-secondary)'
            }}>
              {formData.description}
            </div>
          </div>
          
          <div>
            <strong>Skills Required:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
              {formData.skillsRequired.map(skill => (
                <span key={skill} className="badge badge-primary">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-lg)' }}>
            <div>
              <strong>Budget:</strong> {formData.credits} credits
            </div>
            <div>
              <strong>Duration:</strong> {formData.duration.value} {formData.duration.unit}
            </div>
            <div>
              <strong>Needed By:</strong> {new Date(formData.dateTime).toLocaleString()}
            </div>
            <div>
              <strong>Urgency:</strong> {urgencyOptions.find(u => u.value === formData.urgency)?.label}
            </div>
          </div>
          
          {formData.additionalInfo && (
            <div>
              <strong>Additional Information:</strong>
              <div style={{ 
                marginTop: 'var(--space-sm)', 
                padding: 'var(--space-lg)', 
                background: 'var(--bg-tertiary)', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                {formData.additionalInfo}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="alert alert-info">
        <span>🚀</span>
        <div>
          <strong>Ready to Post!</strong>
          <p style={{ margin: '0.5rem 0 0 0' }}>
            Your project will be visible to verified professionals immediately. You'll start receiving applications within minutes!
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Post a Project</h1>
          <p className="page-subtitle">
            Connect with skilled professionals for your next project
          </p>
        </div>

        {/* Form Container */}
        <div className="card" style={{ padding: 'var(--space-2xl)' }}>
          <StepIndicator />
          
          <h2 style={{
            textAlign: 'center',
            marginBottom: 'var(--space-xl)',
            color: 'var(--text-primary)',
            fontSize: '1.3rem'
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
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              gap: 'var(--space-lg)',
              marginTop: 'var(--space-2xl)',
              paddingTop: 'var(--space-xl)',
              borderTop: '1px solid var(--border-primary)'
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
                    Creating Project...
                  </>
                ) : currentStep === 4 ? (
                  <>🚀 Post Project</>
                ) : (
                  <>Continue →</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;