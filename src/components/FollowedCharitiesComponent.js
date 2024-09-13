import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ImpactContext } from '../contexts/ImpactContext';
import { FaRegHeart, FaTimes } from 'react-icons/fa';

const FollowedCharitiesComponent = () => {
  const { followedCharities, removeFollowedCharity } = useContext(ImpactContext);

  const containerStyle = {
    flex: '1 1 30%',
    backgroundColor: '#f0f8f0',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    borderTop: '4px solid #4CAF50',
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
    backgroundColor: '#e8f5e9',
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
    transition: 'background-color 0.3s',
    textDecoration: 'none',
    display: 'inline-block',
  };

  const deleteButtonStyle = {
    backgroundColor: 'transparent',
    color: '#777',
    border: 'none',
    padding: '2px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'color 0.3s',
  };

  const handleDelete = (charityABN) => {
    if (window.confirm('Are you sure you want to unfollow this charity?')) {
      removeFollowedCharity(charityABN);
    }
  };

  return (
    <div style={containerStyle}>
      <h3 style={headerStyle}>
        <FaRegHeart style={{marginRight: '10px'}} /> Charities Following
      </h3>
      <div style={miniContainerStyle}>
      {followedCharities && followedCharities.length > 0 ? (
  <ul style={listStyle}>
    {followedCharities.map((charity, index) => (
      <li key={charity.ABN || `empty-${index}`} style={listItemStyle}>
        <span>
          {charity.logo && (
            <img src={charity.logo} alt={`${charity.name} logo`} style={{width: '20px', height: '20px', marginRight: '10px', verticalAlign: 'middle'}} />
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
    ))}
  </ul>
) : (
  <p>Not following any charities yet.</p>
)}
      </div>
      <Link to="/search-charities" style={buttonStyle}>Search Charities</Link>
    </div>
  );
};

export default FollowedCharitiesComponent;