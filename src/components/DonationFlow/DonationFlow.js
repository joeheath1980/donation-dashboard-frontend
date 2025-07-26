import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { FaArrowLeft, FaArrowRight, FaCheck, FaCreditCard, FaUniversity } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './DonationFlow.module.css';
import { apiClient } from '../../services/api.service';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Main DonationFlow Component
const DonationFlow = ({ charity, businessMatch = null, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [donationData, setDonationData] = useState({
    amount: null,
    paymentMethodId: null,
    savePaymentMethod: false,
    isRecurring: false,
    frequency: 'monthly'
  });
  const [clientSecret, setClientSecret] = useState(null);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Preset donation amounts based on micro-donation strategy
  const presetAmounts = [
    { value: 5, label: '$5', description: 'Coffee money' },
    { value: 10, label: '$10', description: 'Lunch money' },
    { value: 20, label: '$20', description: 'Weekly support' },
    { value: 50, label: '$50', description: 'Monthly impact' },
    { value: 100, label: '$100', description: 'Major support' },
    { value: 'custom', label: 'Other', description: 'Choose amount' }
  ];

  // Fetch saved payment methods on mount
  useEffect(() => {
    fetchSavedPaymentMethods();
  }, []);

  const fetchSavedPaymentMethods = async () => {
    try {
      const response = await apiClient.get('/payment-methods');
      setSavedPaymentMethods(response.data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  // Create payment intent when amount is selected
  useEffect(() => {
    if (donationData.amount && currentStep === 2) {
      createPaymentIntent();
    }
  }, [donationData.amount, currentStep]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post('/donations/create-payment-intent', {
        amount: donationData.amount,
        charityId: charity.id,
        businessMatchId: businessMatch?.id
      });
      setClientSecret(response.data.clientSecret);
    } catch (error) {
      setError('Failed to initialize payment. Please try again.');
      console.error('Payment intent error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSelect = (amount) => {
    if (amount === 'custom') {
      // Handle custom amount input
      const customAmount = prompt('Enter custom amount:');
      if (customAmount && !isNaN(customAmount) && customAmount > 0) {
        setDonationData({ ...donationData, amount: parseFloat(customAmount) });
        setCurrentStep(2);
      }
    } else {
      setDonationData({ ...donationData, amount });
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const calculateMatchAmount = () => {
    if (!businessMatch || !donationData.amount) return 0;
    return donationData.amount * (businessMatch.multiplier || 2);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <AmountStep 
          presetAmounts={presetAmounts}
          onAmountSelect={handleAmountSelect}
          donationData={donationData}
          setDonationData={setDonationData}
        />;
      
      case 2:
        return clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentStep
              donationData={donationData}
              setDonationData={setDonationData}
              savedPaymentMethods={savedPaymentMethods}
              onBack={handleBack}
              onComplete={(paymentData) => {
                setDonationData({ ...donationData, ...paymentData });
                setCurrentStep(3);
              }}
            />
          </Elements>
        ) : (
          <div className={styles.loading}>Loading payment options...</div>
        );
      
      case 3:
        return <ConfirmationStep
          charity={charity}
          donationData={donationData}
          businessMatch={businessMatch}
          matchAmount={calculateMatchAmount()}
          onBack={handleBack}
          onConfirm={() => setCurrentStep(4)}
        />;
      
      case 4:
        return <SuccessStep
          charity={charity}
          donationData={donationData}
          businessMatch={businessMatch}
          matchAmount={calculateMatchAmount()}
          onClose={onClose}
        />;
      
      default:
        return null;
    }
  };

  return (
    <div className={styles.donationFlow}>
      <div className={styles.header}>
        <h2>Donate to {charity.name}</h2>
        <div className={styles.steps}>
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`${styles.step} ${currentStep >= step ? styles.active : ''}`}
            >
              <div className={styles.stepNumber}>{step}</div>
              <span className={styles.stepLabel}>
                {step === 1 && 'Amount'}
                {step === 2 && 'Payment'}
                {step === 3 && 'Confirm'}
                {step === 4 && 'Complete'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={styles.stepContent}
        >
          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
    </div>
  );
};

// Step 1: Amount Selection Component
const AmountStep = ({ presetAmounts, onAmountSelect, donationData, setDonationData }) => {
  return (
    <div className={styles.amountStep}>
      <h3>Choose your donation amount</h3>
      <p className={styles.subtitle}>Every dollar makes a difference</p>
      
      <div className={styles.amountGrid}>
        {presetAmounts.map((preset) => (
          <button
            key={preset.value}
            className={styles.amountButton}
            onClick={() => onAmountSelect(preset.value)}
          >
            <span className={styles.amountLabel}>{preset.label}</span>
            <span className={styles.amountDescription}>{preset.description}</span>
          </button>
        ))}
      </div>

      <div className={styles.donationOptions}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={donationData.isRecurring}
            onChange={(e) => setDonationData({
              ...donationData,
              isRecurring: e.target.checked
            })}
          />
          <span>Make this a monthly donation</span>
        </label>

        {donationData.isRecurring && (
          <div className={styles.frequencyOptions}>
            <label>
              <input
                type="radio"
                name="frequency"
                value="weekly"
                checked={donationData.frequency === 'weekly'}
                onChange={(e) => setDonationData({
                  ...donationData,
                  frequency: e.target.value
                })}
              />
              Weekly
            </label>
            <label>
              <input
                type="radio"
                name="frequency"
                value="monthly"
                checked={donationData.frequency === 'monthly'}
                onChange={(e) => setDonationData({
                  ...donationData,
                  frequency: e.target.value
                })}
              />
              Monthly
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

// Step 2: Payment Method Component
const PaymentStep = ({ donationData, setDonationData, savedPaymentMethods, onBack, onComplete }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [useNewCard, setUseNewCard] = useState(savedPaymentMethods.length === 0);
  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe) return;

    setProcessing(true);

    try {
      if (useNewCard) {
        // Process with new payment method
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.origin + '/donation-success',
          },
          redirect: 'if_required'
        });

        if (error) {
          throw new Error(error.message);
        }

        onComplete({
          paymentIntentId: paymentIntent.id,
          paymentMethodId: paymentIntent.payment_method
        });
      } else {
        // Process with saved payment method
        const response = await apiClient.post('/donations/confirm-with-saved-method', {
          paymentMethodId: selectedMethodId,
          amount: donationData.amount,
          charityId: donationData.charityId
        });

        onComplete({
          paymentIntentId: response.data.paymentIntentId,
          paymentMethodId: selectedMethodId
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form className={styles.paymentStep} onSubmit={handleSubmit}>
      <h3>Payment Method</h3>

      {savedPaymentMethods.length > 0 && (
        <div className={styles.paymentOptions}>
          <div className={styles.savedMethods}>
            <h4>Saved Payment Methods</h4>
            {savedPaymentMethods.map((method) => (
              <label key={method.id} className={styles.savedMethod}>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={selectedMethodId === method.id && !useNewCard}
                  onChange={() => {
                    setSelectedMethodId(method.id);
                    setUseNewCard(false);
                  }}
                />
                <div className={styles.methodInfo}>
                  {method.type === 'card' && <FaCreditCard />}
                  {method.type === 'bank_account' && <FaUniversity />}
                  <span>{method.brand} •••• {method.last4}</span>
                  <span className={styles.expiry}>Exp: {method.exp_month}/{method.exp_year}</span>
                </div>
              </label>
            ))}
          </div>

          <label className={styles.newMethodOption}>
            <input
              type="radio"
              name="paymentMethod"
              checked={useNewCard}
              onChange={() => setUseNewCard(true)}
            />
            <span>Use a new payment method</span>
          </label>
        </div>
      )}

      {useNewCard && (
        <div className={styles.newPaymentMethod}>
          <PaymentElement options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'bank']
          }} />

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={donationData.savePaymentMethod}
              onChange={(e) => setDonationData({
                ...donationData,
                savePaymentMethod: e.target.checked
              })}
            />
            <span>Save this payment method for future donations</span>
          </label>
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
        >
          <FaArrowLeft /> Back
        </button>
        <button
          type="submit"
          className={styles.continueButton}
          disabled={!stripe || processing}
        >
          {processing ? 'Processing...' : 'Continue'} <FaArrowRight />
        </button>
      </div>
    </form>
  );
};

// Step 3: Confirmation Component
const ConfirmationStep = ({ charity, donationData, businessMatch, matchAmount, onBack, onConfirm }) => {
  const totalImpact = donationData.amount + matchAmount;

  return (
    <div className={styles.confirmationStep}>
      <h3>Confirm Your Donation</h3>

      <div className={styles.donationSummary}>
        <div className={styles.summaryRow}>
          <span>Your donation</span>
          <span className={styles.amount}>${donationData.amount}</span>
        </div>

        {businessMatch && (
          <>
            <div className={styles.summaryRow}>
              <span>{businessMatch.businessName} match ({businessMatch.multiplier}x)</span>
              <span className={styles.matchAmount}>+${matchAmount}</span>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.summaryRow}>
              <span className={styles.totalLabel}>Total Impact</span>
              <span className={styles.totalAmount}>${totalImpact}</span>
            </div>
          </>
        )}
      </div>

      <div className={styles.charityInfo}>
        <h4>Donating to</h4>
        <div className={styles.charityDetails}>
          <img src={charity.logo || '/default-charity-logo.png'} alt={charity.name} />
          <div>
            <h5>{charity.name}</h5>
            <p>{charity.mission}</p>
          </div>
        </div>
      </div>

      {donationData.isRecurring && (
        <div className={styles.recurringInfo}>
          <p>This will be a {donationData.frequency} recurring donation</p>
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
        >
          <FaArrowLeft /> Back
        </button>
        <button
          type="button"
          className={styles.confirmButton}
          onClick={onConfirm}
        >
          Complete Donation <FaCheck />
        </button>
      </div>
    </div>
  );
};

// Step 4: Success Component
const SuccessStep = ({ charity, donationData, businessMatch, matchAmount, onClose }) => {
  const [receiptUrl, setReceiptUrl] = useState(null);
  const totalImpact = donationData.amount + matchAmount;

  useEffect(() => {
    // Generate receipt
    generateReceipt();
  }, []);

  const generateReceipt = async () => {
    try {
      const response = await apiClient.post('/donations/generate-receipt', {
        donationId: donationData.donationId
      });
      setReceiptUrl(response.data.receiptUrl);
    } catch (error) {
      console.error('Error generating receipt:', error);
    }
  };

  const handleShare = (platform) => {
    const message = `I just donated $${donationData.amount} to ${charity.name}${
      businessMatch ? ` and ${businessMatch.businessName} matched it with $${matchAmount}!` : '!'
    } Join me in making a difference on @DoNation`;

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`
    };

    window.open(urls[platform], '_blank');
  };

  return (
    <div className={styles.successStep}>
      <div className={styles.successIcon}>
        <FaCheck />
      </div>

      <h3>Thank You!</h3>
      <p className={styles.successMessage}>
        Your donation of ${donationData.amount} to {charity.name} is complete.
      </p>

      {businessMatch && (
        <div className={styles.matchCelebration}>
          <h4>🎉 Matched!</h4>
          <p>{businessMatch.businessName} matched your donation with ${matchAmount}</p>
          <p className={styles.totalImpact}>Total Impact: ${totalImpact}</p>
        </div>
      )}

      <div className={styles.receiptSection}>
        {receiptUrl && (
          <a
            href={receiptUrl}
            download={`donation-receipt-${donationData.donationId}.pdf`}
            className={styles.downloadReceipt}
          >
            Download Receipt
          </a>
        )}
      </div>

      <div className={styles.shareSection}>
        <h4>Share Your Impact</h4>
        <div className={styles.shareButtons}>
          <button onClick={() => handleShare('twitter')}>Twitter</button>
          <button onClick={() => handleShare('facebook')}>Facebook</button>
          <button onClick={() => handleShare('linkedin')}>LinkedIn</button>
        </div>
      </div>

      <button className={styles.doneButton} onClick={onClose}>
        Done
      </button>
    </div>
  );
};

export default DonationFlow;