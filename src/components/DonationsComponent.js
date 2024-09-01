import React from 'react';
import styles from '../Impact.module.css';
import axios from 'axios';

function DonationsComponent({ donations, setDonations }) {

  const handleDelete = async (index, donationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3002/api/donations/${donationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Remove the donation from the state
      const updatedDonations = donations.filter((_, i) => i !== index);
      setDonations(updatedDonations);

    } catch (error) {
      console.error('Error deleting donation:', error);
      alert('Failed to delete donation. Please try again.');
    }
  };

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
          <button
            className={styles.deleteIcon}
            onClick={() => handleDelete(index, donation._id)}
            aria-label="Delete Donation"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

export default DonationsComponent;




