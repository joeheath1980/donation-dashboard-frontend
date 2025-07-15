import React, { useState } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { stripePromise, apiCall } from '../utils/stripe';
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

// Main donation form component
function DonationFormContent({ charity, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [amount, setAmount] = useState('');
  const [isMonthly, setIsMonthly] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create payment intent
      const { clientSecret, donationId, platformFee, matchingAmount } = await apiCall(
        '/stripe/create-payment-intent',
        'POST',
        {
          amount: parseFloat(amount),
          currency: 'usd',
          charityId: charity._id,
          isMonthly
        }
      );

      // Show platform fee and matching info
      if (platformFee > 0) {
        setMessage(`Platform fee: $${platformFee.toFixed(2)}`);
      }
      if (matchingAmount > 0) {
        setMessage(prev => `${prev} | Matching: $${matchingAmount.toFixed(2)}`);
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
        onSuccess({
          paymentIntent: result.paymentIntent,
          donationId,
          amount,
          charity
        });
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
    <form onSubmit={handleSubmit} className="donation-form">
      <h2>Donate to {charity.charityName || charity.Charity_Legal_Name}</h2>
      
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
        className="submit-button"
      >
        {loading ? 'Processing...' : `Donate $${amount || '0'}`}
      </button>

      {/* Security Note */}
      <p className="security-note">
        🔒 Your payment information is secure and encrypted.
      </p>
    </form>
  );
}

// Wrapper component with Stripe Elements
export default function DonationForm({ charity, onSuccess }) {
  return (
    <Elements stripe={stripePromise}>
      <DonationFormContent charity={charity} onSuccess={onSuccess} />
    </Elements>
  );
}