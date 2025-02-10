import React from 'react';
import { Link } from 'react-router-dom';
import styles from './OrganizationSignup.module.css';
import { FaHandHoldingHeart, FaBuilding, FaArrowRight } from 'react-icons/fa';

function OrganizationSignup() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Choose Your Path</h1>
        <p className={styles.description}>
          Select the type of organization you represent and join our community of change-makers
        </p>
      </header>
      
      <div className={styles.grid}>
        <Link to="/charity-signup" className={styles.card}>
          <div className={styles.cardHeader}>
            <FaHandHoldingHeart size={40} className={styles.cardIcon} />
          </div>
          <h2 className={styles.cardTitle}>Charitable Organization</h2>
          <div className={styles.cardContent}>
            <p>Join as a charitable organization to:</p>
            <ul className={styles.cardList}>
              <li className={styles.cardListItem}>
                <FaArrowRight size={14} className={styles.cardListItemIcon} />
                <span>Create impactful fundraising campaigns</span>
              </li>
              <li className={styles.cardListItem}>
                <FaArrowRight size={14} className={styles.cardListItemIcon} />
                <span>Connect with passionate donors</span>
              </li>
              <li className={styles.cardListItem}>
                <FaArrowRight size={14} className={styles.cardListItemIcon} />
                <span>Track donations and measure impact</span>
              </li>
              <li className={styles.cardListItem}>
                <FaArrowRight size={14} className={styles.cardListItemIcon} />
                <span>Access detailed analytics dashboard</span>
              </li>
            </ul>
          </div>
          <div className={styles.cardActions}>
            <span className={styles.button}>Get Started →</span>
          </div>
        </Link>

        <Link to="/business-signup" className={styles.card}>
          <div className={styles.cardHeader}>
            <FaBuilding size={40} className={styles.cardIcon} />
          </div>
          <h2 className={styles.cardTitle}>Business Partner</h2>
          <div className={styles.cardContent}>
            <p>Join as a business partner to:</p>
            <ul className={styles.cardList}>
              <li className={styles.cardListItem}>
                <FaArrowRight size={14} className={styles.cardListItemIcon} />
                <span>Create matching opportunities</span>
              </li>
              <li className={styles.cardListItem}>
                <FaArrowRight size={14} className={styles.cardListItemIcon} />
                <span>Partner with impactful charities</span>
              </li>
              <li className={styles.cardListItem}>
                <FaArrowRight size={14} className={styles.cardListItemIcon} />
                <span>Monitor corporate giving initiatives</span>
              </li>
              <li className={styles.cardListItem}>
                <FaArrowRight size={14} className={styles.cardListItemIcon} />
                <span>Generate comprehensive impact reports</span>
              </li>
            </ul>
          </div>
          <div className={styles.cardActions}>
            <span className={styles.button}>Get Started →</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default OrganizationSignup;