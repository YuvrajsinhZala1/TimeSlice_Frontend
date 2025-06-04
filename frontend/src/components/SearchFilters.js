import React, { useState, useEffect } from 'react';
import { DURATION_OPTIONS } from '../utils/durationUtils';
import api from '../utils/api';

const SearchFilters = ({ onFilterChange, filters }) => {
  const [availableSkills, setAvailableSkills] = useState([]);
  const [localFilters, setLocalFilters] = useState({
    search: '',
    skillRequired: '',
    urgency: '',
    minDuration: '',
    maxDuration: '',
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
      minDuration: '',
      maxDuration: '',
      minCredits: '',
      maxCredits: '',
      sortBy: 'dateTime',
      sortOrder: 'asc'
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  // Duration options in minutes for filtering
  const durationFilterOptions = [
    { label: 'Any Duration', value: '' },
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: '4 hours', value: 240 },
    { label: '8 hours (1 day)', value: 480 },
    { label: '1 day', value: 1440 },
    { label: '2-3 days', value: 2880 },
    { label: '1 week+', value: 10080 }
  ];

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
            <option value="high">🔴 High - Urgent</option>
            <option value="medium">🟡 Medium - Normal</option>
            <option value="low">🟢 Low - Flexible</option>
          </select>
        </div>

        {/* Duration Filters */}
        <div className="form-group">
          <label>Min Duration:</label>
          <select
            value={localFilters.minDuration}
            onChange={(e) => handleFilterChange('minDuration', e.target.value)}
          >
            {durationFilterOptions.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Max Duration:</label>
          <select
            value={localFilters.maxDuration}
            onChange={(e) => handleFilterChange('maxDuration', e.target.value)}
          >
            {durationFilterOptions.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
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
            <option value="durationInMinutes">⏰ Duration</option>
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

      {/* Active Filters Display */}
      {Object.values(localFilters).some(value => value && value !== 'dateTime' && value !== 'asc') && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          backgroundColor: '#e3f2fd', 
          borderRadius: '4px',
          border: '1px solid #bbdefb'
        }}>
          <strong>Active Filters:</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {localFilters.search && (
              <span className="badge">Search: "{localFilters.search}"</span>
            )}
            {localFilters.skillRequired && (
              <span className="badge">Skill: {localFilters.skillRequired}</span>
            )}
            {localFilters.urgency && (
              <span className="badge">Urgency: {localFilters.urgency}</span>
            )}
            {localFilters.minDuration && (
              <span className="badge">Min Duration: {durationFilterOptions.find(opt => opt.value == localFilters.minDuration)?.label}</span>
            )}
            {localFilters.maxDuration && (
              <span className="badge">Max Duration: {durationFilterOptions.find(opt => opt.value == localFilters.maxDuration)?.label}</span>
            )}
            {localFilters.minCredits && (
              <span className="badge">Min Credits: {localFilters.minCredits}</span>
            )}
            {localFilters.maxCredits && (
              <span className="badge">Max Credits: {localFilters.maxCredits}</span>
            )}
          </div>
        </div>
      )}

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