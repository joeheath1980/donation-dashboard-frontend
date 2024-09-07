import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../OrganizationSignup.module.css';

function OrganizationSignup() {
  return (
    <div className={styles.container}>
      <h1>Choose Your Organization Type</h1>
      <div className={styles.optionsContainer}>
        <Link to="/charity-signup" className={styles.option}>
          <h2>Charity</h2>
          <p>Sign up as a charitable organization</p>
        </Link>
        <Link to="/business-signup" className={styles.option}>
          <h2>Business</h2>
          <p>Sign up as a business partner</p>
        </Link>
      </div>
    </div>
  );
}

export default OrganizationSignup;