import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImpactContext } from '../contexts/ImpactContext';
import { FaRegHeart, FaTimes } from 'react-icons/fa';
import styles from './FollowedCharitiesComponent.module.css';

const FollowedCharitiesComponent = () => {
  const { followedCharities, removeFollowedCharity, error } = useContext(ImpactContext);
  const [localError, setLocalError] = useState(null);

  const handleDelete = async (charityABN) => {
    if (window.confirm('Are you sure you want to unfollow this charity?')) {
      try {
        await removeFollowedCharity(charityABN);
        setLocalError(null); // Clear any previous errors
      } catch (err) {
        setLocalError('Failed to remove the charity. Please try again.');
      }
    }
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>
        <FaRegHeart className={styles.icon} /> Charities Following
      </h3>
      <div className={styles.cardContent}>
        {followedCharities && followedCharities.length > 0 ? (
          <ul className={styles.list}>
            {followedCharities.map((followedCharity, index) => {
              const charity = followedCharity.charity || followedCharity;
              return (
                <li key={charity.ABN || `empty-${index}`} className={styles.listItem}>
                  <span className={styles.charityName}>
                    {charity.logo && (
                      <img
                        src={charity.logo}
                        alt={`${charity.name} logo`}
                        className={styles.charityLogo}
                      />
                    )}
                    {charity.name || 'Unknown Charity'}
                  </span>
                  <button
                    onClick={() => handleDelete(charity.ABN)}
                    className={styles.deleteButton}
                    title="Unfollow Charity"
                  >
                    <FaTimes />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.emptyMessage}>Not following any charities yet.</p>
        )}
        {(error || localError) && (
          <p className={styles.errorMessage}>{error || localError}</p>
        )}
      </div>
      <Link to="/search-charities" className={styles.actionButton}>
        Find more
      </Link>
    </div>
  );
};

export default FollowedCharitiesComponent;