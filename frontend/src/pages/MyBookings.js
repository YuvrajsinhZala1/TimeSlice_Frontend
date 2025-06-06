import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const MyBookings = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [actionLoading, setActionLoading] = useState(false);

  // Safe array check function
  const ensureArray = (value) => {
    return Array.isArray(value) ? value : [];
  };

  useEffect(() => {
    if (currentUser) {
      fetchBookings();
    }
  }, [currentUser]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/bookings');
      const bookingsData = ensureArray(response?.data);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status, workNote = '') => {
    if (!bookingId || !status) return;
    
    try {
      setActionLoading(true);
      setError('');
      await api.put(`/bookings/${bookingId}/status`, {
        status,
        workNote
      });
      await fetchBookings();
      
      // Update selected booking if it's the one being updated
      if (selectedBooking?._id === bookingId) {
        const updatedBooking = bookings.find(b => b._id === bookingId);
        if (updatedBooking) {
          setSelectedBooking({ ...updatedBooking, status });
        }
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Failed to update booking status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const submitReview = async (bookingId, rating, review) => {
    if (!bookingId || !rating) return;
    
    try {
      setActionLoading(true);
      setError('');
      await api.post(`/bookings/review/${bookingId}`, {
        rating,
        review
      });
      await fetchBookings();
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getFilteredBookings = () => {
    const bookingsArray = ensureArray(bookings);
    
    let filtered = bookingsArray;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking && booking.status === filterStatus);
    }

    // Sort bookings
    filtered.sort((a, b) => {
      if (!a || !b) return 0;
      
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'credits':
          return (b.agreedCredits || 0) - (a.agreedCredits || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#f39c12';
      case 'in-progress': return '#3498db';
      case 'work-submitted': return '#9b59b6';
      case 'completed': return '#2ecc71';
      case 'cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return '📋';
      case 'in-progress': return '⚡';
      case 'work-submitted': return '📤';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '❓';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const openDetailPanel = (booking) => {
    setSelectedBooking(booking);
    setShowDetailPanel(true);
  };

  const closeDetailPanel = () => {
    setShowDetailPanel(false);
    setSelectedBooking(null);
  };

  const BookingCard = ({ booking }) => {
    if (!booking) return null;
    
    const task = booking.taskId || {};
    const isHelper = booking.helper?._id === currentUser?.id;
    const otherUser = isHelper ? booking.taskProvider : booking.helper;
    
    return (
      <div className="booking-card" onClick={() => openDetailPanel(booking)}>
        <div className="booking-header">
          <div className="booking-info">
            <h3 className="booking-title">
              {task.title || 'Unknown Project'}
            </h3>
            <div className="booking-meta">
              <span className="booking-role">
                {isHelper ? '🛠️ As Helper' : '📋 As Provider'}
              </span>
              <span className="booking-user">
                👤 {otherUser?.username || 'Unknown User'}
              </span>
              <span className="booking-date">
                📅 {formatDate(booking.createdAt)}
              </span>
            </div>
          </div>
          
          <div className="booking-status">
            <span 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(booking.status) }}
            >
              {getStatusIcon(booking.status)} {booking.status || 'Unknown'}
            </span>
          </div>
        </div>

        <div className="booking-details">
          <div className="detail-row">
            <span className="detail-label">💰 Credits:</span>
            <span className="detail-value">{booking.agreedCredits || 0}</span>
          </div>
          
          {task.dateTime && (
            <div className="detail-row">
              <span className="detail-label">📅 Deadline:</span>
              <span className="detail-value">{formatDate(task.dateTime)}</span>
            </div>
          )}
          
          {booking.startedAt && (
            <div className="detail-row">
              <span className="detail-label">🚀 Started:</span>
              <span className="detail-value">{formatDate(booking.startedAt)}</span>
            </div>
          )}
        </div>

        <div className="booking-actions">
          <button className="view-details-btn">
            View Details →
          </button>
        </div>
      </div>
    );
  };

  const DetailPanel = ({ booking, onClose }) => {
    const [workNote, setWorkNote] = useState('');
    const [reviewData, setReviewData] = useState({ rating: 5, review: '' });
    
    if (!booking) return null;
    
    const task = booking.taskId || {};
    const isHelper = booking.helper?._id === currentUser?.id;
    const otherUser = isHelper ? booking.taskProvider : booking.helper;
    
    const canMarkInProgress = booking.status === 'confirmed' && isHelper;
    const canSubmitWork = booking.status === 'in-progress' && isHelper;
    const canComplete = booking.status === 'work-submitted' && !isHelper;
    const canReview = booking.status === 'completed';
    
    const hasReviewed = isHelper 
      ? booking.helperReview?.rating 
      : booking.taskProviderReview?.rating;

    const handleStatusUpdate = (newStatus) => {
      updateBookingStatus(booking._id, newStatus, workNote);
      setWorkNote('');
    };

    const handleReviewSubmit = () => {
      if (reviewData.rating) {
        submitReview(booking._id, reviewData.rating, reviewData.review);
        setReviewData({ rating: 5, review: '' });
      }
    };

    return (
      <div className="detail-panel-overlay" onClick={onClose}>
        <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
          <div className="panel-header">
            <div className="panel-title">
              <h2>{task.title || 'Project Details'}</h2>
              <span 
                className="status-badge large"
                style={{ backgroundColor: getStatusColor(booking.status) }}
              >
                {getStatusIcon(booking.status)} {booking.status}
              </span>
            </div>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          <div className="panel-content">
            {/* Project Information */}
            <div className="info-section">
              <h3>📋 Project Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Title:</span>
                  <span className="info-value">{task.title || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Description:</span>
                  <span className="info-value">{task.description || 'No description'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Credits:</span>
                  <span className="info-value">{booking.agreedCredits || 0}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Deadline:</span>
                  <span className="info-value">{formatDate(task.dateTime)}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Duration:</span>
                  <span className="info-value">{task.duration || 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Skills Required:</span>
                  <div className="skills-list">
                    {ensureArray(task.skillsRequired).map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Collaboration Details */}
            <div className="info-section">
              <h3>🤝 Collaboration Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Your Role:</span>
                  <span className="info-value">
                    {isHelper ? '🛠️ Helper' : '📋 Task Provider'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Collaborator:</span>
                  <span className="info-value">
                    {otherUser?.username || 'Unknown User'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Booking Created:</span>
                  <span className="info-value">{formatDate(booking.createdAt)}</span>
                </div>
                {booking.startedAt && (
                  <div className="info-item">
                    <span className="info-label">Work Started:</span>
                    <span className="info-value">{formatDate(booking.startedAt)}</span>
                  </div>
                )}
                {booking.completedAt && (
                  <div className="info-item">
                    <span className="info-label">Completed:</span>
                    <span className="info-value">{formatDate(booking.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Work Notes */}
            {(booking.workSubmissionNote || booking.providerAcceptanceNote) && (
              <div className="info-section">
                <h3>📝 Work Notes</h3>
                {booking.workSubmissionNote && (
                  <div className="note-item">
                    <strong>Helper's Submission Note:</strong>
                    <p>{booking.workSubmissionNote}</p>
                  </div>
                )}
                {booking.providerAcceptanceNote && (
                  <div className="note-item">
                    <strong>Provider's Completion Note:</strong>
                    <p>{booking.providerAcceptanceNote}</p>
                  </div>
                )}
              </div>
            )}

            {/* Action Sections */}
            {canMarkInProgress && (
              <div className="action-section">
                <h3>🚀 Start Working</h3>
                <p>Ready to begin this project? Mark it as in progress to let the provider know you've started.</p>
                <button 
                  className="action-btn primary"
                  onClick={() => handleStatusUpdate('in-progress')}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Starting...' : 'Start Project'}
                </button>
              </div>
            )}

            {canSubmitWork && (
              <div className="action-section">
                <h3>📤 Submit Work</h3>
                <p>Finished with your work? Submit it for review by the task provider.</p>
                <textarea
                  value={workNote}
                  onChange={(e) => setWorkNote(e.target.value)}
                  placeholder="Add a note about your completed work (optional)..."
                  className="work-note-input"
                  rows="3"
                />
                <button 
                  className="action-btn success"
                  onClick={() => handleStatusUpdate('work-submitted')}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Submitting...' : 'Submit Work'}
                </button>
              </div>
            )}

            {canComplete && (
              <div className="action-section">
                <h3>✅ Accept Work</h3>
                <p>Review the submitted work and mark the project as completed if you're satisfied.</p>
                <textarea
                  value={workNote}
                  onChange={(e) => setWorkNote(e.target.value)}
                  placeholder="Add completion notes (optional)..."
                  className="work-note-input"
                  rows="3"
                />
                <div className="action-buttons">
                  <button 
                    className="action-btn success"
                    onClick={() => handleStatusUpdate('completed')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Completing...' : 'Accept & Complete'}
                  </button>
                  <button 
                    className="action-btn secondary"
                    onClick={() => handleStatusUpdate('in-progress')}
                    disabled={actionLoading}
                  >
                    Request Revision
                  </button>
                </div>
              </div>
            )}

            {canReview && !hasReviewed && (
              <div className="action-section">
                <h3>⭐ Leave a Review</h3>
                <p>How was your experience working with {otherUser?.username}?</p>
                
                <div className="review-form">
                  <div className="rating-section">
                    <label>Rating:</label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`star ${star <= reviewData.rating ? 'active' : ''}`}
                          onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <textarea
                    value={reviewData.review}
                    onChange={(e) => setReviewData(prev => ({ ...prev, review: e.target.value }))}
                    placeholder="Share your experience working together..."
                    className="review-input"
                    rows="4"
                  />
                  
                  <button 
                    className="action-btn primary"
                    onClick={handleReviewSubmit}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            {(booking.helperReview?.rating || booking.taskProviderReview?.rating) && (
              <div className="info-section">
                <h3>⭐ Reviews</h3>
                <div className="reviews-grid">
                  {booking.helperReview?.rating && (
                    <div className="review-item">
                      <div className="review-header">
                        <strong>Helper's Review:</strong>
                        <div className="rating">
                          {'⭐'.repeat(booking.helperReview.rating)}
                        </div>
                      </div>
                      {booking.helperReview.review && (
                        <p className="review-text">{booking.helperReview.review}</p>
                      )}
                    </div>
                  )}
                  
                  {booking.taskProviderReview?.rating && (
                    <div className="review-item">
                      <div className="review-header">
                        <strong>Provider's Review:</strong>
                        <div className="rating">
                          {'⭐'.repeat(booking.taskProviderReview.rating)}
                        </div>
                      </div>
                      {booking.taskProviderReview.review && (
                        <p className="review-text">{booking.taskProviderReview.review}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="quick-actions">
              <button 
                className="quick-action-btn"
                onClick={() => navigate(`/chat?booking=${booking._id}`)}
              >
                💬 Open Chat
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => navigate(`/tasks/${task._id}`)}
              >
                📋 View Task
              </button>
              {otherUser?._id && (
                <button 
                  className="quick-action-btn"
                  onClick={() => navigate(`/profile/${otherUser._id}`)}
                >
                  👤 View Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = () => (
    <div className="empty-state">
      <div className="empty-icon">📁</div>
      <h3>No Bookings Yet</h3>
      <p>You don't have any bookings yet. Start by browsing tasks or creating your own!</p>
      <div className="empty-actions">
        <button 
          onClick={() => navigate('/browse-tasks')}
          className="btn btn-primary"
        >
          🔍 Browse Tasks
        </button>
        <button 
          onClick={() => navigate('/create-task')}
          className="btn btn-secondary"
        >
          ➕ Create Task
        </button>
      </div>
    </div>
  );

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return (
      <div className="bookings-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      {error && (
        <div className="error-banner">
          <span className="error-text">{error}</span>
          <button onClick={() => setError('')} className="error-close">✕</button>
        </div>
      )}

      <div className="bookings-header">
        <h1>📁 My Bookings</h1>
        <p>Manage your active projects and collaborations</p>
      </div>

      <div className="bookings-controls">
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="confirmed">📋 Confirmed</option>
            <option value="in-progress">⚡ In Progress</option>
            <option value="work-submitted">📤 Work Submitted</option>
            <option value="completed">✅ Completed</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="newest">📅 Newest First</option>
            <option value="oldest">📅 Oldest First</option>
            <option value="credits">💰 Highest Credits</option>
          </select>
        </div>

        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-number">{bookings.length}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {bookings.filter(b => b.status === 'in-progress').length}
            </span>
            <span className="stat-label">Active Projects</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {bookings.filter(b => b.status === 'completed').length}
            </span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      <div className="bookings-content">
        {filteredBookings.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bookings-grid">
            {filteredBookings.map((booking, index) => (
              <BookingCard
                key={booking?._id || index}
                booking={booking}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {showDetailPanel && selectedBooking && (
        <DetailPanel 
          booking={selectedBooking} 
          onClose={closeDetailPanel}
        />
      )}

      <style jsx>{`
        .bookings-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: calc(100vh - 120px);
        }

        .error-banner {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #ff4757;
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1000;
          box-shadow: 0 5px 15px rgba(255,71,87,0.3);
        }

        .error-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 1.2rem;
          font-weight: bold;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
          color: white;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .bookings-header {
          text-align: center;
          margin-bottom: 2rem;
          color: white;
        }

        .bookings-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2.5rem;
          font-weight: 700;
        }

        .bookings-header p {
          margin: 0;
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .bookings-controls {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .filter-controls {
          display: flex;
          gap: 1rem;
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 25px;
          background: rgba(255,255,255,0.9);
          color: #333;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          box-shadow: 0 0 0 3px rgba(255,255,255,0.3);
        }

        .summary-stats {
          display: flex;
          gap: 2rem;
          color: white;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .bookings-content {
          background: rgba(255,255,255,0.95);
          border-radius: 20px;
          padding: 2rem;
          backdrop-filter: blur(10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .bookings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 1.5rem;
        }

        .booking-card {
          background: white;
          border-radius: 15px;
          padding: 1.5rem;
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          border: 1px solid rgba(0,0,0,0.05);
          cursor: pointer;
        }

        .booking-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }

        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid rgba(0,0,0,0.05);
        }

        .booking-info {
          flex: 1;
        }

        .booking-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
          line-height: 1.4;
        }

        .booking-meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.9rem;
          color: #666;
        }

        .booking-status {
          flex-shrink: 0;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: capitalize;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .status-badge.large {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
        }

        .booking-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          font-weight: 600;
          color: #666;
          font-size: 0.9rem;
        }

        .detail-value {
          color: #333;
          font-weight: 500;
        }

        .booking-actions {
          border-top: 1px solid rgba(0,0,0,0.1);
          padding-top: 1rem;
        }

        .view-details-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          width: 100%;
        }

        .view-details-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102,126,234,0.3);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 4rem 2rem;
          color: #666;
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0 0 1rem 0;
          font-size: 1.8rem;
          color: #333;
        }

        .empty-state p {
          margin: 0 0 2rem 0;
          font-size: 1.1rem;
          max-width: 500px;
          line-height: 1.6;
        }

        .empty-actions {
          display: flex;
          gap: 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 4px 15px rgba(102,126,234,0.3);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102,126,234,0.4);
        }

        .btn-secondary {
          background: rgba(102,126,234,0.1);
          color: #667eea;
          border: 2px solid #667eea;
        }

        .btn-secondary:hover {
          background: #667eea;
          color: white;
        }

        /* Detail Panel Styles */
        .detail-panel-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          backdrop-filter: blur(5px);
        }

        .detail-panel {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0,0,0,0.3);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .panel-header {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .panel-title {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .panel-title h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .close-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 0.5rem;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        .panel-content {
          padding: 2rem;
          overflow-y: auto;
          max-height: 70vh;
        }

        .info-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(0,0,0,0.1);
        }

        .info-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .info-section h3 {
          margin: 0 0 1.5rem 0;
          color: #333;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .info-item {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 1rem;
          align-items: flex-start;
        }

        .info-label {
          font-weight: 600;
          color: #667eea;
          font-size: 0.9rem;
        }

        .info-value {
          color: #333;
          word-wrap: break-word;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .note-item {
          background: rgba(102,126,234,0.05);
          border-radius: 10px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .note-item strong {
          color: #667eea;
          display: block;
          margin-bottom: 0.5rem;
        }

        .note-item p {
          margin: 0;
          color: #666;
          line-height: 1.5;
        }

        .action-section {
          background: rgba(102,126,234,0.05);
          border-radius: 15px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .action-section h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.1rem;
        }

        .action-section p {
          margin: 0 0 1.5rem 0;
          color: #666;
          line-height: 1.5;
        }

        .work-note-input, .review-input {
          width: 100%;
          padding: 1rem;
          border: 2px solid rgba(0,0,0,0.1);
          border-radius: 10px;
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
          margin-bottom: 1rem;
          outline: none;
          transition: border-color 0.3s ease;
        }

        .work-note-input:focus, .review-input:focus {
          border-color: #667eea;
        }

        .action-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-right: 1rem;
          margin-bottom: 0.5rem;
        }

        .action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102,126,234,0.3);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .action-btn.success {
          background: linear-gradient(135deg, #2ecc71, #27ae60);
        }

        .action-btn.success:hover:not(:disabled) {
          box-shadow: 0 5px 15px rgba(46,204,113,0.3);
        }

        .action-btn.secondary {
          background: rgba(102,126,234,0.1);
          color: #667eea;
          border: 2px solid #667eea;
        }

        .action-btn.secondary:hover:not(:disabled) {
          background: #667eea;
          color: white;
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .review-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .rating-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .rating-section label {
          font-weight: 600;
          color: #333;
        }

        .star-rating {
          display: flex;
          gap: 0.25rem;
        }

        .star {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 0.3;
          transition: opacity 0.3s ease;
        }

        .star.active {
          opacity: 1;
        }

        .reviews-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .review-item {
          background: rgba(102,126,234,0.05);
          border-radius: 10px;
          padding: 1rem;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .review-header strong {
          color: #667eea;
        }

        .rating {
          font-size: 1.2rem;
        }

        .review-text {
          margin: 0;
          color: #666;
          line-height: 1.5;
        }

        .quick-actions {
          display: flex;
          gap: 1rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(0,0,0,0.1);
          flex-wrap: wrap;
        }

        .quick-action-btn {
          background: rgba(102,126,234,0.1);
          color: #667eea;
          border: 2px solid #667eea;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quick-action-btn:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .bookings-grid {
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .bookings-container {
            padding: 1rem;
          }

          .bookings-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-controls, .summary-stats {
            justify-content: center;
          }

          .bookings-grid {
            grid-template-columns: 1fr;
          }

          .detail-panel-overlay {
            padding: 1rem;
          }

          .panel-header {
            padding: 1.5rem;
          }

          .panel-content {
            padding: 1.5rem;
          }

          .info-item {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .action-buttons {
            flex-direction: column;
          }

          .quick-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default MyBookings;