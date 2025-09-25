import React, { useState } from 'react';
import './AuthLanding.css';

// Import community images
import hommieImage1 from '../assets/Hommie.jpg';
import hommieImage2 from '../assets/Hommie2.jpg';
import volunteerImage from '../assets/Volunteer.jpg';
import volunteerImage1 from '../assets/Volunteer1.jpg';

const AuthLanding = ({ onLogin, onRegister }) => {
  const [selectedRole, setSelectedRole] = useState(null); // 'elderly' or 'volunteer'
  const [authMode, setAuthMode] = useState(null); // 'signin' or 'signup'
  const [formData, setFormData] = useState({
    // Common fields
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    
    // Elderly-specific fields
    age: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalInfo: '',
    mobilityLevel: '',
    
    // Volunteer-specific fields
    availability: [],
    skills: [],
    experience: '',
    transportation: '',
    backgroundCheck: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelection = (role, mode) => {
    setSelectedRole(role);
    setAuthMode(mode);
    setFormData(prev => ({ ...prev, role }));
    setErrors({});
  };

  const handleBackToRoleSelection = () => {
    setSelectedRole(null);
    setAuthMode(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      location: '',
      age: '',
      emergencyContact: '',
      emergencyPhone: '',
      medicalInfo: '',
      mobilityLevel: '',
      availability: [],
      skills: [],
      experience: '',
      transportation: '',
      backgroundCheck: false
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && (name === 'availability' || name === 'skills')) {
      setFormData(prev => ({
        ...prev,
        [name]: checked 
          ? [...prev[name], value]
          : prev[name].filter(item => item !== value)
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Common validation
    if (authMode === 'signup') {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Role-specific validation for signup
    if (authMode === 'signup') {
      if (selectedRole === 'elderly') {
        if (!formData.age || formData.age < 18) {
          newErrors.age = 'Age must be 18 or older';
        }
        if (!formData.emergencyContact.trim()) {
          newErrors.emergencyContact = 'Emergency contact is required';
        }
        if (!formData.emergencyPhone.trim()) {
          newErrors.emergencyPhone = 'Emergency contact phone is required';
        }
      } else if (selectedRole === 'volunteer') {
        if (formData.availability.length === 0) {
          newErrors.availability = 'Please select at least one availability option';
        }
        if (formData.skills.length === 0) {
          newErrors.skills = 'Please select at least one skill you can offer';
        }
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
        await onLogin({
          email: formData.email,
          password: formData.password,
          role: selectedRole
        });
      } else {
        const { confirmPassword, ...registrationData } = formData;
        await onRegister(registrationData);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ submit: error.message || 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Landing page with role selection
  if (!selectedRole || !authMode) {
    return (
      <div className="auth-landing-container">
        <div className="landing-header">
          <h1>❤️ Welcome to HeartBridge</h1>
          <p>Connecting hearts, building community with love</p>
        </div>

        <div className="landing-content">
          <div className="hero-section">
            <h2>💕 How would you like to make a difference today?</h2>
            <p>Choose your path and join our caring community</p>
          </div>

          <div className="role-cards">
            {/* Elderly Person Card */}
            <div className="role-card elderly-card">
              <div className="card-image">
                <img src={hommieImage1} alt="Community member seeking help" />
                <div className="card-overlay">
                  <span className="card-icon">🤝</span>
                </div>
              </div>
              <div className="card-content">
                <h3>I Need Community Support</h3>
                <p>Connect with caring volunteers who want to help with daily tasks, errands, and companionship.</p>
                <ul className="card-features">
                  <li>🛒 Shopping assistance</li>
                  <li>💊 Medication pickup</li>
                  <li>🏠 Light housekeeping</li>
                  <li>🚗 Transportation help</li>
                  <li>💬 Friendly companionship</li>
                </ul>
                <div className="card-actions">
                  <button 
                    className="action-button primary"
                    onClick={() => handleRoleSelection('elderly', 'signup')}
                  >
                    💌 Join as Community Member
                  </button>
                  <button 
                    className="action-button secondary"
                    onClick={() => handleRoleSelection('elderly', 'signin')}
                  >
                    🔑 Sign In
                  </button>
                </div>
              </div>
            </div>

            {/* Volunteer Card */}
            <div className="role-card volunteer-card">
              <div className="card-image">
                <img src={volunteerImage} alt="Volunteer helping others" />
                <div className="card-overlay">
                  <span className="card-icon">💝</span>
                </div>
              </div>
              <div className="card-content">
                <h3>I Want to Help Others</h3>
                <p>Make a meaningful difference by volunteering your time and skills to help community members in need.</p>
                <ul className="card-features">
                  <li>💖 Make meaningful connections</li>
                  <li>🌟 Share your skills</li>
                  <li>⏰ Flexible scheduling</li>
                  <li>🏆 Build your experience</li>
                  <li>💕 Spread kindness</li>
                </ul>
                <div className="card-actions">
                  <button 
                    className="action-button primary"
                    onClick={() => handleRoleSelection('volunteer', 'signup')}
                  >
                    💝 Become a Volunteer
                  </button>
                  <button 
                    className="action-button secondary"
                    onClick={() => handleRoleSelection('volunteer', 'signin')}
                  >
                    🔑 Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="community-stats">
            <h3>💕 Our Growing Community</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">1,200+</span>
                <span className="stat-label">💝 Active Volunteers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">3,500+</span>
                <span className="stat-label">🤝 Requests Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">850+</span>
                <span className="stat-label">💕 Community Members</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.9★</span>
                <span className="stat-label">⭐ Community Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authentication form
  return (
    <div className="auth-form-container">
      <div className="auth-form-content">
        <div className="form-header">
          <button 
            className="back-button"
            onClick={handleBackToRoleSelection}
          >
            ← Back to options
          </button>
          <h2>
            {authMode === 'signin' ? '💌 Welcome Back!' : '💖 Join Our Community'}
          </h2>
          <p>
            {selectedRole === 'elderly' 
              ? authMode === 'signin' 
                ? 'Sign in to connect with volunteers ready to help' 
                : 'Tell us about yourself so we can best support you'
              : authMode === 'signin'
                ? 'Sign in to start making a difference in people\'s lives'
                : 'Share your skills and availability to help others'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.submit && (
            <div className="error-message global-error">
              {errors.submit}
            </div>
          )}

          {/* Common Fields */}
          <div className="form-section">
            <h4>💌 {authMode === 'signin' ? 'Sign In Information' : 'Basic Information'}</h4>
            
            {authMode === 'signup' && (
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email address"
                disabled={isLoading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder={authMode === 'signin' ? 'Enter your password' : 'Create a secure password'}
                disabled={isLoading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            {authMode === 'signup' && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            )}
          </div>

          {/* Role-specific fields for signup */}
          {authMode === 'signup' && selectedRole === 'elderly' && (
            <div className="form-section">
              <h4>🤝 Help Us Support You Better</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age">Age *</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className={errors.age ? 'error' : ''}
                    placeholder="Your age"
                    min="18"
                    disabled={isLoading}
                  />
                  {errors.age && <span className="error-message">{errors.age}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="mobilityLevel">Mobility Level</label>
                  <select
                    id="mobilityLevel"
                    name="mobilityLevel"
                    value={formData.mobilityLevel}
                    onChange={handleChange}
                    disabled={isLoading}
                  >
                    <option value="">Select mobility level</option>
                    <option value="fully-mobile">Fully mobile</option>
                    <option value="limited-mobility">Limited mobility</option>
                    <option value="wheelchair">Wheelchair user</option>
                    <option value="walker-assistance">Walker/assistance needed</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="emergencyContact">Emergency Contact Name *</label>
                  <input
                    type="text"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className={errors.emergencyContact ? 'error' : ''}
                    placeholder="Emergency contact full name"
                    disabled={isLoading}
                  />
                  {errors.emergencyContact && <span className="error-message">{errors.emergencyContact}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="emergencyPhone">Emergency Contact Phone *</label>
                  <input
                    type="tel"
                    id="emergencyPhone"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className={errors.emergencyPhone ? 'error' : ''}
                    placeholder="(555) 123-4567"
                    disabled={isLoading}
                  />
                  {errors.emergencyPhone && <span className="error-message">{errors.emergencyPhone}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="medicalInfo">Medical Information (Optional)</label>
                <textarea
                  id="medicalInfo"
                  name="medicalInfo"
                  value={formData.medicalInfo}
                  onChange={handleChange}
                  placeholder="Any medical conditions or special needs volunteers should be aware of"
                  rows="3"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {authMode === 'signup' && selectedRole === 'volunteer' && (
            <div className="form-section">
              <h4>💝 Tell Us About Your Volunteering</h4>
              
              <div className="form-group">
                <label>Availability * {errors.availability && <span className="error-message">{errors.availability}</span>}</label>
                <div className="checkbox-grid">
                  {['Weekday mornings', 'Weekday afternoons', 'Weekday evenings', 'Weekend mornings', 'Weekend afternoons', 'Weekend evenings', 'Flexible/On-call'].map(time => (
                    <label key={time} className="checkbox-item">
                      <input
                        type="checkbox"
                        name="availability"
                        value={time}
                        checked={formData.availability.includes(time)}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                      <span>{time}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Skills & Services You Can Offer * {errors.skills && <span className="error-message">{errors.skills}</span>}</label>
                <div className="checkbox-grid">
                  {['Grocery shopping', 'Medication pickup', 'Light housekeeping', 'Transportation', 'Companionship', 'Technology help', 'Pet care', 'Yard work', 'Cooking/meal prep'].map(skill => (
                    <label key={skill} className="checkbox-item">
                      <input
                        type="checkbox"
                        name="skills"
                        value={skill}
                        checked={formData.skills.includes(skill)}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="transportation">Do you have reliable transportation?</label>
                <select
                  id="transportation"
                  name="transportation"
                  value={formData.transportation}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="">Select option</option>
                  <option value="own-car">Own car</option>
                  <option value="public-transport">Public transportation</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="walking">Walking distance only</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="experience">Previous Volunteering Experience (Optional)</label>
                <textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Tell us about any previous volunteering or caregiving experience"
                  rows="3"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Contact Information for signup */}
          {authMode === 'signup' && (
            <div className="form-section">
              <h4>📞 Contact Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="location">Location/Area</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Downtown, West side"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`submit-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading 
              ? '💝 Processing...' 
              : authMode === 'signin' 
                ? '💌 Sign In' 
                : selectedRole === 'elderly'
                  ? '🤝 Join Community'
                  : '💝 Start Volunteering'
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthLanding;