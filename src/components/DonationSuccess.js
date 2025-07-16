import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './DonationSuccess.css';

function DonationSuccess({ donation: propDonation, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get donation data from navigation state or props
  const donation = propDonation || location.state?.donation;

  // If no donation data, redirect to dashboard
  if (!donation) {
    return (
      <div className="donation-success">
        <div className="success-content">
          <h1>No donation data found</h1>
          <Link to="/dashboard" className="primary-button">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="donation-success">
      <div className="success-content">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1>Thank You for Your Donation!</h1>
        
        <div className="donation-summary">
          <div className="summary-item">
            <span className="label">Amount:</span>
            <span className="value">{formatAmount(donation.amount)}</span>
          </div>
          
          <div className="summary-item">
            <span className="label">To:</span>
            <span className="value">{donation.charity?.charityName || donation.charity?.Charity_Legal_Name}</span>
          </div>
          
          <div className="summary-item">
            <span className="label">Date:</span>
            <span className="value">{formatDate(donation.paymentIntent?.created * 1000 || new Date())}</span>
          </div>
          
          <div className="summary-item">
            <span className="label">Transaction ID:</span>
            <span className="value transaction-id">{donation.paymentIntent?.id}</span>
          </div>
        </div>

        <div className="receipt-note">
          <p>
            📧 A receipt has been sent to your email address. 
            Please keep this for your tax records.
          </p>
        </div>

        <div className="impact-message">
          <h3>Your Impact</h3>
          <p>
            Your generous donation of {formatAmount(donation.amount)} will help{' '}
            {donation.charity?.charityName || donation.charity?.Charity_Legal_Name} continue
            their important work. Thank you for making a difference!
          </p>
        </div>

        <div className="action-buttons">
          <Link to="/dashboard" className="primary-button">
            View Dashboard
          </Link>
          
          <Link to="/charities" className="secondary-button">
            Donate to Another Charity
          </Link>
          
          {onClose && (
            <button onClick={onClose} className="close-button">
              Close
            </button>
          )}
        </div>

        <div className="social-share">
          <h4>Share Your Impact</h4>
          <div className="share-buttons">
            <button 
              onClick={() => {
                const text = `I just donated ${formatAmount(donation.amount)} to ${donation.charity?.charityName || donation.charity?.Charity_Legal_Name}! 🙏`;
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
              }}
              className="share-button twitter"
            >
              Share on Twitter
            </button>
            
            <button 
              onClick={() => {
                const text = `I just donated ${formatAmount(donation.amount)} to ${donation.charity?.charityName || donation.charity?.Charity_Legal_Name}!`;
                const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
              }}
              className="share-button facebook"
            >
              Share on Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonationSuccess;