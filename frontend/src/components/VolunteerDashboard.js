import React, { useState, useEffect } from 'react';
import './VolunteerDashboard.css';

// Import community image
import hommieImage1 from '../assets/Hommie.jpg';

const VolunteerDashboard = ({ requests, onAssign, onComplete, onDeleteAccount, user }) => {
  const [selectedTab, setSelectedTab] = useState('portfolio');
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [volunteerStats, setVolunteerStats] = useState({
    totalCompleted: 0,
    totalHoursVolunteered: 0,
    averageRating: 0,
    tasksThisMonth: 0,
    favoriteCategories: [],
    joinDate: new Date(),
    streak: 0,
    badges: [],
    impactScore: 0
  });

  // Calculate volunteer statistics
  useEffect(() => {
    if (user && requests) {
      const userRequests = requests.filter(req => 
        req.volunteer && req.volunteer.userId === user.id
      );
      
      const completedRequests = userRequests.filter(req => req.status === 'completed');
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const thisMonthCompleted = completedRequests.filter(req => 
        new Date(req.volunteer.completedAt) >= thisMonth
      );

      // Calculate categories
      const categories = {};
      completedRequests.forEach(req => {
        categories[req.type] = (categories[req.type] || 0) + 1;
      });
      
      const favoriteCategories = Object.entries(categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category, count]) => ({ category, count }));

      // Calculate badges
      const badges = [];
      if (completedRequests.length >= 1) badges.push({ name: 'First Helper', icon: '🌟', description: 'Completed your first request' });
      if (completedRequests.length >= 5) badges.push({ name: 'Helping Hand', icon: '🤝', description: 'Completed 5 requests' });
      if (completedRequests.length >= 10) badges.push({ name: 'Community Champion', icon: '🏆', description: 'Completed 10 requests' });
      if (completedRequests.length >= 25) badges.push({ name: 'Hero of Hearts', icon: '💖', description: 'Completed 25 requests' });
      if (thisMonthCompleted.length >= 3) badges.push({ name: 'Monthly Superstar', icon: '⭐', description: '3+ requests this month' });

      setVolunteerStats({
        totalCompleted: completedRequests.length,
        totalHoursVolunteered: completedRequests.length * 2, // Estimate 2 hours per task
        averageRating: 4.8, // Mock rating
        tasksThisMonth: thisMonthCompleted.length,
        favoriteCategories,
        joinDate: user.joinDate || new Date('2024-01-01'),
        streak: Math.min(completedRequests.length, 7), // Mock streak
        badges,
        impactScore: completedRequests.length * 10 + thisMonthCompleted.length * 5
      });
    }
  }, [user, requests]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case 'high': return 'urgency-high';
      case 'medium': return 'urgency-medium';
      case 'low': return 'urgency-low';
      default: return 'urgency-medium';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'shopping': return '🛒';
      case 'medicine': return '💊';
      case 'daily tasks': return '🏠';
      default: return '❓';
    }
  };

  const handleAssignRequest = (requestId) => {
    onAssign(requestId, user.name);
  };

  const handleCompleteRequest = (requestId) => {
    if (window.confirm('💖 Are you sure you want to mark this request as completed? Thank you for your kindness!')) {
      onComplete(requestId);
    }
  };

  const getAvailableRequests = () => {
    return requests.filter(req => req.status === 'approved' && !req.volunteer);
  };

  const getMyRequests = () => {
    return requests.filter(req => 
      req.volunteer && req.volunteer.userId === user.id && req.status !== 'completed'
    );
  };

  const getCompletedRequests = () => {
    return requests.filter(req => 
      req.volunteer && req.volunteer.userId === user.id && req.status === 'completed'
    );
  };

  const renderPortfolioStats = () => (
    <div className="portfolio-stats">
      <div className="stats-header">
        <h3>💝 Your Volunteer Portfolio</h3>
        <p>Making a difference in our community, one act of kindness at a time</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <span className="stat-number">{volunteerStats.totalCompleted}</span>
            <span className="stat-label">Total Completed</span>
          </div>
        </div>
        
        <div className="stat-card secondary">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <span className="stat-number">{volunteerStats.totalHoursVolunteered}h</span>
            <span className="stat-label">Hours Volunteered</span>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <span className="stat-number">{volunteerStats.averageRating}</span>
            <span className="stat-label">Average Rating</span>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <span className="stat-number">{volunteerStats.tasksThisMonth}</span>
            <span className="stat-label">This Month</span>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <span className="stat-number">{volunteerStats.streak}</span>
            <span className="stat-label">Day Streak</span>
          </div>
        </div>
        
        <div className="stat-card purple">
          <div className="stat-icon">💖</div>
          <div className="stat-content">
            <span className="stat-number">{volunteerStats.impactScore}</span>
            <span className="stat-label">Impact Score</span>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      {volunteerStats.badges.length > 0 && (
        <div className="badges-section">
          <h4>🏅 Your Achievements</h4>
          <div className="badges-grid">
            {volunteerStats.badges.map((badge, index) => (
              <div key={index} className="badge-item">
                <span className="badge-icon">{badge.icon}</span>
                <div className="badge-info">
                  <span className="badge-name">{badge.name}</span>
                  <span className="badge-description">{badge.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Categories */}
      {volunteerStats.favoriteCategories.length > 0 && (
        <div className="categories-section">
          <h4>📊 Your Service Areas</h4>
          <div className="categories-grid">
            {volunteerStats.favoriteCategories.map((cat, index) => (
              <div key={index} className="category-item">
                <span className="category-icon">{getTypeIcon(cat.category)}</span>
                <div className="category-info">
                  <span className="category-name">{cat.category}</span>
                  <span className="category-count">{cat.count} completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAvailableRequests = () => {
    const availableRequests = getAvailableRequests();
    
    return (
      <div className="requests-section">
        <h3>💌 Available Requests ({availableRequests.length})</h3>
        {availableRequests.length === 0 ? (
          <div className="empty-state">
            <img src={hommieImage1} alt="Community" className="empty-image" />
            <p>🎉 Amazing! No pending requests right now.</p>
            <p>💝 Check back soon for more opportunities to help!</p>
          </div>
        ) : (
          <div className="requests-grid">
            {availableRequests.map(request => (
              <div key={request.id} className="request-card available">
                <div className="request-header">
                  <div className="request-info">
                    <h4>{getTypeIcon(request.type)} {request.name}, {request.age}</h4>
                    <span className={`urgency-badge ${getUrgencyClass(request.urgency)}`}>
                      {request.urgency} priority
                    </span>
                  </div>
                </div>
                
                <div className="request-details">
                  <p><strong>Help needed:</strong> {request.description}</p>
                  <p><strong>📍 Location:</strong> {request.location}</p>
                  <p><strong>📞 Contact:</strong> {request.phone}</p>
                  <p><strong>📅 Posted:</strong> {formatDate(request.dateCreated)}</p>
                </div>
                
                <div className="request-actions">
                  <button 
                    className="accept-button"
                    onClick={() => handleAssignRequest(request.id)}
                  >
                    💝 Accept Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderMyRequests = () => {
    const myRequests = getMyRequests();
    
    return (
      <div className="requests-section">
        <h3>🤝 My Current Requests ({myRequests.length})</h3>
        {myRequests.length === 0 ? (
          <div className="empty-state">
            <p>💭 You don't have any active requests right now.</p>
            <p>💝 Check the available requests to help someone today!</p>
          </div>
        ) : (
          <div className="requests-grid">
            {myRequests.map(request => (
              <div key={request.id} className="request-card assigned">
                <div className="request-header">
                  <div className="request-info">
                    <h4>{getTypeIcon(request.type)} {request.name}, {request.age}</h4>
                    <span className="status-badge in-progress">In Progress</span>
                  </div>
                </div>
                
                <div className="request-details">
                  <p><strong>Help needed:</strong> {request.description}</p>
                  <p><strong>📍 Location:</strong> {request.location}</p>
                  <p><strong>📞 Contact:</strong> {request.phone}</p>
                  <p><strong>✅ Accepted:</strong> {formatDate(request.volunteer.assignedAt)}</p>
                </div>
                
                <div className="request-actions">
                  <button 
                    className="complete-button"
                    onClick={() => handleCompleteRequest(request.id)}
                  >
                    ✅ Mark Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCompletedRequests = () => {
    const completedRequests = getCompletedRequests();
    
    return (
      <div className="requests-section">
        <h3>🎉 Completed Requests ({completedRequests.length})</h3>
        {completedRequests.length === 0 ? (
          <div className="empty-state">
            <p>🌟 Your completed requests will appear here.</p>
            <p>💖 Start helping to build your impact portfolio!</p>
          </div>
        ) : (
          <div className="requests-grid">
            {completedRequests.map(request => (
              <div key={request.id} className="request-card completed">
                <div className="request-header">
                  <div className="request-info">
                    <h4>{getTypeIcon(request.type)} {request.name}, {request.age}</h4>
                    <span className="status-badge completed">Completed</span>
                  </div>
                </div>
                
                <div className="request-details">
                  <p><strong>Help provided:</strong> {request.description}</p>
                  <p><strong>📍 Location:</strong> {request.location}</p>
                  <p><strong>✅ Completed:</strong> {formatDate(request.volunteer.completedAt || request.dateCompleted)}</p>
                  <div className="impact-note">
                    <span className="impact-icon">💝</span>
                    <span>You made someone's day brighter!</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="volunteer-dashboard">
      <div className="dashboard-header">
        <div className="header-main">
          <h1>💝 Volunteer Dashboard</h1>
          <p>Welcome back, {user?.name}! Ready to spread some love today?</p>
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
          className={selectedTab === 'portfolio' ? 'nav-button active' : 'nav-button'}
          onClick={() => setSelectedTab('portfolio')}
        >
          📊 My Portfolio
        </button>
        <button 
          className={selectedTab === 'available' ? 'nav-button active' : 'nav-button'}
          onClick={() => setSelectedTab('available')}
        >
          💌 Available ({getAvailableRequests().length})
        </button>
        <button 
          className={selectedTab === 'assigned' ? 'nav-button active' : 'nav-button'}
          onClick={() => setSelectedTab('assigned')}
        >
          🤝 My Tasks ({getMyRequests().length})
        </button>
        <button 
          className={selectedTab === 'completed' ? 'nav-button active' : 'nav-button'}
          onClick={() => setSelectedTab('completed')}
        >
          🎉 Completed ({getCompletedRequests().length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">
        {selectedTab === 'portfolio' && renderPortfolioStats()}
        {selectedTab === 'available' && renderAvailableRequests()}
        {selectedTab === 'assigned' && renderMyRequests()}
        {selectedTab === 'completed' && renderCompletedRequests()}
      </div>

      {/* Delete Account Modal */}
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
                <p><strong>Are you sure you want to delete your volunteer account?</strong></p>
              </div>
              <div className="consequences-list">
                <h4>This action will:</h4>
                <ul>
                  <li>🚫 Permanently deactivate your volunteer account</li>
                  <li>📋 Remove you from all assigned requests</li>
                  <li>💔 Remove you from the HeartBridge volunteer community</li>
                  <li>🏆 Your volunteer history and badges will be archived</li>
                  <li>🔒 Make your volunteer profile no longer accessible</li>
                </ul>
              </div>
              <div className="final-warning">
                <p><em>This action cannot be undone. You would need to create a new account to volunteer with HeartBridge again.</em></p>
              </div>
              <div className="modal-actions">
                <button 
                  className="cancel-delete-button"
                  onClick={() => setShowDeleteAccountModal(false)}
                >
                  💝 Keep Volunteering
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

export default VolunteerDashboard;