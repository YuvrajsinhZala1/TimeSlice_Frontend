import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TaskCard from '../components/TaskCard';
import ApplicantsList from '../components/ApplicantsList';

const MyTasks = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showApplications, setShowApplications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    fetchMyTasks();
  }, [currentUser, navigate]);

  const fetchMyTasks = async () => {
    try {
      const response = await api.get('/tasks/my-tasks');
      setTasks(response.data);
    } catch (error) {
      setError('Failed to fetch your tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (taskId) => {
    // For now, just show an alert. You can implement edit modal later
    alert('Edit functionality coming soon!');
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      
      await api.delete(`/tasks/${taskId}`);
      setSuccess('Task deleted successfully!');
      
      // Remove deleted task from list
      setTasks(tasks.filter(task => task._id !== taskId));
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete task');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleViewApplications = (task) => {
    setSelectedTask(task);
    setShowApplications(true);
  };

  const handleRespondToApplication = async (applicationId, responseData) => {
    try {
      setError('');
      setSuccess('');
      
      await api.put(`/applications/${applicationId}/respond`, responseData);
      
      if (responseData.status === 'accepted') {
        setSuccess('Application accepted! A booking has been created and you can now chat with the helper.');
      } else {
        setSuccess('Application response sent.');
      }
      
      // Refresh tasks to get updated data
      await fetchMyTasks();
      
      // If viewing applications, refresh the selected task
      if (selectedTask) {
        const updatedTask = await api.get(`/tasks/${selectedTask._id}`);
        setSelectedTask(updatedTask.data);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to respond to application');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!currentUser) {
    return null;
  }

  if (loading) {
    return <div className="text-center">Loading your tasks...</div>;
  }

  if (showApplications && selectedTask) {
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <h1>Applications for: {selectedTask.title}</h1>
          <button 
            onClick={() => setShowApplications(false)}
            className="btn btn-secondary"
          >
            ← Back to My Tasks
          </button>
        </div>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <ApplicantsList 
          task={selectedTask}
          onRespondToApplication={handleRespondToApplication}
        />
      </div>
    );
  }

  const openTasks = tasks.filter(task => task.status === 'open');
  const inReviewTasks = tasks.filter(task => task.status === 'in-review');
  const assignedTasks = tasks.filter(task => ['assigned', 'in-progress'].includes(task.status));
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1>My Posted Tasks</h1>
        <Link to="/create-task" className="btn btn-success">
          Post New Task
        </Link>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {tasks.length === 0 ? (
        <div className="card text-center">
          <h3>No tasks posted yet</h3>
          <p>Start by posting your first task to get help from the community!</p>
          <Link to="/create-task" className="btn btn-success">
            Post Your First Task
          </Link>
        </div>
      ) : (
        <>
          {/* Open Tasks */}
          {openTasks.length > 0 && (
            <div className="mb-2">
              <h2>Open Tasks - Accepting Applications ({openTasks.length})</h2>
              <div className="card-grid">
                {openTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    showApplyButton={false}
                    showEditDelete={true}
                    showViewApplications={true}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewApplications={handleViewApplications}
                  />
                ))}
              </div>
            </div>
          )}

          {/* In Review Tasks */}
          {inReviewTasks.length > 0 && (
            <div className="mb-2">
              <h2>Under Review ({inReviewTasks.length})</h2>
              <div className="card-grid">
                {inReviewTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    showApplyButton={false}
                    showEditDelete={false}
                    showViewApplications={true}
                    onViewApplications={handleViewApplications}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Assigned Tasks */}
          {assignedTasks.length > 0 && (
            <div className="mb-2">
              <h2>Assigned Tasks ({assignedTasks.length})</h2>
              <div className="card-grid">
                {assignedTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    showApplyButton={false}
                    showEditDelete={false}
                    showViewApplications={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="mb-2">
              <h2>Completed Tasks ({completedTasks.length})</h2>
              <div className="card-grid">
                {completedTasks.map(task => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    showApplyButton={false}
                    showEditDelete={false}
                    showViewApplications={false}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyTasks;