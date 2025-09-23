import React, { useState } from 'react';
import './RequestForm.css';

// Import community image for subtle background
import hommieImage2 from '../assets/Hommie2.jpg';

const RequestForm = ({ onSubmit, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    type: 'shopping',
    description: '',
    urgency: 'medium',
    location: '',
    phone: '',
    profileImage: null
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profileImage: 'Please select a valid image file'
        }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          profileImage: 'Image size must be less than 5MB'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.profileImage) {
        setErrors(prev => ({
          ...prev,
          profileImage: ''
        }));
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      profileImage: null
    }));
    setImagePreview(null);
    // Clear the file input
    const fileInput = document.getElementById('profileImage');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.age || formData.age < 1 || formData.age > 120) {
      newErrors.age = 'Please enter a valid age';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please describe what help you need';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\(\d{3}\)\s\d{3}-\d{4}$/.test(formData.phone) && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSubmit(formData);
      
      // Reset form
      setFormData({
        name: '',
        age: '',
        type: 'shopping',
        description: '',
        urgency: 'medium',
        location: '',
        phone: '',
        profileImage: null
      });
      setImagePreview(null);
      
      // Clear file input
      const fileInput = document.getElementById('profileImage');
      if (fileInput) {
        fileInput.value = '';
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="request-form-container">
      <div className="form-header">
        <h2>💝 Request Community Assistance</h2>
        <p>Fill out this form to request help from our loving volunteer community. All information is kept confidential and handled with care. You are not alone - we're here to help! 💕</p>
      </div>

      <form onSubmit={handleSubmit} className="request-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          
          <div className="form-row">
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
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

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
                min="1"
                max="120"
              />
              {errors.age && <span className="error-message">{errors.age}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                className={errors.phone ? 'error' : ''}
                placeholder="(555) 123-4567"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="location">Location/Area *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={errors.location ? 'error' : ''}
                placeholder="e.g., Downtown, West side, East side"
              />
              {errors.location && <span className="error-message">{errors.location}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group full-width">
              <label htmlFor="profileImage">📸 Your Photo (Optional)</label>
              <p className="field-description">Adding your photo helps volunteers feel a personal connection and builds trust in our community 💕</p>
              
              <div className="image-upload-container">
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Profile preview" />
                    <button type="button" className="remove-image-btn" onClick={removeImage}>
                      ❌ Remove Photo
                    </button>
                  </div>
                ) : (
                  <div className="image-upload-area">
                    <input
                      type="file"
                      id="profileImage"
                      name="profileImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="image-input"
                    />
                    <label htmlFor="profileImage" className="image-upload-label">
                      <div className="upload-icon">📷</div>
                      <div className="upload-text">
                        <strong>Click to upload your photo</strong>
                        <p>or drag and drop an image here</p>
                        <small>Supports JPG, PNG files up to 5MB</small>
                      </div>
                    </label>
                  </div>
                )}
              </div>
              {errors.profileImage && <span className="error-message">{errors.profileImage}</span>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>💌 Assistance Request Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Type of Help Needed *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="shopping">🛒 Shopping Assistance</option>
                <option value="medicine">💊 Medicine Pickup</option>
                <option value="daily tasks">🏠 Daily Tasks/Housekeeping</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="urgency">Priority Level *</label>
              <select
                id="urgency"
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
              >
                <option value="low">Low - Within a week</option>
                <option value="medium">Medium - Within 2-3 days</option>
                <option value="high">High - Urgent (within 24 hours)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              placeholder="Please describe what specific help you need. Include any important details like preferred times, special requirements, etc."
              rows="4"
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? '💝 Submitting with Love...' : '💖 Submit Request with Hope'}
          </button>
        </div>
      </form>

      <div className="form-footer">
        <p><strong>💕 What happens next?</strong></p>
        <ul>
          <li>💌 Your request will be shared with our loving volunteer community</li>
          <li>🤝 Caring volunteers will see your request and reach out to help</li>
          <li>💖 You'll receive support from compassionate community members</li>
          <li>🔒 All personal information is kept secure and handled with utmost care</li>
        </ul>
      </div>

      {/* Community Support Section */}
      <div className="community-support">
        <div className="support-content">
          <div className="support-text">
            <h3>💗 You're Not Alone</h3>
            <p>Our community is here to support you with kindness and care. Together, we create a network of friendship and mutual help.</p>
          </div>
          <div className="support-image">
            <img src={hommieImage2} alt="Community members supporting each other" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;