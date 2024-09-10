import React, { useContext, useEffect, useState } from 'react';
import { ImpactContext } from '../contexts/ImpactContext';
import styles from './DonationCards.module.css';
import { format, parseISO, parse } from 'date-fns';
import OneOffContributionModal from './OneOffContributionModal';

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

function OneOffContributionsComponent() {
  const { oneOffContributions, onDeleteContribution, fetchImpactData } = useContext(ImpactContext);
  const [editingContribution, setEditingContribution] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    fetchImpactData();
  }, [fetchImpactData]);

  const handleDelete = async (contributionId) => {
    if (window.confirm('Are you sure you want to delete this contribution?')) {
      try {
        await onDeleteContribution(contributionId);
        console.log('Contribution deleted successfully');
        fetchImpactData(); // Refresh the data after deletion
      } catch (error) {
        console.error('Error deleting contribution:', error);
        alert(`Failed to delete contribution: ${error.message}`);
      }
    }
  };

  const handleEdit = (contribution) => {
    console.log('Edit button clicked for contribution:', contribution);
    setEditingContribution(contribution);
    setShowModal(true);
    console.log('showModal set to:', true);
  };

  const handleSave = async (editedContribution) => {
    try {
      const response = await fetch(`http://localhost:3002/api/contributions/one-off/${editedContribution._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editedContribution)
      });

      if (response.ok) {
        setShowModal(false);
        fetchImpactData(); // Refresh the data after update
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update contribution');
      }
    } catch (error) {
      console.error('Error updating contribution:', error);
      alert(`Failed to update contribution: ${error.message}`);
    }
  };

  const handleShowMore = () => {
    setDisplayCount(prevCount => prevCount + 5);
  };

  console.log('Current state - showModal:', showModal, 'editingContribution:', editingContribution);

  return (
    <div className={styles.cardContainer}>
      {oneOffContributions && oneOffContributions.length > 0 ? (
        <>
          {oneOffContributions.slice(0, displayCount).map((contribution) => (
            <div key={contribution._id} className={styles.card}>
              <div className={styles.cardContent}>
                <h3 className={styles.charityName}>{contribution.charity}</h3>
                <p className={styles.donationDetail}><strong>Date:</strong> {formatDate(contribution.date)}</p>
                <p className={styles.donationDetail}><strong>Amount:</strong> ${contribution.amount}</p>
                <p className={styles.donationDetail}><strong>Charity Type:</strong> {contribution.charityType || 'Not specified'}</p>
                {contribution.subject && (
                  <p className={styles.donationDetail}><strong>Subject:</strong> {contribution.subject}</p>
                )}
              </div>
              <div className={styles.cardActions}>
                <button onClick={() => handleEdit(contribution)} className={styles.editButton}>Edit</button>
                <button
                  onClick={() => handleDelete(contribution._id)}
                  className={styles.deleteButton}
                  aria-label="Delete Contribution"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {oneOffContributions.length > displayCount && (
            <button onClick={handleShowMore} className={styles.showMoreButton}>
              Show More
            </button>
          )}
        </>
      ) : (
        <p className={styles.noDonations}>No one-off contributions found.</p>
      )}
      {showModal && (
        <OneOffContributionModal
          contribution={editingContribution}
          onConfirm={handleSave}
          onCancel={() => {
            console.log('Modal closed');
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

export default OneOffContributionsComponent;