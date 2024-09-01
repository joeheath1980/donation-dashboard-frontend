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

function OneOffContributionsComponent({ contributions, onDeleteContribution }) {
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

  return (
    <div className={styles.contributionsContainer}>
      {contributions && contributions.length > 0 ? (
        <ul className={styles.contributionsList}>
          {contributions.map((contribution) => (
            <li key={contribution._id} className={styles.contributionItem}>
              <strong>Charity:</strong> {contribution.charity}<br />
              <strong>Date:</strong> {formatDate(contribution.date)}<br />
              <strong>Amount:</strong> {contribution.amount}<br />
              {contribution.subject && (
                <>
                  <strong>Subject:</strong> {contribution.subject}<br />
                </>
              )}
              <button
                className={styles.deleteIcon}
                onClick={() => handleDelete(contribution._id)}
                aria-label="Delete Contribution"
              >
                &times;
              </button>
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