import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = ({ user, requests, setRequests }) => {
  const [activeTab, setActiveTab] = useState('pending-requests');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    completedRequests: 0,
    totalUsers: 0,
    totalVolunteers: 0,
    totalElderly: 0,
    totalAdmins: 0
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState('approve'); // 'approve' or 'reject'
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [volunteerRecommendations, setVolunteerRecommendations] = useState([]);
  const [topVolunteers, setTopVolunteers] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  // Calculate stats from actual requests data
  useEffect(() => {
    calculateStats();
    loadVolunteerRecommendations();
  }, [requests]);

  const calculateStats = () => {
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(req => req.status === 'pending').length;
    const approvedRequests = requests.filter(req => req.status === 'approved' || req.status === 'open').length;
    const completedRequests = requests.filter(req => req.status === 'completed').length;
    
    // Load all users from localStorage
    const savedUsers = JSON.parse(localStorage.getItem('heartbridge_all_users') || '[]');
    
    // Separate active and deleted users
    const activeUsers = savedUsers.filter(u => u.status !== 'deleted');
    const deletedUsers = savedUsers.filter(u => u.status === 'deleted');
    
    const totalUsers = activeUsers.length;
    const totalVolunteers = activeUsers.filter(u => u.role === 'volunteer').length;
    const totalElderly = activeUsers.filter(u => u.role === 'elderly').length;
    const totalAdmins = activeUsers.filter(u => u.role === 'admin').length;

    // Update users state with all data for display
    setUsers(savedUsers);

    setStats({
      totalRequests,
      pendingRequests,
      approvedRequests,
      completedRequests,
      totalUsers,
      totalVolunteers,
      totalElderly,
      totalAdmins
    });
  };

  const loadVolunteerRecommendations = () => {
    // Calculate volunteer performance from actual completed requests
    const completedRequests = requests.filter(req => req.status === 'completed' && req.volunteer);
    
    const volunteerStats = {};
    
    completedRequests.forEach(req => {
      const volunteerName = req.volunteer.name;
      if (!volunteerStats[volunteerName]) {
        volunteerStats[volunteerName] = {
          name: volunteerName,
          userId: req.volunteer.userId,
          email: req.volunteer.email,
          completedTasks: 0,
          totalRating: 0,
          ratingCount: 0,
          averageRating: 0,
          helpTypes: new Set(),
          lastActivity: null
        };
      }
      
      volunteerStats[volunteerName].completedTasks++;
      volunteerStats[volunteerName].helpTypes.add(req.type);
      
      if (req.volunteer.rating) {
        volunteerStats[volunteerName].totalRating += req.volunteer.rating;
        volunteerStats[volunteerName].ratingCount++;
      }
      
      if (req.volunteer.completedAt) {
        const completedDate = new Date(req.volunteer.completedAt);
        if (!volunteerStats[volunteerName].lastActivity || completedDate > volunteerStats[volunteerName].lastActivity) {
          volunteerStats[volunteerName].lastActivity = completedDate;
        }
      }
    });
    
    // Calculate average ratings and convert to array
    const volunteers = Object.values(volunteerStats).map(vol => ({
      ...vol,
      averageRating: vol.ratingCount > 0 ? vol.totalRating / vol.ratingCount : 0,
      helpTypes: Array.from(vol.helpTypes),
      badge: vol.completedTasks >= 10 ? '🏆 Super Helper' : 
             vol.completedTasks >= 5 ? '⭐ Helper' : 
             vol.completedTasks >= 1 ? '🌟 New Helper' : ''
    }));
    
    // Sort by performance score (completed tasks + average rating)
    volunteers.sort((a, b) => {
      const scoreA = a.completedTasks * 2 + a.averageRating;
      const scoreB = b.completedTasks * 2 + b.averageRating;
      return scoreB - scoreA;
    });
    
    setTopVolunteers(volunteers.slice(0, 5));
    setVolunteerRecommendations(volunteers.slice(0, 10));
  };

  const handleApproveRequest = (request) => {
    setSelectedRequest(request);
    setApprovalAction('approve');
    setAdminNotes('');
    setShowApprovalModal(true);
  };

  const handleRejectRequest = (request) => {
    setSelectedRequest(request);
    setApprovalAction('reject');
    setRejectionReason('');
    setAdminNotes('');
    setShowApprovalModal(true);
  };

  const submitApprovalDecision = () => {
    let updatedRequests;
    
    if (approvalAction === 'approve') {
      // Update request status to approved
      updatedRequests = requests.map(req => 
        req.id === selectedRequest.id 
          ? { 
              ...req, 
              status: 'approved',
              adminApproval: {
                approvedBy: user.id,
                approvedAt: new Date(),
                adminNotes: adminNotes
              }
            }
          : req
      );
    } else {
      // Update request status to rejected
      updatedRequests = requests.map(req => 
        req.id === selectedRequest.id 
          ? { 
              ...req, 
              status: 'rejected',
              adminApproval: {
                rejectedBy: user.id,
                rejectedAt: new Date(),
                rejectionReason: rejectionReason,
                adminNotes: adminNotes
              }
            }
          : req
      );
    }
    
    // Update localStorage
    localStorage.setItem('heartbridge_requests', JSON.stringify(updatedRequests));
    setRequests(updatedRequests);
    
    setShowApprovalModal(false);
    setSelectedRequest(null);
    setAdminNotes('');
    setRejectionReason('');
    
    // Recalculate stats
    calculateStats();
  };

  const handleContactVolunteer = (volunteer) => {
    setSelectedVolunteer(volunteer);
    setShowContactModal(true);
  };

  const removeUser = (userId) => {
    const savedUsers = JSON.parse(localStorage.getItem('heartbridge_all_users') || '[]');
    const filteredUsers = savedUsers.filter(user => user.id !== userId);
    localStorage.setItem('heartbridge_all_users', JSON.stringify(filteredUsers));
    setUsers(filteredUsers);
    calculateStats(); // Recalculate stats after user removal
  };

  const restoreUser = (userId) => {
    const savedUsers = JSON.parse(localStorage.getItem('heartbridge_all_users') || '[]');
    const updatedUsers = savedUsers.map(user => 
      user.id === userId 
        ? { ...user, status: 'active', deletedAt: null, deletedReason: null }
        : user
    );
    localStorage.setItem('heartbridge_all_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    calculateStats(); // Recalculate stats after restoration
  };

  const permanentlyDeleteUser = (userId) => {
    const savedUsers = JSON.parse(localStorage.getItem('heartbridge_all_users') || '[]');
    const filteredUsers = savedUsers.filter(user => user.id !== userId);
    localStorage.setItem('heartbridge_all_users', JSON.stringify(filteredUsers));
    setUsers(filteredUsers);
    calculateStats(); // Recalculate stats after permanent deletion
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'rejected': return 'status-rejected';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getUrgencyBadgeClass = (urgency) => {
    switch (urgency) {
      case 'high': return 'urgency-high';
      case 'medium': return 'urgency-medium';
      case 'low': return 'urgency-low';
      default: return 'urgency-medium';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPendingRequests = () => {
    const pendingRequests = requests.filter(r => r.status === 'pending');
    
    return (
      <div className="requests-section">
        <h3>💌 Pending Requests ({pendingRequests.length})</h3>
        {pendingRequests.length === 0 ? (
          <div className="empty-state">
            <p>🎉 No pending requests to review!</p>
          </div>
        ) : (
          <div className="requests-grid">
            {pendingRequests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <h4>{request.name}, {request.age}</h4>
                  <div className="badges">
                    <span className={`urgency-badge ${getUrgencyBadgeClass(request.urgency)}`}>
                      {request.urgency.toUpperCase()}
                    </span>
                    <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="request-details">
                  <p><strong>Type:</strong> {request.type}</p>
                  <p><strong>Location:</strong> {request.location}</p>
                  <p><strong>Description:</strong> {request.description}</p>
                  <p><strong>Phone:</strong> {request.phone}</p>
                  <p><strong>Submitted:</strong> {formatDate(request.dateCreated)}</p>
                </div>
                
                <div className="request-actions">
                  <button 
                    className="approve-button"
                    onClick={() => handleApproveRequest(request)}
                  >
                    ✅ Approve
                  </button>
                  <button 
                    className="reject-button"
                    onClick={() => handleRejectRequest(request)}
                  >
                    ❌ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAllRequests = () => {
    return (
      <div className="requests-section">
        <h3>📋 All Requests ({requests.length})</h3>
        <div className="requests-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Urgency</th>
                <th>Volunteer</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request.id}>
                  <td>{request.name}, {request.age}</td>
                  <td>{request.type}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <span className={`urgency-badge ${getUrgencyBadgeClass(request.urgency)}`}>
                      {request.urgency}
                    </span>
                  </td>
                  <td>{request.volunteer?.name || 'Unassigned'}</td>
                  <td>{formatDate(request.dateCreated)}</td>
                  <td>
                    <button className="view-button">👁️ View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderUserManagement = () => {
    const activeUsers = users.filter(u => u.status !== 'deleted');
    const deletedUsers = users.filter(u => u.status === 'deleted');

    return (
      <div className="users-section">
        <h3>👥 Active User Management ({activeUsers.length})</h3>
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'elderly' ? '🤝 Elder' : 
                       user.role === 'volunteer' ? '💝 Volunteer' : 
                       '👑 Admin'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.status === 'active' ? 'status-approved' : 'status-pending'}`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td>{formatDate(user.joinDate)}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-button">👁️ View</button>
                      {user.role === 'volunteer' && (
                        <button 
                          className="contact-button"
                          onClick={() => {
                            setSelectedVolunteer(user);
                            setShowContactModal(true);
                          }}
                        >
                          📞 Contact
                        </button>
                      )}
                      <button 
                        className="remove-button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove ${user.name}?`)) {
                            removeUser(user.id);
                          }
                        }}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {deletedUsers.length > 0 && (
          <>
            <h3>🗑️ Deleted Users ({deletedUsers.length})</h3>
            <div className="users-table deleted-users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Deleted Date</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deletedUsers.map(user => (
                    <tr key={user.id} className="deleted-user-row">
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role} deleted`}>
                          {user.role === 'elderly' ? '🤝 Elder' : 
                           user.role === 'volunteer' ? '💝 Volunteer' : 
                           '👑 Admin'}
                        </span>
                      </td>
                      <td>{user.deletedAt ? formatDate(user.deletedAt) : 'Unknown'}</td>
                      <td>
                        <span className="deletion-reason">
                          {user.deletedReason || 'No reason specified'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="restore-button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to restore ${user.name}?`)) {
                                restoreUser(user.id);
                              }
                            }}
                          >
                            ↩️ Restore
                          </button>
                          <button 
                            className="permanent-delete-button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to permanently delete ${user.name}? This cannot be undone!`)) {
                                permanentlyDeleteUser(user.id);
                              }
                            }}
                          >
                            ❌ Permanent Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderVolunteerRecommendations = () => {
    return (
      <div className="volunteer-recommendations">
        <div className="recommendations-header">
          <h3>🌟 Top Volunteers & Recommendations</h3>
          <p>Real volunteer performance data from completed requests</p>
        </div>

        <div className="recommendations-stats">
          <div className="rec-stat-card">
            <div className="rec-stat-icon">⭐</div>
            <div className="rec-stat-content">
              <h4>{topVolunteers.filter(v => v.averageRating >= 4.5).length}</h4>
              <p>High-Rated Volunteers</p>
            </div>
          </div>
          <div className="rec-stat-card">
            <div className="rec-stat-icon">👥</div>
            <div className="rec-stat-content">
              <h4>{topVolunteers.length}</h4>
              <p>Active Volunteers</p>
            </div>
          </div>
          <div className="rec-stat-card">
            <div className="rec-stat-icon">📊</div>
            <div className="rec-stat-content">
              <h4>
                {topVolunteers.length > 0 ? 
                  (topVolunteers.reduce((sum, v) => sum + v.averageRating, 0) / topVolunteers.length).toFixed(1) : 
                  '0.0'
                }
              </h4>
              <p>Average Rating</p>
            </div>
          </div>
        </div>

        {topVolunteers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌟</div>
            <h4>No Volunteer Performance Data Yet</h4>
            <p>Top volunteers will appear here once elderly users complete requests and rate their volunteers.</p>
            <p>Encourage elderly users to:</p>
            <ul>
              <li>Submit requests for help</li>
              <li>Complete rating surveys after receiving help</li>
              <li>Provide detailed feedback about volunteer performance</li>
            </ul>
            <p>This will help build a community showcase of outstanding volunteers!</p>
          </div>
        ) : (
          <div className="volunteers-grid">
            {topVolunteers.map(volunteer => (
              <div key={volunteer.userId || volunteer.name} className={`volunteer-card ${volunteer.averageRating >= 4.5 ? 'recommended' : ''}`}>
                <div className="volunteer-header">
                  <div className="volunteer-info">
                    <h4>{volunteer.name}</h4>
                    <p className="volunteer-email">{volunteer.email}</p>
                    {volunteer.badge && (
                      <span className="recommended-badge">{volunteer.badge}</span>
                    )}
                  </div>
                  <div className="volunteer-rating">
                    {volunteer.averageRating > 0 && (
                      <>
                        <span className="rating-value">{volunteer.averageRating.toFixed(1)}</span>
                        <span className="rating-stars">
                          {'⭐'.repeat(Math.floor(volunteer.averageRating))}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="volunteer-stats">
                  <div className="stat-item">
                    <span className="stat-icon">✅</span>
                    <span className="stat-text">{volunteer.completedTasks} tasks</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⏰</span>
                    <span className="stat-text">
                      {volunteer.lastActivity ? 
                        `${Math.ceil((new Date() - volunteer.lastActivity) / (1000 * 60 * 60 * 24))}d ago` : 
                        'No recent activity'
                      }
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🎯</span>
                    <span className="stat-text">{volunteer.ratingCount} ratings</span>
                  </div>
                </div>

                {volunteer.helpTypes.length > 0 && (
                  <div className="volunteer-specialties">
                    <h5>Specialties:</h5>
                    <div className="specialty-tags">
                      {volunteer.helpTypes.map((specialty, index) => (
                        <span key={index} className="specialty-tag">
                          {specialty === 'shopping' && '🛒'}
                          {specialty === 'medicine' && '💊'}
                          {specialty === 'daily-tasks' && '🏠'}
                          {specialty === 'transportation' && '🚗'}
                          {specialty === 'companionship' && '🤝'}
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="volunteer-actions">
                  <button 
                    className="contact-button"
                    onClick={() => handleContactVolunteer(volunteer)}
                  >
                    📞 Contact Volunteer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="recommendation-guidelines">
          <h4>💡 Performance Criteria</h4>
          <div className="guidelines-list">
            <div className="guideline-item">
              <span className="guideline-icon">⭐</span>
              <div className="guideline-text">
                <h5>High Rating</h5>
                <p>Consistently rated 4.5+ stars by elderly users</p>
              </div>
            </div>
            <div className="guideline-item">
              <span className="guideline-icon">✅</span>
              <div className="guideline-text">
                <h5>Completion Rate</h5>
                <p>Successfully completed multiple community requests</p>
              </div>
            </div>
            <div className="guideline-item">
              <span className="guideline-icon">💝</span>
              <div className="guideline-text">
                <h5>Community Impact</h5>
                <p>Demonstrates reliability and compassion through actual service</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderApprovedRequests = () => {
    const approvedRequests = requests.filter(req => req.status === 'approved' || req.status === 'open');
    
    return (
      <div className="requests-section">
        <h3>✅ Approved Requests ({approvedRequests.length})</h3>
        <div className="requests-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Urgency</th>
                <th>Location</th>
                <th>Date</th>
                <th>Volunteer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvedRequests.map(request => (
                <tr key={request.id}>
                  <td>{request.name}</td>
                  <td>{request.requestType}</td>
                  <td>
                    <span className={`urgency-badge ${request.urgency}`}>
                      {request.urgency}
                    </span>
                  </td>
                  <td>{request.location}</td>
                  <td>{new Date(request.date).toLocaleDateString()}</td>
                  <td>{request.assignedVolunteer || 'Unassigned'}</td>
                  <td>
                    <button className="view-btn" onClick={() => {
                      setSelectedRequest(request);
                      setShowDetailsModal(true);
                    }}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCompletedRequests = () => {
    const completedRequests = requests.filter(req => req.status === 'completed');
    
    return (
      <div className="requests-section">
        <h3>🎉 Completed Requests ({completedRequests.length})</h3>
        <div className="requests-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Volunteer</th>
                <th>Completed Date</th>
                <th>Rating</th>
                <th>Feedback</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {completedRequests.map(request => (
                <tr key={request.id}>
                  <td>{request.name}</td>
                  <td>{request.requestType}</td>
                  <td>{request.assignedVolunteer || 'N/A'}</td>
                  <td>{request.completedDate ? new Date(request.completedDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    {request.volunteerRating ? (
                      <span className="rating">{'⭐'.repeat(request.volunteerRating)} ({request.volunteerRating}/5)</span>
                    ) : 'No rating'}
                  </td>
                  <td className="feedback-cell">
                    {request.feedback || 'No feedback provided'}
                  </td>
                  <td>
                    <button className="view-btn" onClick={() => {
                      setSelectedRequest(request);
                      setShowDetailsModal(true);
                    }}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderVolunteers = () => {
    const savedUsers = JSON.parse(localStorage.getItem('heartbridge_all_users') || '[]');
    const volunteers = savedUsers.filter(u => u.role === 'volunteer' && u.status !== 'deleted');
    
    return (
      <div className="volunteers-section">
        <h3>💝 Volunteers ({volunteers.length})</h3>
        <div className="volunteers-grid">
          {volunteers.map(volunteer => {
            const volunteerRequests = requests.filter(req => req.assignedVolunteer === volunteer.name);
            const completedRequests = volunteerRequests.filter(req => req.status === 'completed');
            const averageRating = completedRequests.reduce((sum, req) => sum + (req.volunteerRating || 0), 0) / (completedRequests.length || 1);
            
            return (
              <div key={volunteer.id} className="volunteer-card">
                <div className="volunteer-header">
                  <h4>{volunteer.name}</h4>
                  <span className="volunteer-email">{volunteer.email}</span>
                </div>
                <div className="volunteer-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Requests:</span>
                    <span className="stat-value">{volunteerRequests.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Completed:</span>
                    <span className="stat-value">{completedRequests.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Average Rating:</span>
                    <span className="stat-value">
                      {completedRequests.length > 0 ? `⭐ ${averageRating.toFixed(1)}/5` : 'No ratings yet'}
                    </span>
                  </div>
                </div>
                <div className="volunteer-skills">
                  <h5>Skills:</h5>
                  <div className="skills-list">
                    {volunteer.skills ? volunteer.skills.split(',').map((skill, index) => (
                      <span key={index} className="skill-tag">{skill.trim()}</span>
                    )) : <span className="no-skills">No skills listed</span>}
                  </div>
                </div>
                <div className="volunteer-actions">
                  <button 
                    className="contact-btn"
                    onClick={() => {
                      setSelectedVolunteer(volunteer);
                      setShowContactModal(true);
                    }}
                  >
                    📧 Contact
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🔧 Admin Dashboard</h1>
        <p>💕 Hi {user.name}, manage the HeartBridge community with care</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card" onClick={() => setActiveTab('all-requests')} style={{cursor: 'pointer'}}>
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.totalRequests}</h3>
            <p>Total Requests</p>
          </div>
        </div>
        <div className="stat-card pending" onClick={() => setActiveTab('pending-requests')} style={{cursor: 'pointer'}}>
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending Review</p>
          </div>
        </div>
        <div className="stat-card approved" onClick={() => setActiveTab('approved-requests')} style={{cursor: 'pointer'}}>
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.approvedRequests}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="stat-card completed" onClick={() => setActiveTab('completed-requests')} style={{cursor: 'pointer'}}>
          <div className="stat-icon">🎉</div>
          <div className="stat-content">
            <h3>{stats.completedRequests}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card users" onClick={() => setActiveTab('user-management')} style={{cursor: 'pointer'}}>
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card volunteers" onClick={() => setActiveTab('volunteers')} style={{cursor: 'pointer'}}>
          <div className="stat-icon">💝</div>
          <div className="stat-content">
            <h3>{stats.totalVolunteers}</h3>
            <p>Volunteers</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'pending-requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending-requests')}
        >
          ⏳ Pending Requests ({stats.pendingRequests})
        </button>
        <button 
          className={`tab-button ${activeTab === 'all-requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('all-requests')}
        >
          📋 All Requests
        </button>
        <button 
          className={`tab-button ${activeTab === 'user-management' ? 'active' : ''}`}
          onClick={() => setActiveTab('user-management')}
        >
          👥 User Management
        </button>
        <button 
          className={`tab-button ${activeTab === 'approved-requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved-requests')}
        >
          ✅ Approved Requests ({stats.approvedRequests})
        </button>
        <button 
          className={`tab-button ${activeTab === 'completed-requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed-requests')}
        >
          🎉 Completed Requests ({stats.completedRequests})
        </button>
        <button 
          className={`tab-button ${activeTab === 'volunteers' ? 'active' : ''}`}
          onClick={() => setActiveTab('volunteers')}
        >
          💝 Volunteers ({stats.totalVolunteers})
        </button>
        <button 
          className={`tab-button ${activeTab === 'volunteer-recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('volunteer-recommendations')}
        >
          🌟 Volunteer Recommendations
        </button>
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {activeTab === 'pending-requests' && renderPendingRequests()}
        {activeTab === 'all-requests' && renderAllRequests()}
        {activeTab === 'user-management' && renderUserManagement()}
        {activeTab === 'approved-requests' && renderApprovedRequests()}
        {activeTab === 'completed-requests' && renderCompletedRequests()}
        {activeTab === 'volunteers' && renderVolunteers()}
        {activeTab === 'volunteer-recommendations' && renderVolunteerRecommendations()}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="modal-overlay">
          <div className="approval-modal">
            <div className="modal-header">
              <h3>
                {approvalAction === 'approve' ? '✅ Approve Request' : '❌ Reject Request'}
              </h3>
              <button 
                className="close-button"
                onClick={() => setShowApprovalModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="request-summary">
                <h4>{selectedRequest?.name}, {selectedRequest?.age}</h4>
                <p><strong>Type:</strong> {selectedRequest?.type}</p>
                <p><strong>Description:</strong> {selectedRequest?.description}</p>
                <p><strong>Urgency:</strong> {selectedRequest?.urgency}</p>
              </div>
              
              {approvalAction === 'reject' && (
                <div className="form-group">
                  <label htmlFor="rejectionReason">Rejection Reason *</label>
                  <select
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  >
                    <option value="">Select reason</option>
                    <option value="inappropriate-content">Inappropriate content</option>
                    <option value="insufficient-information">Insufficient information</option>
                    <option value="duplicate-request">Duplicate request</option>
                    <option value="spam">Spam</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="adminNotes">Admin Notes (Optional)</label>
                <textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this decision..."
                  rows="3"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowApprovalModal(false)}
              >
                Cancel
              </button>
              <button 
                className={approvalAction === 'approve' ? 'approve-button' : 'reject-button'}
                onClick={submitApprovalDecision}
                disabled={approvalAction === 'reject' && !rejectionReason}
              >
                {approvalAction === 'approve' ? '✅ Approve Request' : '❌ Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Volunteer Modal */}
      {showContactModal && selectedVolunteer && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>📞 Contact Volunteer</h3>
              <button 
                className="close-button"
                onClick={() => setShowContactModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="volunteer-contact-info">
                <div className="contact-section">
                  <h4>Volunteer Information</h4>
                  <div className="contact-details">
                    <div className="contact-item">
                      <span className="contact-label">👤 Name:</span>
                      <span className="contact-value">{selectedVolunteer.name}</span>
                    </div>
                    <div className="contact-item">
                      <span className="contact-label">📧 Email:</span>
                      <span className="contact-value">
                        <a href={`mailto:${selectedVolunteer.email}`}>
                          {selectedVolunteer.email}
                        </a>
                      </span>
                    </div>
                    {selectedVolunteer.phone && (
                      <div className="contact-item">
                        <span className="contact-label">📱 Phone:</span>
                        <span className="contact-value">
                          <a href={`tel:${selectedVolunteer.phone}`}>
                            {selectedVolunteer.phone}
                          </a>
                        </span>
                      </div>
                    )}
                    {selectedVolunteer.location && (
                      <div className="contact-item">
                        <span className="contact-label">📍 Location:</span>
                        <span className="contact-value">{selectedVolunteer.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="contact-section">
                  <h4>Performance Summary</h4>
                  <div className="performance-summary">
                    <div className="performance-item">
                      <span className="performance-label">⭐ Average Rating:</span>
                      <span className="performance-value">
                        {selectedVolunteer.averageRating > 0 ? 
                          selectedVolunteer.averageRating.toFixed(1) : 
                          'No ratings yet'
                        }
                      </span>
                    </div>
                    <div className="performance-item">
                      <span className="performance-label">✅ Completed Tasks:</span>
                      <span className="performance-value">{selectedVolunteer.completedTasks}</span>
                    </div>
                    <div className="performance-item">
                      <span className="performance-label">🎯 Total Ratings:</span>
                      <span className="performance-value">{selectedVolunteer.ratingCount}</span>
                    </div>
                  </div>
                </div>

                {selectedVolunteer.helpTypes.length > 0 && (
                  <div className="contact-section">
                    <h4>Specialties</h4>
                    <div className="specialties-list">
                      {selectedVolunteer.helpTypes.map((specialty, index) => (
                        <span key={index} className="specialty-tag">
                          {specialty === 'shopping' && '🛒'}
                          {specialty === 'medicine' && '💊'}
                          {specialty === 'daily-tasks' && '🏠'}
                          {specialty === 'transportation' && '🚗'}
                          {specialty === 'companionship' && '🤝'}
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowContactModal(false)}
              >
                Close
              </button>
              <a 
                href={`mailto:${selectedVolunteer.email}?subject=HeartBridge - Administrative Contact&body=Hello ${selectedVolunteer.name},%0D%0A%0D%0AThis is an administrative message from HeartBridge.%0D%0A%0D%0ABest regards,%0D%0A${user?.name || 'Admin'}`}
                className="email-button"
              >
                📧 Send Email
              </a>
              {selectedVolunteer.phone && (
                <a 
                  href={`tel:${selectedVolunteer.phone}`}
                  className="call-button"
                >
                  📞 Call Now
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="modal-overlay">
          <div className="details-modal">
            <div className="modal-header">
              <h3>📋 Request Details</h3>
              <button 
                className="close-button"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="request-details-grid">
                <div className="detail-section">
                  <h4>👤 Requester Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedRequest.requester?.name || selectedRequest.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Age:</span>
                    <span className="detail-value">{selectedRequest.age}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{selectedRequest.requester?.phone || selectedRequest.phone || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedRequest.requester?.email || selectedRequest.email || 'Not provided'}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>📋 Request Information</h4>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedRequest.requestType || selectedRequest.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Description:</span>
                    <span className="detail-value">{selectedRequest.description}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Urgency:</span>
                    <span className={`detail-value urgency-${selectedRequest.urgency}`}>
                      {selectedRequest.urgency}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{selectedRequest.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value status-${selectedRequest.status}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date Created:</span>
                    <span className="detail-value">
                      {selectedRequest.dateCreated ? new Date(selectedRequest.dateCreated).toLocaleDateString() : 
                       (selectedRequest.date ? new Date(selectedRequest.date).toLocaleDateString() : 'N/A')}
                    </span>
                  </div>
                </div>

                {selectedRequest.assignedVolunteer && (
                  <div className="detail-section">
                    <h4>🤝 Volunteer Information</h4>
                    <div className="detail-item">
                      <span className="detail-label">Volunteer:</span>
                      <span className="detail-value">{selectedRequest.assignedVolunteer}</span>
                    </div>
                    {selectedRequest.volunteer?.assignedAt && (
                      <div className="detail-item">
                        <span className="detail-label">Assigned Date:</span>
                        <span className="detail-value">
                          {new Date(selectedRequest.volunteer.assignedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedRequest.completedDate && (
                      <div className="detail-item">
                        <span className="detail-label">Completed Date:</span>
                        <span className="detail-value">
                          {new Date(selectedRequest.completedDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {(selectedRequest.volunteerRating || selectedRequest.feedback) && (
                  <div className="detail-section">
                    <h4>⭐ Rating & Feedback</h4>
                    {selectedRequest.volunteerRating && (
                      <div className="detail-item">
                        <span className="detail-label">Rating:</span>
                        <span className="detail-value rating">
                          {'⭐'.repeat(selectedRequest.volunteerRating)} ({selectedRequest.volunteerRating}/5)
                        </span>
                      </div>
                    )}
                    {selectedRequest.feedback && (
                      <div className="detail-item">
                        <span className="detail-label">Feedback:</span>
                        <span className="detail-value">{selectedRequest.feedback}</span>
                      </div>
                    )}
                  </div>
                )}

                {selectedRequest.adminApproval && (
                  <div className="detail-section">
                    <h4>🔧 Admin Information</h4>
                    <div className="detail-item">
                      <span className="detail-label">Reviewed By:</span>
                      <span className="detail-value">{selectedRequest.adminApproval.reviewedBy}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Review Date:</span>
                      <span className="detail-value">
                        {new Date(selectedRequest.adminApproval.reviewedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedRequest.adminApproval.notes && (
                      <div className="detail-item">
                        <span className="detail-label">Admin Notes:</span>
                        <span className="detail-value">{selectedRequest.adminApproval.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;