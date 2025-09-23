import React, { useState, useEffect } from 'react';
import './ElderlyDashboard.css';

// Import community images
import hommieImage1 from '../assets/Hommie.jpg';
import elderlyPhoto1 from '../assets/Old.jpg';

const ElderlyDashboard = ({ requests, onSubmitRequest, onCancelRequest, onRateVolunteer, onDeleteAccount, user }) => {
  const [selectedTab, setSelectedTab] = useState('my-requests');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  
  // Enhanced rating system for character assessment
  const [detailedRating, setDetailedRating] = useState({
    overall: 5,
    kindness: 5,
    communication: 5,
    reliability: 5,
    professionalism: 5,
    patience: 5,
    helpfulness: 5
  });
  
  // Volunteer recommendations state
  const [recommendedVolunteers, setRecommendedVolunteers] = useState([]);
  const [preferredVolunteerType, setPreferredVolunteerType] = useState('');
  
  // New request form state
  const [newRequest, setNewRequest] = useState({
    type: 'shopping',
    description: '',
    urgency: 'medium',
    location: user?.location || '',
    phone: user?.phone || '',
    preferredVolunteerGender: 'any',
    preferredAge: 'any',
    specialNeeds: ''
  });

  // User statistics
  const [userStats, setUserStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    completedRequests: 0,
    cancelledRequests: 0,
    averageCompletionTime: 0
  });

  // Calculate user statistics and load volunteer recommendations
  useEffect(() => {
    if (user && requests) {
      const userRequests = requests.filter(req => req.requester?.userId === user.id || req.name === user.name);
      
      const pendingCount = userRequests.filter(req => req.status === 'pending').length;
      const approvedCount = userRequests.filter(req => req.status === 'approved').length;
      const completedCount = userRequests.filter(req => req.status === 'completed').length;
      const cancelledCount = userRequests.filter(req => req.status === 'cancelled').length;

      setUserStats({
        totalRequests: userRequests.length,
        pendingRequests: pendingCount,
        approvedRequests: approvedCount,
        completedRequests: completedCount,
        cancelledRequests: cancelledCount,
        averageCompletionTime: 2.5 // Mock average in days
      });
      
      // Load volunteer recommendations
      loadVolunteerRecommendations();
    }
  }, [user, requests]);

  // Load personalized volunteer recommendations
  const loadVolunteerRecommendations = () => {
    // Get all completed requests with volunteer ratings
    const completedRequests = requests.filter(req => 
      req.status === 'completed' && 
      req.volunteer && 
      req.volunteer.rating
    );
    
    // Calculate volunteer performance metrics
    const volunteerStats = {};
    
    completedRequests.forEach(req => {
      const volunteerId = req.volunteer.userId;
      const volunteerName = req.volunteer.name;
      
      if (!volunteerStats[volunteerId]) {
        volunteerStats[volunteerId] = {
          id: volunteerId,
          name: volunteerName,
          email: req.volunteer.email,
          completedTasks: 0,
          totalRating: 0,
          ratingCount: 0,
          averageRating: 0,
          specialties: new Set(),
          characterRatings: {
            kindness: [],
            communication: [],
            reliability: [],
            professionalism: [],
            patience: [],
            helpfulness: []
          },
          recentActivity: [],
          testimonials: []
        };
      }
      
      const vol = volunteerStats[volunteerId];
      vol.completedTasks++;
      vol.totalRating += req.volunteer.rating;
      vol.ratingCount++;
      vol.specialties.add(req.type);
      vol.recentActivity.push({
        date: req.volunteer.completedAt,
        type: req.type,
        location: req.location
      });
      
      // Store detailed ratings if available
      if (req.volunteer.detailedRating) {
        Object.keys(req.volunteer.detailedRating).forEach(aspect => {
          if (vol.characterRatings[aspect]) {
            vol.characterRatings[aspect].push(req.volunteer.detailedRating[aspect]);
          }
        });
      }
      
      // Store testimonials
      if (req.volunteer.ratingComment) {
        vol.testimonials.push({
          comment: req.volunteer.ratingComment,
          date: req.volunteer.completedAt,
          requestType: req.type
        });
      }
    });
    
    // Calculate final scores and recommendations
    const volunteers = Object.values(volunteerStats).map(vol => {
      vol.averageRating = vol.ratingCount > 0 ? vol.totalRating / vol.ratingCount : 0;
      vol.specialties = Array.from(vol.specialties);
      
      // Calculate character aspect averages
      Object.keys(vol.characterRatings).forEach(aspect => {
        const ratings = vol.characterRatings[aspect];
        vol.characterRatings[aspect] = {
          average: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
          count: ratings.length
        };
      });
      
      // Calculate recommendation score based on performance and character
      const performanceScore = (vol.completedTasks * 0.3) + (vol.averageRating * 0.7);
      const characterScore = Object.values(vol.characterRatings)
        .filter(rating => rating.count > 0)
        .reduce((sum, rating) => sum + rating.average, 0) / 
        Object.values(vol.characterRatings).filter(rating => rating.count > 0).length || 0;
      
      vol.recommendationScore = (performanceScore + characterScore) / 2;
      vol.badge = vol.completedTasks >= 10 ? '🏆 Expert Helper' : 
                  vol.completedTasks >= 5 ? '⭐ Experienced Helper' : 
                  vol.completedTasks >= 1 ? '🌟 Trusted Helper' : '';
      
      vol.badgeClass = vol.completedTasks >= 10 ? 'expert-badge' : 
                       vol.completedTasks >= 5 ? 'experienced-badge' : 
                       vol.completedTasks >= 1 ? 'trusted-badge' : '';
      
      return vol;
    });
    
    // Sort by recommendation score and take top 5
    volunteers.sort((a, b) => b.recommendationScore - a.recommendationScore);
    setRecommendedVolunteers(volunteers.slice(0, 5));
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    const requestData = {
      ...newRequest,
      name: user.name,
      age: user.age,
      requester: {
        userId: user.id,
        name: user.name,
        email: user.email
      }
    };
    
    onSubmitRequest(requestData);
    setNewRequest({
      type: 'shopping',
      description: '',
      urgency: 'medium',
      location: user?.location || '',
      phone: user?.phone || '',
      preferredVolunteerGender: 'any',
      preferredAge: 'any',
      specialNeeds: ''
    });
    setShowRequestForm(false);
  };

  const handleRateVolunteer = (e) => {
    e.preventDefault();
    if (selectedRequest) {
      onRateVolunteer(selectedRequest.id, {
        rating: rating,
        comment: ratingComment,
        volunteerId: selectedRequest.volunteer?.userId,
        volunteerName: selectedRequest.volunteer?.name || selectedRequest.assignedVolunteer
      });
      setShowRatingModal(false);
      setRating(5);
      setRatingComment('');
      setSelectedRequest(null);
    }
  };

  const handleRequestSpecificVolunteer = (volunteerId) => {
    // Create a new request with the specific volunteer preference
    setNewRequest({
      ...newRequest,
      preferredVolunteerId: volunteerId,
      description: `Requesting assistance from recommended volunteer ${recommendations.find(v => v.id === volunteerId)?.name}`
    });
    setShowRequestForm(true);
  };

  const handleViewVolunteerProfile = (volunteer) => {
    setSelectedVolunteer(volunteer);
    // Could open a detailed modal or navigate to profile page
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#fdcb6e';
      case 'approved': return '#00cec9';
      case 'in-progress': return '#74b9ff';
      case 'completed': return '#55a3ff';
      case 'cancelled': return '#ff7675';
      default: return '#ddd';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'shopping': return '🛒';
      case 'medicine': return '💊';
      case 'daily tasks': return '🏠';
      case 'transportation': return '🚗';
      case 'companionship': return '🤝';
      default: return '❓';
    }
  };

  const getRequestIcon = (type) => {
    return getTypeIcon(type);
  };

  const getMyRequests = () => {
    console.log('🔍 Debugging getMyRequests:');
    console.log('User:', user);
    console.log('All requests:', requests);
    const myRequests = requests.filter(req => req.requester?.userId === user.id || req.name === user.name);
    console.log('My requests:', myRequests);
    return myRequests;
  };

  const getPendingRequests = () => {
    return getMyRequests().filter(req => req.status === 'pending');
  };

  const getActiveRequests = () => {
    return getMyRequests().filter(req => ['approved', 'in-progress'].includes(req.status));
  };

  const getCompletedRequests = () => {
    const myRequests = getMyRequests();
    const completedRequests = myRequests.filter(req => req.status === 'completed');
    console.log('🎉 Completed requests:', completedRequests);
    return completedRequests;
  };

  const renderRequestForm = () => (
    <div className="request-form-overlay">
      <div className="request-form-modal">
        <div className="form-header">
          <h3>💌 Submit a New Request</h3>
          <button 
            className="close-button"
            onClick={() => setShowRequestForm(false)}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmitRequest} className="request-form">
          <div className="form-group">
            <label htmlFor="type">Type of Help Needed:</label>
            <select
              id="type"
              value={newRequest.type}
              onChange={(e) => setNewRequest({...newRequest, type: e.target.value})}
              required
            >
              <option value="shopping">🛒 Shopping</option>
              <option value="medicine">💊 Medicine Pickup</option>
              <option value="daily tasks">🏠 Daily Tasks</option>
              <option value="transportation">🚗 Transportation</option>
              <option value="companionship">🤝 Companionship</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={newRequest.description}
              onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
              placeholder="Please describe what help you need..."
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="urgency">Priority Level:</label>
            <select
              id="urgency"
              value={newRequest.urgency}
              onChange={(e) => setNewRequest({...newRequest, urgency: e.target.value})}
              required
            >
              <option value="low">🟢 Low - Can wait a few days</option>
              <option value="medium">🟡 Medium - Within 1-2 days</option>
              <option value="high">🔴 High - Urgent, within 24 hours</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location:</label>
            <input
              type="text"
              id="location"
              value={newRequest.location}
              onChange={(e) => setNewRequest({...newRequest, location: e.target.value})}
              placeholder="Your area or neighborhood"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Contact Phone:</label>
            <input
              type="tel"
              id="phone"
              value={newRequest.phone}
              onChange={(e) => setNewRequest({...newRequest, phone: e.target.value})}
              placeholder="(555) 123-4567"
              required
            />
          </div>

          <div className="volunteer-preferences-section">
            <h4>🧑‍🤝‍🧑 Volunteer Preferences</h4>
            
            <div className="form-group">
              <label htmlFor="preferredGender">Preferred Volunteer Gender:</label>
              <select
                id="preferredGender"
                value={newRequest.preferredVolunteerGender}
                onChange={(e) => setNewRequest({...newRequest, preferredVolunteerGender: e.target.value})}
              >
                <option value="any">No Preference</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="preferredAge">Preferred Volunteer Age:</label>
              <select
                id="preferredAge"
                value={newRequest.preferredAge}
                onChange={(e) => setNewRequest({...newRequest, preferredAge: e.target.value})}
              >
                <option value="any">No Preference</option>
                <option value="young">18-30 years</option>
                <option value="middle">31-50 years</option>
                <option value="senior">51+ years</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="specialNeeds">Special Needs or Preferences:</label>
              <textarea
                id="specialNeeds"
                value={newRequest.specialNeeds}
                onChange={(e) => setNewRequest({...newRequest, specialNeeds: e.target.value})}
                placeholder="e.g., Need someone who speaks Spanish, prefers gentle personality, has experience with medical assistance..."
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setShowRequestForm(false)} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              💝 Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderRatingModal = () => (
    <div className="rating-modal-overlay">
      <div className="rating-modal">
        <div className="modal-header">
          <h3>⭐ Rate Your Volunteer</h3>
          <button 
            className="close-button"
            onClick={() => setShowRatingModal(false)}
          >
            ✕
          </button>
        </div>

        <div className="volunteer-info">
          <h4>Volunteer: {selectedRequest?.volunteer?.name || selectedRequest?.assignedVolunteer || 'Unknown Volunteer'}</h4>
          <p>Help provided: {selectedRequest?.description}</p>
        </div>

        <form onSubmit={handleRateVolunteer} className="rating-form">
          <div className="rating-group">
            <label>How was your experience?</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`star ${rating >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ⭐
                </button>
              ))}
            </div>
            <p className="rating-text">
              {rating === 5 && "Excellent! 😊"}
              {rating === 4 && "Very Good! 👍"}
              {rating === 3 && "Good 😊"}
              {rating === 2 && "Fair 😐"}
              {rating === 1 && "Needs Improvement 😔"}
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Additional Comments (Optional):</label>
            <textarea
              id="comment"
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Share your experience to help other community members..."
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={() => setShowRatingModal(false)} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-rating-button">
              💝 Submit Rating
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="stats-section">
      <div className="stats-header">
        <h3>📊 Your Request Summary</h3>
        <p>Track your community connections and help received</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <span className="stat-number">{userStats.totalRequests}</span>
            <span className="stat-label">Total Requests</span>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <span className="stat-number">{userStats.pendingRequests}</span>
            <span className="stat-label">Pending Review</span>
          </div>
        </div>
        
        <div className="stat-card active">
          <div className="stat-icon">🤝</div>
          <div className="stat-content">
            <span className="stat-number">{userStats.approvedRequests}</span>
            <span className="stat-label">Active Requests</span>
          </div>
        </div>
        
        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-number">{userStats.completedRequests}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        
        <div className="stat-card time">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <span className="stat-number">{userStats.averageCompletionTime}d</span>
            <span className="stat-label">Avg. Response Time</span>
          </div>
        </div>
        
        <div className="stat-card community">
          <div className="stat-icon">💝</div>
          <div className="stat-content">
            <span className="stat-number">{userStats.completedRequests}</span>
            <span className="stat-label">Hearts Received</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMyRequests = () => {
    const myRequests = getMyRequests();
    
    return (
      <div className="requests-section">
        <div className="section-header">
          <h3>📋 All My Requests ({myRequests.length})</h3>
          <button 
            className="new-request-button"
            onClick={() => setShowRequestForm(true)}
          >
            ➕ New Request
          </button>
        </div>
        
        {myRequests.length === 0 ? (
          <div className="empty-state">
            <img src={elderlyPhoto1} alt="Getting Started" className="empty-image" />
            <h4>Welcome to HeartBridge! 💝</h4>
            <p>You haven't submitted any requests yet.</p>
            <p>Click "New Request" above to get help from our caring volunteers.</p>
            <button 
              className="get-started-button"
              onClick={() => setShowRequestForm(true)}
            >
              🌟 Submit Your First Request
            </button>
          </div>
        ) : (
          <div className="requests-grid">
            {myRequests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="request-info">
                    <h4>{getTypeIcon(request.type)} {request.type}</h4>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(request.status) }}
                    >
                      {request.status}
                    </span>
                  </div>
                  <div className="request-date">
                    📅 {formatDate(request.dateCreated)}
                  </div>
                </div>
                
                <div className="request-details">
                  <p><strong>Description:</strong> {request.description}</p>
                  <p><strong>📍 Location:</strong> {request.location}</p>
                  <p><strong>📞 Contact:</strong> {request.phone}</p>
                  
                  {request.volunteer && (
                    <div className="volunteer-info">
                      <p><strong>💝 Volunteer:</strong> {request.volunteer.name}</p>
                      {request.volunteer.assignedAt && (
                        <p><strong>✅ Assigned:</strong> {formatDate(request.volunteer.assignedAt)}</p>
                      )}
                    </div>
                  )}
                  
                  {request.status === 'completed' && request.volunteer && !request.volunteer.rated && (
                    <div className="rating-prompt">
                      <p>💝 How was your experience with {request.volunteer.name}?</p>
                      <button 
                        className="rate-volunteer-button"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRatingModal(true);
                        }}
                      >
                        ⭐ Rate Volunteer
                      </button>
                    </div>
                  )}
                  
                  {request.volunteer?.rated && (
                    <div className="rating-complete">
                      <span className="rating-icon">⭐</span>
                      <span>Thank you for your feedback!</span>
                    </div>
                  )}
                </div>
                
                <div className="request-actions">
                  {request.status === 'pending' && (
                    <button 
                      className="cancel-button"
                      onClick={() => onCancelRequest(request.id)}
                    >
                      ❌ Cancel Request
                    </button>
                  )}
                  {request.status === 'approved' && (
                    <div className="status-message">
                      <span className="status-icon">✅</span>
                      <span>Approved! Volunteers can now see your request.</span>
                    </div>
                  )}
                  {request.status === 'in-progress' && (
                    <div className="status-message">
                      <span className="status-icon">🤝</span>
                      <span>A volunteer is helping you!</span>
                    </div>
                  )}
                  {request.status === 'completed' && (
                    <div className="status-message">
                      <span className="status-icon">🎉</span>
                      <span>Completed! Thank you for using HeartBridge.</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="elderly-dashboard">
      <div className="dashboard-header">
        <div className="header-main">
          <h1>💝 Welcome, {user?.name}!</h1>
          <p>Your personal space to request help and connect with caring volunteers</p>
        </div>
        <div className="header-actions">
          <button 
            className="delete-account-button"
            onClick={() => setShowDeleteAccountModal(true)}
            title="Delete Account"
          >
            🗑️ Delete Account
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        <button 
          className={selectedTab === 'overview' ? 'nav-button active' : 'nav-button'}
          onClick={() => setSelectedTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={selectedTab === 'my-requests' ? 'nav-button active' : 'nav-button'}
          onClick={() => setSelectedTab('my-requests')}
        >
          📋 My Requests ({getMyRequests().length})
        </button>
        <button 
          className={selectedTab === 'active' ? 'nav-button active' : 'nav-button'}
          onClick={() => setSelectedTab('active')}
        >
          🤝 Active ({getActiveRequests().length})
        </button>
        <button 
          className={selectedTab === 'completed' ? 'nav-button active' : 'nav-button'}
          onClick={() => setSelectedTab('completed')}
        >
          ✅ Completed ({getCompletedRequests().length})
        </button>
        <button 
          className={selectedTab === 'recommendations' ? 'nav-button active' : 'nav-button'}
          onClick={() => setSelectedTab('recommendations')}
        >
          🌟 Recommended Volunteers
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">
        {selectedTab === 'overview' && renderStats()}
        {selectedTab === 'my-requests' && renderMyRequests()}
        {selectedTab === 'active' && (
          <div className="requests-section">
            <h3>🤝 Active Requests</h3>
            {getActiveRequests().length === 0 ? (
              <div className="empty-state">
                <p>You don't have any active requests right now.</p>
              </div>
            ) : (
              <div className="requests-grid">
                {getActiveRequests().map(request => (
                  <div key={request.id} className="request-card active">
                    {/* Similar request card structure */}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {selectedTab === 'completed' && (
          <div className="requests-section">
            <h3>✅ Completed Requests</h3>
            {getCompletedRequests().length === 0 ? (
              <div className="empty-state">
                <p>Your completed requests will appear here.</p>
              </div>
            ) : (
              <div className="requests-grid">
                {getCompletedRequests().map(request => (
                  <div key={request.id} className="request-card completed">
                    <div className="request-header">
                      <div className="request-type">
                        <span className="request-icon">{getRequestIcon(request.requestType)}</span>
                        <h4>{request.requestType}</h4>
                      </div>
                      <span className="request-status completed">
                        ✅ Completed
                      </span>
                    </div>
                    
                    <div className="request-content">
                      <p className="request-description">{request.description}</p>
                      <div className="request-details">
                        <div className="detail-item">
                          <span className="detail-label">📍 Location:</span>
                          <span className="detail-value">{request.location}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">⏰ Completed:</span>
                          <span className="detail-value">
                            {request.completedDate ? new Date(request.completedDate).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                        {request.volunteer?.name || request.assignedVolunteer && (
                          <div className="detail-item">
                            <span className="detail-label">👤 Volunteer:</span>
                            <span className="detail-value volunteer-name">{request.volunteer?.name || request.assignedVolunteer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="request-actions">
                      {request.volunteerRating ? (
                        <div className="rating-display">
                          <span className="rating-label">Your Rating:</span>
                          <div className="stars-display">
                            {'⭐'.repeat(request.volunteerRating)}
                          </div>
                          <span className="rating-value">({request.volunteerRating}/5)</span>
                          {request.feedback && (
                            <div className="feedback-display">
                              <p><strong>Your Feedback:</strong> "{request.feedback}"</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          className="rate-volunteer-btn"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRatingModal(true);
                          }}
                        >
                          ⭐ Rate Volunteer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {selectedTab === 'recommendations' && (
          <div className="recommendations-section">
            <div className="section-header">
              <h2>🌟 Recommended Volunteers</h2>
              <p>Based on your preferences and volunteer performance</p>
              <button 
                className="refresh-button"
                onClick={loadVolunteerRecommendations}
                disabled={loading}
              >
                {loading ? '🔄 Loading...' : '🔄 Refresh Recommendations'}
              </button>
            </div>

            {recommendedVolunteers.length === 0 ? (
              <div className="no-recommendations">
                <div className="no-recommendations-icon">👥</div>
                <h3>No Recommendations Yet</h3>
                <p>Complete some requests and rate volunteers to see personalized recommendations!</p>
              </div>
            ) : (
              <div className="recommendations-grid">
                {recommendedVolunteers.map((volunteer) => (
                  <div key={volunteer.id} className="volunteer-recommendation-card">
                    <div className="volunteer-header">
                      <div className="volunteer-avatar">
                        {volunteer.name.charAt(0)}
                      </div>
                      <div className="volunteer-basic-info">
                        <h3>{volunteer.name}</h3>
                        {volunteer.badge && (
                          <div className={`volunteer-badge ${volunteer.badgeClass || ''}`}>
                            {volunteer.badge}
                          </div>
                        )}
                        <div className="volunteer-rating">
                          <span className="rating-stars">
                            {'⭐'.repeat(Math.floor(volunteer.averageRating))}
                          </span>
                          <span className="rating-number">{volunteer.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="volunteer-details">
                      <div className="volunteer-stats">
                        <div className="stat-item">
                          <span className="stat-label">Completed:</span>
                          <span className="stat-value">{volunteer.completedTasks}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Specialties:</span>
                          <span className="stat-value">{volunteer.specialties.join(', ')}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Recommendation Score:</span>
                          <span className="stat-value">{volunteer.recommendationScore.toFixed(1)}/5</span>
                        </div>
                      </div>

                      {volunteer.characterRatings && Object.keys(volunteer.characterRatings).some(key => volunteer.characterRatings[key].count > 0) && (
                        <div className="character-traits">
                          <h4>✨ Character Traits</h4>
                          <div className="traits-grid">
                            {Object.entries(volunteer.characterRatings)
                              .filter(([trait, data]) => data.count > 0)
                              .map(([trait, data]) => (
                              <div key={trait} className="trait-item">
                                <span className="trait-name">{trait}</span>
                                <div className="trait-bar">
                                  <div 
                                    className="trait-fill" 
                                    style={{width: `${(data.average / 5) * 100}%`}}
                                  ></div>
                                </div>
                                <span className="trait-score">{data.average.toFixed(1)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {volunteer.testimonials && volunteer.testimonials.length > 0 && (
                        <div className="testimonials">
                          <h4>💬 Recent Testimonials</h4>
                          {volunteer.testimonials.slice(0, 2).map((testimonial, index) => (
                            <div key={index} className="testimonial">
                              <p>"{testimonial.comment}"</p>
                              <div className="testimonial-author">
                                <span>- For {testimonial.requestType} help</span>
                                <span className="testimonial-date">
                                  {new Date(testimonial.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="volunteer-actions">
                        <button 
                          className="request-volunteer-button"
                          onClick={() => handleRequestSpecificVolunteer(volunteer.id)}
                        >
                          📋 Request This Volunteer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Community Appreciation Section */}
      <div className="community-appreciation">
        <div className="appreciation-content">
          <div className="appreciation-text">
            <h3>💝 You're Part of Something Beautiful</h3>
            <p>Every request you make helps build our caring community. Our volunteers are here because they want to help, and your willingness to reach out creates meaningful connections that brighten everyone's day.</p>
          </div>
          <div className="appreciation-image">
            <img src={hommieImage1} alt="Community Love" />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showRequestForm && renderRequestForm()}
      {showRatingModal && renderRatingModal()}
      {showDeleteAccountModal && (
        <div className="delete-account-modal-overlay">
          <div className="delete-account-modal">
            <div className="modal-header">
              <h3>🗑️ Delete Account</h3>
              <button 
                className="close-button"
                onClick={() => setShowDeleteAccountModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="delete-account-content">
              <div className="warning-message">
                <span className="warning-icon">⚠️</span>
                <p><strong>Are you sure you want to delete your account?</strong></p>
              </div>
              <div className="consequences-list">
                <h4>This action will:</h4>
                <ul>
                  <li>🚫 Permanently deactivate your account</li>
                  <li>📋 Cancel all your pending requests</li>
                  <li>💔 Remove you from the HeartBridge community</li>
                  <li>🔒 Make your profile no longer accessible</li>
                </ul>
              </div>
              <div className="final-warning">
                <p><em>This action cannot be undone. You would need to create a new account to use HeartBridge again.</em></p>
              </div>
              <div className="modal-actions">
                <button 
                  className="cancel-delete-button"
                  onClick={() => setShowDeleteAccountModal(false)}
                >
                  💝 Keep My Account
                </button>
                <button 
                  className="confirm-delete-button"
                  onClick={() => {
                    onDeleteAccount();
                    setShowDeleteAccountModal(false);
                  }}
                >
                  🗑️ Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElderlyDashboard;