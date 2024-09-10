import React, { useContext, useEffect, useState } from 'react';
import { ImpactContext } from '../contexts/ImpactContext';
import styles from './DonationCards.module.css';
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

function OneOffContributionsComponent() {
  const { oneOffContributions, onDeleteContribution, fetchImpactData } = useContext(ImpactContext);
  const [editingContribution, setEditingContribution] = useState(null);
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    fetchImpactData();
  }, [fetchImpactData]);

  const handleDelete = async (contributionId) => {
    if (window.confirm('Are you sure you want to delete this contribution?')) {
      try {
        await onDeleteContribution(contributionId);
        console.log('Contribution deleted successfully');
      } catch (error) {
        console.error('Error deleting contribution:', error);
        alert(`Failed to delete contribution: ${error.message}`);
      }
    }
  };

  const handleEdit = (contribution) => {
    setEditingContribution({ ...contribution });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/contributions/one-off/${editingContribution._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editingContribution)
      });

      if (response.ok) {
        setEditingContribution(null);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingContribution(prev => ({ ...prev, [name]: value }));
  };

  const handleShowMore = () => {
    setDisplayCount(prevCount => prevCount + 5);
  };

  return (
    <div className={styles.cardContainer}>
      {oneOffContributions && oneOffContributions.length > 0 ? (
        <>
          {oneOffContributions.slice(0, displayCount).map((contribution) => (
            <div key={contribution._id} className={styles.card}>
              {editingContribution && editingContribution._id === contribution._id ? (
                <div className={styles.cardContent}>
                  <input
                    type="text"
                    name="charity"
                    value={editingContribution.charity}
                    onChange={handleChange}
                    className={styles.editInput}
                  />
                  <input
                    type="date"
                    name="date"
                    value={editingContribution.date.split('T')[0]}
                    onChange={handleChange}
                    className={styles.editInput}
                  />
                  <input
                    type="number"
                    name="amount"
                    value={editingContribution.amount}
                    onChange={handleChange}
                    className={styles.editInput}
                  />
                  <select
                    name="charityType"
                    value={editingContribution.charityType}
                    onChange={handleChange}
                    className={styles.editInput}
                  >
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Environment">Environment</option>
                    <option value="Humanitarian">Humanitarian</option>
                    <option value="Arts and Culture">Arts and Culture</option>
                    <option value="Religious">Religious</option>
                    <option value="Human Rights">Human Rights</option>
                    <option value="Children and Youth">Children and Youth</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className={styles.cardActions}>
                    <button onClick={handleSave} className={styles.editButton}>Save</button>
                    <button onClick={() => setEditingContribution(null)} className={styles.deleteButton}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
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
    </div>
  );
}

export default OneOffContributionsComponent;