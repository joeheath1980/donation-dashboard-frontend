import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../Impact.module.css';  // Assuming you have some styles defined for consistent UI

function OneOffContributionsComponent({ userId }) {
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    const fetchContributions = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:3002/api/contributions/one-off`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setContributions(response.data);
      } catch (error) {
        console.error('Error fetching one-off contributions:', error);
      }
    };

    fetchContributions();
  }, [userId]);

  return (
    <div className={styles.contributionsContainer}>
      {contributions.length > 0 ? (
        <ul className={styles.contributionsList}>
          {contributions.map((contribution) => (
            <li key={contribution._id} className={styles.contributionItem}>
              <strong>Charity:</strong> {contribution.charity}<br />
              <strong>Date:</strong> {new Date(contribution.date).toLocaleDateString()}<br />
              <strong>Amount:</strong> {contribution.amount}<br />
              {contribution.subject && (
                <>
                  <strong>Subject:</strong> {contribution.subject}<br />
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


