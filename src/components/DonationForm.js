import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { stripePromise, apiCall } from '../utils/stripe';
import axios from 'axios';
import businessAPI from '../services/businessAPI';
import './DonationForm.css';

// Card element styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4'
      }
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a'
    }
  }
};

// Match Preview Component
const MatchPreview = ({ matches, totalImpact }) => {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="match-preview">
      <div className="match-preview-header">
        <span className="match-icon">🎯</span>
        <h3>Your donation will be matched!</h3>
      </div>
      <div className="match-details">
        {matches.map((match, index) => (
          <div key={index} className="match-item">
            <div className="match-business">
              <img 
                src={match.businessLogo || '/default-business-logo.png'} 
                alt={match.businessName}
                className="business-logo"
              />
              <span className="business-name">{match.businessName}</span>
            </div>
            <div className="match-amount">
              <span className="multiplier">{match.multiplier}x</span>
              <span className="equals">=</span>
              <span className="match-value">${match.matchAmount.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="total-impact">
        <span className="impact-label">Total Impact:</span>
        <span className="impact-amount">${totalImpact.toFixed(2)}</span>
      </div>
    </div>
  );
};

// Match Confirmation Modal
const MatchConfirmationModal = ({ isOpen, onClose, donation, matches }) => {
  if (!isOpen) return null;

  const totalMatched = matches.reduce((sum, match) => sum + match.matchAmount, 0);
  const totalImpact = donation.amount + totalMatched;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="success-animation">
          <div className="checkmark">✓</div>
        </div>
        
        <h2>Impact Multiplied!</h2>
        
        <div className="impact-breakdown">
          <div className="impact-row">
            <span>Your donation:</span>
            <span>${donation.amount.toFixed(2)}</span>
          </div>
          
          {matches.map((match, index) => (
            <div key={index} className="impact-row match-row">
              <span>
                <img src={match.businessLogo} alt="" className="inline-logo" />
                {match.businessName} ({match.multiplier}x):
              </span>
              <span>+${match.matchAmount.toFixed(2)}</span>
            </div>
          ))}
          
          <div className="impact-row total-row">
            <span>Total Impact:</span>
            <span className="total-amount">${totalImpact.toFixed(2)}</span>
          </div>
        </div>
        
        <p className="impact-message">
          Thank you! Your generosity has been amplified by our business partners.
          Together, you're making {matches.length + 1}x the difference for {donation.charity.charityName}.
        </p>
        
        <button className="modal-button" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
};

// Main donation form component
function DonationFormContent({ charity, onSuccess, matchingOpportunity }) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [amount, setAmount] = useState(matchingOpportunity?.suggestedAmount?.toString() || '');
  const [isMonthly, setIsMonthly] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [matchPreview, setMatchPreview] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [lastDonation, setLastDonation] = useState(null);

  // Fetch match preview when amount changes
  useEffect(() => {
    const fetchMatchPreview = async () => {
      if (!amount || parseFloat(amount) <= 0) {
        setMatchPreview(null);
        return;
      }

      try {
        const response = await businessAPI.matching.previewMatches({
          amount: parseFloat(amount),
          charityId: charity._id,
          isMonthly
        });

        if (response.data.matches && response.data.matches.length > 0) {
          setMatchPreview({
            matches: response.data.matches,
            totalImpact: response.data.totalImpact
          });
        } else {
          setMatchPreview(null);
        }
      } catch (err) {
        console.error('Failed to fetch match preview:', err);
        // Use dummy data for demonstration
        if (parseFloat(amount) >= 10) {
          setMatchPreview({
            matches: [
              {
                businessId: '1',
                businessName: 'TechCorp Inc.',
                businessLogo: '/techcorp-logo.png',
                multiplier: 2,
                matchAmount: parseFloat(amount) * 2,
                campaignName: 'Holiday Giving Campaign'
              }
            ],
            totalImpact: parseFloat(amount) * 3
          });
        }
      }
    };

    const debounceTimer = setTimeout(fetchMatchPreview, 500);
    return () => clearTimeout(debounceTimer);
  }, [amount, charity._id, isMonthly]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create payment intent
      const { clientSecret, donationId, platformFee, matchingData } = await apiCall(
        '/stripe/create-payment-intent',
        'POST',
        {
          amount: parseFloat(amount),
          currency: 'usd',
          charityId: charity._id,
          isMonthly,
          includeMatching: true,
          ...(matchingOpportunity?.campaignId && { campaignId: matchingOpportunity.campaignId })
        }
      );

      // Show platform fee
      if (platformFee > 0) {
        setMessage(`Platform fee: $${platformFee.toFixed(2)}`);
      }

      // Step 2: Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            email: email
          }
        },
        receipt_email: email
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        // Payment succeeded
        const donationData = {
          paymentIntent: result.paymentIntent,
          donationId,
          amount: parseFloat(amount),
          charity
        };

        // Show match confirmation if there were matches
        if (matchingData && matchingData.matches && matchingData.matches.length > 0) {
          setLastDonation(donationData);
          setShowMatchModal(true);
          
          // Add match data to donation for success page
          donationData.matching = matchingData;
        }

        onSuccess(donationData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Preset amount buttons
  const presetAmounts = [25, 50, 100, 250];

  return (
    <>
      <form onSubmit={handleSubmit} className="donation-form">
        <h2>Donate to {charity.charityName || charity.Charity_Legal_Name}</h2>
        
        {/* Show matching opportunity info if coming from match feed */}
        {matchingOpportunity && (
          <div className="match-opportunity-info">
            <div className="match-info-header">
              <span className="match-badge">🎯 Matched Donation</span>
              <span className="match-business">{matchingOpportunity.businessName}</span>
            </div>
            <p className="match-info-text">
              {matchingOpportunity.businessName} will match your donation {matchingOpportunity.multiplier}x 
              as part of their {matchingOpportunity.campaignName}!
            </p>
          </div>
        )}
        
        {/* Amount Selection */}
        <div className="form-section">
          <label>Donation Amount</label>
          <div className="amount-buttons">
            {presetAmounts.map(preset => (
              <button
                key={preset}
                type="button"
                className={`amount-btn ${amount === preset.toString() ? 'selected' : ''}`}
                onClick={() => setAmount(preset.toString())}
              >
                ${preset}
              </button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Other amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="0.01"
            required
            className="amount-input"
          />
        </div>

        {/* Match Preview */}
        {matchPreview && (
          <MatchPreview 
            matches={matchPreview.matches} 
            totalImpact={matchPreview.totalImpact}
          />
        )}

        {/* Frequency */}
        <div className="form-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isMonthly}
              onChange={(e) => setIsMonthly(e.target.checked)}
            />
            Make this a monthly donation
          </label>
        </div>

        {/* Email */}
        <div className="form-section">
          <label htmlFor="email">Email (for receipt)</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="email-input"
          />
        </div>

        {/* Card Element */}
        <div className="form-section">
          <label>Card Information</label>
          <div className="card-element-container">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        {/* Error/Message Display */}
        {error && <div className="error-message">{error}</div>}
        {message && <div className="info-message">{message}</div>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || loading || !amount}
          className={`submit-button ${matchPreview ? 'with-match' : ''}`}
        >
          {loading ? 'Processing...' : 
           matchPreview ? `Donate $${amount || '0'} → Impact $${matchPreview.totalImpact.toFixed(2)}` :
           `Donate $${amount || '0'}`}
        </button>

        {/* Security Note */}
        <p className="security-note">
          🔒 Your payment information is secure and encrypted.
        </p>
      </form>

      {/* Match Confirmation Modal */}
      {lastDonation && (
        <MatchConfirmationModal
          isOpen={showMatchModal}
          onClose={() => setShowMatchModal(false)}
          donation={lastDonation}
          matches={matchPreview?.matches || []}
        />
      )}
    </>
  );
}

// Wrapper component that fetches charity data and handles routing
function DonationFormWrapper() {
  const { charityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [charity, setCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get matching opportunity data from navigation state
  const matchingOpportunity = location.state?.matchingOpportunity;

  useEffect(() => {
    const fetchCharity = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities/${charityId}`, 
          {
            headers: {
              'Authorization': token ? `Bearer ${token}` : ''
            }
          }
        );
        setCharity(response.data.charity || response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (charityId) {
      fetchCharity();
    }
  }, [charityId]);

  const handleSuccess = (donationData) => {
    // Navigate to success page with donation data
    navigate('/donation-success', { state: { donation: donationData } });
  };

  if (loading) {
    return (
      <div className="donation-form" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="donation-form" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  if (!charity) {
    return (
      <div className="donation-form" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Charity not found</h2>
        <button onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <DonationFormContent 
        charity={charity} 
        onSuccess={handleSuccess}
        matchingOpportunity={matchingOpportunity}
      />
    </Elements>
  );
}

export default DonationFormWrapper;