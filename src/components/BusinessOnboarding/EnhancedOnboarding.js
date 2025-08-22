import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EnhancedOnboarding.module.css';
import { API_CONFIG } from '../../config/api.config';
import apiServices, { csrfServiceAPI } from '../../services/api.service';
import businessAPI from '../../services/businessAPI';
import { parseRetryAfter, mapValidationErrors } from '../../utils/onboarding.helpers';
import CSRDownloadButton from '../CSRDownloadButton';
import { SecureTokenStorage } from '../../utils/auth.utils';
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

const EnhancedOnboarding = ({ businessId, onComplete, onSkip, initialCompanyData = {}, defaultStep = 'choose-method' }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(defaultStep || 'choose-method');
  const [loading, setLoading] = useState(false);
  const [researchData, setResearchData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);
  const [isKillSwitched, setIsKillSwitched] = useState(false);
  const [resolvedOnce, setResolvedOnce] = useState(false);
  const [formData, setFormData] = useState({
    companyName: initialCompanyData.companyName || '',
    website: initialCompanyData.website || '',
    industry: initialCompanyData.industry || '',
    country: initialCompanyData.country || 'Australia',
    additionalContext: initialCompanyData.additionalContext || '',
    abn: initialCompanyData.abn || ''
  });
  const [editedData, setEditedData] = useState(null);
  // ABN lookup now handled earlier in Business Profile step

  const API_BASE_URL = API_CONFIG.BASE_URL;

  // Get the actual business ID from the authenticated profile as source of truth
  const [effectiveBusinessId, setEffectiveBusinessId] = useState(businessId || null);
  useEffect(() => {
    let cancelled = false;
    const resolveBusinessId = async () => {
      try {
        if (businessId) { setEffectiveBusinessId(businessId); return; }
        const res = await apiServices.client.get('/api/business/me');
        const id = res?.data?._id || res?.data?.id || null;
        const businessData = res?.data;
        if (!cancelled) {
          setEffectiveBusinessId(id);
          // If no initial company data was provided, use the fetched data
          if (!initialCompanyData.companyName && businessData) {
            setFormData(prev => ({
              companyName: businessData.companyName || prev.companyName || '',
              website: businessData.website || prev.website || '',
              industry: businessData.industry || prev.industry || '',
              country: businessData.country || prev.country || 'Australia',
              additionalContext: businessData.additionalContext || prev.additionalContext || '',
              abn: businessData.abn || prev.abn || ''
            }));
          }
        }
      } catch {
        // fall back to localStorage as last resort
        try {
          const stored = localStorage.getItem('businessId');
          if (!cancelled) setEffectiveBusinessId(stored || null);
        } catch {}
      }
    };
    resolveBusinessId();
    return () => { cancelled = true; };
  }, [businessId, initialCompanyData.companyName]);

  // Get auth token
  const getAuthHeaders = () => {
    const token = SecureTokenStorage.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  };

  // Track progress
  useEffect(() => {
    if (effectiveBusinessId) {
      fetchProgress();
    }
  }, [effectiveBusinessId]);

  // Silently resolve charities/portfolio to ObjectIds during the review step
  useEffect(() => {
    const shouldResolve = step === 'review-research' && researchData && !resolvedOnce;
    if (!shouldResolve) return;
    (async () => {
      try {
        const portfolio = researchData?.charityPortfolio || researchData?.csrActivities?.charityPortfolio;
        const payload = {};
        if (portfolio) payload.charityPortfolio = portfolio;
        if (Array.isArray(researchData?.primaryCharities)) payload.primaryCharities = researchData.primaryCharities;
        if (Array.isArray(researchData?.partnerCharities)) payload.partnerCharities = researchData.partnerCharities;
        if (Object.keys(payload).length > 0) {
          await businessAPI.onboarding.resolveCharities(payload);
        }
      } catch (e) {
        console.warn('resolve-charities during review failed (non-fatal):', e?.response?.status || e?.message);
      } finally {
        setResolvedOnce(true);
      }
    })();
  }, [step, researchData, resolvedOnce]);

  // Countdown for 429 Retry-After
  useEffect(() => {
    if (!rateLimitSeconds || rateLimitSeconds <= 0) return;
    const t = setInterval(() => {
      setRateLimitSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [rateLimitSeconds]);

  const fetchProgress = async () => {
    try {
      // Don't include business ID in URL - let backend use authenticated user's business
      const response = await fetch(
        `${API_BASE_URL}/api/business/enhanced-onboarding/progress`,
        { headers: getAuthHeaders() }
      );
      if (response.status === 403) {
        console.warn('Progress access forbidden (business mismatch)');
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setProgress(data.overall || 0);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  // Search for Australian businesses by name
  // (ABN search removed from AI step)

  // (ABN select removed from AI step)

  // (Removed ABN search debounce in AI step)

  // Step 1: Method Selection
  const MethodSelection = () => (
    <div className={styles.methodSelection}>
      <div className={styles.header}>
        <h2>How would you like to set up your CSR profile?</h2>
        <p>Choose the method that works best for you. You can always add more data later.</p>
        <div>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              if (onSkip) return onSkip();
              navigate('/business-dashboard');
            }}
          >
            Skip For Now
          </button>
        </div>
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
        <h2>Confirm Company Details</h2>
        <p>We’ll use these to run AI Research. Edit earlier in Business Profile if needed.</p>
      </div>

      <div className={styles.section}>
        <div className={styles.dataGrid}>
          <div className={styles.dataItem}><label>Company Name</label><div className={styles.value}>{formData.companyName || '—'}</div></div>
          {formData.abn && (<div className={styles.dataItem}><label>ABN</label><div className={styles.value}>{formData.abn}</div></div>)}
          <div className={styles.dataItem}><label>Website</label><div className={styles.value}>{formData.website || '—'}</div></div>
          <div className={styles.dataItem}><label>Industry</label><div className={styles.value}>{formData.industry || '—'}</div></div>
          <div className={styles.dataItem}><label>Country</label><div className={styles.value}>{formData.country || '—'}</div></div>
          <div className={styles.dataItem} style={{ gridColumn: '1 / -1' }}>
            <label>Additional Context</label>
            <div className={styles.value}>{formData.additionalContext || '—'}</div>
          </div>
        </div>
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
          onClick={() => navigate('/business-onboarding')}
        >
          Edit Company Details
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          disabled={loading || !formData.companyName}
          onClick={handleAIResearch}
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
    </div>
  );

  // Step 3: Review Research Results
  const ReviewResearch = () => {
    const data = editedData || researchData;

    // Helper to safely format totals in millions
    const formatMillions = (value) => {
      const n = typeof value === 'number' ? value : Number(value || 0);
      if (!isFinite(n) || n <= 0) return '0.0';
      return (n / 1_000_000).toFixed(1);
    };

    return (
      <div className={styles.reviewResearch}>
        <div className={styles.header}>
          <h2>Review AI Research Results</h2>
          <p>Please review and confirm the information we found about your company</p>
        </div>

        {data && (
          <>
            {/* Show a hint if dataQuality is low to encourage manual entry */}
            {typeof data?.dataQuality?.score === 'number' && data.dataQuality.score < 50 && (
              <div className={styles.helpMessage} style={{ 
                padding: '12px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, marginBottom: 16
              }}>
                <RiAlertLine /> Our AI has low confidence in the detected figures. You can still save now and update your annual budget manually later in Account Settings.
              </div>
            )}
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
                    {`${formatMillions(data?.csrActivities?.totalContributions)}M`}
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
              <CSRDownloadButton className={styles.secondaryButton} label="Download CSR Report" />
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
      // Ensure CSRF token for state-changing request
      let csrf = null;
      try { csrf = await csrfServiceAPI.initializeToken(); } catch {}

      const response = await fetch(
        `${API_BASE_URL}/api/business/enhanced-onboarding/data-preference`,
        {
          method: 'POST',
          headers: { ...getAuthHeaders(), ...(csrf ? { 'X-CSRF-Token': csrf } : {}) },
          body: JSON.stringify({ 
            preference: method 
          })
        }
      );

      if (response.status === 503) {
        setIsKillSwitched(true);
        alert('Enhanced onboarding is temporarily unavailable. Switching to standard onboarding.');
        navigate('/business-onboarding');
        return;
      }

      if (response.status === 429) {
        const retry = response.headers.get('Retry-After');
        const seconds = parseRetryAfter(retry);
        setRateLimitSeconds(seconds || 30);
        setError(`Rate limited. Try again in ${seconds || 30} seconds.`);
        return;
      }

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
    
    // Validate required fields
    if (!formData.companyName) {
      setError('Company name is required for AI research');
      return;
    }
    
    setLoading(true);
    setStep('loading');
    
    console.log('Starting AI research with form data:', formData);
    
    try {
      // Ensure all fields have values (even if empty strings)
      const requestBody = {
        companyName: formData.companyName || '',
        website: formData.website || '',
        industry: formData.industry || '',
        country: formData.country || 'Australia',
        additionalContext: formData.additionalContext || '',
        abn: formData.abn || ''
      };
      
      let csrf = null;
      try { csrf = await csrfServiceAPI.initializeToken(); } catch {}
      const response = await fetch(
        `${API_BASE_URL}/api/business/enhanced-onboarding/ai-research`,
        {
          method: 'POST',
          headers: { ...getAuthHeaders(), ...(csrf ? { 'X-CSRF-Token': csrf } : {}) },
          body: JSON.stringify(requestBody)
        }
      );

      if (response.status === 503) {
        setIsKillSwitched(true);
        alert('Enhanced onboarding is temporarily unavailable. Switching to standard onboarding.');
        navigate('/business-onboarding');
        return;
      }

      if (response.status === 429) {
        const retry = response.headers.get('Retry-After');
        const seconds = parseRetryAfter(retry);
        setRateLimitSeconds(seconds || 30);
        setStep('ai-research-form');
        setError(`Rate limited. Try again in ${seconds || 30} seconds.`);
        return;
      }

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
      // Normalize AI research payload to avoid schema validation errors
      const raw = editedData || researchData || {};
      const sanitizeForConfirm = (input) => {
        const clone = JSON.parse(JSON.stringify(input || {}));
        const asArray = (v) => Array.isArray(v) ? v : [];
        const isObjectId = (s) => typeof s === 'string' && /^[a-f\d]{24}$/i.test(s);
        const toArray = (v) => {
          if (Array.isArray(v)) return v;
          if (typeof v === 'string') {
            const s = v.trim();
            // Try to parse JSON; if single-quoted, coerce quotes
            const tryParse = (text) => { try { return JSON.parse(text); } catch { return null; } };
            let parsed = tryParse(s);
            if (!parsed && s.startsWith('[') && s.endsWith(']')) {
              const coerced = s
                .replace(/\r?\n/g, ' ')
                .replace(/\s+/g, ' ')
                .replace(/'/g, '"');
              parsed = tryParse(coerced);
            }
            return Array.isArray(parsed) ? parsed : [];
          }
          return [];
        };

        const portfolio = clone.charityPortfolio || clone.csrActivities?.charityPortfolio || {};
        // acceptableCharities may come as array, stringified array, or objects
        const rawAcceptable = asArray(portfolio.acceptableCharities).length
          ? asArray(portfolio.acceptableCharities)
          : toArray(portfolio.acceptableCharities);
        let acceptableIds = [];
        let acceptableRaw = null;
        if (rawAcceptable.length) {
          const mapped = rawAcceptable
            .map((c) => (c && (c._id || c.id || c.charityId || c.charityABN || c.abn || c.ABN)))
            .filter(Boolean)
            .map((v) => String(v));
          acceptableIds = mapped.filter(isObjectId);
          if (acceptableIds.length !== rawAcceptable.length) acceptableRaw = rawAcceptable;
        }
        if (!clone.charityPortfolio) clone.charityPortfolio = {};
        clone.charityPortfolio.acceptableCharities = acceptableIds;
        // Remove potentially conflicting nested copy to avoid backend reading string version
        if (clone.csrActivities && clone.csrActivities.charityPortfolio) {
          delete clone.csrActivities.charityPortfolio.acceptableCharities;
        }

        ['primaryCharities', 'partnerCharities', 'acceptableCharities'].forEach((key) => {
          if (clone[key]) {
            const arr = asArray(clone[key]).length ? asArray(clone[key]) : toArray(clone[key]);
            const ids = arr
              .map((c) => (c && (c._id || c.id || c.charityId)))
              .filter((id) => isObjectId(String(id)))
              .map(String);
            clone[key] = ids;
          }
        });

        return { cleaned: clone, meta: { acceptableRaw } };
      };

      const { cleaned, meta } = sanitizeForConfirm(raw);

      let csrf = null;
      try { csrf = await csrfServiceAPI.initializeToken(); } catch {}
      const response = await fetch(
        `${API_BASE_URL}/api/business/enhanced-onboarding/confirm-research`,
        {
          method: 'POST',
          headers: { ...getAuthHeaders(), ...(csrf ? { 'X-CSRF-Token': csrf } : {}) },
          body: JSON.stringify({
            confirmedData: cleaned,
            corrections: {},
            additionalData: { acceptableCharitiesRaw: meta.acceptableRaw || undefined }
          })
        }
      );

      if (response.status === 503) {
        setIsKillSwitched(true);
        alert('Enhanced onboarding is temporarily unavailable. Switching to standard onboarding.');
        navigate('/business-onboarding');
        return;
      }

      if (response.status === 429) {
        const retry = response.headers.get('Retry-After');
        const seconds = parseRetryAfter(retry);
        setRateLimitSeconds(seconds || 30);
        setError(`Rate limited. Try again in ${seconds || 30} seconds.`);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        const mapped = mapValidationErrors(errorData?.errors || errorData?.details);
        throw new Error(mapped || errorData.details || 'Failed to save research data');
      }

      const data = await response.json();
      
      console.log('Research confirmed successfully:', {
        completionPercentage: data.completionPercentage,
        nextStep: data.nextStep,
        message: data.message,
        annualBudget: data.annualBudget
      });
      
      // Determine the saved budget amount from response or local data
      const savedBudget = (typeof data.annualBudget === 'number' ? data.annualBudget : null);
      const fallbackBudget = researchData?.csrActivities?.totalContributions || 0;
      const effectiveBudget = savedBudget ?? fallbackBudget ?? 0;
      
      if (effectiveBudget > 0) {
        alert(`✅ AI Research confirmed! Annual Giving Budget set to $${(effectiveBudget / 1000000).toFixed(1)}M`);
      }
      
      setProgress(data.completionPercentage || 75);
      
      // Refresh the page to update progress
      fetchProgress();
      
      // Call parent callback or navigate to next step
      if (onComplete) {
        onComplete(data);
      } else {
        // Return to dashboard post-confirm without sending user to settings
        navigate('/business-dashboard');
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
          <RiAlertLine className="color-hex-856404 font-size-20" />
          <div>
            <strong>Complete your AI Research:</strong> You've selected AI Research but haven't completed it yet. 
            Click "AI Research" below to finish setting up your Annual Giving Budget.
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className={styles.stepContent}>
        {rateLimitSeconds > 0 && (
          <div className={styles.helpMessage} style={{ padding: '12px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, marginBottom: 12 }}>
            Try again in {rateLimitSeconds} seconds.
          </div>
        )}
        {loading && step === 'loading' && <LoadingState />}
        {!loading && step === 'choose-method' && <MethodSelection />}
        {!loading && step === 'ai-research-form' && <AIResearchForm />}
        {!loading && step === 'review-research' && <ReviewResearch />}
      </div>
    </div>
  );
};

export default EnhancedOnboarding;
