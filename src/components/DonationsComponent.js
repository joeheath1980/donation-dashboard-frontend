import React, { useContext, useEffect, useState } from 'react';
import { ImpactContext } from '../contexts/ImpactContext';
import styles from './DonationCards.module.css';
import { format, parseISO, parse } from 'date-fns';
import DonationConfirmationModal from './DonationConfirmationModal';

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

function DonationsComponent() {
  const { donations, fetchImpactData } = useContext(ImpactContext);
  const [localDonations, setLocalDonations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentDonation, setCurrentDonation] = useState(null);
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    fetchImpactData();
  }, [fetchImpactData]);

  useEffect(() => {
    setLocalDonations(donations);
  }, [donations]);

  const handleDelete = async (donationId) => {
    console.log('Attempting to delete donation with ID:', donationId);
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        const response = await fetch(`http://localhost:3002/api/donations/${donationId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

        if (response.ok) {
          console.log('Donation deleted successfully');
          setLocalDonations(prevDonations => prevDonations.filter(donation => donation._id !== donationId));
          fetchImpactData();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete donation');
        }
      } catch (error) {
        console.error('Error deleting donation:', error);
        alert(`Failed to delete donation: ${error.message}`);
      }
    }
  };

  const handleEdit = (donation) => {
    setCurrentDonation(donation);
    setShowModal(true);
  };

  const handleConfirm = async (editedDonation) => {
    try {
      const response = await fetch(`http://localhost:3002/api/donations/${editedDonation._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editedDonation)
      });

      if (response.ok) {
        setLocalDonations(prevDonations =>
          prevDonations.map(donation =>
            donation._id === editedDonation._id ? editedDonation : donation
          )
        );
        setShowModal(false);
        fetchImpactData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update donation');
      }
    } catch (error) {
      console.error('Error updating donation:', error);
      alert(`Failed to update donation: ${error.message}`);
    }
  };

  const handleShowMore = () => {
    setDisplayCount(prevCount => prevCount + 5);
  };

  return (
    <div className={styles.cardContainer}>
      {localDonations && localDonations.length > 0 ? (
        <>
          {localDonations.slice(0, displayCount).map((donation) => (
            <div key={donation._id} className={styles.card}>
              <div className={styles.cardContent}>
                <h3 className={styles.charityName}>{donation.charity}</h3>
                <p className={styles.donationDetail}><strong>Date:</strong> {formatDate(donation.date)}</p>
                <p className={styles.donationDetail}><strong>Amount:</strong> ${donation.amount}</p>
                <p className={styles.donationDetail}><strong>Charity Type:</strong> {donation.charityType || 'Not specified'}</p>
                {donation.subject && (
                  <p className={styles.donationDetail}><strong>Subject:</strong> {donation.subject}</p>
                )}
              </div>
              <div className={styles.cardActions}>
                <button onClick={() => handleEdit(donation)} className={styles.editButton}>Edit</button>
                <button
                  onClick={() => handleDelete(donation._id)}
                  className={styles.deleteButton}
                  aria-label="Delete Donation"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {localDonations.length > displayCount && (
            <button onClick={handleShowMore} className={styles.showMoreButton}>
              Show More
            </button>
          )}
        </>
      ) : (
        <p className={styles.noDonations}>No donations to display.</p>
      )}
      {showModal && (
        <DonationConfirmationModal
          donation={currentDonation}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default DonationsComponent;