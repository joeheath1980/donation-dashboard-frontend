import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import businessAPI from '../services/businessAPI';
import styles from './BusinessCreateCampaign.module.css';
import {
  RiEditLine,
  RiMoneyDollarCircleLine,
  RiHeartLine,
  RiFocusLine,
  RiRocketLine,
  RiCheckLine,
  RiAddLine
} from 'react-icons/ri';

function BusinessCreateCampaign() {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  
  const [currentSection, setCurrentSection] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [portfolioCharities, setPortfolioCharities] = useState([]);
  const [budgetAllocation, setBudgetAllocation] = useState(0);
  
  const [campaignData, setCampaignData] = useState({
    // Basic Information
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'all', // all, employee, customer
    
    // Budget Allocation
    totalBudget: '',
    matchingRules: {
      defaultMultiplier: 2,
      maxMatchPerDonation: 100,
      maxMatchPerUser: 1000
    },
    
    // Charity Selection
    selectedCharities: [], // Array of charity IDs from portfolio
    charityAllocation: 'equal', // equal, custom
    customAllocations: {}, // { charityId: percentage }
    
    // Targeting Rules
    targetingRules: {
      userTypes: {
        newUsers: false,
        returningUsers: true,
        highValueUsers: false,
        frequentUsers: false
      },
      geography: {
        enabled: false,
        countries: [],
        states: [],
        cities: []
      },
      donationRanges: [
        { min: 0, max: 50, multiplier: 3 },
        { min: 50, max: 200, multiplier: 2 },
        { min: 200, max: 1000, multiplier: 1.5 }
      ],
      timeRestrictions: {
        enabled: false,
        daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
        hoursOfDay: { start: 9, end: 17 } // 9 AM to 5 PM
      }
    },
    
    // Campaign Goals
    goals: {
      targetMatches: 1000,
      targetUsers: 500,
      targetImpact: 'Provide clean water to 100 families'
    }
  });

  useEffect(() => {
    fetchPortfolioCharities();
  }, []);

  const fetchPortfolioCharities = async () => {
    try {
      const response = await businessAPI.portfolio.get();
      setPortfolioCharities(response.data.charities || []);
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
      // Use dummy data for now
      setPortfolioCharities([
        { _id: '1', name: 'Red Cross', category: 'humanitarian', score: 92 },
        { _id: '2', name: 'UNICEF', category: 'children', score: 95 },
        { _id: '3', name: 'WWF', category: 'environment', score: 88 },
        { _id: '4', name: 'Doctors Without Borders', category: 'health', score: 94 }
      ]);
    }
  };

  const sections = [
    { id: 'basic', title: 'Basic Information', icon: <RiEditLine /> },
    { id: 'budget', title: 'Budget Allocation', icon: <RiMoneyDollarCircleLine /> },
    { id: 'charities', title: 'Charity Selection', icon: <RiHeartLine /> },
    { id: 'targeting', title: 'Targeting Rules', icon: <RiFocusLine /> },
    { id: 'preview', title: 'Preview & Launch', icon: <RiRocketLine /> }
  ];

  const handleInputChange = (field, value) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setCampaignData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const calculateBudgetPercentage = () => {
    if (!campaignData.totalBudget) return 0;
    const totalBudget = parseFloat(campaignData.totalBudget);
    const estimatedUsage = campaignData.selectedCharities.length * 
      (totalBudget / portfolioCharities.length) * 0.8; // 80% utilization estimate
    return Math.min(100, Math.round((estimatedUsage / totalBudget) * 100));
  };

  const handleCharityToggle = (charityId) => {
    const isSelected = campaignData.selectedCharities.includes(charityId);
    if (isSelected) {
      setCampaignData(prev => ({
        ...prev,
        selectedCharities: prev.selectedCharities.filter(id => id !== charityId)
      }));
    } else {
      setCampaignData(prev => ({
        ...prev,
        selectedCharities: [...prev.selectedCharities, charityId]
      }));
    }
  };

  const handleDonationRangeChange = (index, field, value) => {
    const updatedRanges = [...campaignData.targetingRules.donationRanges];
    updatedRanges[index] = {
      ...updatedRanges[index],
      [field]: field === 'multiplier' ? parseFloat(value) : parseInt(value)
    };
    setCampaignData(prev => ({
      ...prev,
      targetingRules: {
        ...prev.targetingRules,
        donationRanges: updatedRanges
      }
    }));
  };

  const addDonationRange = () => {
    setCampaignData(prev => ({
      ...prev,
      targetingRules: {
        ...prev.targetingRules,
        donationRanges: [
          ...prev.targetingRules.donationRanges,
          { min: 0, max: 100, multiplier: 2 }
        ]
      }
    }));
  };

  const removeDonationRange = (index) => {
    setCampaignData(prev => ({
      ...prev,
      targetingRules: {
        ...prev.targetingRules,
        donationRanges: prev.targetingRules.donationRanges.filter((_, i) => i !== index)
      }
    }));
  };

  const validateSection = (section) => {
    switch (section) {
      case 'basic':
        return campaignData.name && campaignData.description && 
               campaignData.startDate && campaignData.endDate;
      case 'budget':
        return campaignData.totalBudget && parseFloat(campaignData.totalBudget) > 0;
      case 'charities':
        return campaignData.selectedCharities.length > 0;
      case 'targeting':
        return campaignData.targetingRules.donationRanges.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    const sectionIndex = sections.findIndex(s => s.id === currentSection);
    if (sectionIndex < sections.length - 1) {
      if (validateSection(currentSection)) {
        setCurrentSection(sections[sectionIndex + 1].id);
        setError('');
      } else {
        setError('Please complete all required fields before proceeding.');
      }
    }
  };

  const handlePrevious = () => {
    const sectionIndex = sections.findIndex(s => s.id === currentSection);
    if (sectionIndex > 0) {
      setCurrentSection(sections[sectionIndex - 1].id);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await businessAPI.campaigns.create(campaignData);
      if (response.status === 201) {
        navigate('/business-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create campaign. Please try again.');
      console.error('Error creating campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderSectionContent = () => {
    switch (currentSection) {
      case 'basic':
        return <BasicInfoSection data={campaignData} onChange={handleInputChange} />;
      case 'budget':
        return <BudgetSection data={campaignData} onChange={handleInputChange} onNestedChange={handleNestedChange} />;
      case 'charities':
        return <CharitySelectionSection 
          data={campaignData} 
          portfolioCharities={portfolioCharities}
          onCharityToggle={handleCharityToggle}
          onChange={handleInputChange}
        />;
      case 'targeting':
        return <TargetingRulesSection 
          data={campaignData} 
          onChange={handleInputChange}
          onNestedChange={handleNestedChange}
          onDonationRangeChange={handleDonationRangeChange}
          onAddRange={addDonationRange}
          onRemoveRange={removeDonationRange}
        />;
      case 'preview':
        return <PreviewSection data={campaignData} portfolioCharities={portfolioCharities} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Create New Campaign</h1>

        {/* Progress Indicator */}
        <div className={styles.progressBar}>
          {sections.map((section, index) => (
            <div key={section.id} className={styles.progressStep}>
              <div 
                className={`${styles.stepCircle} ${
                  currentSection === section.id ? styles.active : ''
                } ${sections.findIndex(s => s.id === currentSection) > index ? styles.completed : ''}`}
                onClick={() => sections.findIndex(s => s.id === currentSection) > index && setCurrentSection(section.id)}
              >
                <span className={styles.stepIcon}>{section.icon}</span>
              </div>
              <span className={styles.stepTitle}>{section.title}</span>
              {index < sections.length - 1 && (
                <div className={`${styles.stepLine} ${
                  sections.findIndex(s => s.id === currentSection) > index ? styles.completed : ''
                }`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {renderSectionContent()}

          <div className={styles.navigationButtons}>
            {currentSection !== 'basic' && (
              <button
                type="button"
                className={styles.previousButton}
                onClick={handlePrevious}
              >
                Previous
              </button>
            )}
            
            {currentSection !== 'preview' ? (
              <button
                type="button"
                className={styles.nextButton}
                onClick={handleNext}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Creating Campaign...' : 'Launch Campaign'}
              </button>
            )}
          </div>
        </form>

        <div className={styles.links}>
          <Link to="/business-dashboard" className={styles.link}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

// Section Components
const BasicInfoSection = ({ data, onChange }) => {
  return (
    <div className={styles.sectionContent}>
      <h2>Basic Information</h2>
      
      <div className={styles.formGroup}>
        <label htmlFor="name">Campaign Name</label>
        <input
          type="text"
          id="name"
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          required
          className={styles.input}
          placeholder="e.g., Holiday Giving Campaign 2024"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={data.description}
          onChange={(e) => onChange('description', e.target.value)}
          required
          className={styles.textarea}
          placeholder="Describe your campaign goals and what makes it special..."
          rows={4}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Campaign Type</label>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="all"
              checked={data.type === 'all'}
              onChange={(e) => onChange('type', e.target.value)}
            />
            <span>All Users</span>
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="employee"
              checked={data.type === 'employee'}
              onChange={(e) => onChange('type', e.target.value)}
            />
            <span>Employees Only</span>
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="customer"
              checked={data.type === 'customer'}
              onChange={(e) => onChange('type', e.target.value)}
            />
            <span>Customers Only</span>
          </label>
        </div>
      </div>

      <div className={styles.dateGroup}>
        <div className={styles.formGroup}>
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            value={data.startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
            required
            className={styles.input}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            value={data.endDate}
            onChange={(e) => onChange('endDate', e.target.value)}
            required
            className={styles.input}
            min={data.startDate || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
    </div>
  );
};

const BudgetSection = ({ data, onChange, onNestedChange }) => {
  const budgetPercentage = Math.min(100, (data.totalBudget / 100000) * 100);
  
  return (
    <div className={styles.sectionContent}>
      <h2>Budget Allocation</h2>
      
      <div className={styles.budgetVisualization}>
        <div className={styles.budgetCircle}>
          <svg viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="12"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#007bff"
              strokeWidth="12"
              strokeDasharray={`${budgetPercentage * 5.65} 565`}
              strokeDashoffset="0"
              transform="rotate(-90 100 100)"
              className={styles.budgetProgress}
            />
            <text x="100" y="100" textAnchor="middle" className={styles.budgetText}>
              ${data.totalBudget ? parseInt(data.totalBudget).toLocaleString() : '0'}
            </text>
          </svg>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="totalBudget">Total Campaign Budget ($)</label>
        <input
          type="number"
          id="totalBudget"
          value={data.totalBudget}
          onChange={(e) => onChange('totalBudget', e.target.value)}
          required
          min="100"
          step="100"
          className={styles.input}
          placeholder="e.g., 50000"
        />
        <p className={styles.helperText}>
          This is the maximum amount you're willing to match for this campaign.
        </p>
      </div>

      <div className={styles.matchingRulesSection}>
        <h3>Matching Rules</h3>
        
        <div className={styles.formGroup}>
          <label htmlFor="defaultMultiplier">Default Match Multiplier</label>
          <select
            id="defaultMultiplier"
            value={data.matchingRules.defaultMultiplier}
            onChange={(e) => onNestedChange('matchingRules', 'defaultMultiplier', parseFloat(e.target.value))}
            className={styles.select}
          >
            <option value="1">1x (Dollar for dollar)</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x (Double the donation)</option>
            <option value="3">3x (Triple the donation)</option>
            <option value="4">4x</option>
            <option value="5">5x</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="maxMatchPerDonation">Maximum Match Per Donation ($)</label>
          <input
            type="number"
            id="maxMatchPerDonation"
            value={data.matchingRules.maxMatchPerDonation}
            onChange={(e) => onNestedChange('matchingRules', 'maxMatchPerDonation', parseInt(e.target.value))}
            min="10"
            step="10"
            className={styles.input}
          />
          <p className={styles.helperText}>
            Caps the match amount for any single donation.
          </p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="maxMatchPerUser">Maximum Match Per User ($)</label>
          <input
            type="number"
            id="maxMatchPerUser"
            value={data.matchingRules.maxMatchPerUser}
            onChange={(e) => onNestedChange('matchingRules', 'maxMatchPerUser', parseInt(e.target.value))}
            min="50"
            step="50"
            className={styles.input}
          />
          <p className={styles.helperText}>
            Limits total matching funds per unique user during the campaign.
          </p>
        </div>
      </div>
    </div>
  );
};

const CharitySelectionSection = ({ data, portfolioCharities, onCharityToggle, onChange }) => {
  const selectedCount = data.selectedCharities.length;
  
  return (
    <div className={styles.sectionContent}>
      <h2>Select Charities</h2>
      <p className={styles.sectionDescription}>
        Choose which charities from your portfolio to include in this campaign.
      </p>

      <div className={styles.charityStats}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{selectedCount}</span>
          <span className={styles.statLabel}>Selected</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{portfolioCharities.length}</span>
          <span className={styles.statLabel}>Available</span>
        </div>
      </div>

      <div className={styles.charityGrid}>
        {portfolioCharities.map(charity => (
          <div
            key={charity._id}
            className={`${styles.charityCard} ${
              data.selectedCharities.includes(charity._id) ? styles.selected : ''
            }`}
            onClick={() => onCharityToggle(charity._id)}
          >
            <div className={styles.charityHeader}>
              <h3>{charity.name}</h3>
              <div className={styles.charityScore}>
                <span className={styles.scoreValue}>{charity.score}</span>
                <span className={styles.scoreLabel}>Score</span>
              </div>
            </div>
            <p className={styles.charityCategory}>{charity.category}</p>
            <div className={styles.selectionIndicator}>
              {data.selectedCharities.includes(charity._id) ? <RiCheckLine /> : <RiAddLine />}
            </div>
          </div>
        ))}
      </div>

      {selectedCount > 0 && (
        <div className={styles.allocationSection}>
          <h3>Budget Allocation Method</h3>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="equal"
                checked={data.charityAllocation === 'equal'}
                onChange={(e) => onChange('charityAllocation', e.target.value)}
              />
              <span>Equal distribution across all selected charities</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="custom"
                checked={data.charityAllocation === 'custom'}
                onChange={(e) => onChange('charityAllocation', e.target.value)}
              />
              <span>Custom allocation percentages</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

const TargetingRulesSection = ({ data, onChange, onNestedChange, onDonationRangeChange, onAddRange, onRemoveRange }) => {
  return (
    <div className={styles.sectionContent}>
      <h2>Targeting Rules</h2>
      
      <div className={styles.targetingSection}>
        <h3>User Types</h3>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={data.targetingRules.userTypes.newUsers}
              onChange={(e) => onNestedChange('targetingRules', 'userTypes', {
                ...data.targetingRules.userTypes,
                newUsers: e.target.checked
              })}
            />
            <span>New Users (First-time donors)</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={data.targetingRules.userTypes.returningUsers}
              onChange={(e) => onNestedChange('targetingRules', 'userTypes', {
                ...data.targetingRules.userTypes,
                returningUsers: e.target.checked
              })}
            />
            <span>Returning Users</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={data.targetingRules.userTypes.highValueUsers}
              onChange={(e) => onNestedChange('targetingRules', 'userTypes', {
                ...data.targetingRules.userTypes,
                highValueUsers: e.target.checked
              })}
            />
            <span>High-Value Users (Top 20% donors)</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={data.targetingRules.userTypes.frequentUsers}
              onChange={(e) => onNestedChange('targetingRules', 'userTypes', {
                ...data.targetingRules.userTypes,
                frequentUsers: e.target.checked
              })}
            />
            <span>Frequent Users (Monthly donors)</span>
          </label>
        </div>
      </div>

      <div className={styles.targetingSection}>
        <h3>Donation Range Multipliers</h3>
        <p className={styles.sectionDescription}>
          Set different match rates based on donation amounts.
        </p>
        
        <div className={styles.donationRanges}>
          {data.targetingRules.donationRanges.map((range, index) => (
            <div key={index} className={styles.rangeRow}>
              <div className={styles.rangeInputs}>
                <div className={styles.rangeInput}>
                  <label>Min ($)</label>
                  <input
                    type="number"
                    value={range.min}
                    onChange={(e) => onDonationRangeChange(index, 'min', e.target.value)}
                    min="0"
                  />
                </div>
                <div className={styles.rangeInput}>
                  <label>Max ($)</label>
                  <input
                    type="number"
                    value={range.max}
                    onChange={(e) => onDonationRangeChange(index, 'max', e.target.value)}
                    min="0"
                  />
                </div>
                <div className={styles.rangeInput}>
                  <label>Multiplier</label>
                  <select
                    value={range.multiplier}
                    onChange={(e) => onDonationRangeChange(index, 'multiplier', e.target.value)}
                  >
                    <option value="1">1x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2x</option>
                    <option value="3">3x</option>
                    <option value="4">4x</option>
                    <option value="5">5x</option>
                  </select>
                </div>
              </div>
              {data.targetingRules.donationRanges.length > 1 && (
                <button
                  type="button"
                  className={styles.removeRangeButton}
                  onClick={() => onRemoveRange(index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            className={styles.addRangeButton}
            onClick={onAddRange}
          >
            Add Another Range
          </button>
        </div>
      </div>

      <div className={styles.targetingSection}>
        <h3>Geographic Targeting (Optional)</h3>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={data.targetingRules.geography.enabled}
            onChange={(e) => onNestedChange('targetingRules', 'geography', {
              ...data.targetingRules.geography,
              enabled: e.target.checked
            })}
          />
          <span>Enable geographic targeting</span>
        </label>
        
        {data.targetingRules.geography.enabled && (
          <div className={styles.geographyInputs}>
            <input
              type="text"
              placeholder="Countries (comma-separated)"
              value={data.targetingRules.geography.countries.join(', ')}
              onChange={(e) => onNestedChange('targetingRules', 'geography', {
                ...data.targetingRules.geography,
                countries: e.target.value.split(',').map(s => s.trim()).filter(s => s)
              })}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="States/Provinces (comma-separated)"
              value={data.targetingRules.geography.states.join(', ')}
              onChange={(e) => onNestedChange('targetingRules', 'geography', {
                ...data.targetingRules.geography,
                states: e.target.value.split(',').map(s => s.trim()).filter(s => s)
              })}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Cities (comma-separated)"
              value={data.targetingRules.geography.cities.join(', ')}
              onChange={(e) => onNestedChange('targetingRules', 'geography', {
                ...data.targetingRules.geography,
                cities: e.target.value.split(',').map(s => s.trim()).filter(s => s)
              })}
              className={styles.input}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const PreviewSection = ({ data, portfolioCharities }) => {
  const selectedCharities = portfolioCharities.filter(c => 
    data.selectedCharities.includes(c._id)
  );
  
  const calculateEstimatedReach = () => {
    const baseReach = 1000;
    const multiplier = data.type === 'all' ? 1 : 0.5;
    const charityBonus = selectedCharities.length * 0.1;
    return Math.round(baseReach * multiplier * (1 + charityBonus));
  };
  
  return (
    <div className={styles.sectionContent}>
      <h2>Campaign Preview</h2>
      
      <div className={styles.previewCard}>
        <h3>{data.name}</h3>
        <p className={styles.previewDescription}>{data.description}</p>
        
        <div className={styles.previewGrid}>
          <div className={styles.previewItem}>
            <span className={styles.previewLabel}>Duration</span>
            <span className={styles.previewValue}>
              {data.startDate && data.endDate ? 
                `${new Date(data.startDate).toLocaleDateString()} - ${new Date(data.endDate).toLocaleDateString()}` : 
                'Not set'
              }
            </span>
          </div>
          
          <div className={styles.previewItem}>
            <span className={styles.previewLabel}>Total Budget</span>
            <span className={styles.previewValue}>${parseInt(data.totalBudget || 0).toLocaleString()}</span>
          </div>
          
          <div className={styles.previewItem}>
            <span className={styles.previewLabel}>Target Audience</span>
            <span className={styles.previewValue}>
              {data.type === 'all' ? 'All Users' : data.type === 'employee' ? 'Employees' : 'Customers'}
            </span>
          </div>
          
          <div className={styles.previewItem}>
            <span className={styles.previewLabel}>Default Multiplier</span>
            <span className={styles.previewValue}>{data.matchingRules.defaultMultiplier}x</span>
          </div>
        </div>
        
        <div className={styles.previewSection}>
          <h4>Selected Charities ({selectedCharities.length})</h4>
          <div className={styles.previewCharities}>
            {selectedCharities.map(charity => (
              <div key={charity._id} className={styles.previewCharity}>
                {charity.name}
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.previewSection}>
          <h4>Matching Rules</h4>
          <ul className={styles.previewList}>
            <li>Max match per donation: ${data.matchingRules.maxMatchPerDonation}</li>
            <li>Max match per user: ${data.matchingRules.maxMatchPerUser}</li>
            <li>{data.targetingRules.donationRanges.length} donation range{data.targetingRules.donationRanges.length !== 1 ? 's' : ''} configured</li>
          </ul>
        </div>
        
        <div className={styles.estimatedImpact}>
          <h4>Estimated Impact</h4>
          <div className={styles.impactGrid}>
            <div className={styles.impactItem}>
              <span className={styles.impactNumber}>{calculateEstimatedReach()}</span>
              <span className={styles.impactLabel}>Potential Donors</span>
            </div>
            <div className={styles.impactItem}>
              <span className={styles.impactNumber}>{selectedCharities.length * 50}</span>
              <span className={styles.impactLabel}>Expected Matches</span>
            </div>
            <div className={styles.impactItem}>
              <span className={styles.impactNumber}>${(parseInt(data.totalBudget || 0) * 0.8).toLocaleString()}</span>
              <span className={styles.impactLabel}>Projected Distribution</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.launchCheckbox}>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" required />
          <span>I have reviewed all campaign details and am ready to launch</span>
        </label>
      </div>
    </div>
  );
};

export default BusinessCreateCampaign;