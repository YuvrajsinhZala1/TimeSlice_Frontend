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
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    category: '',
    minCredits: '',
    maxCredits: '',
    urgency: '',
    skills: '',
    sortBy: 'newest',
    duration: '',
    showOnlyMatching: false
  });

  const categories = [
    { value: '', label: '🔍 All Categories', count: 0 },
    { value: 'web-development', label: '💻 Web Development', count: 0 },
    { value: 'mobile-development', label: '📱 Mobile Development', count: 0 },
    { value: 'design', label: '🎨 Design & Creative', count: 0 },
    { value: 'writing', label: '✍️ Writing & Content', count: 0 },
    { value: 'marketing', label: '📈 Digital Marketing', count: 0 },
    { value: 'data-analysis', label: '📊 Data & Analytics', count: 0 },
    { value: 'ai-ml', label: '🤖 AI & Machine Learning', count: 0 },
    { value: 'consulting', label: '💼 Business Consulting', count: 0 },
    { value: 'other', label: '📦 Other', count: 0 }
  ];

  const urgencyLevels = [
    { value: '', label: '⏱️ Any Urgency', color: '#666' },
    { value: 'low', label: '🟢 Flexible', color: '#10B981' },
    { value: 'medium', label: '🟡 Normal', color: '#F59E0B' },
    { value: 'high', label: '🔴 Urgent', color: '#EF4444' }
  ];

  const sortOptions = [
    { value: 'newest', label: '🆕 Newest First', icon: '📅' },
    { value: 'credits-high', label: '💰 Highest Credits', icon: '💎' },
    { value: 'credits-low', label: '💵 Lowest Credits', icon: '🪙' },
    { value: 'urgent', label: '🚨 Most Urgent', icon: '⚡' },
    { value: 'deadline', label: '⏰ Earliest Deadline', icon: '⏳' },
    { value: 'matching', label: '🎯 Best Match', icon: '🔥' }
  ];

  const durationOptions = [
    { value: '', label: 'Any Duration' },
    { value: 'short', label: '< 2 hours' },
    { value: 'medium', label: '2-8 hours' },
    { value: 'long', label: '1-3 days' },
    { value: 'project', label: '1+ weeks' }
  ];

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters, searchQuery]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      const openTasks = response.data.filter(task => task.status === 'open');
      setTasks(openTasks);
    } catch (error) {
      setError('Failed to load premium projects');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.skillsRequired.some(skill => skill.toLowerCase().includes(query))
      );
    }

    // Skills matching filter
    if (filters.showOnlyMatching && currentUser.skills?.length > 0) {
      filtered = filtered.filter(task => 
        task.skillsRequired.some(skill => 
          currentUser.skills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
          )
        )
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(task => task.category === filters.category);
    }

    // Credits filter
    if (filters.minCredits) {
      filtered = filtered.filter(task => task.credits >= parseInt(filters.minCredits));
    }
    if (filters.maxCredits) {
      filtered = filtered.filter(task => task.credits <= parseInt(filters.maxCredits));
    }

    // Urgency filter
    if (filters.urgency) {
      filtered = filtered.filter(task => task.urgency === filters.urgency);
    }

    // Duration filter
    if (filters.duration) {
      filtered = filtered.filter(task => {
        const minutes = task.durationInMinutes || 0;
        switch (filters.duration) {
          case 'short': return minutes <= 120;
          case 'medium': return minutes > 120 && minutes <= 480;
          case 'long': return minutes > 480 && minutes <= 4320;
          case 'project': return minutes > 4320;
          default: return true;
        }
      });
    }

    // Skills filter
    if (filters.skills.trim()) {
      const requiredSkills = filters.skills.toLowerCase().split(',').map(s => s.trim());
      filtered = filtered.filter(task => 
        requiredSkills.some(skill => 
          task.skillsRequired.some(taskSkill => 
            taskSkill.toLowerCase().includes(skill)
          )
        )
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'credits-high':
        filtered.sort((a, b) => b.credits - a.credits);
        break;
      case 'credits-low':
        filtered.sort((a, b) => a.credits - b.credits);
        break;
      case 'urgent':
        filtered.sort((a, b) => {
          const urgencyOrder = { high: 3, medium: 2, low: 1 };
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        });
        break;
      case 'deadline':
        filtered.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
        break;
      case 'matching':
        // Sort by skill match score
        filtered.sort((a, b) => {
          const aScore = calculateMatchScore(a);
          const bScore = calculateMatchScore(b);
          return bScore - aScore;
        });
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredTasks(filtered);
  };

  const calculateMatchScore = (task) => {
    if (!currentUser.skills?.length) return 0;
    
    let score = 0;
    task.skillsRequired.forEach(skill => {
      if (currentUser.skills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )) {
        score += 1;
      }
    });
    
    return score / task.skillsRequired.length;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minCredits: '',
      maxCredits: '',
      urgency: '',
      skills: '',
      sortBy: 'newest',
      duration: '',
      showOnlyMatching: false
    });
    setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.minCredits || filters.maxCredits) count++;
    if (filters.urgency) count++;
    if (filters.skills.trim()) count++;
    if (filters.duration) count++;
    if (filters.showOnlyMatching) count++;
    if (searchQuery.trim()) count++;
    return count;
  };

  const handleApplyForTask = async (taskId, applicationData) => {
    try {
      await api.post(`/applications`, { taskId, ...applicationData });
      
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId
            ? { ...task, userApplicationStatus: 'pending' }
            : task
        )
      );
      
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to apply for project');
    }
  };

  if (loading) {
    return (
      <div className="browse-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Discovering premium projects...</p>
        </div>
      </div>
    );
  }

  const averageCredits = filteredTasks.length > 0 
    ? Math.round(filteredTasks.reduce((sum, task) => sum + task.credits, 0) / filteredTasks.length)
    : 0;

  const urgentTasks = filteredTasks.filter(t => t.urgency === 'high').length;
  const matchingTasks = filteredTasks.filter(t => calculateMatchScore(t) > 0).length;

  return (
    <div className="browse-container">
      {/* Header Section */}
      <div className="browse-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">Premium Project Marketplace</h1>
            <p className="page-subtitle">
              Discover exclusive opportunities from verified clients in our curated professional network
            </p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <div className="stat-value">{filteredTasks.length}</div>
              <div className="stat-label">Premium Projects</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{averageCredits}</div>
              <div className="stat-label">Avg Credits</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{urgentTasks}</div>
              <div className="stat-label">Urgent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Controls */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              placeholder="Search projects, skills, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="clear-search"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="search-controls">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="sort-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-toggle ${getActiveFilterCount() > 0 ? 'has-filters' : ''}`}
            >
              🎛️ Filters
              {getActiveFilterCount() > 0 && (
                <span className="filter-count">{getActiveFilterCount()}</span>
              )}
            </button>

            <div className="view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              >
                ▦
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filters-header">
              <h3>Advanced Filters</h3>
              <button onClick={clearFilters} className="clear-filters-btn">
                🗑️ Clear All
              </button>
            </div>
            
            <div className="filters-grid">
              {/* Quick Match Toggle */}
              <div className="filter-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={filters.showOnlyMatching}
                    onChange={(e) => handleFilterChange('showOnlyMatching', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                  🎯 Show Only Matching Skills
                </label>
              </div>

              {/* Category Filter */}
              <div className="filter-group">
                <label>Project Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Urgency Filter */}
              <div className="filter-group">
                <label>Urgency Level</label>
                <div className="urgency-options">
                  {urgencyLevels.map(level => (
                    <button
                      key={level.value}
                      onClick={() => handleFilterChange('urgency', 
                        filters.urgency === level.value ? '' : level.value
                      )}
                      className={`urgency-btn ${filters.urgency === level.value ? 'active' : ''}`}
                      style={{ '--urgency-color': level.color }}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration Filter */}
              <div className="filter-group">
                <label>Project Duration</label>
                <select
                  value={filters.duration}
                  onChange={(e) => handleFilterChange('duration', e.target.value)}
                >
                  {durationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Credits Range */}
              <div className="filter-group credits-range">
                <label>Credit Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minCredits}
                    onChange={(e) => handleFilterChange('minCredits', e.target.value)}
                  />
                  <span className="range-separator">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxCredits}
                    onChange={(e) => handleFilterChange('maxCredits', e.target.value)}
                  />
                </div>
              </div>

              {/* Skills Filter */}
              <div className="filter-group">
                <label>Required Skills</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Design..."
                  value={filters.skills}
                  onChange={(e) => handleFilterChange('skills', e.target.value)}
                />
                <small>Separate multiple skills with commas</small>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <div className="results-info">
          <div className="results-count">
            <span className="count-number">{filteredTasks.length}</span>
            <span className="count-text">Premium Projects Available</span>
          </div>
          {matchingTasks > 0 && (
            <div className="matching-info">
              <span className="match-icon">🎯</span>
              <span>{matchingTasks} projects match your skills</span>
            </div>
          )}
        </div>
        
        {filteredTasks.length > 0 && (
          <div className="results-meta">
            <span>💰 Avg: {averageCredits} credits</span>
            <span>🚀 {urgentTasks} urgent</span>
            <span>📊 {Math.round((matchingTasks / filteredTasks.length) * 100)}% match rate</span>
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* Tasks Display */}
      <div className="tasks-section">
        {filteredTasks.length > 0 ? (
          <div className={`tasks-container ${viewMode}`}>
            {filteredTasks.map(task => (
              <div key={task._id} className="task-wrapper">
                <TaskCard
                  task={task}
                  onApply={handleApplyForTask}
                  showApplyButton={true}
                  viewMode={viewMode}
                />
                {calculateMatchScore(task) > 0 && (
                  <div className="match-indicator">
                    <span className="match-score">
                      {Math.round(calculateMatchScore(task) * 100)}% match
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              {searchQuery || getActiveFilterCount() > 0 ? '🔍' : '📋'}
            </div>
            <h3 className="empty-title">
              {searchQuery || getActiveFilterCount() > 0 
                ? 'No projects match your criteria' 
                : 'No premium projects available'
              }
            </h3>
            <p className="empty-description">
              {searchQuery || getActiveFilterCount() > 0 
                ? 'Try adjusting your search terms or filters to discover more opportunities.'
                : 'Check back soon for new premium projects from verified clients.'
              }
            </p>
            
            {(searchQuery || getActiveFilterCount() > 0) && (
              <button onClick={clearFilters} className="btn btn-primary">
                🗑️ Clear Filters & Show All
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pro Tips Section */}
      <div className="tips-section">
        <div className="tips-container">
          <h3>🎯 Pro Tips for Landing Premium Projects</h3>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-icon">✨</div>
              <h4>Craft Compelling Applications</h4>
              <p>Write personalized proposals that showcase your relevant experience and demonstrate understanding of the project requirements.</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">⚡</div>
              <h4>Apply Quickly & Strategically</h4>
              <p>Be among the first to apply for high-value projects. Focus on opportunities that truly match your expertise rather than applying broadly.</p>
            </div>
            <div className="tip-card">
              <div className="tip-icon">🏆</div>
              <h4>Build Your Reputation</h4>
              <p>Deliver exceptional work consistently, communicate proactively, and gather detailed reviews to attract premium clients.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .browse-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .browse-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }

        .loading-container {
          text-align: center;
        }

        .loading-container p {
          margin-top: 1rem;
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .browse-header {
          margin-bottom: 3rem;
          background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
          border-radius: 1.5rem;
          padding: 3rem;
          border: 1px solid var(--border-primary);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .header-text {
          flex: 1;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 800;
          background: var(--primary-gradient);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1rem;
        }

        .page-subtitle {
          color: var(--text-secondary);
          font-size: 1.1rem;
          line-height: 1.6;
          max-width: 600px;
        }

        .header-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          text-align: center;
          padding: 1.5rem;
          background: rgba(0, 212, 255, 0.1);
          border-radius: 1rem;
          border: 1px solid rgba(0, 212, 255, 0.2);
          min-width: 120px;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: var(--primary-cyan);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .search-section {
          background: var(--bg-card);
          border: 1px solid var(--border-primary);
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .search-container {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .search-input-wrapper {
          flex: 1;
          position: relative;
          min-width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 1.2rem;
          color: var(--text-muted);
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background: var(--bg-input);
          border: 2px solid var(--border-primary);
          border-radius: 3rem;
          color: var(--text-primary);
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--border-accent);
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1.2rem;
        }

        .search-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .sort-select {
          padding: 0.75rem 1rem;
          background: var(--bg-input);
          border: 2px solid var(--border-primary);
          border-radius: 0.75rem;
          color: var(--text-primary);
          font-size: 0.9rem;
          min-width: 180px;
        }

        .filter-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--bg-tertiary);
          border: 2px solid var(--border-primary);
          border-radius: 0.75rem;
          color: var(--text-primary);
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          position: relative;
        }

        .filter-toggle:hover {
          border-color: var(--border-accent);
        }

        .filter-toggle.has-filters {
          border-color: var(--primary-cyan);
          background: rgba(0, 212, 255, 0.1);
        }

        .filter-count {
          background: var(--primary-cyan);
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .view-toggle {
          display: flex;
          background: var(--bg-tertiary);
          border-radius: 0.75rem;
          border: 2px solid var(--border-primary);
          overflow: hidden;
        }

        .view-btn {
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .view-btn.active {
          background: var(--primary-cyan);
          color: white;
        }

        .filters-panel {
          margin-top: 2rem;
          padding: 2rem;
          background: var(--bg-secondary);
          border-radius: 1rem;
          border: 1px solid var(--border-primary);
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .filters-header h3 {
          color: var(--text-primary);
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0;
        }

        .clear-filters-btn {
          background: var(--error);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .filter-group input,
        .filter-group select {
          padding: 0.75rem;
          background: var(--bg-input);
          border: 2px solid var(--border-primary);
          border-radius: 0.5rem;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .filter-group small {
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          font-weight: 600;
        }

        .toggle-slider {
          position: relative;
          width: 50px;
          height: 24px;
          background: var(--bg-tertiary);
          border-radius: 12px;
          border: 2px solid var(--border-primary);
          transition: all 0.3s ease;
        }

        .toggle-slider::before {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          background: var(--text-muted);
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: all 0.3s ease;
        }

        input[type="checkbox"]:checked + .toggle-slider {
          background: var(--primary-cyan);
          border-color: var(--primary-cyan);
        }

        input[type="checkbox"]:checked + .toggle-slider::before {
          background: white;
          transform: translateX(26px);
        }

        .urgency-options {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .urgency-btn {
          padding: 0.5rem 1rem;
          background: var(--bg-input);
          border: 2px solid var(--border-primary);
          border-radius: 0.5rem;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .urgency-btn.active {
          border-color: var(--urgency-color);
          background: color-mix(in srgb, var(--urgency-color) 10%, transparent);
          color: var(--urgency-color);
        }

        .credits-range .range-inputs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .range-separator {
          color: var(--text-muted);
          font-weight: 700;
        }

        .results-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: var(--bg-card);
          border-radius: 1rem;
          border: 1px solid var(--border-primary);
        }

        .results-info {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .results-count {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .count-number {
          font-size: 2rem;
          font-weight: 800;
          color: var(--primary-cyan);
        }

        .count-text {
          color: var(--text-secondary);
          font-weight: 600;
        }

        .matching-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--success);
          font-weight: 600;
          background: rgba(16, 185, 129, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
        }

        .match-icon {
          font-size: 1.2rem;
        }

        .results-meta {
          display: flex;
          gap: 1.5rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.15);
          color: var(--error);
          padding: 1rem 1.5rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(239, 68, 68, 0.3);
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tasks-section {
          margin-bottom: 3rem;
        }

        .tasks-container.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
        }

        .tasks-container.list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .task-wrapper {
          position: relative;
        }

        .match-indicator {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 10;
        }

        .match-score {
          background: var(--success);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: var(--bg-card);
          border-radius: 1rem;
          border: 1px solid var(--border-primary);
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }

        .empty-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .empty-description {
          color: var(--text-secondary);
          font-size: 1.1rem;
          line-height: 1.6;
          max-width: 500px;
          margin: 0 auto 2rem;
        }

        .tips-section {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(255, 107, 53, 0.1));
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 1rem;
          padding: 3rem;
        }

        .tips-container h3 {
          text-align: center;
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 2rem;
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .tip-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .tip-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .tip-card h4 {
          color: var(--text-primary);
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .tip-card p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 768px) {
          .browse-container {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
            gap: 2rem;
          }

          .header-stats {
            flex-direction: column;
            gap: 1rem;
          }

          .page-title {
            font-size: 2rem;
          }

          .search-container {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input-wrapper {
            min-width: auto;
          }

          .search-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .results-summary {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .results-meta {
            flex-direction: column;
            gap: 0.5rem;
          }

          .tasks-container.grid {
            grid-template-columns: 1fr;
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }

          .tips-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default BrowseTasks;