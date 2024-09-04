import React from 'react';
import styles from '../BrandPartner.module.css';

function BrandPartner({ brand }) {
  return (
    <div className={styles.brandContainer}>
      <h1 className={styles.brandName}>{brand.name}</h1>
      <div className={styles.brandDetails}>
        <h2>Purpose</h2>
        <p>{brand.purpose}</p>
        <h2>Mission</h2>
        <p>{brand.mission}</p>
        <h2>Vision</h2>
        <p>{brand.vision}</p>
      </div>
      <div className={styles.supportedCharities}>
        <h2>Supported Charities</h2>
        <ul>
          {brand.supportedCharities.map((charity, index) => (
            <li key={index}>{charity}</li>
          ))}
        </ul>
      </div>
      <div className={styles.csrImpact}>
        <h2>CSR Impact</h2>
        <p>{brand.csrImpact}</p>
      </div>
      <div className={styles.actions}>
        <button className={styles.followButton}>Follow</button>
        <button className={styles.matchButton}>Match</button>
      </div>
    </div>
  );
}

export default BrandPartner;