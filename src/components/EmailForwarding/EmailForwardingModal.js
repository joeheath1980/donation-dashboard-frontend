import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './EmailForwardingModal.module.css';
import '../SharedStyles.css';

const EmailForwardingModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [forwardingEmail, setForwardingEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      if (user && user._id) {
        const email = `donor-${user._id}@forward.do-nation.space`;
        setForwardingEmail(email);
        setLoading(false);
        setError('');
      } else {
        setError('Please log in to view your forwarding email');
        setLoading(false);
      }
    }
  }, [isOpen, user]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const emailProviders = [
    { label: 'Gmail', value: 'gmail' },
    { label: 'Outlook', value: 'outlook' }
  ];

  if (!isOpen) return null;

  const currentProvider = emailProviders[activeTab].value;

  // Gmail search criteria
  const gmailSearchCriteria = [
    'from:(noreply@paypal.com OR service@paypal.com) subject:(receipt OR donation OR charitable)',
    'from:receipts@stripe.com subject:(receipt OR donation)',
    'from:donation-receipts@donate.ly',
    'from:*@canadahelps.org subject:(tax receipt OR donation)',
    '(donation OR charitable OR receipt) has:attachment',
    'subject:"donation receipt" OR subject:"charitable receipt" OR subject:"tax receipt"',
    'from:*@gofundme.com subject:(donation OR contribution)'
  ];

  // Outlook search criteria
  const outlookSearchCriteria = [
    'from:noreply@paypal.com OR from:service@paypal.com AND (subject:receipt OR subject:donation)',
    'from:receipts@stripe.com AND (subject:receipt OR subject:donation)',
    'from:donation-receipts@donate.ly',
    'hasattachment:yes AND (donation OR charitable OR receipt)',
    'subject:"donation receipt" OR subject:"charitable receipt" OR subject:"tax receipt"',
    'from:*@canadahelps.org AND (subject:"tax receipt" OR subject:donation)',
    'from:*@gofundme.com AND (subject:donation OR subject:contribution)'
  ];

  const displayedCriteria = currentProvider === 'gmail' ? gmailSearchCriteria : outlookSearchCriteria;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <h2 className={styles.title}>Email Forwarding Setup</h2>
        <p className={styles.description}>
          Forward your donation receipts without granting access to your entire email inbox
        </p>

        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <>
            {/* Forwarding Email Display */}
            <div className={styles.emailBox}>
              <h3>Your Unique Forwarding Address</h3>
              <div className={styles.emailDisplay}>
                <span className={styles.emailIcon}>📧</span>
                <code className={styles.email}>{forwardingEmail}</code>
                <button 
                  className={styles.copyButton}
                  onClick={() => copyToClipboard(forwardingEmail)}
                  title="Copy email address"
                >
                  {copied ? '✓' : '📋'} Copy
                </button>
              </div>
              <p className={styles.emailInfo}>
                ℹ️ Forward donation receipt emails to this address. Your donations will be automatically tracked!
              </p>
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

            {/* Search Criteria */}
            <div className={styles.searchCriteria}>
              <h3>🔍 Optimized Search Queries for {emailProviders[activeTab].label}</h3>
              <p className={styles.criteriaDescription}>
                Copy these search queries to find donation receipts in your {emailProviders[activeTab].label}:
              </p>
              
              <div className={styles.criteriaList}>
                {displayedCriteria.map((criteria, index) => (
                  <div key={index} className={styles.criteriaItem}>
                    <code className={styles.criteriaCode}>{criteria}</code>
                    <button
                      className={styles.copyButton}
                      onClick={() => copyToClipboard(criteria)}
                      title="Copy search query"
                    >
                      📋
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className={styles.instructions}>
              <h3>How to Forward Emails</h3>
              <ol>
                <li>Copy one of the search queries above</li>
                <li>Paste it into your {emailProviders[activeTab].label} search bar</li>
                <li>Select the donation receipt emails you want to track</li>
                <li>Forward them to: <strong>{forwardingEmail}</strong></li>
                <li>Our AI will process them and add them to your dashboard within minutes</li>
              </ol>
              
              {currentProvider === 'gmail' && (
                <div className={styles.providerTip}>
                  <strong>Gmail Tip:</strong> Use Advanced Search (click the filter icon) for more precise results
                </div>
              )}
              
              {currentProvider === 'outlook' && (
                <div className={styles.providerTip}>
                  <strong>Outlook Tip:</strong> Use the Search Tools tab for advanced filtering options
                </div>
              )}
            </div>

            {/* Copy notification */}
            {copied && (
              <div className={styles.copyNotification}>
                Copied to clipboard!
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmailForwardingModal;