import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const AdminDashboard = () => {
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

  if (loading) return <div className="admin-loading">👑 Loading Admin Dashboard...</div>;
  if (error) return <div className="admin-error">❌ Error: {error}</div>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>👑 HeartBridge Admin Dashboard</h1>
        <p className="admin-subtitle">Top Secret Access - {adminData?.security?.accessLevel}</p>
      </header>

      <div className="admin-stats-grid">
        <div className="stat-card">
          <h3>👥 Total Users</h3>
          <p className="stat-number">{adminData?.systemStats?.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>💝 Total Requests</h3>
          <p className="stat-number">{adminData?.systemStats?.totalRequests}</p>
        </div>
        <div className="stat-card">
          <h3>⏱️ Server Uptime</h3>
          <p className="stat-number">{Math.floor(adminData?.systemStats?.serverUptime / 3600)}h</p>
        </div>
        <div className="stat-card">
          <h3>🌍 Environment</h3>
          <p className="stat-text">{adminData?.systemStats?.environment}</p>
        </div>
      </div>

      <div className="admin-actions">
        <h2>🛠️ Admin Actions</h2>
        <div className="action-buttons">
          <button className="admin-btn">View All Users</button>
          <button className="admin-btn">View All Requests</button>
          <button className="admin-btn">System Health</button>
          <button className="admin-btn">Clear Cache</button>
        </div>
      </div>

      <div className="system-info">
        <h2>💻 System Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <strong>Node Version:</strong> {adminData?.systemStats?.nodeVersion}
          </div>
          <div className="info-item">
            <strong>Memory Usage:</strong> {Math.round(adminData?.systemStats?.memoryUsage?.used / 1024 / 1024)}MB
          </div>
          <div className="info-item">
            <strong>Last Accessed:</strong> {new Date(adminData?.security?.lastAccessed).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
