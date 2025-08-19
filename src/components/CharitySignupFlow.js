import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CHARITY_CATEGORIES, formatABN } from '../constants/charityCategories';
import { 
  RiUserLine, 
  RiBuildingLine, 
  RiMailLine, 
  RiLockLine, 
  RiPhoneLine,
  RiGlobalLine,
  RiMapPinLine,
  RiCheckboxCircleLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiLoader4Line,
  RiSearchLine
} from 'react-icons/ri';
import styles from './CharitySignupFlow.module.css';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api.config';

const CharitySignupFlow = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // ACNC charity search states
  const [charitySearchTerm, setCharitySearchTerm] = useState('');
  const [charitySearchResults, setCharitySearchResults] = useState([]);
  const [searchingCharity, setSearchingCharity] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState(null);
  
  // Address autocomplete states
  const [addressSearchTerm, setAddressSearchTerm] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [searchingAddress, setSearchingAddress] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    charityName: '',
    contactEmail: '',
    password: '',
    confirmPassword: '',
    contactPhone: '',
    
    // Step 2: Organization Details
    category: '',
    website: '',
    description: '',
    missionStatement: '',
    foundedYear: '',
    
    // Step 3: Address & Legal
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Australia'
    },
    abn: '',
    registrationNumber: '',
    
    // Agreement
    termsAccepted: false,
    privacyAccepted: false
  });
  
  const [validation, setValidation] = useState({});
  const [categoryAutoSelected, setCategoryAutoSelected] = useState(false);
  
  const steps = [
    { number: 1, title: 'Basic Information', icon: RiUserLine },
    { number: 2, title: 'Organization Details', icon: RiBuildingLine },
    { number: 3, title: 'Address & Legal', icon: RiMapPinLine }
  ];
  
  // Use the same categories as the donation modal for consistency
  const categories = CHARITY_CATEGORIES;
  
  // Function to determine category from ACNC data
  const determineCategory = (record) => {
    // Combine all relevant fields for category determination
    const fields = [
      record.Charity_Type,
      record.Main_Activity,
      record.Advancing_Health,
      record.Advancing_Education,
      record.Advancing_Culture,
      record.Advancing_natual_environment,
      record.Purposes_beneficial_to_ther_general_public_and_other_analogous,
      record.Charity_Legal_Name
    ].filter(Boolean).join(' ').toLowerCase();
    
    // Check for specific categories based on ACNC fields
    if (fields.includes('health') || fields.includes('medical') || 
        fields.includes('hospital') || fields.includes('red cross')) {
      return 'Health Services';
    }
    if (fields.includes('mental health') || fields.includes('psychology') || 
        fields.includes('counselling')) {
      return 'Mental Health';
    }
    if (fields.includes('education') || fields.includes('school') || 
        fields.includes('university') || fields.includes('training')) {
      return 'Education';
    }
    if (fields.includes('environment') || fields.includes('conservation') || 
        fields.includes('climate') || fields.includes('sustainability')) {
      return 'Environmental Conservation';
    }
    if (fields.includes('social') || fields.includes('welfare') || 
        fields.includes('community')) {
      return 'Social Welfare';
    }
    if (fields.includes('emergency') || fields.includes('relief') || 
        fields.includes('disaster')) {
      return 'Emergency Relief';
    }
    if (fields.includes('food') || fields.includes('hunger') || 
        fields.includes('nutrition')) {
      return 'Food Security';
    }
    if (fields.includes('child') || fields.includes('youth') || 
        fields.includes('kids')) {
      return 'Child Welfare';
    }
    if (fields.includes('indigenous') || fields.includes('aboriginal') || 
        fields.includes('first nations')) {
      return 'Indigenous Support';
    }
    if (fields.includes('housing') || fields.includes('homeless') || 
        fields.includes('shelter')) {
      return 'Housing';
    }
    if (fields.includes('rural') || fields.includes('regional') || 
        fields.includes('remote')) {
      return 'Rural Support';
    }
    if (fields.includes('animal') || fields.includes('wildlife') || 
        fields.includes('pet')) {
      return 'Animal Welfare';
    }
    if (fields.includes('art') || fields.includes('culture') || 
        fields.includes('museum') || fields.includes('heritage')) {
      return 'Arts & Culture';
    }
    if (fields.includes('religious') || fields.includes('church') || 
        fields.includes('faith')) {
      return 'Religious';
    }
    if (fields.includes('disability') || fields.includes('disabled') || 
        fields.includes('accessibility')) {
      return 'Disability Support';
    }
    if (fields.includes('refugee') || fields.includes('asylum') || 
        fields.includes('migrant')) {
      return 'Refugee Support';
    }
    
    // Default category if no match
    return 'Community Building';
  };
  
  const australianStates = [
    'NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'
  ];
  
  // Search ACNC charity database using the same endpoint as CharitySearch component
  const searchACNCCharities = useCallback(async (searchTerm) => {
    if (searchTerm.length < 3) {
      setCharitySearchResults([]);
      return;
    }
    
    setSearchingCharity(true);
    try {
      // Use the public search-charities endpoint that doesn't require authentication
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/search-charities`,
        {
          params: { q: searchTerm }
        }
      );
      
      if (response.data?.result?.records) {
        // Map ACNC records to our format
        const charities = response.data.result.records.map(record => ({
          ABN: record.ABN,
          name: record.Charity_Legal_Name,
          state: record.State,
          postcode: record.Postcode,
          website: record.Charity_Website,
          category: determineCategory(record), // Determine category from ACNC data
          address: {
            street: record.Address_Line_1 || '',
            city: record.Town_City || '',
            state: record.State || '',
            postalCode: record.Postcode || ''
          }
        }));
        setCharitySearchResults(charities);
      } else {
        setCharitySearchResults([]);
      }
    } catch (error) {
      console.error('Error searching charities:', error);
      setCharitySearchResults([]);
    } finally {
      setSearchingCharity(false);
    }
  }, []);
  
  // Debounced charity search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (charitySearchTerm) {
        searchACNCCharities(charitySearchTerm);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [charitySearchTerm, searchACNCCharities]);
  
  // Australian address autocomplete using free service
  const searchAddresses = useCallback(async (searchTerm) => {
    if (searchTerm.length < 5) {
      setAddressSuggestions([]);
      return;
    }
    
    setSearchingAddress(true);
    try {
      // Using OpenStreetMap Nominatim for free address search
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: searchTerm + ', Australia',
          format: 'json',
          addressdetails: 1,
          limit: 5,
          countrycodes: 'au'
        }
      });
      
      const suggestions = response.data.map(result => ({
        display: result.display_name,
        street: result.address?.road || '',
        city: result.address?.city || result.address?.town || result.address?.suburb || '',
        state: result.address?.state || '',
        postcode: result.address?.postcode || ''
      }));
      
      setAddressSuggestions(suggestions);
    } catch (error) {
      console.error('Error searching addresses:', error);
    } finally {
      setSearchingAddress(false);
    }
  }, []);
  
  // Debounced address search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (addressSearchTerm) {
        searchAddresses(addressSearchTerm);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [addressSearchTerm, searchAddresses]);
  
  // Category determination is now handled by the API endpoint /api/charity-search/simple
  // which returns charities with properly mapped categories

  // Handle charity selection from ACNC search
  const handleCharitySelect = (charity) => {
    setSelectedCharity(charity);
    
    // Set flag if category was provided by the API
    if (charity.category) {
      setCategoryAutoSelected(true);
    }
    
    setFormData(prev => ({
      ...prev,
      charityName: charity.name,
      abn: formatABN(charity.ABN || ''),
      category: charity.category || '', // Use the category from the API
      website: charity.website || '',
      address: {
        ...prev.address,
        ...charity.address,
        country: 'Australia'
      }
    }));
    setCharitySearchTerm('');
    setCharitySearchResults([]);
  };
  
  // Handle address selection from autocomplete
  const handleAddressSelect = (address) => {
    setFormData(prev => ({
      ...prev,
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postcode,
        country: 'Australia'
      }
    }));
    setAddressSearchTerm('');
    setAddressSuggestions([]);
  };
  
  // formatABN is now imported from constants/charityCategories.js
  
  const validateStep = (stepNumber) => {
    const errors = {};
    
    switch (stepNumber) {
      case 1:
        if (!formData.charityName) errors.charityName = 'Charity name is required';
        if (!formData.contactEmail) {
          errors.contactEmail = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
          errors.contactEmail = 'Invalid email format';
        }
        if (!formData.password) {
          errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        break;
        
      case 2:
        if (!formData.category) errors.category = 'Category is required';
        if (!formData.description) {
          errors.description = 'Description is required';
        } else if (formData.description.length < 50) {
          errors.description = 'Description must be at least 50 characters';
        }
        if (!formData.missionStatement) {
          errors.missionStatement = 'Mission statement is required';
        } else if (formData.missionStatement.length < 100) {
          errors.missionStatement = 'Mission statement must be at least 100 characters';
        }
        break;
        
      case 3:
        if (!formData.address.street) errors.street = 'Street address is required';
        if (!formData.address.city) errors.city = 'City is required';
        if (!formData.address.state) errors.state = 'State is required';
        if (!formData.address.postalCode) errors.postalCode = 'Postcode is required';
        if (!formData.abn) errors.abn = 'ABN is required';
        if (!formData.termsAccepted) errors.terms = 'You must accept the terms and conditions';
        if (!formData.privacyAccepted) errors.privacy = 'You must accept the privacy policy';
        break;
    }
    
    setValidation(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If user manually changes category, clear the auto-selected flag
    if (name === 'category') {
      setCategoryAutoSelected(false);
    }
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name === 'abn') {
      // Format ABN as user types
      setFormData(prev => ({
        ...prev,
        abn: formatABN(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear validation error for this field
    if (validation[name]) {
      setValidation(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };
  
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Prepare data for submission
      const submitData = {
        charityName: formData.charityName,
        contactEmail: formData.contactEmail,
        password: formData.password,
        contactPhone: formData.contactPhone,
        category: formData.category,
        website: formData.website,
        description: formData.description,
        missionStatement: formData.missionStatement,
        foundedYear: formData.foundedYear,
        address: formData.address,
        taxId: formData.abn.replace(/\s/g, ''), // Backend expects taxId, remove spaces from ABN
        registrationNumber: formData.registrationNumber
      };
      
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/charities/signup`,
        submitData
      );
      
      setSuccess(true);
      
      // Store token if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userType', 'charity');
        localStorage.setItem('charityId', response.data.charityId);
        
        // Setup axios defaults with token
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Fetch the charity profile to set in auth context
        try {
          const profileResponse = await axios.get(
            `${API_CONFIG.BASE_URL}/api/charities/me`
          );
          
          // Set user in auth context with charity flag
          setUser({ ...profileResponse.data, isBusiness: false, isCharity: true });
        } catch (profileError) {
          console.error('Error fetching charity profile:', profileError);
          // Even if profile fetch fails, still set basic user info
          setUser({ 
            charityId: response.data.charityId,
            charityName: formData.charityName,
            contactEmail: formData.contactEmail,
            isBusiness: false, 
            isCharity: true 
          });
        }
        
        // Redirect to charity dashboard after 2 seconds
        setTimeout(() => {
          navigate('/charity-dashboard');
        }, 2000);
      } else {
        // If no token, redirect to login
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Signup error:', err);
      
      // Handle specific error messages
      if (err.response?.data?.missingFields) {
        setError(`Missing required fields: ${err.response.data.missingFields.join(', ')}`);
      } else {
        setError(err.response?.data?.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const renderProgressBar = () => (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          data-width={Math.round(((currentStep / 3) * 100) / 5) * 5}
        />
      </div>
      <div className={styles.steps}>
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          
          return (
            <div 
              key={step.number} 
              className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
            >
              <div className={styles.stepIcon}>
                {isCompleted ? <RiCheckboxCircleLine /> : <Icon />}
              </div>
              <span className={styles.stepTitle}>{step.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
  
  const renderStep1 = () => (
    <div className={styles.stepContent}>
      <h2>Let's get started with your basic information</h2>
      <p className={styles.stepDescription}>
        Search for your charity in the ACNC database or enter details manually.
      </p>
      
      {/* ACNC Charity Search */}
      <div className={styles.searchSection}>
        <div className={styles.formGroup}>
          <label>
            <RiSearchLine /> Search ACNC Charity Database
          </label>
          <input
            type="text"
            placeholder="Search by charity name or ABN..."
            value={charitySearchTerm}
            onChange={(e) => setCharitySearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchingCharity && (
            <div className={styles.searchingIndicator}>
              <RiLoader4Line className={styles.spinner} /> Searching...
            </div>
          )}
        </div>
        
        {charitySearchResults.length > 0 && (
          <div className={styles.searchResults}>
            {charitySearchResults.map((charity, index) => (
              <div 
                key={index} 
                className={styles.searchResult}
                onClick={() => handleCharitySelect(charity)}
              >
                <div className={styles.charityName}>{charity.name}</div>
                <div className={styles.charityDetails}>
                  ABN: {charity.ABN} | {charity.state} | {charity.category || 'No category'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedCharity && (
        <div className={styles.selectedCharity}>
          <RiCheckboxCircleLine /> Selected: {selectedCharity.name}
        </div>
      )}
      
      <div className={styles.formGroup}>
        <label htmlFor="charityName">
          <RiBuildingLine /> Charity Name *
        </label>
        <input
          type="text"
          id="charityName"
          name="charityName"
          value={formData.charityName}
          onChange={handleInputChange}
          placeholder="Enter your charity's official name"
          className={validation.charityName ? styles.error : ''}
        />
        {validation.charityName && (
          <span className={styles.errorText}>{validation.charityName}</span>
        )}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="contactEmail">
          <RiMailLine /> Contact Email *
        </label>
        <input
          type="email"
          id="contactEmail"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleInputChange}
          placeholder="primary@yourcharity.org.au"
          className={validation.contactEmail ? styles.error : ''}
        />
        {validation.contactEmail && (
          <span className={styles.errorText}>{validation.contactEmail}</span>
        )}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="contactPhone">
          <RiPhoneLine /> Contact Phone
        </label>
        <input
          type="tel"
          id="contactPhone"
          name="contactPhone"
          value={formData.contactPhone}
          onChange={handleInputChange}
          placeholder="02 1234 5678"
        />
      </div>
      
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="password">
            <RiLockLine /> Password *
          </label>
          <div className={styles.passwordRequirements}>
            <small>Password must contain:</small>
            <ul>
              <li>At least 12 characters</li>
              <li>One uppercase letter (A-Z)</li>
              <li>One lowercase letter (a-z)</li>
              <li>One number (0-9)</li>
              <li>One special character (@$!%*?&)</li>
            </ul>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Min. 12 characters"
            className={validation.password ? styles.error : ''}
          />
          {validation.password && (
            <span className={styles.errorText}>{validation.password}</span>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">
            <RiLockLine /> Confirm Password *
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Re-enter password"
            className={validation.confirmPassword ? styles.error : ''}
          />
          {validation.confirmPassword && (
            <span className={styles.errorText}>{validation.confirmPassword}</span>
          )}
        </div>
      </div>
    </div>
  );
  
  const renderStep2 = () => {
    return (
    <div className={styles.stepContent}>
      <h2>Tell us about your organization</h2>
      <p className={styles.stepDescription}>
        This information helps donors understand your mission and impact.
      </p>
      
      {categoryAutoSelected && formData.category && (
        <div style={{
          marginBottom: '20px', 
          padding: '12px 16px', 
          backgroundColor: '#e3f2fd', 
          border: '1px solid #90caf9',
          borderRadius: '8px',
          color: '#1565c0',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>ℹ️</span>
          <span>Category auto-selected from ACNC: <strong className="color-hex-0d47a1">{formData.category}</strong></span>
        </div>
      )}
      
      <div className={styles.formGroup}>
        <label htmlFor="category">
          Category *
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className={validation.category ? styles.error : ''}
        >
          <option value="">Select a category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {validation.category && (
          <span className={styles.errorText}>{validation.category}</span>
        )}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="website">
          <RiGlobalLine /> Website
        </label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          placeholder="https://yourcharity.org.au"
        />
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="foundedYear">
          Founded Year
        </label>
        <input
          type="number"
          id="foundedYear"
          name="foundedYear"
          value={formData.foundedYear}
          onChange={handleInputChange}
          placeholder="e.g., 2020"
          min="1800"
          max={new Date().getFullYear()}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="description">
          Brief Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="4"
          placeholder="A brief description of your charity (min. 50 characters)"
          className={validation.description ? styles.error : ''}
          maxLength="300"
        />
        <span className={styles.charCount}>
          {formData.description.length}/300 characters
        </span>
        {validation.description && (
          <span className={styles.errorText}>{validation.description}</span>
        )}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="missionStatement">
          Mission Statement *
        </label>
        <textarea
          id="missionStatement"
          name="missionStatement"
          value={formData.missionStatement}
          onChange={handleInputChange}
          rows="6"
          placeholder="Your charity's mission and vision (min. 100 characters)"
          className={validation.missionStatement ? styles.error : ''}
          maxLength="1000"
        />
        <span className={styles.charCount}>
          {formData.missionStatement.length}/1000 characters
        </span>
        {validation.missionStatement && (
          <span className={styles.errorText}>{validation.missionStatement}</span>
        )}
      </div>
    </div>
  );
  };
  
  const renderStep3 = () => (
    <div className={styles.stepContent}>
      <h2>Address and legal information</h2>
      <p className={styles.stepDescription}>
        We need this information for verification and legal compliance.
      </p>
      
      {/* Address Autocomplete */}
      <div className={styles.searchSection}>
        <div className={styles.formGroup}>
          <label>
            <RiSearchLine /> Search for Address
          </label>
          <input
            type="text"
            placeholder="Start typing your address..."
            value={addressSearchTerm}
            onChange={(e) => setAddressSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchingAddress && (
            <div className={styles.searchingIndicator}>
              <RiLoader4Line className={styles.spinner} /> Searching...
            </div>
          )}
        </div>
        
        {addressSuggestions.length > 0 && (
          <div className={styles.searchResults}>
            {addressSuggestions.map((address, index) => (
              <div 
                key={index} 
                className={styles.searchResult}
                onClick={() => handleAddressSelect(address)}
              >
                <div className={styles.addressDisplay}>{address.display}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="street">
          <RiMapPinLine /> Street Address *
        </label>
        <input
          type="text"
          id="street"
          name="address.street"
          value={formData.address.street}
          onChange={handleInputChange}
          placeholder="123 Main Street"
          className={validation.street ? styles.error : ''}
        />
        {validation.street && (
          <span className={styles.errorText}>{validation.street}</span>
        )}
      </div>
      
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="city">City/Suburb *</label>
          <input
            type="text"
            id="city"
            name="address.city"
            value={formData.address.city}
            onChange={handleInputChange}
            placeholder="Sydney"
            className={validation.city ? styles.error : ''}
          />
          {validation.city && (
            <span className={styles.errorText}>{validation.city}</span>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="state">State *</label>
          <select
            id="state"
            name="address.state"
            value={formData.address.state}
            onChange={handleInputChange}
            className={validation.state ? styles.error : ''}
          >
            <option value="">Select state</option>
            {australianStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {validation.state && (
            <span className={styles.errorText}>{validation.state}</span>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="postalCode">Postcode *</label>
          <input
            type="text"
            id="postalCode"
            name="address.postalCode"
            value={formData.address.postalCode}
            onChange={handleInputChange}
            placeholder="2000"
            maxLength="4"
            className={validation.postalCode ? styles.error : ''}
          />
          {validation.postalCode && (
            <span className={styles.errorText}>{validation.postalCode}</span>
          )}
        </div>
      </div>
      
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="abn">ABN (Australian Business Number) *</label>
          <input
            type="text"
            id="abn"
            name="abn"
            value={formData.abn}
            onChange={handleInputChange}
            placeholder="12 345 678 901"
            maxLength="14"
            className={validation.abn ? styles.error : ''}
          />
          {validation.abn && (
            <span className={styles.errorText}>{validation.abn}</span>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="registrationNumber">
            ACNC Registration Number
          </label>
          <input
            type="text"
            id="registrationNumber"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleInputChange}
            placeholder="Optional"
          />
        </div>
      </div>
      
      <div className={styles.agreements}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            name="termsAccepted"
            checked={formData.termsAccepted}
            onChange={handleInputChange}
          />
          <span>
            I accept the <a href="/terms" target="_blank">Terms and Conditions</a> *
          </span>
        </label>
        {validation.terms && (
          <span className={styles.errorText}>{validation.terms}</span>
        )}
        
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            name="privacyAccepted"
            checked={formData.privacyAccepted}
            onChange={handleInputChange}
          />
          <span>
            I accept the <a href="/privacy" target="_blank">Privacy Policy</a> *
          </span>
        </label>
        {validation.privacy && (
          <span className={styles.errorText}>{validation.privacy}</span>
        )}
      </div>
    </div>
  );
  
  if (success) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.successContainer}>
          <RiCheckboxCircleLine className={styles.successIcon} />
          <h1>Registration Successful!</h1>
          <p>Your charity account has been created successfully.</p>
          <p>A verification email has been sent to {formData.contactEmail}</p>
          <p>Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <div className={styles.header}>
          <img src={logo} alt="Logo" className={styles.logo} />
          <h1>Charity Registration</h1>
        </div>
        
        {renderProgressBar()}
        
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        
        <form className={styles.form}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          
          <div className={styles.navigation}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className={styles.previousButton}
              >
                <RiArrowLeftLine /> Previous
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className={styles.nextButton}
              >
                Next <RiArrowRightLine />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? (
                  <>
                    <RiLoader4Line className={styles.spinner} />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            )}
          </div>
        </form>
        
        <div className={styles.footer}>
          <p>
            Already have an account? <a href="/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CharitySignupFlow;