import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ImpactContext } from '../contexts/ImpactContext';
import { FaRegHeart, FaTimes } from 'react-icons/fa';

const FollowedCharitiesComponent = () => {
  const { followedCharities, removeFollowedCharity } = useContext(ImpactContext);

  const containerStyle = {
    backgroundColor: '#e8f5e9',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
  };

  const headerStyle = {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
  };

  const miniContainerStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
  };

  const listStyle = {
    listStyleType: 'none',
    padding: '0',
    margin: '0',
  };

  const listItemStyle = {
    padding: '8px 0',
    borderBottom: '1px solid #ccc',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const buttonStyle = {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    textDecoration: 'none',
    display: 'inline-block',
  };

  const deleteButtonStyle = {
    backgroundColor: 'transparent',
    color: '#ff4444',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
  };

  const handleDelete = (charityABN) => {
    if (window.confirm('Are you sure you want to unfollow this charity?')) {
      removeFollowedCharity(charityABN);
    }
  };

  return (
    <div style={containerStyle}>
      <h3 style={headerStyle}>
        <FaRegHeart style={{ marginRight: '10px' }} /> Charities Following
      </h3>
      <div style={miniContainerStyle}>
        {followedCharities && followedCharities.length > 0 ? (
          <ul style={listStyle}>
            {followedCharities.map((followedCharity, index) => {
              const charity = followedCharity.charity || followedCharity;
              return (
                <li key={charity.ABN || `empty-${index}`} style={listItemStyle}>
                  <span>
                    {charity.logo && (
                      <img
                        src={charity.logo}
                        alt={`${charity.name} logo`}
                        style={{
                          width: '20px',
                          height: '20px',
                          marginRight: '10px',
                          verticalAlign: 'middle',
                        }}
                      />
                    )}
                    {charity.name || 'Unknown Charity'}
                  </span>
                  <button
                    onClick={() => handleDelete(charity.ABN)}
                    style={deleteButtonStyle}
                    title="Unfollow Charity"
                  >
                    <FaTimes />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>Not following any charities yet.</p>
        )}
      </div>
      <Link to="/search-charities" style={buttonStyle}>
        Search Charities
      </Link>
    </div>
  );
};

export default FollowedCharitiesComponent;