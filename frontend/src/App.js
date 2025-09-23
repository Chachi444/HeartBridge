import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Homepage from './components/Homepage';
import RequestForm from './components/RequestForm';
import VolunteerDashboard from './components/VolunteerDashboard';
import AdminDashboard from './components/AdminDashboard';
import ElderlyDashboard from './components/ElderlyDashboard';
import Navigation from './components/Navigation';
import AuthLanding from './components/AuthLanding';
import SecretAdmin from './components/SecretAdmin';
import ProtectedRoute from './components/ProtectedRoute';

// Import elderly photos from assets
import elderlyPhoto1 from './assets/Old.jpg';
import elderlyPhoto2 from './assets/Old2.jpg';
import elderlyPhoto3 from './assets/Old3.jpg';

// Import community/friendship images
import hommieImage1 from './assets/Hommie.jpg';
import hommieImage2 from './assets/Hommie2.jpg';

function App() {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [requests, setRequests] = useState([]);

  // Check for existing authentication on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('heartbridge_user');
    const savedToken = localStorage.getItem('heartbridge_token');
    
    if (savedUser && savedToken) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }

    // Load all users from localStorage
    const allUsers = JSON.parse(localStorage.getItem('heartbridge_all_users') || '[]');

    // Load requests from localStorage
    const savedRequests = localStorage.getItem('heartbridge_requests');
    if (savedRequests) {
      try {
        const parsedRequests = JSON.parse(savedRequests);
        // Convert date strings back to Date objects and migrate volunteer data
        const requestsWithDates = parsedRequests.map(req => ({
          ...req,
          dateCreated: new Date(req.dateCreated),
          // Ensure assignedVolunteer is populated from volunteer.name if missing
          assignedVolunteer: req.assignedVolunteer || req.volunteer?.name,
          ...(req.volunteer?.assignedAt && {
            volunteer: {
              ...req.volunteer,
              assignedAt: new Date(req.volunteer.assignedAt),
              ...(req.volunteer.completedAt && {
                completedAt: new Date(req.volunteer.completedAt)
              }),
              ...(req.volunteer.ratedAt && {
                ratedAt: new Date(req.volunteer.ratedAt)
              })
            }
          }),
          ...(req.adminApproval?.reviewedAt && {
            adminApproval: {
              ...req.adminApproval,
              reviewedAt: new Date(req.adminApproval.reviewedAt)
            }
          })
        }));
        setRequests(requestsWithDates);
      } catch (error) {
        console.error('Error loading saved requests:', error);
        // Keep default requests if there's an error
      }
    } else {
      // If no saved requests, save current default requests to localStorage
      localStorage.setItem('heartbridge_requests', JSON.stringify(requests));
    }
  }, []);

  // Save requests to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('heartbridge_requests', JSON.stringify(requests));
  }, [requests]);

  // Authentication functions
  const handleLogin = async (credentials) => {
    try {
      // For now, simulate API call - replace with actual API call later
      console.log('Login credentials:', credentials);
      
      // Simulate successful login
      const mockUser = {
        id: Date.now(),
        email: credentials.email,
        name: credentials.email.split('@')[0], // Use email prefix as name for demo
        role: credentials.role,
        phone: credentials.phone || '(555) 123-4567',
        location: credentials.location || 'Downtown area',
        age: credentials.age || (credentials.role === 'elderly' ? 75 : 30),
        isAuthenticated: true
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      
      // Save to localStorage
      localStorage.setItem('heartbridge_user', JSON.stringify(mockUser));
      localStorage.setItem('heartbridge_token', 'demo_token_' + Date.now());
      
      // Store user in global users list for admin tracking (only if not already exists)
      const allUsers = JSON.parse(localStorage.getItem('heartbridge_all_users') || '[]');
      const existingUser = allUsers.find(u => u.email === mockUser.email);
      if (!existingUser) {
        allUsers.push({ ...mockUser, joinDate: new Date(), status: 'active' });
        localStorage.setItem('heartbridge_all_users', JSON.stringify(allUsers));
      }
      
      // Show success message based on role
      if (mockUser.role === 'elderly') {
        setSuccessMessage(`💖 Welcome back! Your personal dashboard is ready to help you connect with caring volunteers! 🤝`);
      } else if (mockUser.role === 'admin') {
        setSuccessMessage(`🔧 Welcome back, Admin! Ready to manage our caring community! 💼`);
      } else {
        setSuccessMessage(`💝 Welcome back! Ready to make a difference in someone's day! 🌟`);
      }
      
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
      
      return mockUser; // Return user for navigation
      
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  };

  const handleRegister = async (userData) => {
    try {
      // For now, simulate API call - replace with actual API call later
      console.log('Registration data:', userData);
      
      // Simulate successful registration
      const newUser = {
        id: Date.now(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
        location: userData.location,
        age: userData.age,
        // Role-specific data
        ...(userData.role === 'elderly' && {
          emergencyContact: userData.emergencyContact,
          emergencyPhone: userData.emergencyPhone,
          medicalInfo: userData.medicalInfo,
          mobilityLevel: userData.mobilityLevel
        }),
        ...(userData.role === 'volunteer' && {
          availability: userData.availability,
          skills: userData.skills,
          experience: userData.experience,
          transportation: userData.transportation
        }),
        isAuthenticated: true
      };

      setUser(newUser);
      setIsAuthenticated(true);
      
      // Save to localStorage
      localStorage.setItem('heartbridge_user', JSON.stringify(newUser));
      localStorage.setItem('heartbridge_token', 'demo_token_' + Date.now());
      
      // Store user in global users list for admin tracking
      const allUsers = JSON.parse(localStorage.getItem('heartbridge_all_users') || '[]');
      const existingUserIndex = allUsers.findIndex(u => u.email === newUser.email);
      if (existingUserIndex >= 0) {
        allUsers[existingUserIndex] = { ...allUsers[existingUserIndex], ...newUser };
      } else {
        allUsers.push({ ...newUser, joinDate: new Date(), status: 'active' });
      }
      localStorage.setItem('heartbridge_all_users', JSON.stringify(allUsers));
      
      // Show appropriate message based on role
      if (newUser.role === 'elderly') {
        setSuccessMessage(`💝 Welcome to HeartBridge, ${userData.name}! Your personal dashboard is ready. You can now request help from our caring volunteers! 🤝`);
      } else if (newUser.role === 'admin') {
        setSuccessMessage(`🔧 Welcome to HeartBridge, ${userData.name}! You now have admin access to manage our caring community! 💼`);
      } else {
        setSuccessMessage(`💖 Welcome to HeartBridge, ${userData.name}! You're now ready to help make a difference in people's lives! 🌟`);
      }
      
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 6000);
      
      return newUser; // Return user for navigation
      
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('heartbridge_user');
    localStorage.removeItem('heartbridge_token');
    
    setSuccessMessage('💕 You\'ve been signed out. Thank you for being part of our caring community! See you soon! 👋');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 4000);
  };

  const handleDeleteAccount = () => {
    if (!user) return;

    // Mark user as deleted instead of removing completely
    const allUsers = JSON.parse(localStorage.getItem('heartbridge_all_users') || '[]');
    const updatedUsers = allUsers.map(u => 
      u.id === user.id 
        ? { ...u, status: 'deleted', deletedAt: new Date(), deletedReason: 'User requested account deletion' }
        : u
    );
    localStorage.setItem('heartbridge_all_users', JSON.stringify(updatedUsers));

    // Cancel all active requests for this user
    const updatedRequests = requests.map(req => 
      req.requester?.userId === user.id && req.status !== 'completed'
        ? { ...req, status: 'cancelled', cancelledReason: 'Account deleted by user' }
        : req
    );
    setRequests(updatedRequests);
    localStorage.setItem('heartbridge_requests', JSON.stringify(updatedRequests));

    // Log out the user
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('heartbridge_user');
    localStorage.removeItem('heartbridge_token');
    
    setSuccessMessage('🗑️ Your account has been deleted. We\'re sorry to see you go. Thank you for being part of our community! 💕');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 6000);
  };

  const addRequest = (newRequest) => {
    if (!isAuthenticated) {
      setSuccessMessage('💌 Please sign in to submit a request. We want to make sure we can reach you!');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 4000);
      return;
    }

    const request = {
      ...newRequest,
      id: Date.now(),
      status: 'open',
      dateCreated: new Date(),
      volunteer: null,
      requester: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || newRequest.phone
      }
    };
    setRequests([...requests, request]);
    setSuccessMessage('💝 Your request has been submitted with love! Our caring volunteers will see it soon. 💕');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  const assignVolunteer = (requestId, volunteerName) => {
    if (!isAuthenticated) {
      setSuccessMessage('💌 Please sign in to volunteer. We want to connect you properly with those who need help!');
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 4000);
      return;
    }

    const actualVolunteerName = volunteerName || user.name;
    setRequests(requests.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            assignedVolunteer: actualVolunteerName,
            volunteer: {
              userId: user.id,
              name: actualVolunteerName,
              email: user.email,
              phone: user.phone,
              assignedAt: new Date()
            }, 
            status: 'in-progress' 
          }
        : req
    ));
    setSuccessMessage(`💖 Thank you ${actualVolunteerName}! You've accepted a request with kindness. The person in need will be so grateful! 🤝`);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  const completeRequest = (requestId) => {
    setRequests(requests.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status: 'completed',
            volunteer: {
              ...req.volunteer,
              completedAt: new Date()
            }
          }
        : req
    ));
    setSuccessMessage('💕 Request completed! Your kindness has made someone\'s day brighter. Thank you for spreading love in our community! 🌟');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  // Elderly-specific functions
  const submitElderlyRequest = (requestData) => {
    const request = {
      ...requestData,
      id: Date.now(),
      status: 'approved', // Auto-approve for testing - change to 'pending' for production
      dateCreated: new Date(),
      volunteer: null,
      requester: {
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || requestData.phone
      },
      adminApproval: {
        status: 'approved', // Auto-approve for testing
        reviewedBy: 'system',
        reviewedAt: new Date(),
        notes: 'Auto-approved for testing purposes'
      }
    };
    setRequests([...requests, request]);
    setSuccessMessage('💝 Your request has been submitted and approved! Volunteers can now see and accept it. 💕');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  const cancelRequest = (requestId) => {
    setRequests(requests.map(req => 
      req.id === requestId 
        ? { ...req, status: 'cancelled' }
        : req
    ));
    setSuccessMessage('Your request has been cancelled successfully.');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const rateVolunteer = (requestId, ratingData) => {
    setRequests(requests.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            volunteerRating: ratingData.rating,
            feedback: ratingData.comment,
            ratedAt: new Date(),
            volunteer: {
              ...req.volunteer,
              rated: true,
              rating: ratingData.rating,
              ratingComment: ratingData.comment,
              ratedAt: new Date()
            }
          }
        : req
    ));
    setSuccessMessage(`💝 Thank you for rating your volunteer! Your feedback helps us build a better community. 🌟`);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 4000);
  };

  return (
    <Router>
      <AppContent 
        user={user}
        isAuthenticated={isAuthenticated}
        showSuccessMessage={showSuccessMessage}
        successMessage={successMessage}
        setShowSuccessMessage={setShowSuccessMessage}
        requests={requests}
        setRequests={setRequests}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        handleLogout={handleLogout}
        handleDeleteAccount={handleDeleteAccount}
        addRequest={addRequest}
        assignVolunteer={assignVolunteer}
        completeRequest={completeRequest}
        submitElderlyRequest={submitElderlyRequest}
        cancelRequest={cancelRequest}
        rateVolunteer={rateVolunteer}
      />
    </Router>
  );
}

