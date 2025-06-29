import React from 'react';
import { FaCheckCircle, FaEdit, FaTrash } from 'react-icons/fa';
import InstantTooltip from './InstantTooltip';
import { format, parseISO, parse } from 'date-fns';
import styles from './DonationsComponent.module.css';
import sharedStyles from './SharedStyles.css';
import { createLogger } from '../utils/logger';

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
  onReceiptClick 
}) => {
  return (
    <div className={styles.donationCard}>
      <div className={sharedStyles.cardHeader}>
        <h3 className={sharedStyles.cardTitle}>{donation.charity}</h3>
        <div className={sharedStyles.validationButton}>
          <InstantTooltip text={donation.receiptUrl ? "Receipt uploaded" : "No receipt uploaded"}>
            <FaCheckCircle className={donation.receiptUrl ? styles.validationIcon : styles.validationIconPending} />
          </InstantTooltip>
        </div>
      </div>
      <div className={styles.donationContent}>
        <p><strong>Date:</strong> {formatDate(donation.date)}</p>
        <p>
          <strong>Amount:</strong> ${donation.amount.toFixed(2)}
          {donation.isMonthly && <span className={sharedStyles.highlight}> (Monthly)</span>}
        </p>
        <p><strong>Charity Type:</strong> {donation.charityType || 'Not specified'}</p>
        {donation.receiptUrl && (
          <p>
            <strong>Receipt:</strong>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onReceiptClick(donation.receiptUrl);
              }}
              className={sharedStyles.link}
            >
              View Receipt
            </a>
          </p>
        )}
      </div>
      <div className={sharedStyles.cardActions}>
        <InstantTooltip text="Edit donation">
          <button onClick={() => onEdit(donation)} className={styles.iconButton} aria-label="Edit Donation">
            <FaEdit />
          </button>
        </InstantTooltip>
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
    prevProps.donation.isMonthly === nextProps.donation.isMonthly
  );
});

DonationItem.displayName = 'DonationItem';

export default DonationItem;