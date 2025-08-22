import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiServices from '../services/api.service';
import { SecureTokenStorage } from '../utils/auth.utils';
import businessAPI from '../services/businessAPI';
import EnhancedOnboarding from './BusinessOnboarding/EnhancedOnboarding';
import styles from './BusinessOnboarding.module.css';
import { API_CONFIG } from '../config/api.config';
import {
  RiBuildingLine,
  RiBarChartLine,
  RiHeartLine,
  RiFolderLine,
  RiFocusLine,
  RiCheckLine,
  RiFileLine,
  RiAlertLine,
  RiArrowRightLine,
  RiSparklingLine
} from 'react-icons/ri';

// Lightweight ABN search input (moved from EnhancedOnboarding)
const ABNSearchInput = ({ value, onChangeText, onSelect }) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastAt, setLastAt] = useState(0);
  const inputRef = useRef(null);
  const API_BASE_URL = API_CONFIG.BASE_URL;

  useEffect(() => { setQuery(value || ''); }, [value]);

  const fetchResults = async (term) => {
    if (!term || term.length < 2) { setResults([]); setShow(false); return; }
    const now = Date.now();
    const since = now - lastAt;
    const minInterval = 800;
    if (since < minInterval) await new Promise(r => setTimeout(r, minInterval - since));
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/business/enhanced-onboarding/abn-search?name=${encodeURIComponent(term)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setShow(true);
      } else {
        setResults([]); setShow(false);
      }
    } catch { setResults([]); setShow(false); }
    finally { setLoading(false); setLastAt(Date.now()); }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchResults(query), 500);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChangeText && onChangeText(e.target.value); }}
        placeholder="Start typing to search Australian businesses..."
        autoComplete="off"
        className={styles.input}
        aria-label="Company Name"
        onFocus={() => { if (results.length) setShow(true); }}
      />
      {loading && <div className={styles.searchingIndicator}>Searching...</div>}
      {show && results.length > 0 && (
        <div className={styles.abnSearchResults} tabIndex={-1} onMouseDown={(e) => e.preventDefault()}>
          <div className={styles.resultsHeader}>Select your business from the Australian Business Register:</div>
          {results.map((r, idx) => (
            <div key={`${r.abn}-${idx}`} className={styles.abnResult}
                 onMouseDown={(e) => e.preventDefault()}
                 onClick={() => { onSelect && onSelect(r.businessName || r.tradingName, r.abn); setShow(false); inputRef.current && inputRef.current.focus(); }}>
              <div className={styles.businessName}>{r.businessName || r.tradingName}</div>
              <div className={styles.businessDetails}>ABN: {r.abn} • {r.state} {r.postcode}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const BusinessOnboarding = () => {
  const navigate = useNavigate();
  const { getAuthHeaders, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [useEnhancedOnboarding, setUseEnhancedOnboarding] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    abn: '',
    website: '',
    industry: '',
    country: 'Australia',
    additionalContext: '',
    // Step 1: Business Profile
    companyDescription: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    billingEmail: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    annualGivingBudget: 10000,

    // Step 2: CSR Report
    csrReportFile: null,
    csrReportData: null,
    givingScore: null,

    // Step 3: Primary Charities
    primaryCharities: [],

    // Step 4: Charity Portfolio
    charityPortfolio: [],
    suggestedCharities: []
  });

  const steps = [
    { id: 1, title: 'Business Profile', icon: <RiBuildingLine /> },
    { id: 2, title: 'CSR Report', icon: <RiBarChartLine /> },
    { id: 3, title: 'Primary Charities', icon: <RiHeartLine /> },
    { id: 4, title: 'Charity Portfolio', icon: <RiFolderLine /> }
  ];

  const handleNext = async () => {
    // Special handling for step 3 - submit primary charities and get suggestions
    if (currentStep === 3) {
      try {
        setLoading(true);
        const response = await businessAPI.onboarding.selectPrimaryCharities(formData.primaryCharities);
        
        // Save suggestions to formData
        setFormData(prev => ({
          ...prev,
          suggestedCharities: response.data.similarCharitySuggestions || []
        }));
        
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error('Failed to submit primary charities:', error);
        setError('Failed to save primary charities. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (addressType, field, value) => {
    setFormData(prev => ({
      ...prev,
      [addressType]: {
        ...prev[addressType],
        [field]: value
      }
    }));
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if we have a valid token
    const token = SecureTokenStorage.getToken();
    const userType = localStorage.getItem('userType');
    
    if (!token) {
      setError('You must be logged in as a business to upload CSR reports');
      return;
    }

    if (userType !== 'business') {
      setError('Only business accounts can upload CSR reports');
      return;
    }

    setFormData(prev => ({ ...prev, csrReportFile: file }));
    setLoading(true);
    setError(null);

    try {
      const response = await businessAPI.onboarding.uploadCSRReport(file);

      setFormData(prev => ({
        ...prev,
        csrReportData: response.data.extractedData,
        givingScore: response.data.givingScore
      }));
    } catch (err) {
      setError('Failed to upload CSR report. Please try again.');
      console.error('CSR upload error:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare the complete onboarding data - transform customerTypes to match backend schema
      // Targeting config will be handled in campaign creation
      const onboardingData = {};
      
      await businessAPI.onboarding.complete(onboardingData);

      navigate('/business-dashboard');
    } catch (err) {
      setError('Failed to complete onboarding. Please try again.');
      console.error('Onboarding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseEnhancedOnboarding = () => {
    setUseEnhancedOnboarding(true);
  };

  const handleEnhancedComplete = (data) => {
    // Handle the completed enhanced onboarding data
    setFormData(prev => ({
      ...prev,
      csrReportData: data.confirmedData,
      givingScore: data.confirmedData?.csrActivities?.givingScore || null
    }));
    setUseEnhancedOnboarding(false);
    setCurrentStep(3); // Move to primary charities step
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BusinessProfileStep formData={formData} onChange={handleInputChange} onAddressChange={handleAddressChange} />;
      case 2:
        return <CSRReportStep 
          formData={formData} 
          onFileUpload={handleFileUpload} 
          uploadProgress={uploadProgress} 
          loading={loading}
          onUseEnhanced={handleUseEnhancedOnboarding}
        />;
      case 3:
        return <PrimaryCharitiesStep formData={formData} onChange={handleInputChange} />;
      case 4:
        return <CharityPortfolioStep formData={formData} onChange={handleInputChange} />;
      default:
        return null;
    }
  };

  // If using enhanced onboarding, show that instead
  if (useEnhancedOnboarding) {
    return (
      <EnhancedOnboarding 
        businessId={user?._id || user?.id || localStorage.getItem('businessId')}
        initialCompanyData={{
          companyName: formData.companyName,
          abn: formData.abn,
          website: formData.website,
          industry: formData.industry,
          country: formData.country,
          additionalContext: formData.additionalContext
        }}
        defaultStep={'ai-research-form'}
        onComplete={handleEnhancedComplete}
        onSkip={() => { setUseEnhancedOnboarding(false); navigate('/business-dashboard'); }}
      />
    );
  }

  return (
    <div className={styles.onboardingContainer}>
      <div className={styles.progressBar}>
        <div className={styles.progressSteps}>
          <div 
            className={styles.progressLine} 
            style={{'--progress': `${((currentStep - 1) / (steps.length - 1)) * 100}%`}}
          />
          {steps.map((step, index) => (
            <div key={step.id} className={styles.progressStep}>
              <div 
                className={`${styles.stepCircle} ${currentStep === step.id ? styles.active : ''} ${currentStep > step.id ? styles.completed : ''}`}
                onClick={() => currentStep > step.id && setCurrentStep(step.id)}
              >
                <span className={styles.stepIcon}>{step.icon}</span>
              </div>
              <span className={`${styles.stepTitle} ${currentStep === step.id ? styles.active : ''}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.contentContainer}>
        <h2 className={styles.stepHeading}>{steps[currentStep - 1].title}</h2>
        <p className={styles.stepSubheading}>
          {currentStep === 1 && 'Tell us about your business and contact information'}
          {currentStep === 2 && 'Upload your CSR report to unlock AI-powered charity matching'}
          {currentStep === 3 && 'Select charities that align with your company values'}
          {currentStep === 4 && 'Build your personalized charity portfolio'}
        </p>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {renderStepContent()}

        <div className={styles.navigationButtons}>
          {currentStep > 1 && (
            <button 
              className={styles.previousButton}
              onClick={handlePrevious}
              disabled={loading}
            >
              ← Previous
            </button>
          )}
          
          <button 
            className={styles.nextButton}
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? 'Processing...' : currentStep === 4 ? 'Complete Setup' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 1: Business Profile Component
const BusinessProfileStep = ({ formData, onChange, onAddressChange }) => {
  return (
    <div className={styles.stepContent}>
      <div className={styles.formGroup}>
        <label>Company Name</label>
        <ABNSearchInput 
          value={formData.companyName}
          onSelect={(name, abn) => {
            onChange('companyName', name);
            onChange('abn', abn);
          }}
          onChangeText={(v) => onChange('companyName', v)}
        />
        {formData.abn && (
          <small>ABN selected: {formData.abn}</small>
        )}
      </div>

      <div className={styles.formGroup}>
        <label>Company Website</label>
        <input
          type="url"
          id="website"
          name="website"
          value={formData.website}
          onChange={(e) => onChange('website', e.target.value)}
          placeholder="https://www.example.com"
          className={styles.input}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Industry</label>
          <select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={(e) => onChange('industry', e.target.value)}
            className={styles.input}
            aria-label="Industry"
          >
            <option value="">Select Industry</option>
            <option value="Retail">Retail</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance & Banking</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Construction">Construction</option>
            <option value="Energy">Energy & Utilities</option>
            <option value="Telecommunications">Telecommunications</option>
            <option value="Transportation">Transportation</option>
            <option value="Hospitality">Hospitality & Tourism</option>
            <option value="Education">Education</option>
            <option value="Professional Services">Professional Services</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Country</label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={(e) => onChange('country', e.target.value)}
            className={styles.input}
            aria-label="Country"
          >
            <option value="Australia">Australia</option>
            <option value="New Zealand">New Zealand</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Additional Context (Optional)</label>
        <textarea
          id="additionalContext"
          name="additionalContext"
          value={formData.additionalContext}
          onChange={(e) => onChange('additionalContext', e.target.value)}
          placeholder="Any specific information about your CSR activities, charity partnerships, or focus areas..."
          rows={3}
          className={styles.textarea}
        />
      </div>
      <div className={styles.formGroup}>
        <label>Company Description</label>
        <textarea
          id="companyDescription"
          name="companyDescription"
          value={formData.companyDescription}
          onChange={(e) => onChange('companyDescription', e.target.value)}
          placeholder="Tell us about your company and its mission..."
          rows={4}
          className={styles.textarea}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Phone Number</label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => onChange('phoneNumber', e.target.value)}
          placeholder="+1 (555) 123-4567"
          className={styles.input}
        />
      </div>

      <div className={styles.addressSection}>
        <h3>Company Address</h3>
        <div className={styles.addressGrid}>
          <input
            type="text"
            id="addressStreet"
            name="addressStreet"
            placeholder="Street Address"
            value={formData.address.street}
            onChange={(e) => onAddressChange('address', 'street', e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            id="addressCity"
            name="addressCity"
            placeholder="City"
            value={formData.address.city}
            onChange={(e) => onAddressChange('address', 'city', e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            id="addressState"
            name="addressState"
            placeholder="State/Province"
            value={formData.address.state}
            onChange={(e) => onAddressChange('address', 'state', e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            id="addressZipCode"
            name="addressZipCode"
            placeholder="ZIP/Postal Code"
            value={formData.address.zipCode}
            onChange={(e) => onAddressChange('address', 'zipCode', e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            id="addressCountry"
            name="addressCountry"
            placeholder="Country"
            value={formData.address.country}
            onChange={(e) => onAddressChange('address', 'country', e.target.value)}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Billing Email</label>
        <input
          type="email"
          id="billingEmail"
          name="billingEmail"
          value={formData.billingEmail}
          onChange={(e) => onChange('billingEmail', e.target.value)}
          placeholder="billing@company.com"
          className={styles.input}
        />
      </div>

      <div className={styles.addressSection}>
        <h3>Billing Address</h3>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            id="sameAsCompanyAddress"
            name="sameAsCompanyAddress"
            onChange={(e) => {
              if (e.target.checked) {
                onChange('billingAddress', formData.address);
              }
            }}
          />
          Same as company address
        </label>
        <div className={styles.addressGrid}>
          <input
            type="text"
            id="billingStreet"
            name="billingStreet"
            placeholder="Street Address"
            value={formData.billingAddress.street}
            onChange={(e) => onAddressChange('billingAddress', 'street', e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            id="billingCity"
            name="billingCity"
            placeholder="City"
            value={formData.billingAddress.city}
            onChange={(e) => onAddressChange('billingAddress', 'city', e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            id="billingState"
            name="billingState"
            placeholder="State/Province"
            value={formData.billingAddress.state}
            onChange={(e) => onAddressChange('billingAddress', 'state', e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            id="billingZipCode"
            name="billingZipCode"
            placeholder="ZIP/Postal Code"
            value={formData.billingAddress.zipCode}
            onChange={(e) => onAddressChange('billingAddress', 'zipCode', e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            id="billingCountry"
            name="billingCountry"
            placeholder="Country"
            value={formData.billingAddress.country}
            onChange={(e) => onAddressChange('billingAddress', 'country', e.target.value)}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Annual Giving Budget</label>
        <div className={styles.budgetInput}>
          <span className={styles.currencySymbol}>$</span>
          <input
            type="number"
            id="annualGivingBudget"
            name="annualGivingBudget"
            value={formData.annualGivingBudget}
            onChange={(e) => onChange('annualGivingBudget', parseInt(e.target.value) || 0)}
            min="0"
            step="1000"
            className={styles.input}
          />
        </div>
        <input
          type="range"
          id="annualGivingBudgetSlider"
          name="annualGivingBudgetSlider"
          value={formData.annualGivingBudget}
          onChange={(e) => onChange('annualGivingBudget', parseInt(e.target.value))}
          min="0"
          max="1000000"
          step="1000"
          className={styles.slider}
          aria-label="Annual Giving Budget Slider"
        />
        <div className={styles.sliderLabels}>
          <span>$0</span>
          <span>$500K</span>
          <span>$1M</span>
        </div>
      </div>
    </div>
  );
};

// Step 2: CSR Report Component
const CSRReportStep = ({ formData, onFileUpload, uploadProgress, loading, onUseEnhanced }) => {
  return (
    <div className={styles.stepContent}>
      <div className={styles.enhancedOption}>
        <div className={styles.enhancedCard}>
          <RiSparklingLine className={styles.enhancedIcon} />
          <h3>New: AI-Powered Setup</h3>
          <p>Let AI research your company's CSR data automatically</p>
          <button 
            className={styles.enhancedButton}
            onClick={onUseEnhanced}
          >
            Try Enhanced Setup
          </button>
          <button 
            className={styles.secondaryButton}
            onClick={(e) => {
              e.preventDefault();
              // Allow skipping CSR/AI for now
              window.location.href = '/business-dashboard';
            }}
            style={{ marginLeft: 12 }}
          >
            Skip For Now
          </button>
        </div>
        <div className={styles.dividerOr}>
          <span>OR</span>
        </div>
      </div>
      
      <div className={styles.uploadSection}>
        <div className={styles.uploadBox}>
          <input
            type="file"
            accept=".pdf"
            onChange={onFileUpload}
            id="csr-upload"
            className={styles.fileInput}
          />
          <label htmlFor="csr-upload" className={styles.uploadLabel}>
            <div className={styles.uploadIcon}><RiFileLine /></div>
            <h3>Upload CSR Report</h3>
            <p>Drag and drop your PDF here or click to browse</p>
            <p className={styles.uploadHint}>Accepted format: PDF (max 10MB)</p>
          </label>
        </div>

        {loading && (
          <div className={styles.progressContainer}>
            <div className={styles.uploadProgressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p>Uploading and analysing report... {uploadProgress}%</p>
          </div>
        )}

        {formData.givingScore !== null && (
          <div className={styles.scoreContainer}>
            <h3>Your Giving Score</h3>
            <div className={styles.scoreCircle}>
              <span className={styles.scoreNumber}>{formData.givingScore}</span>
              <span className={styles.scoreLabel}>/ 100</span>
            </div>
            <p className={styles.scoreDescription}>
              Based on your CSR report, your company demonstrates strong commitment to social responsibility.
            </p>
          </div>
        )}

        {formData.csrReportData && (
          <div className={styles.extractedData}>
            <h3>Extracted Information</h3>
            <div className={styles.dataGrid}>
              {Object.entries(formData.csrReportData).map(([key, value]) => (
                <div key={key} className={styles.dataItem}>
                  <span className={styles.dataLabel}>{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className={styles.dataValue}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Step 3: Primary Charities Component
const PrimaryCharitiesStep = ({ formData, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    fetchCharities();
  }, []);

  // Add search functionality when user types
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    
    const timeout = setTimeout(() => {
      if (searchTerm.length >= 2) {
        fetchCharities(searchTerm);
      }
    }, 500); // Debounce for 500ms
    
    setSearchTimeout(timeout);
    
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const fetchCharities = async (searchQuery = '') => {
    setLoading(true);
    try {
      // Use the new Australian charity database endpoint
      const api = apiServices.client;
      const response = await api.get('/api/business/onboarding/search-charities', {
        params: { query: searchQuery || 'charity', limit: 50, offset: 0 }
      });
      setCharities(response.data.charities || []);
    } catch (error) {
      console.error('Failed to fetch charities:', error);
      setCharities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCharitySelect = (charity) => {
    // Use ABN as the unique identifier for Australian charities
    const charityIdentifier = charity.ABN || charity._id || charity.id;
    const exists = formData.primaryCharities.find(c => 
      c.charityABN === charity.ABN || c.charityId === charityIdentifier
    );
    
    if (!exists) {
      onChange('primaryCharities', [...formData.primaryCharities, {
        charityId: charity._id || charity.id,
        charityABN: charity.ABN,
        charityName: charity.name || charity.Charity_Legal_Name || charity.charityName,
        legalName: charity.Charity_Legal_Name,
        category: charity.Main_Activity || charity.category,
        state: charity.State || charity.state,
        supportLevel: 'regular',
        annualCommitment: 10000,
        causes: [] // Will be populated based on charity activities
      }]);
    }
  };

  const handleCharityUpdate = (charityIdentifier, field, value) => {
    const updated = formData.primaryCharities.map(charity => 
      (charity.charityABN === charityIdentifier || charity.charityId === charityIdentifier)
        ? { ...charity, [field]: value }
        : charity
    );
    onChange('primaryCharities', updated);
  };

  const handleCharityRemove = (charityIdentifier) => {
    const filtered = formData.primaryCharities.filter(c => 
      c.charityABN !== charityIdentifier && c.charityId !== charityIdentifier
    );
    onChange('primaryCharities', filtered);
  };

  const filteredCharities = charities.filter(charity => {
    if (!charity) return false;
    const charityName = charity.name || charity.Charity_Legal_Name || charity.charityName || '';
    return charityName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className={styles.stepContent}>
      <div className={styles.charitySearch}>
        <input
          type="text"
          id="charitySearch"
          name="charitySearch"
          placeholder="Search charities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
          aria-label="Search charities"
        />
      </div>

      {loading ? (
        <div className={styles.loading}>Loading charities...</div>
      ) : (
        <div className={styles.charityList}>
          {filteredCharities.map(charity => {
            const charityKey = charity.ABN || charity._id;
            const isSelected = formData.primaryCharities.find(c => 
              c.charityABN === charity.ABN || c.charityId === charityKey
            );
            
            return (
              <div key={charityKey} className={styles.charityItem}>
                <div className={styles.charityInfo}>
                  <h4>{charity.name || charity.Charity_Legal_Name || charity.charityName}</h4>
                  <div className={styles.charityMeta}>
                    {charity.ABN && <span className={styles.abn}>ABN: {charity.ABN}</span>}
                    {charity.category && <span className={styles.category}>{charity.category}</span>}
                    {charity.state && <span className={styles.location}>{charity.state}</span>}
                  </div>
                  <div className={styles.charityBadges}>
                    {charity.advancingEducation && <span className={styles.badge}>Education</span>}
                    {charity.advancingHealth && <span className={styles.badge}>Health</span>}
                    {charity.advancingWelfare && <span className={styles.badge}>Welfare</span>}
                    {charity.advancingReligion && <span className={styles.badge}>Religion</span>}
                    {charity.advancingCulture && <span className={styles.badge}>Culture</span>}
                    {charity.advancingEnvironment && <span className={styles.badge}>Environment</span>}
                  </div>
                  {charity.website && (
                    <a href={charity.website} target="_blank" rel="noopener noreferrer" className={styles.website}>
                      Visit Website
                    </a>
                  )}
                </div>
                <button
                  className={styles.addButton}
                  onClick={() => handleCharitySelect(charity)}
                  disabled={isSelected}
                >
                  {isSelected ? 'Added' : 'Add'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {formData.primaryCharities.length > 0 && (
        <div className={styles.selectedCharities}>
          <h3>Selected Charities</h3>
          {formData.primaryCharities.map(charity => {
            const charityKey = charity.charityABN || charity.charityId;
            return (
              <div key={charityKey} className={styles.selectedCharity}>
                <div className={styles.charityHeader}>
                  <h4>{charity.charityName || charity.name}</h4>
                  {charity.charityABN && <span className={styles.abn}>ABN: {charity.charityABN}</span>}
                  <button
                    className={styles.removeButton}
                    onClick={() => handleCharityRemove(charityKey)}
                  >
                    Remove
                  </button>
                </div>
              <div className={styles.charitySettings}>
                <div className={styles.settingGroup}>
                  <label>Support Level</label>
                  <select
                    id={`supportLevel-${charityKey}`}
                    name={`supportLevel-${charityKey}`}
                    value={charity.supportLevel}
                    onChange={(e) => handleCharityUpdate(charityKey, 'supportLevel', e.target.value)}
                    className={styles.select}
                    aria-label="Support Level"
                  >
                    <option value="major">Major Partner</option>
                    <option value="regular">Regular Partner</option>
                    <option value="occasional">Occasional Support</option>
                  </select>
                </div>
                <div className={styles.settingGroup}>
                  <label>Annual Commitment</label>
                  <div className={styles.currencyInput}>
                    <span>$</span>
                    <input
                      type="number"
                      id={`annualCommitment-${charityKey}`}
                      name={`annualCommitment-${charityKey}`}
                      value={charity.annualCommitment}
                      onChange={(e) => handleCharityUpdate(charityKey, 'annualCommitment', parseInt(e.target.value) || 0)}
                      min="0"
                      step="1000"
                      aria-label="Annual Commitment"
                    />
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Step 4: Charity Portfolio Component
const CharityPortfolioStep = ({ formData, onChange }) => {
  const [suggestedCharities, setSuggestedCharities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuggestedCharities();
  }, []);

  const fetchSuggestedCharities = async () => {
    setLoading(true);
    try {
      // The backend returns suggestions when we submit primary charities
      // We should have already received them in the previous step
      // For now, if we don't have them, we can re-submit the primary charities
      if (!formData.suggestedCharities || formData.suggestedCharities.length === 0) {
        const response = await businessAPI.onboarding.selectPrimaryCharities(formData.primaryCharities);
        setSuggestedCharities(response.data.similarCharitySuggestions || []);
        // Also save to formData for persistence
        onChange('suggestedCharities', response.data.similarCharitySuggestions || []);
      } else {
        setSuggestedCharities(formData.suggestedCharities);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      // Continue without suggestions
      setSuggestedCharities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCharity = (charity) => {
    // Handle both ABN and _id based charities
    const charityWithIdentifier = {
      ...charity,
      charityABN: charity.ABN,
      charityId: charity._id || charity.id
    };
    onChange('charityPortfolio', [...formData.charityPortfolio, charityWithIdentifier]);
    
    // Filter by ABN or _id
    const charityIdentifier = charity.ABN || charity._id;
    setSuggestedCharities(suggestedCharities.filter(c => 
      (c.ABN && c.ABN !== charity.ABN) || (c._id && c._id !== charity._id)
    ));
  };

  const handleRejectCharity = (charityIdentifier) => {
    setSuggestedCharities(suggestedCharities.filter(c => 
      (c.ABN && c.ABN !== charityIdentifier) && (c._id && c._id !== charityIdentifier)
    ));
  };

  const categories = [
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'health', name: 'Health', icon: '🏥' },
    { id: 'environment', name: 'Environment', icon: '🌱' },
    { id: 'social-justice', name: 'Social Justice', icon: '⚖️' },
    { id: 'humanitarian', name: 'Humanitarian', icon: '🤝' },
    { id: 'animal-welfare', name: 'Animal Welfare', icon: '🐾' },
    { id: 'arts-culture', name: 'Arts & Culture', icon: '🎨' }
  ];

  return (
    <div className={styles.stepContent}>
      <div className={styles.portfolioSection}>
        <h3>AI-Suggested Similar Charities</h3>
        <p className={styles.sectionDescription}>
          Based on your selected primary charities, we recommend these similar organizations:
        </p>
        
        {loading ? (
          <div className={styles.loading}>Finding similar charities...</div>
        ) : (
          <div className={styles.suggestedList}>
            {suggestedCharities.map(charity => {
              const charityKey = charity.ABN || charity._id;
              return (
              <div key={charityKey} className={styles.suggestedCharity}>
                <div className={styles.charityContent}>
                  <h4>{charity.name || charity.Charity_Legal_Name || charity.charityName}</h4>
                  <p>{charity.description || charity.Description || ''}</p>
                  <div className={styles.charityMeta}>
                    <span className={styles.similarityScore}>
                      {charity.similarityScore}% match
                    </span>
                    <span className={styles.category}>{charity.category}</span>
                  </div>
                </div>
                <div className={styles.charityActions}>
                  <button
                    className={styles.acceptButton}
                    onClick={() => handleAcceptCharity(charity)}
                  >
                    Accept
                  </button>
                  <button
                    className={styles.rejectButton}
                    onClick={() => handleRejectCharity(charity.ABN || charity._id)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      <div className={styles.portfolioSection}>
        <h3>Category-Based Charity Groups</h3>
        <p className={styles.sectionDescription}>
          Select categories to automatically include relevant charities in your portfolio:
        </p>
        
        <div className={styles.categoryGrid}>
          {categories.map(category => (
            <div 
              key={category.id} 
              className={`${styles.categoryCard} ${formData.charityPortfolio.find(c => c.category === category.id) ? styles.selected : ''}`}
              onClick={() => {
                const exists = formData.charityPortfolio.find(c => c.category === category.id);
                if (!exists) {
                  onChange('charityPortfolio', [...formData.charityPortfolio, { category: category.id, name: category.name }]);
                } else {
                  onChange('charityPortfolio', formData.charityPortfolio.filter(c => c.category !== category.id));
                }
              }}
            >
              <span className={styles.categoryIcon}>{category.icon}</span>
              <span className={styles.categoryName}>{category.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.portfolioSummary}>
        <h3>Your Charity Portfolio</h3>
        <div className={styles.portfolioStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{formData.primaryCharities.length}</span>
            <span className={styles.statLabel}>Primary Charities</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{formData.charityPortfolio.filter(c => c._id || c.charityABN).length}</span>
            <span className={styles.statLabel}>Additional Charities</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{formData.charityPortfolio.filter(c => c.category).length}</span>
            <span className={styles.statLabel}>Categories Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Removed Step 5: Targeting Configuration - now handled in campaign creation
/* const TargetingConfigStep = ({ formData, onChange }) => {
  const handleCustomerTypeChange = (type) => {
    onChange('targetingConfig', {
      ...formData.targetingConfig,
      customerTypes: {
        ...formData.targetingConfig.customerTypes,
        [type]: !formData.targetingConfig.customerTypes[type]
      }
    });
  };

  const handleGeographyChange = (type, value) => {
    onChange('targetingConfig', {
      ...formData.targetingConfig,
      geography: {
        ...formData.targetingConfig.geography,
        [type]: value
      }
    });
  };

  const handleDonationRangeChange = (index, field, value) => {
    const updatedRanges = [...formData.targetingConfig.donationRanges];
    updatedRanges[index] = {
      ...updatedRanges[index],
      [field]: field === 'multiplier' ? parseFloat(value) : parseInt(value)
    };
    onChange('targetingConfig', {
      ...formData.targetingConfig,
      donationRanges: updatedRanges
    });
  };

  const addDonationRange = () => {
    onChange('targetingConfig', {
      ...formData.targetingConfig,
      donationRanges: [
        ...formData.targetingConfig.donationRanges,
        { min: 0, max: 100, multiplier: 2 }
      ]
    });
  };

  const removeDonationRange = (index) => {
    const filtered = formData.targetingConfig.donationRanges.filter((_, i) => i !== index);
    onChange('targetingConfig', {
      ...formData.targetingConfig,
      donationRanges: filtered
    });
  };

  return (
    <div className={styles.stepContent}>
      <div className={styles.targetingSection}>
        <h3>Customer Type Targeting</h3>
        <p className={styles.sectionDescription}>
          Select which types of customers you want to target with matching campaigns:
        </p>
        
        <div className={styles.customerTypes}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.targetingConfig.customerTypes.highValue}
              onChange={() => handleCustomerTypeChange('highValue')}
            />
            <span className={styles.checkboxText}>
              <strong>High-Value Customers</strong>
              <span className={styles.checkboxDescription}>Customers with high lifetime value</span>
            </span>
          </label>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.targetingConfig.customerTypes.frequent}
              onChange={() => handleCustomerTypeChange('frequent')}
            />
            <span className={styles.checkboxText}>
              <strong>Frequent Customers</strong>
              <span className={styles.checkboxDescription}>Regular repeat customers</span>
            </span>
          </label>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.targetingConfig.customerTypes.new}
              onChange={() => handleCustomerTypeChange('new')}
            />
            <span className={styles.checkboxText}>
              <strong>New Customers</strong>
              <span className={styles.checkboxDescription}>First-time customers</span>
            </span>
          </label>
        </div>
      </div>

      <div className={styles.targetingSection}>
        <h3>Geographic Targeting</h3>
        <p className={styles.sectionDescription}>
          Define where your matching campaigns should be active:
        </p>
        
        <div className={styles.geographyInputs}>
          <div className={styles.formGroup}>
            <label>Countries</label>
            <input
              type="text"
              placeholder="e.g., USA, Canada, UK (comma-separated)"
              value={formData.targetingConfig.geography.countries.join(', ')}
              onChange={(e) => handleGeographyChange('countries', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>States/Provinces</label>
            <input
              type="text"
              placeholder="e.g., CA, NY, TX (comma-separated)"
              value={formData.targetingConfig.geography.states.join(', ')}
              onChange={(e) => handleGeographyChange('states', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
              className={styles.input}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Cities</label>
            <input
              type="text"
              placeholder="e.g., New York, Los Angeles, Chicago (comma-separated)"
              value={formData.targetingConfig.geography.cities.join(', ')}
              onChange={(e) => handleGeographyChange('cities', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
              className={styles.input}
            />
          </div>
        </div>
      </div>

      <div className={styles.targetingSection}>
        <h3>Donation Range Multipliers</h3>
        <p className={styles.sectionDescription}>
          Set different matching multipliers based on donation amounts:
        </p>
        
        <div className={styles.donationRanges}>
          {formData.targetingConfig.donationRanges.map((range, index) => (
            <div key={index} className={styles.rangeRow}>
              <div className={styles.rangeInputs}>
                <div className={styles.rangeInput}>
                  <label>Min ($)</label>
                  <input
                    type="number"
                    value={range.min}
                    onChange={(e) => handleDonationRangeChange(index, 'min', e.target.value)}
                    min="0"
                  />
                </div>
                <div className={styles.rangeInput}>
                  <label>Max ($)</label>
                  <input
                    type="number"
                    value={range.max}
                    onChange={(e) => handleDonationRangeChange(index, 'max', e.target.value)}
                    min="0"
                  />
                </div>
                <div className={styles.rangeInput}>
                  <label>Multiplier</label>
                  <input
                    type="number"
                    value={range.multiplier}
                    onChange={(e) => handleDonationRangeChange(index, 'multiplier', e.target.value)}
                    min="1"
                    max="10"
                    step="0.5"
                  />
                </div>
              </div>
              {formData.targetingConfig.donationRanges.length > 1 && (
                <button
                  className={styles.removeRangeButton}
                  onClick={() => removeDonationRange(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <button
            className={styles.addRangeButton}
            onClick={addDonationRange}
          >
            Add Another Range
          </button>
        </div>
      </div>

      <div className={styles.targetingSummary}>
        <h3>Targeting Summary</h3>
        <p>Your matching campaigns will target:</p>
        <ul>
          <li>
            Customer Types: {
              Object.entries(formData.targetingConfig.customerTypes)
                .filter(([_, enabled]) => enabled)
                .map(([type]) => type.charAt(0).toUpperCase() + type.slice(1))
                .join(', ') || 'None selected'
            }
          </li>
          <li>
            Locations: {
              [
                ...formData.targetingConfig.geography.countries,
                ...formData.targetingConfig.geography.states,
                ...formData.targetingConfig.geography.cities
              ].join(', ') || 'All locations'
            }
          </li>
          <li>
            {formData.targetingConfig.donationRanges.length} donation range{formData.targetingConfig.donationRanges.length !== 1 ? 's' : ''} configured
          </li>
        </ul>
      </div>
    </div>
  );
}; */

export default BusinessOnboarding;