// Separate component to handle navigation and routing
function AppContent({ 
  user, isAuthenticated, showSuccessMessage, successMessage, setShowSuccessMessage,
  requests, setRequests, handleLogin, handleRegister, handleLogout, handleDeleteAccount,
  addRequest, assignVolunteer, completeRequest, submitElderlyRequest, 
  cancelRequest, rateVolunteer 
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect authenticated users to their dashboard if they're on login page
  useEffect(() => {
    if (isAuthenticated && user && (location.pathname === '/login' || location.pathname === '/')) {
      switch (user.role) {
        case 'elderly':
          navigate('/elderly', { replace: true });
          break;
        case 'volunteer':
          navigate('/volunteer', { replace: true });
          break;
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        default:
          break;
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  // Enhanced login wrapper that handles navigation
  const handleLoginWithNavigation = async (credentials) => {
    try {
      const loggedInUser = await handleLogin(credentials);
      // Navigate to appropriate dashboard
      switch (loggedInUser.role) {
        case 'elderly':
          navigate('/elderly');
          break;
        case 'volunteer':
          navigate('/volunteer');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          break;
      }
    } catch (error) {
      throw error;
    }
  };

  // Enhanced register wrapper that handles navigation
  const handleRegisterWithNavigation = async (userData) => {
    try {
      const registeredUser = await handleRegister(userData);
      // Navigate to appropriate dashboard
      switch (registeredUser.role) {
        case 'elderly':
          navigate('/elderly');
          break;
        case 'volunteer':
          navigate('/volunteer');
          break;
        case 'admin':
          navigate('/admin');
          break;
        default:
          break;
      }
    } catch (error) {
      throw error;
    }
  };

  // Enhanced logout that navigates to login
  const handleLogoutWithNavigation = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <div className="app">
      {isAuthenticated && (
        <Navigation 
          user={user}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogoutWithNavigation}
        />
      )}
      
      {showSuccessMessage && (
        <div className="success-message">
          <span className="success-text">{successMessage}</span>
          <button 
            className="close-success"
            onClick={() => setShowSuccessMessage(false)}
          >
            ✕
          </button>
        </div>
      )}

      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to={`/${user.role}`} replace />
              ) : (
                <AuthLanding 
                  onLogin={handleLoginWithNavigation}
                  onRegister={handleRegisterWithNavigation}
                />
              )
            } 
          />
          
          {/* Secret Admin Route */}
          <Route 
            path="/secret-admin-portal-2025" 
            element={
              isAuthenticated && user?.role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <SecretAdmin 
                  onLogin={handleLoginWithNavigation}
                  onRegister={handleRegisterWithNavigation}
                />
              )
            } 
          />
          
          {/* Protected role-specific routes */}
          <Route 
            path="/elderly" 
            element={
              <ProtectedRoute user={user} requiredRole="elderly" isAuthenticated={isAuthenticated}>
                <ElderlyDashboard 
                  requests={requests}
                  onSubmitRequest={submitElderlyRequest}
                  onCancelRequest={cancelRequest}
                  onRateVolunteer={rateVolunteer}
                  onDeleteAccount={handleDeleteAccount}
                  user={user}
                />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/volunteer" 
            element={
              <ProtectedRoute user={user} requiredRole="volunteer" isAuthenticated={isAuthenticated}>
                <VolunteerDashboard 
                  requests={requests} 
                  onAssign={assignVolunteer}
                  onComplete={completeRequest}
                  onDeleteAccount={handleDeleteAccount}
                  user={user}
                />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute user={user} requiredRole="admin" isAuthenticated={isAuthenticated}>
                <AdminDashboard 
                  user={user} 
                  requests={requests}
                  setRequests={setRequests}
                />
              </ProtectedRoute>
            } 
          />
          
          {/* Legacy routes for backwards compatibility */}
          <Route 
            path="/home" 
            element={
              isAuthenticated ? (
                <Homepage requests={requests} user={user} isAuthenticated={isAuthenticated} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          <Route 
            path="/request" 
            element={
              isAuthenticated ? (
                <RequestForm onSubmit={addRequest} user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Default routes */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to={`/${user.role}`} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;