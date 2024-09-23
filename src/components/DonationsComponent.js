import React, { useContext, useEffect, useState } from 'react';
import { ImpactContext } from '../contexts/ImpactContext';
import styles from './DonationCards.module.css';
import { format, parseISO, parse } from 'date-fns';
import DonationConfirmationModal from './DonationConfirmationModal';
import ValidationModal from './ValidationModal';

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

function DonationsComponent({ displayAll }) {
  const { donations, fetchImpactData, isAuthenticated } = useContext(ImpactContext);
  const [localDonations, setLocalDonations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [currentDonation, setCurrentDonation] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchImpactData();
    }
  }, [fetchImpactData, isAuthenticated]);

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
          if (isAuthenticated) {
            fetchImpactData();
          }
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
    console.log('Edit button clicked for donation:', donation);
    setCurrentDonation(donation);
    setShowModal(true);
  };

  const handleConfirm = async (editedDonation) => {
    console.log('Saving edited donation:', editedDonation);
    const amount = parseFloat(editedDonation.amount);
    if (isNaN(amount)) {
      alert('Please enter a valid amount.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3002/api/donations/${editedDonation._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...editedDonation, amount, needsValidation: true })
      });

      if (response.ok) {
        const updatedDonation = await response.json();
        console.log('Server response:', updatedDonation);
        setLocalDonations(prevDonations =>
          prevDonations.map(donation =>
            donation._id === updatedDonation._id ? updatedDonation : donation
          )
        );
        setShowModal(false);
        if (isAuthenticated) {
          fetchImpactData();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update donation');
      }
    } catch (error) {
      console.error('Error updating donation:', error);
      alert(`Failed to update donation: ${error.message}`);
    }
  };

  const handleValidate = (donation) => {
    console.log('Validate button clicked for donation:', donation);
    setCurrentDonation({ ...donation, type: 'donation' });
    setShowValidationModal(true);
  };

  const handleValidationComplete = async (validatedDonation) => {
    console.log('Validation complete for donation:', validatedDonation);
    try {
      setLocalDonations(prevDonations =>
        prevDonations.map(donation =>
          donation._id === validatedDonation._id ? validatedDonation : donation
        )
      );
      setShowValidationModal(false);
      setCurrentDonation(null);
      if (isAuthenticated) {
        fetchImpactData();
      }
    } catch (error) {
      console.error('Error handling validation completion:', error);
      alert(`Failed to handle validation completion: ${error.message}`);
    }
  };

  const displayedDonations = displayAll ? localDonations : localDonations.slice(0, 5);

  if (!isAuthenticated) {
    return <div className={styles.card}>Please log in to view your donations.</div>;
  }

  return (
    <div className={styles.cardContainer}>
      {displayedDonations && displayedDonations.length > 0 ? (
        <>
          {displayedDonations.map((donation) => (
            <div key={donation._id} className={styles.card}>
              {donation.needsValidation && (
                <button 
                  onClick={() => handleValidate(donation)} 
                  className={`${styles.validateButton} ${styles.topRightButton}`}
                >
                  Please Validate
                </button>
              )}
              <div className={styles.cardContent}>
                <h3 className={styles.charityName}>{donation.charity}</h3>
                <p className={styles.donationDetail}><strong>Date:</strong> {formatDate(donation.date)}</p>
                <p className={styles.donationDetail}>
                  <strong>Amount:</strong> ${donation.amount.toFixed(2)}
                  {donation.isMonthly && <span className={styles.monthlyTag}> (Monthly)</span>}
                </p>
                <p className={styles.donationDetail}><strong>Charity Type:</strong> {donation.charityType || 'Not specified'}</p>
                {donation.subject && (
                  <p className={styles.donationDetail}><strong>Subject:</strong> {donation.subject}</p>
                )}
                {donation.receiptUrl && (
                  <p className={styles.donationDetail}>
                    <strong>Receipt:</strong> 
                    <a 
                      href={`http://localhost:3002${donation.receiptUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View Receipt
                    </a>
                  </p>
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
      {showValidationModal && currentDonation && (
        <ValidationModal
          item={currentDonation}
          onValidate={handleValidationComplete}
          onCancel={() => {
            console.log('Validation modal closed');
            setShowValidationModal(false);
            setCurrentDonation(null);
          }}
        />
      )}
    </div>
  );
}

export default DonationsComponent;
