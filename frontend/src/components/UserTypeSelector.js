import React from 'react';

const UserTypeSelector = ({ selectedType, onChange }) => {
  return (
    <div className="form-group">
      <label>Primary Role (you can do both, but pick your main focus):</label>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="radio"
            name="primaryRole"
            value="helper"
            checked={selectedType === 'helper'}
            onChange={(e) => onChange(e.target.value)}
            style={{ marginRight: '0.5rem' }}
          />
          <div>
            <strong>🤝 Helper</strong>
            <br />
            <small style={{ color: '#666' }}>
              Primarily help others with tasks and earn credits
            </small>
          </div>
        </label>
        
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <input
            type="radio"
            name="primaryRole"
            value="taskProvider"
            checked={selectedType === 'taskProvider'}
            onChange={(e) => onChange(e.target.value)}
            style={{ marginRight: '0.5rem' }}
          />
          <div>
            <strong>📋 Task Provider</strong>
            <br />
            <small style={{ color: '#666' }}>
              Primarily post tasks and get help using credits
            </small>
          </div>
        </label>
      </div>
      <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
        💡 Don't worry! You can both post tasks AND help others regardless of your primary role.
      </small>
    </div>
  );
};

export default UserTypeSelector;