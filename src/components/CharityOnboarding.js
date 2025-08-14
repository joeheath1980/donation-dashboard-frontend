import React, { useState } from 'react';
import { apiCall } from '../utils/stripe';
import styles from './CharityOnboarding.module.css';

function CharityOnboarding({ charity, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accountLinkUrl, setAccountLinkUrl] = useState(null);

  const createStripeAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall('/stripe/create-charity-account', 'POST', {
        charityId: charity._id,
        email: charity.email,
        charityName: charity.charityName || charity.Charity_Legal_Name,
        country: 'US' // Default to US, can be made configurable
      });

      if (response.accountLinkUrl) {
        setAccountLinkUrl(response.accountLinkUrl);
      } else {
        if (onComplete) {
          onComplete(response.accountId);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExternalLinkClick = () => {
    // Open in new tab
    window.open(accountLinkUrl, '_blank');
    // Note: We can't automatically detect when they complete onboarding
    // They'll need to refresh or click a "I've completed setup" button
  };
  
  const handleCheckStatus = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className={styles.charityOnboarding}>
      <h2>Complete Your Stripe Setup</h2>
      
      <div className={styles.onboardingContent}>
        <div className={styles.infoSection}>
          <h3>Why do we need this?</h3>
          <ul>
            <li>Receive donations directly to your bank account</li>
            <li>Secure payment processing through Stripe</li>
            <li>Access detailed payment analytics</li>
            <li>Instant payment confirmations</li>
          </ul>
        </div>

        <div className={styles.charityInfo}>
          <h3>Organization Details</h3>
          <p><strong>Name:</strong> {charity.charityName || charity.Charity_Legal_Name}</p>
          <p><strong>Email:</strong> {charity.email}</p>
          <p><strong>EIN:</strong> {charity.EIN || 'Not provided'}</p>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {accountLinkUrl ? (
          <div className={styles.linkSection}>
            <p>Please complete your Stripe account setup:</p>
            <button 
              onClick={handleExternalLinkClick}
              className={styles.linkButton}
            >
              Complete Setup with Stripe
            </button>
            <p className={styles.linkNote}>
              This will open in a new tab. Once complete, return here and click the button below.
            </p>
            <button 
              onClick={handleCheckStatus}
              className={styles.setupButton}
              className="mt-15"
            >
              I've Completed Setup
            </button>
          </div>
        ) : (
          <div className={styles.actionSection}>
            <button 
              onClick={createStripeAccount}
              disabled={loading}
              className={styles.setupButton}
            >
              {loading ? 'Creating Account...' : 'Set Up Stripe Account'}
            </button>
          </div>
        )}

        <div className={styles.securityNote}>
          <p>
            Your information is secure and encrypted. 
            We partner with Stripe for secure payment processing.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CharityOnboarding;