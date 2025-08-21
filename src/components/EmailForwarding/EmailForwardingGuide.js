import React, { useState, useEffect } from 'react';
import apiServices from '../../services/api.service';
import styles from './EmailForwardingGuide.module.css';

const EmailForwardingGuide = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [forwardingEmail, setForwardingEmail] = useState('');
  const [searchTemplates, setSearchTemplates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [userInstructions, setUserInstructions] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get forwarding email address
      const api = apiServices.client;
      const emailResponse = await api.get(`/api/email/forward-address`);
      // Use the forwardToEmail instead of the old donor-specific email
      setForwardingEmail(emailResponse.data.forwardToEmail || emailResponse.data.email);
      setUserInstructions(emailResponse.data.instructions);

      // Get search templates
      const templatesResponse = await api.get(`/api/email/search-templates`);
      setSearchTemplates(templatesResponse.data);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load email forwarding information');
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const emailProviders = [
    { label: 'Gmail', value: 'gmail' },
    { label: 'Outlook', value: 'outlook' },
    { label: 'Apple Mail', value: 'apple' },
    { label: 'Other', value: 'generic' }
  ];

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const currentProvider = emailProviders[activeTab].value;
  const templates = searchTemplates?.[currentProvider] || [];
  const instructions = searchTemplates?.instructions?.[currentProvider] || {};

  return (
    <div className={styles.container}>
      {/* Forwarding Email Display */}
      <div className={styles.emailBox}>
        <h2>Your Unique Forwarding Address</h2>
        <div className={styles.emailDisplay}>
          <span className={styles.emailIcon}>📧</span>
          <code className={styles.email}>{forwardingEmail}</code>
          <button 
            className={styles.copyButton}
            onClick={() => copyToClipboard(forwardingEmail)}
            title="Copy email address"
          >
            📋 Copy
          </button>
        </div>
        <div className={styles.emailInfo}>
          ℹ️ {userInstructions?.step2 || 'Emails processed within 5-10 minutes'}
        </div>
        {userInstructions?.example && (
          <div className={styles.exampleBox}>
            <strong>Example:</strong> {userInstructions.example}
          </div>
        )}
      </div>

      {/* Email Provider Tabs */}
      <div className={styles.providerTabs}>
        {emailProviders.map((provider, index) => (
          <button
            key={provider.value}
            className={`${styles.providerTab} ${activeTab === index ? styles.activeProviderTab : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {provider.label}
          </button>
        ))}
      </div>

      {/* Step-by-Step Instructions */}
      <div className={styles.instructionsCard}>
        <h3>Step-by-Step Instructions for {emailProviders[activeTab].label}</h3>
        
        <div className={styles.steps}>
          {instructions.steps?.map((step, index) => (
            <div 
              key={index} 
              className={`${styles.step} ${activeStep === index ? styles.activeStep : ''} ${activeStep > index ? styles.completedStep : ''}`}
            >
              <div className={styles.stepHeader} onClick={() => setActiveStep(index)}>
                <span className={styles.stepNumber}>{index + 1}</span>
                <span className={styles.stepTitle}>Step {index + 1}</span>
              </div>
              {activeStep === index && (
                <div className={styles.stepContent}>
                  <p>{step}</p>
                  <div className={styles.stepActions}>
                    {index < instructions.steps.length - 1 && (
                      <button
                        className={styles.nextButton}
                        onClick={() => setActiveStep(index + 1)}
                      >
                        Next →
                      </button>
                    )}
                    {index > 0 && (
                      <button
                        className={styles.backButton}
                        onClick={() => setActiveStep(index - 1)}
                      >
                        ← Back
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {activeStep === instructions.steps?.length && (
          <div className={styles.completionMessage}>
            ✅ All steps completed! Your donation receipts will be processed shortly.
            <button onClick={() => setActiveStep(0)} className={styles.resetButton}>
              Reset Steps
            </button>
          </div>
        )}
      </div>

      {/* Search Templates */}
      <div className={styles.templatesCard}>
        <h3>🔍 Search Templates</h3>
        <p className={styles.templatesDescription}>
          Copy these optimized search queries to find donation receipts in your email:
        </p>

        {templates.map((template, index) => (
          <div key={index} className={styles.template}>
            <code className={styles.templateCode}>{template}</code>
            <button
              className={styles.copyButton}
              onClick={() => copyToClipboard(template)}
              title="Copy search query"
            >
              📋
            </button>
          </div>
        ))}

        {/* Tips */}
        {instructions.tips && (
          <div className={styles.tips}>
            <h4>Tips for {emailProviders[activeTab].label}</h4>
            <ul>
              {instructions.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Copy notification */}
      {copied && (
        <div className={styles.copyNotification}>
          Copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default EmailForwardingGuide;
