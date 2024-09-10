import React, { useContext, useEffect, useState } from 'react';
import { ImpactContext } from '../contexts/ImpactContext';
import styles from '../Impact.module.css';
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

  return (
    <div className={styles.donationsContainer}>
      {localDonations && localDonations.length > 0 ? (
        localDonations.map((donation) => (
          <div key={donation._id} className={styles.donationItem}>
            <strong>Charity:</strong> {donation.charity}<br />
            <strong>Date:</strong> {formatDate(donation.date)}<br />
            <strong>Amount:</strong> {donation.amount}<br />
            <strong>Tags:</strong> {donation.tags ? donation.tags.join(', ') : 'None'}<br />
            {donation.subject && (
              <>
                <strong>Subject:</strong> {donation.subject}<br />
              </>
            )}
            <button onClick={() => handleEdit(donation)}>Edit</button>
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