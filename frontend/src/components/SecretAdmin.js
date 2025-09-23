import React, { useState } from 'react';
import './AuthLanding.css';

const SecretAdmin = ({ onLogin, onRegister }) => {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    adminCode: '', // Secret admin code field
    role: 'admin'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (authMode === 'signup') {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }

      if (!formData.confirmPassword.trim()) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      }

      if (!formData.location.trim()) {
        newErrors.location = 'Location is required';
      }

      // Secret admin code validation
      if (!formData.adminCode.trim()) {
        newErrors.adminCode = 'Admin access code is required';
      } else if (formData.adminCode !== 'HEARTBRIDGE2025') {
        newErrors.adminCode = 'Invalid admin access code';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'signin') {
        await onLogin(formData);
      } else {
        await onRegister(formData);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-landing">
      <div className="auth-container">
        <div className="auth-header">
          <h1>🔧 Administrator Access</h1>
          <p>Secure admin portal for HeartBridge management</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`tab-button ${authMode === 'signin' ? 'active' : ''}`}
            onClick={() => setAuthMode('signin')}
          >
            🔑 Admin Sign In
          </button>
          <button 
            className={`tab-button ${authMode === 'signup' ? 'active' : ''}`}
            onClick={() => setAuthMode('signup')}
          >
            👑 Create Admin Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {authMode === 'signup' && (
            <>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter your full name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={errors.location ? 'error' : ''}
                  placeholder="City, State"
                />
                {errors.location && <span className="error-text">{errors.location}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="adminCode">🔐 Admin Access Code</label>
                <input
                  type="password"
                  id="adminCode"
                  name="adminCode"
                  value={formData.adminCode}
                  onChange={handleInputChange}
                  className={errors.adminCode ? 'error' : ''}
                  placeholder="Enter secret admin code"
                />
                {errors.adminCode && <span className="error-text">{errors.adminCode}</span>}
                <small className="field-hint">Contact system administrator for access code</small>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="admin@heartbridge.org"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter secure password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {authMode === 'signup' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button admin-submit"
            disabled={isLoading}
          >
            {isLoading 
              ? '🔄 Processing...' 
              : authMode === 'signin' 
                ? '🔧 Access Admin Panel' 
                : '👑 Create Admin Account'
            }
          </button>
        </form>

        <div className="admin-notice">
          <p>⚠️ This is a secure administrative area. Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  );
};

export default SecretAdmin;