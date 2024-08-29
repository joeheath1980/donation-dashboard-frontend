import React from 'react';
import styles from '../Impact.module.css';

function DonationsComponent({ donations }) {
  return (
    <div className={styles.donationsContainer}>
      {donations.map((donation, index) => (
        <div key={index} className={styles.donationItem}>
          <strong>Charity:</strong> {donation.charity}<br />
              <strong>Date:</strong> {new Date(donation.date).toLocaleDateString()}<br />
              <strong>Amount:</strong> {donation.amount}<br />
          {donation.subject && (
            <>
              <strong>Subject:</strong> {donation.subject}<br />
            </>
      )}
    </div>
      ))}
    </div>
  );
}

export default DonationsComponent;



