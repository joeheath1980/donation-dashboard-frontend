import React from 'react';
import styles from '../Impact.module.css';
import { format, parseISO, parse } from 'date-fns';

function formatDate(dateString) {
  let date;
  
  try {
    date = parseISO(dateString);
  } catch (error) {
    try {
      date = parse(dateString, "EEE, dd MMM yyyy HH:mm:ss xx", new Date());
    } catch (error) {
      console.error("Failed to parse date:", dateString);
      return dateString;
    }
  }
  
  return format(date, 'dd/MM/yyyy');
}

function DonationsComponent({ donations, onDeleteDonation }) {
  const handleDelete = async (donationId) => {
    console.log('Attempting to delete donation with ID:', donationId);
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await onDeleteDonation(donationId);
        console.log('Donation deleted successfully');
      } catch (error) {
        console.error('Error deleting donation:', error);
        alert(`Failed to delete donation: ${error.message}`);
      }
    }
  };

  return (
    <div className={styles.donationsContainer}>
      {donations && donations.length > 0 ? (
        donations.map((donation) => (
          <div key={donation._id} className={styles.donationItem}>
            <strong>Charity:</strong> {donation.charity}<br />
            <strong>Date:</strong> {formatDate(donation.date)}<br />
            <strong>Amount:</strong> {donation.amount}<br />
            {donation.subject && (
              <>
                <strong>Subject:</strong> {donation.subject}<br />
              </>
            )}
            <button
              className={styles.deleteIcon}
              onClick={() => handleDelete(donation._id)}
              aria-label="Delete Donation"
            >
              &times;
            </button>
          </div>
        ))
      ) : (
        <p>No donations to display.</p>
      )}
    </div>
  );
}

export default DonationsComponent;