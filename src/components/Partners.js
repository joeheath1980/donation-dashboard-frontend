import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Partners.module.css';

// Temporary partner data (replace with actual data source later)
const partners = {
  nbcf: { name: 'National Breast Cancer Foundation' },
  starbucks: { name: 'Starbucks' }
};

function Partners() {
  return (
    <div className={styles.partnersContainer}>
      <h1 className={styles.header}>Our Partners</h1>
      <div className={styles.partnerList}>
        <h2>Charity Partners</h2>
        <ul>
          <li><Link to="/charity/nbcf">{partners.nbcf.name}</Link></li>
          {/* Add more charity partners here */}
        </ul>
      </div>
      <div className={styles.partnerList}>
        <h2>Brand Partners</h2>
        <ul>
          <li><Link to="/brand/starbucks">{partners.starbucks.name}</Link></li>
          {/* Add more brand partners here */}
        </ul>
      </div>
    </div>
  );
}

export default Partners;