import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ 
  user, 
  isAuthenticated, 
  onLogout
}) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const renderNavigationButtons = () => {
    if (!user) {
      return null; // Don't render navigation buttons if no user is logged in
    }
    
    if (user.role === 'elderly') {
      return (
        <>
          <Link 
            to="/elderly"
            className={`nav-button ${location.pathname === '/elderly' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            💝 My Dashboard
          </Link>
          <Link 
            to="/home"
            className={`nav-button ${location.pathname === '/home' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            🤝 Community
          </Link>
        </>
      );
    } else if (user.role === 'volunteer') {
      return (
        <>
          <Link 
            to="/volunteer"
            className={`nav-button ${location.pathname === '/volunteer' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            💖 Volunteer Dashboard
          </Link>
          <Link 
            to="/home"
            className={`nav-button ${location.pathname === '/home' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            💝 View Requests
          </Link>
        </>
      );
    } else if (user.role === 'admin') {
      // Get sample users from localStorage to show real names
      const savedUsers = JSON.parse(localStorage.getItem('heartbridge_all_users') || '[]');
      const sampleVolunteer = savedUsers.find(u => u.role === 'volunteer');
      const sampleElderly = savedUsers.find(u => u.role === 'elderly');
      
      return (
        <>
          <Link 
            to="/admin"
            className={`nav-button ${location.pathname === '/admin' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            🔧 Admin Dashboard
          </Link>
          <Link 
            to="/volunteer"
            className={`nav-button ${location.pathname === '/volunteer' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            💖 {sampleVolunteer ? `${sampleVolunteer.name} (Volunteer)` : 'Volunteer View'}
          </Link>
          <Link 
            to="/elderly"
            className={`nav-button ${location.pathname === '/elderly' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            💝 {sampleElderly ? `${sampleElderly.name} (Elderly)` : 'Elderly View'}
          </Link>
          <Link 
            to="/home"
            className={`nav-button ${location.pathname === '/home' ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            🤝 Community
          </Link>
        </>
      );
    }
    
    // Default navigation for any other roles
    return (
      <>
        <Link 
          to="/home"
          className={`nav-button ${location.pathname === '/home' ? 'active' : ''}`}
          onClick={closeMobileMenu}
        >
          💝 View Requests
        </Link>
        <Link 
          to="/request"
          className={`nav-button ${location.pathname === '/request' ? 'active' : ''}`}
          onClick={closeMobileMenu}
        >
          🤝 Request Help
        </Link>
      </>
    );
  };

  const getRoleDisplay = () => {
    switch (user.role) {
      case 'elderly': return '💝 Community Member';
      case 'volunteer': return '💖 Volunteer';
      case 'admin': return '🔧 Administrator';
      default: return '👤 User';
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link" onClick={closeMobileMenu}>
            <h1 className="nav-title">💕 HeartBridge</h1>
            <p className="nav-subtitle">Connecting Hearts, Building Community</p>
          </Link>
        </div>
        
        {/* Hamburger Menu Button */}
        <button 
          className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        
        <div className={`nav-content ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="nav-buttons">
            {renderNavigationButtons()}
          </div>
          
          <div className="nav-user">
            <div className="user-info">
              <span className="user-role">{getRoleDisplay()}</span>
              <span className="user-name">👋 {user.name}</span>
            </div>
            <button 
              className="logout-button"
              onClick={() => {
                onLogout();
                closeMobileMenu();
              }}
            >
              👋 Sign Out
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="mobile-overlay" 
            onClick={closeMobileMenu}
          ></div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;