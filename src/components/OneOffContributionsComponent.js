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

function OneOffContributionsComponent({ displayAll }) {
  const { oneOffContributions, onDeleteContribution, fetchImpactData } = useContext(ImpactContext);
  const [localContributions, setLocalContributions] = useState([]);
  const [editingContribution, setEditingContribution] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log('Fetching impact data...');
    fetchImpactData();
  }, [fetchImpactData]);

  useEffect(() => {
    console.log('oneOffContributions updated:', oneOffContributions);
    setLocalContributions(oneOffContributions);
  }, [oneOffContributions]);

  const handleDelete = async (contributionId) => {
    if (window.confirm('Are you sure you want to delete this contribution?')) {
      try {
        console.log('Deleting contribution:', contributionId);
        await onDeleteContribution(contributionId);
        console.log('Contribution deleted successfully');
        setLocalContributions(prevContributions => {
          const newContributions = prevContributions.filter(contribution => contribution._id !== contributionId);
          console.log('Updated localContributions after deletion:', newContributions);
          return newContributions;
        });
        fetchImpactData();
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
  };

  const handleSave = async (editedContribution) => {
    console.log('Saving edited contribution:', editedContribution);
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
        const updatedContribution = await response.json();
        console.log('Server response:', updatedContribution);
        setLocalContributions(prevContributions => {
          const newContributions = prevContributions.map(contribution =>
            contribution._id === editedContribution._id ? updatedContribution : contribution
          );
          console.log('Updated localContributions after edit:', newContributions);
          return newContributions;
        });
        setShowModal(false);
        setEditingContribution(null);
        fetchImpactData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update contribution');
      }
    } catch (error) {
      console.error('Error updating contribution:', error);
      alert(`Failed to update contribution: ${error.message}`);
    }
  };

  console.log('Rendering component. Current state:', {
    showModal,
    editingContribution,
    localContributionsCount: localContributions.length,
    displayAll
  });

  const displayedContributions = displayAll ? localContributions : localContributions.slice(0, 5);

  return (
    <div className={styles.cardContainer}>
      {displayedContributions && displayedContributions.length > 0 ? (
        <>
          {displayedContributions.map((contribution) => (
            <div key={contribution._id} className={styles.card}>
              <div className={styles.cardContent}>
                <h3 className={styles.charityName}>{contribution.charity}</h3>
                <p className={styles.donationDetail}><strong>Date:</strong> {formatDate(contribution.date)}</p>
                <p className={styles.donationDetail}><strong>Amount:</strong> ${contribution.amount}</p>
                {contribution.charityType && (
                  <p className={styles.donationDetail}><strong>Charity Type:</strong> {contribution.charityType}</p>
                )}
                {contribution.receiptUrl && (
                  <p className={styles.donationDetail}><strong>Receipt:</strong> <a href={contribution.receiptUrl} target="_blank" rel="noopener noreferrer">View Receipt</a></p>
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
            setEditingContribution(null);
          }}
        />
      )}
    </div>
  );
}

export default OneOffContributionsComponent;