import React, { useState } from 'react';
import { apiCall } from '../utils/stripe';
import './CharityOnboarding.css';

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
        onComplete(response.accountId);
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
  };

  return (
    <div className="charity-onboarding">
      <h2>Complete Your Stripe Setup</h2>
      
      <div className="onboarding-content">
        <div className="info-section">
          <h3>Why do we need this?</h3>
          <ul>
            <li>🏦 Receive donations directly to your bank account</li>
            <li>🔒 Secure payment processing through Stripe</li>
            <li>📊 Access detailed payment analytics</li>
            <li>⚡ Instant payment confirmations</li>
          </ul>
        </div>

        <div className="charity-info">
          <h3>Organization Details</h3>
          <p><strong>Name:</strong> {charity.charityName || charity.Charity_Legal_Name}</p>
          <p><strong>Email:</strong> {charity.email}</p>
          <p><strong>EIN:</strong> {charity.EIN || 'Not provided'}</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {accountLinkUrl ? (
          <div className="link-section">
            <p>Please complete your Stripe account setup:</p>
            <button 
              onClick={handleExternalLinkClick}
              className="link-button"
            >
              Complete Setup with Stripe
            </button>
            <p className="link-note">
              This will open in a new tab. Once complete, return here to continue.
            </p>
          </div>
        ) : (
          <div className="action-section">
            <button 
              onClick={createStripeAccount}
              disabled={loading}
              className="setup-button"
            >
              {loading ? 'Creating Account...' : 'Set Up Stripe Account'}
            </button>
          </div>
        )}

        <div className="security-note">
          <p>
            🔒 Your information is secure and encrypted. 
            We partner with Stripe for secure payment processing.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CharityOnboarding;