import React, { useState } from 'react';
import { DURATION_OPTIONS, validateCustomDuration } from '../utils/durationUtils';

const DurationSelector = ({ value, onChange, error }) => {
  const [isCustom, setIsCustom] = useState(!DURATION_OPTIONS.find(opt => opt.value === value && opt.value !== 'custom'));
  const [customDuration, setCustomDuration] = useState(isCustom ? value : '');

  const handlePresetChange = (selectedValue) => {
    if (selectedValue === 'custom') {
      setIsCustom(true);
      setCustomDuration('');
    } else {
      setIsCustom(false);
      setCustomDuration('');
      onChange(selectedValue);
    }
  };

  const handleCustomChange = (customValue) => {
    setCustomDuration(customValue);
    
    if (customValue.trim()) {
      const validation = validateCustomDuration(customValue);
      if (validation.isValid) {
        onChange(customValue);
      }
    }
  };

  return (
    <div className="form-group">
      <label>Task Duration:</label>
      
      {/* Preset Duration Options */}
      <select
        value={isCustom ? 'custom' : value}
        onChange={(e) => handlePresetChange(e.target.value)}
      >
        <option value="">Select duration...</option>
        {DURATION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Custom Duration Input */}
      {isCustom && (
        <div style={{ marginTop: '0.5rem' }}>
          <input
            type="text"
            value={customDuration}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="e.g., 2 hours, 30 minutes, 1 day"
            style={{ 
              border: error ? '2px solid #dc3545' : '2px solid #e1e5e9',
              borderRadius: '4px',
              padding: '0.5rem',
              width: '100%'
            }}
          />
          <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
            Examples: "2 hours", "30 minutes", "1 day", "3 days", "1 week"
          </small>
          {error && (
            <small style={{ color: '#dc3545', display: 'block', marginTop: '0.25rem' }}>
              {error}
            </small>
          )}
        </div>
      )}

      {!isCustom && (
        <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
          Need a different duration? Select "Custom duration" from the dropdown.
        </small>
      )}
    </div>
  );
};

export default DurationSelector;