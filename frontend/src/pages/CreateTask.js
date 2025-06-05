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
    { value: 'low', label: '🟢 Flexible', description: 'No rush, quality over speed', color: '#10B981' },
    { value: 'medium', label: '🟡 Normal', description: 'Standard timeline, balanced approach', color: '#F59E0B' },
    { value: 'high', label: '🔴 Urgent', description: 'Time-sensitive, needs quick delivery', color: '#EF4444' }
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
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: '600',
          color: '#374151',
          fontSize: '0.9rem'
        }}>
          Project Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Build a responsive e-commerce website with React"
          style={{
            width: '100%',
            padding: '1rem',
            border: '2px solid #E5E7EB',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#00D4FF'}
          onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
        />
        <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
          {formData.title.length}/100 characters
        </div>
      </div>

      {/* Category */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.75rem',
          fontWeight: '600',
          color: '#374151',
          fontSize: '0.9rem'
        }}>
          Category *
        </label>
        
        {/* Popular Categories First */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.5rem' }}>
            🔥 Popular Categories
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
            {categories.filter(cat => cat.popular).map(category => (
              <label key={category.value} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                border: `2px solid ${formData.category === category.value ? '#00D4FF' : '#E5E7EB'}`,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: formData.category === category.value ? '#F0F9FF' : 'white'
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
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#6B7280', fontSize: '0.8rem' }}>
            📂 All Categories
          </summary>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginTop: '0.5rem' }}>
            {categories.filter(cat => !cat.popular).map(category => (
              <label key={category.value} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                border: `2px solid ${formData.category === category.value ? '#00D4FF' : '#E5E7EB'}`,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: formData.category === category.value ? '#F0F9FF' : 'white'
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
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: '600',
          color: '#374151',
          fontSize: '0.9rem'
        }}>
          Project Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your project in detail. What do you need help with? What are your expectations? The more detail you provide, the better quality applications you'll receive."
          rows="6"
          style={{
            width: '100%',
            padding: '1rem',
            border: '2px solid #E5E7EB',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s ease',
            resize: 'vertical'
          }}
          onFocus={(e) => e.target.style.borderColor = '#00D4FF'}
          onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
        />
        <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
          {formData.description.length}/2000 characters
        </div>
      </div>

      {/* Pro Tips */}
      <div style={{
        background: '#F0F9FF',
        border: '1px solid #BAE6FD',
        borderRadius: '0.75rem',
        padding: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span>💡</span>
          <strong style={{ color: '#0C4A6E' }}>Pro Tips for Better Results:</strong>
        </div>
        <ul style={{ margin: 0, paddingLeft: '1rem', color: '#0369A1', fontSize: '0.9rem' }}>
          <li>Be specific about what you want to achieve</li>
          <li>Include examples or references if helpful</li>
          <li>Mention any technical requirements or preferences</li>
          <li>Explain the context and purpose of the project</li>
        </ul>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      {/* Skills Required */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.75rem',
          fontWeight: '600',
          color: '#374151',
          fontSize: '0.9rem'
        }}>
          Required Skills *
        </label>
        
        {/* Selected Skills */}
        {formData.skillsRequired.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.5rem' }}>
              Selected Skills:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {formData.skillsRequired.map(skill => (
                <span key={skill} style={{
                  background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleSkillRemove(skill)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '1rem'
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
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '0.5rem' }}>
              🔥 Popular for {categories.find(c => c.value === formData.category)?.label}:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {popularSkills[formData.category].map(skill => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSkillAdd(skill)}
                  disabled={formData.skillsRequired.includes(skill)}
                  style={{
                    background: formData.skillsRequired.includes(skill) ? '#F3F4F6' : 'white',
                    color: formData.skillsRequired.includes(skill) ? '#9CA3AF' : '#374151',
                    border: '2px solid #E5E7EB',
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem',
                    fontSize: '0.9rem',
                    cursor: formData.skillsRequired.includes(skill) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease'
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
              padding: '0.75rem 1rem',
              border: '2px solid #E5E7EB',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Credits Budget */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: '600',
          color: '#374151',
          fontSize: '0.9rem'
        }}>
          Budget (Credits) *
        </label>
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
              padding: '1rem',
              paddingRight: '6rem',
              border: '2px solid #E5E7EB',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#00D4FF'}
            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
          />
          <div style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}>
            credits
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
          <span>Available: {currentUser.credits} credits</span>
          <span>Min: 1 credit</span>
        </div>
      </div>

      {/* Credit Guide */}
      <div style={{
        background: '#F0FDF4',
        border: '1px solid #BBF7D0',
        borderRadius: '0.75rem',
        padding: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span>💰</span>
          <strong style={{ color: '#166534' }}>Credit Pricing Guide:</strong>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem', color: '#15803D', fontSize: '0.8rem' }}>
          <div>🚀 Simple tasks: 5-25</div>
          <div>🔧 Medium projects: 25-100</div>
          <div>🏗️ Complex work: 100-500+</div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      {/* Duration */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: '600',
          color: '#374151',
          fontSize: '0.9rem'
        }}>
          Estimated Duration *
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
          <input
            type="number"
            name="duration.value"
            value={formData.duration.value}
            onChange={handleChange}
            min="1"
            placeholder="e.g., 2"
            style={{
              padding: '1rem',
              border: '2px solid #E5E7EB',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              outline: 'none'
            }}
          />
          <select
            name="duration.unit"
            value={formData.duration.unit}
            onChange={handleChange}
            style={{
              padding: '1rem',
              border: '2px solid #E5E7EB',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              outline: 'none',
              background: 'white'
            }}
          >
            {durationUnits.map(unit => (
              <option key={unit.value} value={unit.value}>{unit.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Completion Date */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: '600',
          color: '#374151',
          fontSize: '0.9rem'
        }}>
          Needed By *
        </label>
        <input
          type="datetime-local"
          name="dateTime"
          value={formData.dateTime}
          onChange={handleChange}
          min={new Date().toISOString().slice(0, 16)}
          style={{
            width: '100%',
            padding: '1rem',
            border: '2px solid #E5E7EB',
            borderRadius: '0.75rem',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#00D4FF'}
          onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
        />
      </div>

      {/* Urgency */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          marginBottom: '0.75rem',
          fontWeight: '600',
          color: '#374151',
          fontSize: '0.9rem'
        }}>
          Project Urgency *
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {urgencyOptions.map(option => (
            <label key={option.value} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              border: `2px solid ${formData.urgency === option.value ? option.color : '#E5E7EB'}`,
              borderRadius: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: formData.urgency === option.value ? `${option.color}10` : 'white'
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
                <div style={{ fontWeight: '600', fontSize: '1rem' }}>{option.label}</div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: '600',
          color: '#374151',
          fontSize: '0.9rem'
        }}>
          Additional Information (Optional)
        </label>
        <textarea
          name="additionalInfo"
          value={formData.additionalInfo}
          onChange={handleChange}
          placeholder="Any specific requirements, preferences, or additional context that would help potential helpers understand your project better..."
          rows="4"
          style={{
            width: '100%',
            padding: '1rem',
            border: '2px solid #E5E7EB',
            borderRadius: '0.75rem',
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
      <div style={{
        background: '#F9FAFB',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid #E5E7EB'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: '#1F2937' }}>Review Your Project</h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <strong>Title:</strong> {formData.title}
          </div>
          
          <div>
            <strong>Category:</strong> {categories.find(c => c.value === formData.category)?.label}
          </div>
          
          <div>
            <strong>Description:</strong>
            <div style={{ 
              marginTop: '0.5rem', 
              padding: '1rem', 
              background: 'white', 
              borderRadius: '0.5rem',
              border: '1px solid #E5E7EB',
              fontSize: '0.9rem',
              lineHeight: '1.6'
            }}>
              {formData.description}
            </div>
          </div>
          
          <div>
            <strong>Skills Required:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {formData.skillsRequired.map(skill => (
                <span key={skill} style={{
                  background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.8rem'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
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
                marginTop: '0.5rem', 
                padding: '1rem', 
                background: 'white', 
                borderRadius: '0.5rem',
                border: '1px solid #E5E7EB',
                fontSize: '0.9rem'
              }}>
                {formData.additionalInfo}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div style={{
        background: '#EBF8FF',
        border: '1px solid #BAE6FD',
        borderRadius: '0.75rem',
        padding: '1rem',
        marginTop: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span>🚀</span>
          <strong style={{ color: '#0C4A6E' }}>Ready to Post!</strong>
        </div>
        <p style={{ margin: 0, color: '#0369A1', fontSize: '0.9rem' }}>
          Your project will be visible to verified professionals immediately. You'll start receiving applications within minutes!
        </p>
      </div>
    </div>
  );

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem 1rem'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          Post a Project
        </h1>
        <p style={{ color: '#6B7280', fontSize: '1.1rem' }}>
          Connect with skilled professionals for your next project
        </p>
      </div>

      {/* Form Container */}
      <div style={{
        background: 'white',
        borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #E5E7EB',
        padding: '2rem'
      }}>
        <StepIndicator />
        
        <h2 style={{
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#1F2937',
          fontSize: '1.3rem'
        }}>
          {getStepTitle()}
        </h2>

        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#B91C1C',
            padding: '1rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
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
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid #E5E7EB'
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
                  padding: '1rem',
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
                padding: '1rem',
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

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CreateTask;