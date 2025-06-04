import React, { useState } from 'react';

const TaskCompletionModal = ({ task, isOpen, onClose, onComplete }) => {
  const [completionNote, setCompletionNote] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onComplete(task._id, completionNote);
      onClose();
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ✕
        </button>

        <h2 style={{ marginBottom: '1.5rem' }}>Mark Task as Completed</h2>
        
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <h4>{task.title}</h4>
          <p style={{ margin: '0.5rem 0', color: '#666' }}>
            Helper: {task.selectedHelper?.username}
          </p>
          <p style={{ margin: 0, color: '#666' }}>
            Credits: {task.credits}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Completion Notes (optional):</label>
            <textarea
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="Add any notes about the completed work, feedback for the helper, or additional comments..."
              rows="4"
              style={{ width: '100%' }}
            />
            <small style={{ color: '#666' }}>
              This note will be visible to the helper and included in the task completion record.
            </small>
          </div>

          <div style={{ 
            background: '#fff3cd', 
            border: '1px solid #ffeaa7', 
            borderRadius: '4px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <strong>⚠️ Important:</strong>
            <ul style={{ margin: '0.5rem 0 0 1rem', color: '#856404' }}>
              <li>This will mark the task as completed</li>
              <li>Credits will be transferred to the helper</li>
              <li>Both you and the helper can then leave reviews</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Completing...' : 'Mark as Completed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCompletionModal;