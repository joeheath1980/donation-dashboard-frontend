import React, { useContext, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ImpactContext } from '../contexts/ImpactContext';
import { FaRegHeart, FaTimes, FaChevronRight, FaPlus } from 'react-icons/fa';
import './SharedStyles.css';

const FollowedCharitiesComponent = ({ displayAll }) => {
  const { followedCharities, removeFollowedCharity, error: contextError } = useContext(ImpactContext);
  const [localError, setLocalError] = useState(null);

  const handleDelete = useCallback(async (charityABN) => {
    if (window.confirm('Are you sure you want to unfollow this charity?')) {
      try {
        await removeFollowedCharity(charityABN);
        setLocalError(null);
      } catch (err) {
        setLocalError('Failed to remove the charity. Please try again.');
      }
    }
  }, [removeFollowedCharity]);

  const displayedCharities = displayAll ? followedCharities : followedCharities.slice(0, 3);

  const getCharityName = (followedCharity) => {
    // Handle different data structures that might come from the API
    if (typeof followedCharity === 'string') return followedCharity;
    if (followedCharity?.name) return followedCharity.name;
    if (followedCharity?.charity?.name) return followedCharity.charity.name;
    return 'Unknown Charity';
  };

  const getCharityABN = (followedCharity) => {
    // Handle different data structures that might come from the API
    if (followedCharity?.ABN) return followedCharity.ABN;
    if (followedCharity?.charity?.ABN) return followedCharity.charity.ABN;
    return null;
  };

  return (
    <div className="contributionSection">
      <h3 className="sectionTitle">
        <FaRegHeart className="titleIcon" /> Charities Following
      </h3>
      <Link to="/search-charities" className="button primary fullWidth">
        <FaPlus /> Follow New Charity
      </Link>
      <div className="charitiesList">
        {displayedCharities && displayedCharities.length > 0 ? (
          displayedCharities.map((followedCharity, index) => {
            const charityName = getCharityName(followedCharity);
            const charityABN = getCharityABN(followedCharity);
            
            return (
              <div key={charityABN || `charity-${index}`} className="charityCard">
                <span className="charityName">{charityName}</span>
                {charityABN && (
                  <button
                    onClick={() => handleDelete(charityABN)}
                    className="deleteButton"
                    aria-label="Unfollow Charity"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <p className="emptyMessage">Not following any charities yet.</p>
        )}
      </div>
      {(contextError || localError) && (
        <p className="errorMessage">{contextError || localError}</p>
      )}
      {!displayAll && followedCharities.length > 3 && (
        <Link to="/followed-charities" className="button secondary">
          See All <FaChevronRight />
        </Link>
      )}
    </div>
  );
};

export default FollowedCharitiesComponent;