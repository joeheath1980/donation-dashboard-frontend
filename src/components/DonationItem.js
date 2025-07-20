import React from 'react';
import { FaCheckCircle, FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import InstantTooltip from './InstantTooltip';
import { format, parseISO, parse } from 'date-fns';
import styles from './DonationsComponent.module.css';
import './SharedStyles.css';
import { createLogger } from '../utils/logger';
import DefaultBusinessLogo from './DefaultBusinessLogo';

const logger = createLogger('DonationItem');

function formatDate(dateString) {
  let date;

  try {
    date = parseISO(dateString);
  } catch (error) {
    try {
      date = parse(dateString, "EEE, dd MMM solubilities HH:mm:ss xx", new Date());
    } catch (error) {
      logger.error("Failed to parse date", { dateString });
      return dateString;
    }
  }

  return format(date, 'dd/MM/yyyy');
}

// Memoized donation item component for performance
const DonationItem = React.memo(({ 
  donation, 
  onEdit, 
  onDelete, 
  onReceiptClick,
  onReceiptDownload 
}) => {
  // Calculate total impact including matches
  const totalMatched = donation.matches ? 
    donation.matches.reduce((sum, match) => sum + match.matchAmount, 0) : 0;
  const totalImpact = donation.amount + totalMatched;
  const hasMatches = donation.matches && donation.matches.length > 0;

  return (
    <div className={`${styles.donationCard} ${hasMatches ? styles.matchedDonation : ''}`}>
      <div className="cardHeader">
        <h3 className="cardTitle">
          {donation.charity}
          {hasMatches && (
            <span className={styles.matchBadge}>
              🎯 Matched
            </span>
          )}
        </h3>
        <div className="validationButton">
          <InstantTooltip text={donation.receiptUrl ? "Receipt uploaded" : "No receipt uploaded"}>
            <FaCheckCircle className={donation.receiptUrl ? styles.validationIcon : styles.validationIconPending} />
          </InstantTooltip>
        </div>
      </div>
      
      {/* Business Match Logos */}
      {hasMatches && (
        <div className={styles.matchingBusinesses}>
          {donation.matches.map((match, index) => (
            <div key={index} className={styles.businessMatch}>
              {match.businessLogo ? (
                <img 
                  src={match.businessLogo} 
                  alt={match.businessName}
                  className={styles.businessLogo}
                />
              ) : (
                <DefaultBusinessLogo size={32} />
              )}
              <span className={styles.matchInfo}>
                {match.businessName} matched {match.multiplier}x
              </span>
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.donationContent}>
        <p><strong>Date:</strong> {formatDate(donation.date)}</p>
        <p>
          <strong>Your Donation:</strong> ${donation.amount.toFixed(2)}
          {donation.isMonthly && <span className="highlight"> (Monthly)</span>}
        </p>
        
        {/* Impact Summary */}
        {hasMatches && (
          <div className={styles.impactSummary}>
            <p className={styles.matchedAmount}>
              <strong>Matched Amount:</strong> ${totalMatched.toFixed(2)}
            </p>
            <p className={styles.totalImpact}>
              <strong>Total Impact:</strong> 
              <span className={styles.impactValue}>${totalImpact.toFixed(2)}</span>
            </p>
          </div>
        )}
        
        <p><strong>Charity Type:</strong> {donation.charityType || 'Not specified'}</p>
        {donation.receiptUrl && (
          <p>
            <strong>Receipt:</strong>
            <button
              onClick={() => onReceiptClick(donation.receiptUrl)}
              className="link"
              style={{ 
                background: 'none', 
                border: 'none', 
                padding: 0, 
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              View Receipt
            </button>
          </p>
        )}
      </div>
      <div className="cardActions">
        <InstantTooltip text="Edit donation">
          <button onClick={() => onEdit(donation)} className={styles.iconButton} aria-label="Edit Donation">
            <FaEdit />
          </button>
        </InstantTooltip>
        {donation.receiptUrl && onReceiptDownload && (
          <InstantTooltip text="Download receipt">
            <button
              onClick={() => onReceiptDownload(donation)}
              className={styles.iconButton}
              aria-label="Download Receipt"
            >
              <FaDownload />
            </button>
          </InstantTooltip>
        )}
        <InstantTooltip text="Delete donation">
          <button
            onClick={() => onDelete(donation._id)}
            className={styles.iconButton}
            aria-label="Delete Donation"
          >
            <FaTrash />
          </button>
        </InstantTooltip>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.donation._id === nextProps.donation._id &&
    prevProps.donation.amount === nextProps.donation.amount &&
    prevProps.donation.receiptUrl === nextProps.donation.receiptUrl &&
    prevProps.donation.isMonthly === nextProps.donation.isMonthly &&
    JSON.stringify(prevProps.donation.matches) === JSON.stringify(nextProps.donation.matches)
  );
});

DonationItem.displayName = 'DonationItem';

export default DonationItem;