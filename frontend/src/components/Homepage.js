import React from 'react';
import './Homepage.css';

// Import community images
import hommieImage1 from '../assets/Hommie.jpg';
import hommieImage2 from '../assets/Hommie2.jpg';

const Homepage = ({ requests }) => {
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'assigned': return 'status-assigned';
      case 'completed': return 'status-completed';
      default: return 'status-open';
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

  const openRequests = requests.filter(req => req.status === 'open');
  const assignedRequests = requests.filter(req => req.status === 'assigned');
  const completedRequests = requests.filter(req => req.status === 'completed');

  return (
    <div className="homepage">
      <header className="homepage-header">
        <h2>💕 Community Assistance Requests</h2>
        <p>Connecting elderly community members with caring volunteers through love and compassion</p>
      </header>

      {/* Community Hero Section */}
      <section className="community-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h3>💖 Building Connections That Matter</h3>
            <p>Our community is built on friendship, care, and mutual support. Every request connects hearts and creates lasting bonds.</p>
          </div>
          <div className="hero-images">
            <div className="hero-image">
              <img src={hommieImage1} alt="Community friends supporting each other" />
              <span className="image-caption">Friends caring for friends</span>
            </div>
            <div className="hero-image">
              <img src={hommieImage2} alt="Volunteers helping community members" />
              <span className="image-caption">Volunteers making a difference</span>
            </div>
          </div>
        </div>
      </section>

      <div className="requests-summary">
        <div className="summary-card">
          <h3>{openRequests.length}</h3>
          <p>💝 Open Requests</p>
        </div>
        <div className="summary-card">
          <h3>{assignedRequests.length}</h3>
          <p>🤝 In Progress</p>
        </div>
        <div className="summary-card">
          <h3>{completedRequests.length}</h3>
          <p>💖 Completed</p>
        </div>
      </div>

      <section className="requests-section">
        <h3>💌 Current Requests Needing Your Love & Care</h3>
        {openRequests.length === 0 ? (
          <div className="no-requests">
            <p>💕 No open requests at this time. Thank you to all our wonderful volunteers! Your kindness makes a difference.</p>
          </div>
        ) : (
          <div className="requests-grid">
            {openRequests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="request-type">
                    <span className="type-icon">{getTypeIcon(request.type)}</span>
                    <span className="type-text">{request.type.charAt(0).toUpperCase() + request.type.slice(1)}</span>
                  </div>
                  <span className={`urgency-badge ${getUrgencyClass(request.urgency)}`}>
                    {request.urgency} priority
                  </span>
                </div>
                
                <div className="request-content">
                  <div className="request-profile">
                    {request.profileImage ? (
                      <div className="profile-image">
                        <img 
                          src={typeof request.profileImage === 'string' 
                            ? request.profileImage 
                            : URL.createObjectURL(request.profileImage)} 
                          alt={`${request.name}'s profile`} 
                        />
                      </div>
                    ) : (
                      <div className="profile-placeholder">
                        <span className="placeholder-icon">👤</span>
                      </div>
                    )}
                    <div className="profile-info">
                      <h4>{request.name}, {request.age} years old</h4>
                      <p className="request-description">{request.description}</p>
                    </div>
                  </div>
                  
                  <div className="request-details">
                    <div className="detail-item">
                      <strong>Location:</strong> {request.location}
                    </div>
                    <div className="detail-item">
                      <strong>Contact:</strong> {request.phone}
                    </div>
                    <div className="detail-item">
                      <strong>Posted:</strong> {formatDate(request.dateCreated)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {assignedRequests.length > 0 && (
        <section className="requests-section">
          <h3>Requests In Progress</h3>
          <div className="requests-grid">
            {assignedRequests.map(request => (
              <div key={request.id} className="request-card assigned">
                <div className="request-header">
                  <div className="request-type">
                    <span className="type-icon">{getTypeIcon(request.type)}</span>
                    <span className="type-text">{request.type.charAt(0).toUpperCase() + request.type.slice(1)}</span>
                  </div>
                  <span className={`status-badge ${getStatusClass(request.status)}`}>
                    Assigned to {request.volunteer}
                  </span>
                </div>
                
                <div className="request-content">
                  <h4>{request.name}, {request.age} years old</h4>
                  <p className="request-description">{request.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Homepage;