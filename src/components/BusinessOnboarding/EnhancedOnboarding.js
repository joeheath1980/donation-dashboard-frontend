import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EnhancedOnboarding.module.css';
import {
  RiSearchLine,
  RiUploadCloudLine,
  RiEditLine,
  RiCheckLine,
  RiAlertLine,
  RiArrowRightLine,
  RiBuilding2Line,
  RiGlobalLine,
  RiCalendarLine,
  RiHandHeartLine,
  RiTrophyLine,
  RiLeafLine,
  RiSparklingLine
} from 'react-icons/ri';

const EnhancedOnboarding = ({ businessId, onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('choose-method');
  const [loading, setLoading] = useState(false);
  const [researchData, setResearchData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    industry: '',
    country: 'Australia',
    additionalContext: '',
    abn: ''
  });
  const [editedData, setEditedData] = useState(null);
  const [abnSearchResults, setAbnSearchResults] = useState([]);
  const [searchingABN, setSearchingABN] = useState(false);
  const [showABNResults, setShowABNResults] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002';

  // Get the actual business ID from props or localStorage
  const getBusinessId = () => {
    if (businessId) return businessId;
    // Fallback to localStorage
    const storedBusinessId = localStorage.getItem('businessId');
    if (storedBusinessId) return storedBusinessId;
    // If still no ID, log warning
    console.warn('No business ID found');
    return null;
  };

  const effectiveBusinessId = getBusinessId();

  // Get auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Track progress
  useEffect(() => {
    if (effectiveBusinessId) {
      fetchProgress();
    }
  }, [effectiveBusinessId]);

  const fetchProgress = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/business/enhanced-onboarding/progress/${effectiveBusinessId}`,
        { headers: getAuthHeaders() }
      );
      if (response.ok) {
        const data = await response.json();
        setProgress(data.overall || 0);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  // Search for Australian businesses by name
  const searchBusinessByName = async (searchTerm) => {
    if (searchTerm.length < 2) {
      setAbnSearchResults([]);
      setShowABNResults(false);
      return;
    }

    setSearchingABN(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/business/enhanced-onboarding/abn-search?name=${encodeURIComponent(searchTerm)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setAbnSearchResults(data.results || []);
        setShowABNResults(true);
      }
    } catch (error) {
      console.error('Error searching ABN:', error);
    } finally {
      setSearchingABN(false);
    }
  };

  // Select a business from ABN search results
  const selectBusiness = async (business) => {
    setFormData({
      ...formData,
      companyName: business.businessName || business.tradingName,
      abn: business.abn
    });
    setShowABNResults(false);
    
    // Fetch full details
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/business/enhanced-onboarding/abn-details/${encodeURIComponent(business.abn)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Auto-fill additional fields if available
        if (data.mappedData) {
          setFormData(prev => ({
            ...prev,
            companyName: data.mappedData.name || prev.companyName,
            abn: data.mappedData.abn || prev.abn,
            // You can map more fields as needed
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching ABN details:', error);
    }
  };

  // Debounced search for Australian businesses
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.companyName && formData.country === 'Australia') {
        searchBusinessByName(formData.companyName);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.companyName, formData.country]);

  // Step 1: Method Selection
  const MethodSelection = () => (
    <div className={styles.methodSelection}>
      <div className={styles.header}>
        <h2>How would you like to set up your CSR profile?</h2>
        <p>Choose the method that works best for you. You can always add more data later.</p>
      </div>

      <div className={styles.methodCards}>
        <div 
          className={styles.methodCard}
          onClick={() => handleMethodSelect('ai-research')}
        >
          <div className={styles.methodIcon}>
            <RiSearchLine />
          </div>
          <h3>AI Research</h3>
          <p>Let AI research your company's public CSR data and charity partnerships</p>
          <div className={styles.methodBenefits}>
            <span><RiCheckLine /> 5-minute setup</span>
            <span><RiCheckLine /> Automatic discovery</span>
            <span><RiCheckLine /> Verified data</span>
          </div>
          <div className={styles.recommendedBadge}>
            <RiSparklingLine /> Recommended
          </div>
        </div>

        <div 
          className={styles.methodCard}
          onClick={() => handleMethodSelect('upload-document')}
        >
          <div className={styles.methodIcon}>
            <RiUploadCloudLine />
          </div>
          <h3>Upload CSR Report</h3>
          <p>Upload your existing CSR or sustainability report for AI parsing</p>
          <div className={styles.methodBenefits}>
            <span><RiCheckLine /> Accurate data</span>
            <span><RiCheckLine /> AI extraction</span>
            <span><RiCheckLine /> Full detail</span>
          </div>
        </div>

        <div 
          className={styles.methodCard}
          onClick={() => handleMethodSelect('manual-entry')}
        >
          <div className={styles.methodIcon}>
            <RiEditLine />
          </div>
          <h3>Manual Entry</h3>
          <p>Skip automated setup and enter your CSR data manually</p>
          <div className={styles.methodBenefits}>
            <span><RiCheckLine /> Full control</span>
            <span><RiCheckLine /> Add as you go</span>
            <span><RiCheckLine /> Privacy focused</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: AI Research Form
  const AIResearchForm = () => (
    <div className={styles.aiResearchForm}>
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => setStep('choose-method')}
        >
          ← Back
        </button>
        <h2>Company Details for AI Research</h2>
        <p>Provide some basic information to help AI research your CSR activities</p>
      </div>

      <form onSubmit={handleAIResearch} className={styles.form}>
        <div className={styles.formGroup}>
          <label>
            <RiBuilding2Line />
            Company Name *
          </label>
          <div className={styles.abnSearchWrapper}>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              placeholder={formData.country === 'Australia' ? "Start typing to search Australian businesses..." : "e.g., Coles Supermarkets"}
              required
              autoComplete="off"
            />
            {formData.country === 'Australia' && searchingABN && (
              <div className={styles.searchingIndicator}>Searching...</div>
            )}
            {formData.country === 'Australia' && showABNResults && abnSearchResults.length > 0 && (
              <div className={styles.abnSearchResults}>
                <div className={styles.resultsHeader}>
                  Select your business from the Australian Business Register:
                </div>
                {abnSearchResults.map((business, index) => (
                  <div
                    key={index}
                    className={styles.abnResult}
                    onClick={() => selectBusiness(business)}
                  >
                    <div className={styles.businessName}>
                      {business.businessName || business.tradingName}
                    </div>
                    <div className={styles.businessDetails}>
                      ABN: {business.abn} • {business.state} {business.postcode}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <small>
            {formData.country === 'Australia' 
              ? "We'll automatically find your ABN and business details" 
              : "Enter your company's official name"}
          </small>
        </div>

        {formData.abn && (
          <div className={styles.formGroup}>
            <label>ABN (Australian Business Number)</label>
            <input
              type="text"
              value={formData.abn}
              readOnly
              className={styles.readOnlyField}
            />
            <small>Automatically retrieved from the Australian Business Register</small>
          </div>
        )}

        <div className={styles.formGroup}>
          <label>
            <RiGlobalLine />
            Company Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({...formData, website: e.target.value})}
            placeholder="https://www.example.com"
          />
          <small>Helps AI find accurate information</small>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Industry</label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({...formData, industry: e.target.value})}
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
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
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
            value={formData.additionalContext}
            onChange={(e) => setFormData({...formData, additionalContext: e.target.value})}
            placeholder="Any specific information about your CSR activities, charity partnerships, or focus areas..."
            rows={4}
          />
          <small>Help AI understand your specific CSR focus</small>
        </div>

        {error && (
          <div className={styles.error}>
            <RiAlertLine /> {error}
          </div>
        )}

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => setStep('choose-method')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={loading || !formData.companyName}
          >
            {loading ? (
              <>Researching... This may take 10-15 seconds</>
            ) : (
              <>
                <RiSearchLine /> Start AI Research
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // Step 3: Review Research Results
  const ReviewResearch = () => {
    const data = editedData || researchData;
    
    return (
      <div className={styles.reviewResearch}>
        <div className={styles.header}>
          <h2>Review AI Research Results</h2>
          <p>Please review and confirm the information we found about your company</p>
        </div>

        {data && (
          <>
            {/* Data Quality Score */}
            <div className={styles.dataQuality}>
              <div className={styles.qualityScore}>
                <div className={styles.scoreCircle}>
                  <span className={styles.scoreValue}>{data.dataQuality?.score || 0}%</span>
                  <span className={styles.scoreLabel}>Confidence</span>
                </div>
                <div className={styles.qualityDetails}>
                  <h4>Data Quality: {data.dataQuality?.completeness || 'Unknown'}</h4>
                  <p>AI has researched public information about your CSR activities</p>
                  {data.dataQuality?.missingData?.length > 0 && (
                    <div className={styles.missingData}>
                      <small>Missing: {data.dataQuality.missingData.join(', ')}</small>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Company Profile */}
            <div className={styles.section}>
              <h3><RiBuilding2Line /> Company Profile</h3>
              <div className={styles.dataGrid}>
                <div className={styles.dataItem}>
                  <label>Company Name</label>
                  <div className={styles.value}>{data.companyProfile?.name}</div>
                </div>
                <div className={styles.dataItem}>
                  <label>Industry</label>
                  <div className={styles.value}>{data.companyProfile?.industry}</div>
                </div>
                <div className={styles.dataItem}>
                  <label>Employee Count</label>
                  <div className={styles.value}>
                    {data.companyProfile?.employeeCount?.toLocaleString() || 'Not found'}
                  </div>
                </div>
              </div>
            </div>

            {/* CSR Activities */}
            <div className={styles.section}>
              <h3><RiHandHeartLine /> CSR Activities</h3>
              <div className={styles.csrSummary}>
                <div className={styles.bigNumber}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.amount}>
                    {(data.csrActivities?.totalContributions / 1000000).toFixed(1)}M
                  </span>
                  <span className={styles.period}>Annual Giving ({data.csrActivities?.year || 'Latest'})</span>
                </div>
                
                {data.csrActivities?.categories?.length > 0 && (
                  <div className={styles.categories}>
                    <h4>Giving Categories</h4>
                    {data.csrActivities.categories.map((cat, idx) => (
                      <div key={idx} className={styles.categoryItem}>
                        <div className={styles.categoryHeader}>
                          <span>{cat.name}</span>
                          <span className={styles.percentage}>{cat.percentage}%</span>
                        </div>
                        <div className={styles.categoryBar}>
                          <div 
                            className={styles.categoryFill}
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                        <div className={styles.categoryAmount}>
                          ${(cat.amount / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Key Programs */}
            {data.csrActivities?.keyPrograms?.length > 0 && (
              <div className={styles.section}>
                <h3><RiTrophyLine /> Key Programs</h3>
                <div className={styles.programs}>
                  {data.csrActivities.keyPrograms.map((program, idx) => (
                    <div key={idx} className={styles.programCard}>
                      <h4>{program.name}</h4>
                      <p>{program.description}</p>
                      {program.impact && (
                        <div className={styles.impact}>
                          <RiSparklingLine /> {program.impact}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Charity Partners */}
            {data.charities?.length > 0 && (
              <div className={styles.section}>
                <h3><RiHandHeartLine /> Charity Partners</h3>
                <div className={styles.charities}>
                  {data.charities.map((charity, idx) => (
                    <div key={idx} className={styles.charityCard}>
                      <div className={styles.charityHeader}>
                        <h4>{charity.name}</h4>
                        {charity.verified && (
                          <span className={styles.verifiedBadge}>
                            <RiCheckLine /> Verified
                          </span>
                        )}
                      </div>
                      <div className={styles.charityDetails}>
                        <span className={styles.category}>{charity.category}</span>
                        <span className={styles.relationship}>{charity.relationship}</span>
                      </div>
                      {charity.estimatedAnnualSupport > 0 && (
                        <div className={styles.support}>
                          Est. Annual Support: ${charity.estimatedAnnualSupport.toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Employee Programs */}
            {data.employeePrograms && (
              <div className={styles.section}>
                <h3>Employee Programs</h3>
                <div className={styles.employeePrograms}>
                  {data.employeePrograms.matchingProgram && (
                    <div className={styles.programTag}>
                      <RiCheckLine /> Matching Program ({data.employeePrograms.matchingRatio}:1 ratio)
                    </div>
                  )}
                  {data.employeePrograms.volunteeringProgram && (
                    <div className={styles.programTag}>
                      <RiCheckLine /> Volunteering Program
                      {data.employeePrograms.estimatedVolunteerHours > 0 && 
                        ` (${data.employeePrograms.estimatedVolunteerHours.toLocaleString()} hours/year)`
                      }
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sustainability */}
            {data.sustainability && (
              <div className={styles.section}>
                <h3><RiLeafLine /> Sustainability</h3>
                <div className={styles.sustainability}>
                  {data.sustainability.hasESGReport && (
                    <div className={styles.sustainItem}>
                      <RiCheckLine /> Published ESG Report
                    </div>
                  )}
                  {data.sustainability.carbonNeutralTarget && (
                    <div className={styles.sustainItem}>
                      Carbon Neutral Target: {data.sustainability.carbonNeutralTarget}
                    </div>
                  )}
                  {data.sustainability.sustainabilityInitiatives?.length > 0 && (
                    <div className={styles.initiatives}>
                      {data.sustainability.sustainabilityInitiatives.map((init, idx) => (
                        <span key={idx} className={styles.initiativeTag}>{init}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Key Highlights */}
            {data.keyHighlights?.length > 0 && (
              <div className={styles.section}>
                <h3>Key Highlights</h3>
                <ul className={styles.highlights}>
                  {data.keyHighlights.map((highlight, idx) => (
                    <li key={idx}>
                      <RiCheckLine /> {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Insights */}
            {data.insights && (
              <div className={styles.section}>
                <h3>AI Summary</h3>
                <div className={styles.insights}>
                  <p>{data.insights}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className={styles.reviewActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleEdit}
              >
                <RiEditLine /> Edit Information
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? (
                  <>Saving...</>
                ) : (
                  <><RiCheckLine /> Confirm & Save (Sets Annual Budget)</>  
                )}
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // Loading State
  const LoadingState = () => (
    <div className={styles.loadingState}>
      <div className={styles.loader}>
        <div className={styles.loaderIcon}>
          <RiSearchLine />
        </div>
        <div className={styles.loaderDots}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <h3>AI is researching your company...</h3>
      <p>This typically takes 10-15 seconds</p>
      <div className={styles.loadingSteps}>
        <div className={styles.loadingStep}>
          <RiCheckLine /> Searching public CSR data
        </div>
        <div className={styles.loadingStep}>
          <RiCheckLine /> Identifying charity partnerships
        </div>
        <div className={styles.loadingStep}>
          <RiCheckLine /> Analyzing employee programs
        </div>
        <div className={styles.loadingStep}>
          <RiCheckLine /> Generating insights
        </div>
      </div>
    </div>
  );

  // API Handlers
  const handleMethodSelect = async (method) => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/business/enhanced-onboarding/data-preference`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ 
            businessId: effectiveBusinessId, 
            preference: method 
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to set preference');
      }

      const data = await response.json();
      
      if (method === 'ai-research') {
        setStep('ai-research-form');
      } else if (method === 'upload-document') {
        // Redirect to existing upload flow
        navigate('/business/onboarding/upload-csr');
      } else {
        // Redirect to manual entry
        navigate('/business/onboarding/manual-entry');
      }
    } catch (error) {
      console.error('Error setting preference:', error);
      setError('Failed to set preference. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAIResearch = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStep('loading');
    
    console.log('Starting AI research with form data:', formData);
    
    try {
      const requestBody = {
        ...formData,
        businessId: effectiveBusinessId
      };
      
      const response = await fetch(
        `${API_BASE_URL}/api/business/enhanced-onboarding/ai-research`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.message || 'AI research failed');
      }

      const data = await response.json();
      
      console.log('AI research completed:', {
        success: data.success,
        hasData: !!data.researchData,
        totalContributions: data.researchData?.csrActivities?.totalContributions
      });
      
      if (data.success && data.researchData) {
        setResearchData(data.researchData);
        setStep('review-research');
        // Show a message guiding the user
        alert('✅ AI Research complete! Please review the findings and click "Confirm & Save" to set your Annual Giving Budget.');
      } else {
        throw new Error('No research data received');
      }
    } catch (error) {
      console.error('Error performing research:', error);
      setError(error.message || 'AI research failed. Please try manual entry.');
      setStep('ai-research-form');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    // In a real implementation, this would open an edit modal
    // For now, we'll just allow editing in place
    alert('Edit functionality would be implemented here');
  };

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);
    
    console.log('Confirming AI research with data:', {
      businessId: effectiveBusinessId,
      hasResearchData: !!researchData,
      annualBudget: researchData?.csrActivities?.totalContributions
    });
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/business/enhanced-onboarding/confirm-research`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            businessId: effectiveBusinessId,
            confirmedData: editedData || researchData,
            corrections: {},
            additionalData: {}
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to save research data');
      }

      const data = await response.json();
      
      console.log('Research confirmed successfully:', {
        completionPercentage: data.completionPercentage,
        nextStep: data.nextStep
      });
      
      // Show success message with budget amount
      const budgetAmount = researchData?.csrActivities?.totalContributions;
      if (budgetAmount) {
        alert(`✅ AI Research confirmed! Annual Giving Budget set to $${(budgetAmount / 1000000).toFixed(1)}M`);
      }
      
      setProgress(data.completionPercentage || 75);
      
      // Refresh the page to update progress
      fetchProgress();
      
      // Call parent callback or navigate to next step
      if (onComplete) {
        onComplete(data);
      } else {
        // Navigate back to main onboarding flow
        navigate('/business/onboarding');
      }
    } catch (error) {
      console.error('Error confirming research:', error);
      setError(`Failed to save data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Render current step
  return (
    <div className={styles.enhancedOnboarding}>
      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressTrack}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={styles.progressLabel}>{progress}% Complete</span>
      </div>
      
      {/* Help Message for AI Research Flow */}
      {step === 'choose-method' && progress === 50 && (
        <div className={styles.helpMessage} style={{ 
          padding: '15px', 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffc107',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <RiAlertLine style={{ color: '#856404', fontSize: '20px' }} />
          <div>
            <strong>Complete your AI Research:</strong> You've selected AI Research but haven't completed it yet. 
            Click "AI Research" below to finish setting up your Annual Giving Budget.
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className={styles.stepContent}>
        {loading && step === 'loading' && <LoadingState />}
        {!loading && step === 'choose-method' && <MethodSelection />}
        {!loading && step === 'ai-research-form' && <AIResearchForm />}
        {!loading && step === 'review-research' && <ReviewResearch />}
      </div>
    </div>
  );
};

export default EnhancedOnboarding;