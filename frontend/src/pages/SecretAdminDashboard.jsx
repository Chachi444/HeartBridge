import React, { useState, useEffect } from 'react';
import '../components/AdminDashboard.css';

const SecretAdminDashboard = () => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const response = await fetch('https://heartbridge-74v8.onrender.com/admin/dashboard/secret-hb-2025');
      if (!response.ok) {
        throw new Error('Failed to fetch admin data');
      }
      const data = await response.json();
      setAdminData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">👑 Loading Secret Admin Dashboard...</div>;
  if (error) return <div className="admin-error">❌ Error: {error}</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>👑 HeartBridge Secret Admin Dashboard</h1>
        <p className="admin-subtitle">🔐 Top Secret Access - {adminData?.security?.accessLevel}</p>
        <p className="admin-timestamp">Last accessed: {new Date(adminData?.security?.lastAccessed).toLocaleString()}</p>
      </header>

      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <h3>Total Users</h3>
          <p className="stat-number">{adminData?.systemStats?.totalUsers || 0}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💝</div>
          <h3>Total Requests</h3>
          <p className="stat-number">{adminData?.systemStats?.totalRequests || 0}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <h3>Server Uptime</h3>
          <p className="stat-number">{Math.floor(adminData?.systemStats?.serverUptime / 3600)}h</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌍</div>
          <h3>Environment</h3>
          <p className="stat-text">{adminData?.systemStats?.environment}</p>
        </div>
      </div>

      <div className="admin-actions">
        <h2>🛠️ System Admin Actions</h2>
        <div className="action-buttons">
          <button className="admin-btn" onClick={() => window.open('https://heartbridge-74v8.onrender.com/api/users', '_blank')}>
            👥 View All Users API
          </button>
          <button className="admin-btn" onClick={() => window.open('https://heartbridge-74v8.onrender.com/api/requests', '_blank')}>
            💝 View All Requests API
          </button>
          <button className="admin-btn" onClick={() => window.open('https://heartbridge-74v8.onrender.com/api/health', '_blank')}>
            🏥 System Health Check
          </button>
          <button className="admin-btn" onClick={fetchAdminData}>
            🔄 Refresh Dashboard Data
          </button>
        </div>
      </div>

      <div className="system-info">
        <h2>💻 System Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <strong>Node Version:</strong> {adminData?.systemStats?.nodeVersion}
          </div>
          <div className="info-item">
            <strong>Memory Used:</strong> {Math.round(adminData?.systemStats?.memoryUsage?.used / 1024 / 1024)}MB
          </div>
          <div className="info-item">
            <strong>Heap Used:</strong> {Math.round(adminData?.systemStats?.memoryUsage?.heapUsed / 1024 / 1024)}MB
          </div>
          <div className="info-item">
            <strong>Total Memory:</strong> {Math.round(adminData?.systemStats?.memoryUsage?.total / 1024 / 1024)}MB
          </div>
          <div className="info-item">
            <strong>External Memory:</strong> {Math.round(adminData?.systemStats?.memoryUsage?.external / 1024 / 1024)}MB
          </div>
          <div className="info-item">
            <strong>Last Updated:</strong> {new Date(adminData?.timestamp).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="security-section">
        <h2>🔐 Security Information</h2>
        <div className="security-grid">
          <div className="security-item">
            <span className="security-label">🆔 Access Level:</span>
            <span className="security-value">{adminData?.security?.accessLevel}</span>
          </div>
          <div className="security-item">
            <span className="security-label">🌍 Environment Mode:</span>
            <span className="security-value">{adminData?.systemStats?.environment?.toUpperCase()}</span>
          </div>
          <div className="security-item">
            <span className="security-label">📊 Server Status:</span>
            <span className="security-value success">ONLINE & OPERATIONAL</span>
          </div>
          <div className="security-item">
            <span className="security-label">🔄 Last System Check:</span>
            <span className="security-value">{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="admin-footer">
        <p>🔐 HeartBridge Secret Admin Portal - Authorized Access Only</p>
        <p>💖 System monitoring and administration with love</p>
        <p>⚠️ This is a restricted area. All activities are logged.</p>
      </div>
    </div>
  );
};

export default SecretAdminDashboard;
