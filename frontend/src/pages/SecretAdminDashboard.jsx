import React, { useState, useEffect } from 'react';
import '../components/AdminDashboard.css';

const SecretAdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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
    completedRequests: 0
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
      
      // Calculate stats
      const activeUsers = localUsers.filter(u => u.status !== 'deleted');
      const pendingRequests = localRequests.filter(r => r.status === 'pending').length;
      const completedRequests = localRequests.filter(r => r.status === 'completed').length;
      
      setStats({
        totalUsers: activeUsers.length,
        totalRequests: localRequests.length,
        pendingRequests,
        completedRequests
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

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="admin-dashboard">
        <div className="login-container">
          <div className="login-form">
            <div className="login-header">
              <h1>🔐 Secret Admin Portal</h1>
              <p>HeartBridge Administrative Access</p>
            </div>
            
            <form onSubmit={handleLogin}>
              {loginError && (
                <div className="error-message">
                  ❌ {loginError}
                </div>
              )}
              
              <div className="form-group">
                <label>Admin Username:</label>
                <input
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                  placeholder="Enter admin username"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Admin Password:</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              
              <button type="submit" className="login-button">
                🔑 Access Admin Dashboard
              </button>
            </form>
            
            <div className="login-footer">
              <p>⚠️ Authorized personnel only</p>
              <p>💖 HeartBridge Security Portal</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full admin dashboard
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>🔧 Secret Admin Dashboard</h1>
        <div className="admin-controls">
          <button onClick={loadDashboardData} className="refresh-btn">🔄 Refresh</button>
          <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card" onClick={() => setActiveTab('users')}>
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('requests')}>
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.totalRequests}</h3>
            <p>Total Requests</p>
          </div>
        </div>
        <div className="stat-card pending" onClick={() => setActiveTab('pending')}>
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
        <div className="stat-card completed" onClick={() => setActiveTab('completed')}>
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedRequests}</h3>
            <p>Completed</p>
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
          👥 User Management ({stats.totalUsers})
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
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {activeTab === 'dashboard' && (
          <div className="system-overview">
            <h3>💻 System Information</h3>
            {adminData && (
              <div className="info-grid">
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
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h3>👥 User Management</h3>
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
                            if (window.confirm(`Remove ${user.name}?`)) {
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
