import React, { useContext, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ImpactContext } from '../contexts/ImpactContext';
import { FaRegHeart, FaTimes, FaChevronRight, FaPlus } from 'react-icons/fa';
import cleanStyles from './CleanDesign.module.css';

const FollowedCharitiesComponent = ({ displayAll }) => {
  const { followedCharities, removeFollowedCharity, error: contextError } = useContext(ImpactContext);
  const [localError, setLocalError] = useState(null);

  const handleDelete = useCallback(async (charityABN) => {
    if (window.confirm('Are you sure you want to unfollow this charity?')) {
      try {
        await removeFollowedCharity(charityABN);
        setLocalError(null); // Clear any previous errors
      } catch (err) {
        setLocalError('Failed to remove the charity. Please try again.');
      }
    }
  }, [removeFollowedCharity]);

  const displayedCharities = displayAll ? followedCharities : followedCharities.slice(0, 3);

  return (
    <div className={cleanStyles.contributionSection}>
      <h3 className={cleanStyles.sectionTitle}>
        <FaRegHeart className={cleanStyles.titleIcon} /> Charities Following
      </h3>
      <Link to="/search-charities" className={`${cleanStyles.button} ${cleanStyles.primary} ${cleanStyles.fullWidth}`}>
        <FaPlus /> Follow New Charity
      </Link>
      <div className={cleanStyles.charitiesList}>
        {displayedCharities && displayedCharities.length > 0 ? (
          displayedCharities.map((followedCharity, index) => {
            const charity = followedCharity.charity || followedCharity;
            return (
              <div key={charity.ABN || `empty-${index}`} className={cleanStyles.charityCard}>
                <span className={cleanStyles.charityName}>{charity.name || 'Unknown Charity'}</span>
                <button
                  onClick={() => handleDelete(charity.ABN)}
                  className={cleanStyles.deleteButton}
                  aria-label="Unfollow Charity"
                >
                  <FaTimes />
                </button>
              </div>
            );
          })
        ) : (
          <p className={cleanStyles.emptyMessage}>Not following any charities yet.</p>
        )}
      </div>
      {(contextError || localError) && (
        <p className={cleanStyles.errorMessage}>{contextError || localError}</p>
      )}
      {!displayAll && followedCharities.length > 3 && (
        <Link to="/followed-charities" className={`${cleanStyles.button} ${cleanStyles.secondary}`}>
          See All <FaChevronRight />
        </Link>
      )}
    </div>
  );
};

export default FollowedCharitiesComponent;