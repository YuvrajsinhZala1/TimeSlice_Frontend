import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TaskCard from '../components/TaskCard';
import SearchFilters from '../components/SearchFilters';

const BrowseTasks = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    skillRequired: '',
    urgency: '',
    duration: '',
    minCredits: '',
    maxCredits: '',
    sortBy: 'dateTime',
    sortOrder: 'asc'
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchTasks();
  }, [currentUser, navigate, filters, showAll]);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.toString().trim() !== '') {
          queryParams.append(key, value);
        }
      });

      // Add showAll parameter
      queryParams.append('showAll', showAll.toString());

      const response = await api.get(`/tasks?${queryParams.toString()}`);
      setTasks(response.data);
    } catch (error) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, showAll]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApply = async (taskId, applicationData) => {
    try {
      setError('');
      setSuccess('');
      
      await api.post('/applications', { 
        taskId, 
        ...applicationData 
      });
      
      setSuccess('Application submitted successfully! The task provider will review it.');
      
      // Update task in list to show application status
      setTasks(tasks.map(task => 
        task._id === taskId 
          ? { ...task, userApplicationStatus: 'pending' }
          : task
      ));
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit application');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return <div className="text-center">Loading available tasks...</div>;
  }

  const matchingTasks = tasks.filter(task => 
    !showAll ? task.skillsRequired.some(skill => currentUser.skills.includes(skill)) : true
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1>Available Tasks</h1>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Show all tasks (not just matching skills)
          </label>
        </div>
      </div>
      
      {currentUser.skills.length === 0 && !showAll && (
        <div className="error">
          You haven't added any skills yet! Please add your skills in your profile to see relevant tasks, or toggle "Show all tasks" above.
        </div>
      )}
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {/* Search and Filter Component */}
      <SearchFilters 
        onFilterChange={handleFilterChange}
        filters={filters}
      />

      {/* Results Summary */}
      <div className="mb-1" style={{ color: '#666' }}>
        {tasks.length === 0 && !loading ? (
          <p>No tasks match your current filters.</p>
        ) : (
          <p>
            Showing {tasks.length} available task{tasks.length !== 1 ? 's' : ''}
            {!showAll && currentUser.skills.length > 0 && (
              <> ({matchingTasks.length} match your skills)</>
            )}
          </p>
        )}
      </div>
      
      {/* Tasks Grid */}
      {tasks.length === 0 && !loading ? (
        <div className="card text-center">
          <h3>No tasks available</h3>
          <p>
            {currentUser.skills.length === 0 
              ? 'Add your skills in your profile to see relevant tasks!'
              : 'No tasks match your current filters. Try adjusting your search criteria or check back later!'
            }
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {tasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onApply={handleApply}
              showApplyButton={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseTasks;