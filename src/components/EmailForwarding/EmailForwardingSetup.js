import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaCopy, 
  FaCheckCircle, 
  FaEnvelope, 
  FaPaperPlane,
  FaSpinner,
  FaInfoCircle 
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './EmailForwardingSetup.module.css';
import { apiClient } from '../../services/api.service';

const EmailForwardingSetup = () => {
  const { user } = useAuth();
  const [forwardingEmail, setForwardingEmail] = useState('');
  const [activeProvider, setActiveProvider] = useState('gmail');
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [copied, setCopied] = useState(false);

  const providers = [
    { id: 'gmail', name: 'Gmail', icon: '📧' },
    { id: 'outlook', name: 'Outlook', icon: '📮' },
    { id: 'yahoo', name: 'Yahoo', icon: '📬' },
    { id: 'other', name: 'Other', icon: '✉️' }
  ];

  useEffect(() => {
    if (user && user._id) {
      const email = `donor-${user._id}@forward.do-nation.space`;
      setForwardingEmail(email);
      checkVerificationStatus();
    }
  }, [user]);

  const checkVerificationStatus = async () => {
    try {
      const response = await apiClient.get('/email-forwarding/verify');
      setVerificationStatus(response.data.status || 'pending');
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!', {
        position: "bottom-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy. Please try again.');
    }
  };

  const sendTestReceipt = async () => {
    setSendingTest(true);
    try {
      await apiClient.post('/email-forwarding/send-test', {
        email: forwardingEmail
      });
      setTestEmailSent(true);
      toast.success('Test receipt sent! Check your inbox in a few minutes.', {
        position: "bottom-right",
        autoClose: 5000,
      });
      
      // Start checking for verification
      setTimeout(() => {
        checkVerificationStatus();
      }, 5000);
    } catch (error) {
      toast.error('Failed to send test receipt. Please try again.');
      console.error('Error sending test receipt:', error);
    } finally {
      setSendingTest(false);
    }
  };

  const getProviderInstructions = () => {
    const instructions = {
      gmail: {
        steps: [
          'Open Gmail and click the search bar',
          'Click the filter icon (🔽) on the right side',
          'In "From" field, enter: noreply@paypal.com OR receipts@stripe.com',
          'In "Subject" field, enter: receipt OR donation',
          'Click "Search" to find your receipts',
          'Select emails and click Forward',
          `Forward to: ${forwardingEmail}`
        ],
        tips: [
          'Use Gmail filters to auto-forward future receipts',
          'You can search for specific date ranges',
          'Include attachments by checking "Has attachment"'
        ]
      },
      outlook: {
        steps: [
          'Open Outlook and click in the search box',
          'Type: from:(noreply@paypal.com OR receipts@stripe.com)',
          'Add: AND subject:(receipt OR donation)',
          'Press Enter to search',
          'Select the receipts you want to track',
          'Right-click and choose Forward',
          `Send to: ${forwardingEmail}`
        ],
        tips: [
          'Use Search Tools for advanced filtering',
          'Create rules to auto-forward future receipts',
          'Sort by date to find recent donations'
        ]
      },
      yahoo: {
        steps: [
          'Open Yahoo Mail search',
          'Search for: donation receipt',
          'Or search by sender: from:paypal.com',
          'Select the emails to forward',
          'Click Forward button',
          `Enter: ${forwardingEmail}`
        ],
        tips: [
          'Yahoo search supports basic operators',
          'Filter by date using the sidebar',
          'Check Spam folder for missing receipts'
        ]
      },
      other: {
        steps: [
          'Search your email for keywords: donation, receipt, charitable',
          'Look for emails from: PayPal, Stripe, donation platforms',
          'Select the receipt emails',
          'Forward them to your unique address',
          `Your address: ${forwardingEmail}`
        ],
        tips: [
          'Most email providers support search filters',
          'Check both inbox and spam folders',
          'Look for PDF attachments'
        ]
      }
    };

    return instructions[activeProvider] || instructions.other;
  };

  const { steps, tips } = getProviderInstructions();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Email Receipt Forwarding</h2>
        <p className={styles.subtitle}>
          Automatically track all your donations by forwarding receipt emails
        </p>
      </div>

      {/* Forwarding Address Section */}
      <div className={styles.addressSection}>
        <div className={styles.addressHeader}>
          <h3>
            <FaEnvelope /> Your Unique Forwarding Address
          </h3>
          {verificationStatus === 'verified' && (
            <span className={styles.verifiedBadge}>
              <FaCheckCircle /> Verified
            </span>
          )}
        </div>

        <div className={styles.addressBox}>
          <code className={styles.address}>{forwardingEmail}</code>
          <button
            className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
            onClick={() => copyToClipboard(forwardingEmail)}
          >
            {copied ? <FaCheckCircle /> : <FaCopy />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <p className={styles.addressInfo}>
          <FaInfoCircle /> Forward any donation receipt to this address and we'll automatically add it to your dashboard
        </p>

        {/* Test Receipt Button */}
        <div className={styles.testSection}>
          <button
            className={styles.testButton}
            onClick={sendTestReceipt}
            disabled={sendingTest || testEmailSent}
          >
            {sendingTest ? (
              <>
                <FaSpinner className={styles.spinner} />
                Sending...
              </>
            ) : testEmailSent ? (
              <>
                <FaCheckCircle />
                Test Sent!
              </>
            ) : (
              <>
                <FaPaperPlane />
                Send Test Receipt
              </>
            )}
          </button>
          <p className={styles.testInfo}>
            We'll send a sample receipt to test your forwarding
          </p>
        </div>
      </div>

      {/* Provider Selection */}
      <div className={styles.providerSection}>
        <h3>Select Your Email Provider</h3>
        <div className={styles.providerGrid}>
          {providers.map((provider) => (
            <button
              key={provider.id}
              className={`${styles.providerCard} ${
                activeProvider === provider.id ? styles.active : ''
              }`}
              onClick={() => setActiveProvider(provider.id)}
            >
              <span className={styles.providerIcon}>{provider.icon}</span>
              <span className={styles.providerName}>{provider.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Instructions Section */}
      <div className={styles.instructionsSection}>
        <h3>How to Forward from {providers.find(p => p.id === activeProvider)?.name}</h3>
        
        <div className={styles.steps}>
          <h4>Steps:</h4>
          <ol>
            {steps.map((step, index) => (
              <li key={index} className={styles.step}>
                {step}
                {step.includes(forwardingEmail) && (
                  <button
                    className={styles.inlineCopy}
                    onClick={() => copyToClipboard(forwardingEmail)}
                    title="Copy address"
                  >
                    <FaCopy />
                  </button>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.tips}>
          <h4>💡 Pro Tips:</h4>
          <ul>
            {tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Common Search Queries */}
      <div className={styles.queriesSection}>
        <h3>Common Search Queries</h3>
        <p className={styles.queriesInfo}>
          Copy these to quickly find donation receipts:
        </p>
        <div className={styles.queryList}>
          {[
            'from:noreply@paypal.com subject:receipt',
            'from:receipts@stripe.com',
            'subject:"donation receipt"',
            'has:attachment donation',
            'from:*@canadahelps.org'
          ].map((query, index) => (
            <div key={index} className={styles.queryItem}>
              <code>{query}</code>
              <button
                className={styles.queryCopy}
                onClick={() => copyToClipboard(query)}
                title="Copy query"
              >
                <FaCopy />
              </button>
            </div>
          ))}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default EmailForwardingSetup;