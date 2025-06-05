import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import api from '../utils/api';

const BrowseTasks = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest');
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    urgency: '',
    creditsMin: '',
    creditsMax: '',
    skills: '',
    dateRange: ''
  });

  const categories = [
    'Web Development', 'Mobile Development', 'Design', 'Writing', 'Marketing',
    'Data Analysis', 'Video Editing', 'Photography', 'Translation', 'Consulting',
    'Other'
  ];

  const urgencyOptions = [
    { value: 'high', label: '🔴 Urgent', color: '#EF4444' },
    { value: 'medium', label: '🟡 Normal', color: '#F59E0B' },
    { value: 'low', label: '🟢 Flexible', color: '#10B981' }
  ];

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, filters, sortBy]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      setError('Failed to load tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.taskProviderId.username.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(task => task.category === filters.category);
    }

    if (filters.urgency) {
      filtered = filtered.filter(task => task.urgency === filters.urgency);
    }

    if (filters.creditsMin) {
      filtered = filtered.filter(task => task.credits >= parseInt(filters.creditsMin));
    }

    if (filters.creditsMax) {
      filtered = filtered.filter(task => task.credits <= parseInt(filters.creditsMax));
    }

    if (filters.skills) {
      const skillsArray = filters.skills.split(',').map(s => s.trim().toLowerCase());
      filtered = filtered.filter(task => 
        task.skillsRequired && task.skillsRequired.some(skill => 
          skillsArray.some(filterSkill => skill.toLowerCase().includes(filterSkill))
        )
      );
    }

    if (filters.dateRange) {
      const now = new Date();
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date(now.setDate(now.getDate() - days));
      
      filtered = filtered.filter(task => new Date(task.createdAt) >= cutoffDate);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'credits-high':
        filtered.sort((a, b) => b.credits - a.credits);
        break;
      case 'credits-low':
        filtered.sort((a, b) => a.credits - b.credits);
        break;
      case 'deadline':
        filtered.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }

    setFilteredTasks(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      urgency: '',
      creditsMin: '',
      creditsMax: '',
      skills: '',
      dateRange: ''
    });
  };

  const handleApply = async (taskId, applicationData) => {
    try {
      await api.post(`/tasks/${taskId}/apply`, applicationData);
      setSuccessMessage('Application submitted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchTasks(); // Refresh tasks to update application status
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit application');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getFilterCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  const FilterCard = ({ title, children }) => (
    <div style={{
      background: 'white',
      borderRadius: '0.75rem',
      border: '1px solid #E5E7EB',
      padding: '1rem',
      marginBottom: '1rem'
    }}>
      <h4 style={{ 
        fontSize: '0.9rem', 
        fontWeight: '600', 
        color: '#374151', 
        marginBottom: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {title}
      </h4>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #00D4FF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#6B7280' }}>Loading premium opportunities...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          Premium Opportunities
        </h1>
        <p style={{ 
          color: '#6B7280', 
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>🎯</span>
          Discover high-quality projects from verified clients
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#B91C1C',
          padding: '1rem',
          borderRadius: '0.75rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>⚠️</span>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          color: '#166534',
          padding: '1rem',
          borderRadius: '0.75rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>✅</span>
          {successMessage}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        {/* Filters Sidebar */}
        <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
          <div style={{
            background: 'white',
            borderRadius: '1rem',
            border: '1px solid #E5E7EB',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ 
                fontSize: '1.2rem', 
                fontWeight: 'bold', 
                color: '#1F2937',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>🔍</span>
                Filters
                {getFilterCount() > 0 && (
                  <span style={{
                    background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}>
                    {getFilterCount()}
                  </span>
                )}
              </h3>
              
              {getFilterCount() > 0 && (
                <button
                  onClick={clearFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EF4444',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    textDecoration: 'underline'
                  }}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Search */}
            <FilterCard title="🔍 Search">
              <input
                type="text"
                placeholder="Search tasks, skills, or clients..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '2px solid #E5E7EB',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00D4FF'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </FilterCard>

            {/* Category */}
            <FilterCard title="📂 Category">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '2px solid #E5E7EB',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'white'
                }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </FilterCard>

            {/* Urgency */}
            <FilterCard title="⚡ Urgency">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="radio"
                    name="urgency"
                    value=""
                    checked={filters.urgency === ''}
                    onChange={(e) => handleFilterChange('urgency', e.target.value)}
                  />
                  <span style={{ fontSize: '0.9rem' }}>All Urgencies</span>
                </label>
                {urgencyOptions.map(option => (
                  <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      name="urgency"
                      value={option.value}
                      checked={filters.urgency === option.value}
                      onChange={(e) => handleFilterChange('urgency', e.target.value)}
                    />
                    <span style={{ fontSize: '0.9rem' }}>{option.label}</span>
                  </label>
                ))}
              </div>
            </FilterCard>

            {/* Credits Range */}
            <FilterCard title="💰 Credits">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.creditsMin}
                  onChange={(e) => handleFilterChange('creditsMin', e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '2px solid #E5E7EB',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.creditsMax}
                  onChange={(e) => handleFilterChange('creditsMax', e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '2px solid #E5E7EB',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </FilterCard>

            {/* Skills */}
            <FilterCard title="🎯 Skills">
              <input
                type="text"
                placeholder="JavaScript, React, Design..."
                value={filters.skills}
                onChange={(e) => handleFilterChange('skills', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '2px solid #E5E7EB',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '0.25rem' }}>
                Separate multiple skills with commas
              </div>
            </FilterCard>

            {/* Date Range */}
            <FilterCard title="📅 Posted">
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '2px solid #E5E7EB',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'white'
                }}
              >
                <option value="">All Time</option>
                <option value="1">Last 24 hours</option>
                <option value="7">Last week</option>
                <option value="30">Last month</option>
                <option value="90">Last 3 months</option>
              </select>
            </FilterCard>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* Controls Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'white',
            borderRadius: '0.75rem',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ 
                color: '#6B7280', 
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <strong style={{ color: '#1F2937' }}>{filteredTasks.length}</strong> 
                {filteredTasks.length === 1 ? 'opportunity' : 'opportunities'} found
              </span>
              
              {getFilterCount() > 0 && (
                <span style={{
                  background: '#EBF8FF',
                  color: '#2B6CB0',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {getFilterCount()} filter{getFilterCount() !== 1 ? 's' : ''} active
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid #E5E7EB',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'white'
                }}
              >
                <option value="newest">📅 Newest First</option>
                <option value="oldest">📅 Oldest First</option>
                <option value="credits-high">💰 Highest Credits</option>
                <option value="credits-low">💰 Lowest Credits</option>
                <option value="deadline">⏰ Deadline</option>
                <option value="alphabetical">🔤 A-Z</option>
              </select>

              {/* View Mode Toggle */}
              <div style={{
                display: 'flex',
                background: '#F3F4F6',
                borderRadius: '0.5rem',
                padding: '0.25rem'
              }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    background: viewMode === 'grid' ? 'white' : 'transparent',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: viewMode === 'grid' ? '#1F2937' : '#6B7280'
                  }}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    background: viewMode === 'list' ? 'white' : 'transparent',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: viewMode === 'list' ? '#1F2937' : '#6B7280'
                  }}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {/* Tasks Grid/List */}
          {filteredTasks.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'white',
              borderRadius: '1rem',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ color: '#1F2937', marginBottom: '0.5rem' }}>
                No opportunities found
              </h3>
              <p style={{ color: '#6B7280', marginBottom: '1.5rem' }}>
                Try adjusting your filters or check back later for new opportunities
              </p>
              {getFilterCount() > 0 && (
                <button
                  onClick={clearFilters}
                  style={{
                    background: 'linear-gradient(135deg, #00D4FF, #FF6B35)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: viewMode === 'grid' ? 'grid' : 'flex',
              flexDirection: viewMode === 'list' ? 'column' : undefined,
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(400px, 1fr))' : undefined,
              gap: '1.5rem'
            }}>
              {filteredTasks.map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onApply={handleApply}
                  showApplyButton={true}
                />
              ))}
            </div>
          )}

          {/* Load More (if pagination is implemented) */}
          {filteredTasks.length > 0 && filteredTasks.length % 20 === 0 && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button style={{
                background: 'white',
                color: '#00D4FF',
                border: '2px solid #00D4FF',
                padding: '0.75rem 2rem',
                borderRadius: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                Load More Opportunities
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats at Bottom */}
      <div style={{
        marginTop: '3rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)',
        borderRadius: '1rem',
        border: '1px solid #BAE6FD'
      }}>
        <h3 style={{ 
          textAlign: 'center', 
          marginBottom: '1.5rem',
          color: '#0C4A6E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          📊 Marketplace Insights
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369A1' }}>
              {tasks.filter(t => t.status === 'open').length}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#0C4A6E' }}>Open Opportunities</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369A1' }}>
              {Math.round(tasks.reduce((sum, t) => sum + t.credits, 0) / tasks.length) || 0}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#0C4A6E' }}>Avg. Credits</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369A1' }}>
              {[...new Set(tasks.map(t => t.category))].length}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#0C4A6E' }}>Categories</div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0369A1' }}>
              {tasks.filter(t => t.urgency === 'high').length}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#0C4A6E' }}>Urgent Tasks</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseTasks;