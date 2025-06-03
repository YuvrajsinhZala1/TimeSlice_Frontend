import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const SearchFilters = ({ onFilterChange, filters }) => {
  const [availableSkills, setAvailableSkills] = useState([]);
  const [localFilters, setLocalFilters] = useState({
    search: '',
    skillRequired: '',
    urgency: '',
    duration: '',
    minCredits: '',
    maxCredits: '',
    sortBy: 'dateTime',
    sortOrder: 'asc',
    ...filters
  });

  useEffect(() => {
    fetchAvailableSkills();
  }, []);

  const fetchAvailableSkills = async () => {
    try {
      const response = await api.get('/tasks/skills');
      setAvailableSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      skillRequired: '',
      urgency: '',
      duration: '',
      minCredits: '',
      maxCredits: '',
      sortBy: 'dateTime',
      sortOrder: 'asc'
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="card mb-2">
      <h3>🔍 Search & Filter Tasks</h3>
      
      {/* Search Bar */}
      <div className="form-group">
        <label>Search Tasks:</label>
        <input
          type="text"
          placeholder="Search in task titles and descriptions..."
          value={localFilters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem' 
      }}>
        
        {/* Skill Filter */}
        <div className="form-group">
          <label>Required Skill:</label>
          <select
            value={localFilters.skillRequired}
            onChange={(e) => handleFilterChange('skillRequired', e.target.value)}
          >
            <option value="">All Skills</option>
            {availableSkills.map((skill, index) => (
              <option key={index} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>

        {/* Urgency Filter */}
        <div className="form-group">
          <label>Urgency:</label>
          <select
            value={localFilters.urgency}
            onChange={(e) => handleFilterChange('urgency', e.target.value)}
          >
            <option value="">Any Urgency</option>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>

        {/* Duration Filter */}
        <div className="form-group">
          <label>Duration:</label>
          <select
            value={localFilters.duration}
            onChange={(e) => handleFilterChange('duration', e.target.value)}
          >
            <option value="">Any Duration</option>
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </div>

        {/* Credits Range */}
        <div className="form-group">
          <label>Min Credits:</label>
          <input
            type="number"
            placeholder="Min"
            value={localFilters.minCredits}
            onChange={(e) => handleFilterChange('minCredits', e.target.value)}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Max Credits:</label>
          <input
            type="number"
            placeholder="Max"
            value={localFilters.maxCredits}
            onChange={(e) => handleFilterChange('maxCredits', e.target.value)}
            min="0"
          />
        </div>

        {/* Sort Options */}
        <div className="form-group">
          <label>Sort By:</label>
          <select
            value={localFilters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="dateTime">📅 Date & Time</option>
            <option value="credits">💰 Credits</option>
            <option value="urgency">⚡ Urgency</option>
            <option value="duration">⏰ Duration</option>
            <option value="createdAt">🆕 Recently Posted</option>
          </select>
        </div>

        <div className="form-group">
          <label>Sort Order:</label>
          <select
            value={localFilters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
          >
            <option value="asc">⬆️ Ascending</option>
            <option value="desc">⬇️ Descending</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-1 mt-1">
        <button 
          onClick={clearFilters} 
          className="btn btn-secondary"
        >
          🗑️ Clear All Filters
        </button>
        <span style={{ color: '#666', fontSize: '0.9rem', alignSelf: 'center' }}>
          ⚡ Filters are applied automatically
        </span>
      </div>
    </div>
  );
};

export default SearchFilters;