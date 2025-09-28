import React, { useState, useEffect } from 'react';
import '../components/AdminDashboard.css';
import '../components/AuthLanding.css';

const SecretAdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [adminData, setAdminData] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    totalVolunteers: 0,
    totalElderly: 0,
    averageRating: 0
  });

  // Check for existing admin session
  useEffect(() => {
    const adminSession = localStorage.getItem('secret_admin_session');
    if (adminSession) {
      setIsAuthenticated(true);
      loadDashboardData();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Secret admin credentials
    const ADMIN_USERNAME = 'heartbridge_admin';
    const ADMIN_PASSWORD = 'HB_Secret_2025!';
    
    if (loginData.username === ADMIN_USERNAME && loginData.password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('secret_admin_session', 'authenticated');
      loadDashboardData();
      setLoginError('');
      setShowLogin(false);
    } else {
      setLoginError('Invalid credentials. Access denied.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('secret_admin_session');
    setLoginData({ username: '', password: '' });
    setAdminData(null);
    setUsers([]);
    setRequests([]);
    setShowLogin(false);
  };

  const loadDashboardData = async () => {
    try {
      // Fetch system stats from backend
      const response = await fetch('https://heartbridge-74v8.onrender.com/admin/dashboard/secret-hb-2025');
      if (response.ok) {
        const data = await response.json();
        setAdminData(data);
      }

      // Load local data for management
      const localUsers = JSON.parse(localStorage.getItem('heartbridge_all_users') || '[]');
      const localRequests = JSON.parse(localStorage.getItem('heartbridge_requests') || '[]');
      
      setUsers(localUsers);
      setRequests(localRequests);
      
      // Calculate comprehensive stats
      const activeUsers = localUsers.filter(u => u.status !== 'deleted');
      const pendingRequests = localRequests.filter(r => r.status === 'pending').length;
      const completedRequests = localRequests.filter(r => r.status === 'completed').length;
      const volunteers = activeUsers.filter(u => u.role === 'volunteer').length;
      const elderly = activeUsers.filter(u => u.role === 'elderly').length;
      
      // Calculate average rating from completed requests
      const ratedRequests = localRequests.filter(r => r.volunteerRating && r.volunteerRating > 0);
      const averageRating = ratedRequests.length > 0 
        ? (ratedRequests.reduce((sum, r) => sum + r.volunteerRating, 0) / ratedRequests.length).toFixed(1)
        : 0;
      
      setStats({
        totalUsers: activeUsers.length,
        totalRequests: localRequests.length,
        pendingRequests,
        completedRequests,
        totalVolunteers: volunteers,
        totalElderly: elderly,
        averageRating
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const removeUser = (userId) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, status: 'deleted', deletedAt: new Date(), deletedReason: 'Admin removal' }
        : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('heartbridge_all_users', JSON.stringify(updatedUsers));
    loadDashboardData();
  };

  const deleteRequest = (requestId) => {
    const updatedRequests = requests.filter(req => req.id !== requestId);
    setRequests(updatedRequests);
    localStorage.setItem('heartbridge_requests', JSON.stringify(updatedRequests));
    loadDashboardData();
  };

  const approveRequest = (requestId) => {
    const updatedRequests = requests.map(req =>
      req.id === requestId 
        ? { ...req, status: 'approved', adminApproval: { approvedBy: 'Secret Admin', approvedAt: new Date() } }
        : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('heartbridge_requests', JSON.stringify(updatedRequests));
    loadDashboardData();
  };

  // Beautiful admin landing page
  if (!isAuthenticated && !showLogin) {
    return (
      <div className="auth-landing-container">
        <div className="landing-header">
          <h1>👑 Welcome to HeartBridge Admin</h1>
          <p>Manage and oversee our caring community with love</p>
        </div>

        <div className="landing-content">
          <div className="hero-section">
            <h2>🛠️ How would you like to manage the community today?</h2>
            <p>Access your administrative dashboard to oversee operations</p>
          </div>

          <div className="role-cards" style={{ justifyContent: 'center' }}>
            <div className="role-card admin-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="card-content">
                <h3>🔧 I Want to Manage the Community</h3>
                <p>Oversee and moderate the HeartBridge community, manage requests, users, and ensure a safe environment for all members.</p>
                <ul className="card-features">
                  <li>👥 Manage user accounts and registrations</li>
                  <li>📋 Review and approve community requests</li>
                  <li>⭐ Monitor volunteer ratings and feedback</li>
                  <li>📊 View comprehensive analytics and stats</li>
                  <li>🛡️ Ensure community safety and compliance</li>
                </ul>
                <div className="card-actions">
                  <button 
                    className="action-button primary admin-button"
                    onClick={() => setShowLogin(true)}
                  >
                    🔑 Access Admin Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="community-stats">
            <h3>📊 Community Overview</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{stats.totalUsers}</span>
                <span className="stat-label">👥 Active Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalRequests}</span>
                <span className="stat-label">📋 Total Requests</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.completedRequests}</span>
                <span className="stat-label">✅ Completed Tasks</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.averageRating || '4.9'}★</span>
                <span className="stat-label">⭐ Average Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login modal
  if (showLogin && !isAuthenticated) {
    return (
      <div className="auth-form-container">
        <div className="auth-form-content">
          <div className="form-header">
            <button 
              className="back-button"
              onClick={() => setShowLogin(false)}
            >
              ← Back to admin portal
            </button>
            <h2>🔐 Admin Authentication</h2>
            <p>Enter your administrative credentials to access the dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            {loginError && (
              <div className="error-message global-error">
                ❌ {loginError}
              </div>
            )}

            <div className="form-section">
              <h4>🔑 Administrative Access</h4>
              
              <div className="form-group">
                <label htmlFor="username">Admin Username *</label>
                <input
                  type="text"
                  id="username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  placeholder="Enter admin username"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Admin Password *</label>
                <input
                  type="password"
                  id="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  placeholder="Enter admin password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-button">
              🔑 Access Admin Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Full functional admin dashboard
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>👑 HeartBridge Admin Dashboard</h1>
        <div className="admin-controls">
          <button onClick={loadDashboardData} className="refresh-btn">🔄 Refresh</button>
          <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
        </div>
      </div>

      {/* Comprehensive Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card" onClick={() => setActiveTab('users')}>
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('volunteers')}>
          <div className="stat-icon">💝</div>
          <div className="stat-content">
            <h3>{stats.totalVolunteers}</h3>
            <p>Volunteers</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('requests')}>
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.totalRequests}</h3>
            <p>All Requests</p>
          </div>
        </div>
        <div className="stat-card pending" onClick={() => setActiveTab('pending')}>
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card completed" onClick={() => setActiveTab('ratings')}>
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{stats.averageRating}★</h3>
            <p>Avg Rating</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 System Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 All Users ({stats.totalUsers})
        </button>
        <button 
          className={`tab-button ${activeTab === 'volunteers' ? 'active' : ''}`}
          onClick={() => setActiveTab('volunteers')}
        >
          💝 Volunteers ({stats.totalVolunteers})
        </button>
        <button 
          className={`tab-button ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          📋 All Requests ({stats.totalRequests})
        </button>
        <button 
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ Pending ({stats.pendingRequests})
        </button>
        <button 
          className={`tab-button ${activeTab === 'ratings' ? 'active' : ''}`}
          onClick={() => setActiveTab('ratings')}
        >
          ⭐ Ratings & Reviews
        </button>
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {activeTab === 'dashboard' && (
          <div className="system-overview">
            <h3>💻 System Information & Analytics</h3>
            <div className="info-grid">
              {adminData && (
                <>
                  <div className="info-item">
                    <strong>Server Uptime:</strong> {Math.floor(adminData.systemStats.serverUptime / 3600)}h
                  </div>
                  <div className="info-item">
                    <strong>Environment:</strong> {adminData.systemStats.environment}
                  </div>
                  <div className="info-item">
                    <strong>Node Version:</strong> {adminData.systemStats.nodeVersion}
                  </div>
                  <div className="info-item">
                    <strong>Memory Used:</strong> {Math.round(adminData.systemStats.memoryUsage.used / 1024 / 1024)}MB
                  </div>
                </>
              )}
              <div className="info-item">
                <strong>Community Health:</strong> <span style={{color: 'green'}}>Excellent</span>
              </div>
              <div className="info-item">
                <strong>User Growth:</strong> +{stats.totalUsers} this period
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h3>👥 Complete User Management</h3>
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
                  {users.filter(u => u.status !== 'deleted').map(user => (
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
                        <span className="status-badge status-approved">
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td>{new Date(user.joinDate).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="remove-button"
                          onClick={() => {
                            if (window.confirm(`Remove ${user.name} from the platform?`)) {
                              removeUser(user.id);
                            }
                          }}
                        >
                          🗑️ Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'volunteers' && (
          <div className="volunteers-section">
            <h3>💝 Volunteer Management & Performance</h3>
            <div className="volunteers-grid">
              {users.filter(u => u.role === 'volunteer' && u.status !== 'deleted').map(volunteer => {
                const volunteerRequests = requests.filter(r => r.assignedVolunteer === volunteer.name);
                const completedRequests = volunteerRequests.filter(r => r.status === 'completed');
                const avgRating = completedRequests.length > 0 
                  ? (completedRequests.reduce((sum, r) => sum + (r.volunteerRating || 0), 0) / completedRequests.length).toFixed(1)
                  : 'N/A';
                
                return (
                  <div key={volunteer.id} className="volunteer-card">
                    <div className="volunteer-header">
                      <h4>{volunteer.name}</h4>
                      <span className="volunteer-email">{volunteer.email}</span>
                    </div>
                    <div className="volunteer-stats">
                      <div className="stat-item">
                        <span className="stat-label">📋 Total Requests:</span>
                        <span className="stat-value">{volunteerRequests.length}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">✅ Completed:</span>
                        <span className="stat-value">{completedRequests.length}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">⭐ Rating:</span>
                        <span className="stat-value">{avgRating !== 'N/A' ? `${avgRating}/5` : 'No ratings'}</span>
                      </div>
                    </div>
                    <div className="volunteer-actions">
                      <button className="view-button">👁️ View Details</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'ratings' && (
          <div className="ratings-section">
            <h3>⭐ Community Ratings & Reviews</h3>
            <div className="ratings-overview">
              <div className="rating-stat">
                <h4>Average Community Rating: {stats.averageRating}★</h4>
              </div>
            </div>
            <div className="ratings-list">
              {requests.filter(r => r.volunteerRating && r.feedback).map(request => (
                <div key={request.id} className="rating-card">
                  <div className="rating-header">
                    <h5>{request.name} rated {request.assignedVolunteer}</h5>
                    <span className="rating-stars">
                      {'⭐'.repeat(request.volunteerRating)} ({request.volunteerRating}/5)
                    </span>
                  </div>
                  <p className="rating-feedback">{request.feedback}</p>
                  <small className="rating-date">
                    {request.ratedAt ? new Date(request.ratedAt).toLocaleDateString() : 'Date unknown'}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="requests-section">
            <h3>📋 All Requests</h3>
            <div className="requests-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(request => (
                    <tr key={request.id}>
                      <td>{request.name}</td>
                      <td>{request.type}</td>
                      <td>
                        <span className={`status-badge status-${request.status}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>{new Date(request.dateCreated).toLocaleDateString()}</td>
                      <td>
                        {request.status === 'pending' && (
                          <button 
                            className="approve-button"
                            onClick={() => approveRequest(request.id)}
                          >
                            ✅ Approve
                          </button>
                        )}
                        <button 
                          className="remove-button"
                          onClick={() => {
                            if (window.confirm('Delete this request?')) {
                              deleteRequest(request.id);
                            }
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="requests-section">
            <h3>⏳ Pending Requests</h3>
            <div className="requests-grid">
              {requests.filter(r => r.status === 'pending').map(request => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <h4>{request.name}</h4>
                    <span className="urgency-badge urgency-high">PENDING APPROVAL</span>
                  </div>
                  <div className="request-details">
                    <p><strong>Type:</strong> {request.type}</p>
                    <p><strong>Description:</strong> {request.description}</p>
                    <p><strong>Location:</strong> {request.location}</p>
                  </div>
                  <div className="request-actions">
                    <button 
                      className="approve-button"
                      onClick={() => approveRequest(request.id)}
                    >
                      ✅ Approve Request
                    </button>
                    <button 
                      className="reject-button"
                      onClick={() => deleteRequest(request.id)}
                    >
                      ❌ Reject & Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretAdminDashboard;
