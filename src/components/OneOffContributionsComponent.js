import React, { useContext, useEffect, useState } from 'react';
import { ImpactContext } from '../contexts/ImpactContext';
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

function OneOffContributionsComponent() {
  const { oneOffContributions, onDeleteContribution, fetchImpactData } = useContext(ImpactContext);
  const [editingContribution, setEditingContribution] = useState(null);

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

  return (
    <div className={styles.contributionsContainer}>
      {oneOffContributions && oneOffContributions.length > 0 ? (
        <ul className={styles.contributionsList}>
          {oneOffContributions.map((contribution) => (
            <li key={contribution._id} className={styles.contributionItem}>
              {editingContribution && editingContribution._id === contribution._id ? (
                <>
                  <input
                    type="text"
                    name="charity"
                    value={editingContribution.charity}
                    onChange={handleChange}
                  />
                  <input
                    type="date"
                    name="date"
                    value={editingContribution.date.split('T')[0]}
                    onChange={handleChange}
                  />
                  <input
                    type="number"
                    name="amount"
                    value={editingContribution.amount}
                    onChange={handleChange}
                  />
                  <select
                    name="charityType"
                    value={editingContribution.charityType}
                    onChange={handleChange}
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
                  <button onClick={handleSave}>Save</button>
                  <button onClick={() => setEditingContribution(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <strong>Charity:</strong> {contribution.charity}<br />
                  <strong>Date:</strong> {formatDate(contribution.date)}<br />
                  <strong>Amount:</strong> {contribution.amount}<br />
                  <strong>Charity Type:</strong> {contribution.charityType || 'Not specified'}<br />
                  {contribution.subject && (
                    <>
                      <strong>Subject:</strong> {contribution.subject}<br />
                    </>
                  )}
                  <button onClick={() => handleEdit(contribution)}>Edit</button>
                  <button
                    className={styles.deleteIcon}
                    onClick={() => handleDelete(contribution._id)}
                    aria-label="Delete Contribution"
                  >
                    &times;
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No one-off contributions found.</p>
      )}
    </div>
  );
}

export default OneOffContributionsComponent;