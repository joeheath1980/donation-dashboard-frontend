import React, { useState, useEffect } from 'react';
import { businessAccountService } from '../../../services/businessAccountService';
import { toast } from 'react-toastify';
import styles from './CompanyProfile.module.css';

function CompanyProfile({ data, profileSettings, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    website: '',
    industry: '',
    size: '',
    logo: '',
    socialMedia: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: ''
    },
    preferredCauses: [],
    billingEmail: '',
    billingAddress: '',
    profileSettings: {
      isPublic: true,
      showContactInfo: true,
      showFinancialInfo: false,
      showCampaigns: true,
      showImpactMetrics: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        description: data.description || '',
        phone: data.phone || '',
        address: data.address || '',
        website: data.website || '',
        industry: data.industry || '',
        size: data.size || '',
        logo: data.logo || '',
        socialMedia: data.socialMedia || {
          linkedin: '',
          twitter: '',
          facebook: '',
          instagram: ''
        },
        preferredCauses: data.preferredCauses || [],
        billingEmail: data.billingEmail || '',
        billingAddress: data.billingAddress || '',
        profileSettings: profileSettings || {
          isPublic: true,
          showContactInfo: true,
          showFinancialInfo: false,
          showCampaigns: true,
          showImpactMetrics: true
        }
      });
    }
  }, [data, profileSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: checked
        }
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Company name is required';
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await businessAccountService.updateCompanyProfile(formData);
      toast.success('Company profile updated successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating company profile:', error);
      toast.error('Failed to update company profile');
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Retail',
    'Manufacturing',
    'Education',
    'Real Estate',
    'Construction',
    'Media',
    'Consulting',
    'Non-profit',
    'Other'
  ];

  const companySizes = [
    { value: 'small', label: 'Small (1-50 employees)' },
    { value: 'medium', label: 'Medium (51-200 employees)' },
    { value: 'large', label: 'Large (201-1000 employees)' },
    { value: 'enterprise', label: 'Enterprise (1000+ employees)' }
  ];

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div className={styles.section}>
          <h2>Basic Information</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="name">Company Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? styles.error : ''}
              required
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Company Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us about your company..."
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="industry">Industry</label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
              >
                <option value="">Select Industry</option>
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="size">Company Size</label>
              <select
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
              >
                <option value="">Select Size</option>
                {companySizes.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Contact Information</h2>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="website">Website</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://www.example.com"
                className={errors.website ? styles.error : ''}
              />
              {errors.website && <span className={styles.errorText}>{errors.website}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address">Business Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, City, State 12345"
            />
          </div>
        </div>

        <div className={styles.section}>
          <h2>Social Media</h2>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="socialMedia.linkedin">LinkedIn</label>
              <input
                type="url"
                id="socialMedia.linkedin"
                name="socialMedia.linkedin"
                value={formData.socialMedia.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/..."
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="socialMedia.twitter">Twitter</label>
              <input
                type="url"
                id="socialMedia.twitter"
                name="socialMedia.twitter"
                value={formData.socialMedia.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/..."
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="socialMedia.facebook">Facebook</label>
              <input
                type="url"
                id="socialMedia.facebook"
                name="socialMedia.facebook"
                value={formData.socialMedia.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/..."
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="socialMedia.instagram">Instagram</label>
              <input
                type="url"
                id="socialMedia.instagram"
                name="socialMedia.instagram"
                value={formData.socialMedia.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Profile Visibility</h2>
          
          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                name="profileSettings.isPublic"
                checked={formData.profileSettings.isPublic}
                onChange={handleCheckboxChange}
              />
              <span>Make profile public</span>
            </label>
            
            <label>
              <input
                type="checkbox"
                name="profileSettings.showContactInfo"
                checked={formData.profileSettings.showContactInfo}
                onChange={handleCheckboxChange}
              />
              <span>Show contact information</span>
            </label>
            
            <label>
              <input
                type="checkbox"
                name="profileSettings.showFinancialInfo"
                checked={formData.profileSettings.showFinancialInfo}
                onChange={handleCheckboxChange}
              />
              <span>Show financial information</span>
            </label>
            
            <label>
              <input
                type="checkbox"
                name="profileSettings.showCampaigns"
                checked={formData.profileSettings.showCampaigns}
                onChange={handleCheckboxChange}
              />
              <span>Show campaigns</span>
            </label>
            
            <label>
              <input
                type="checkbox"
                name="profileSettings.showImpactMetrics"
                checked={formData.profileSettings.showImpactMetrics}
                onChange={handleCheckboxChange}
              />
              <span>Show impact metrics</span>
            </label>
          </div>
        </div>

        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.saveButton}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CompanyProfile;