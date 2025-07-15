import React from 'react';
import { Link } from 'react-router-dom';
import styles from './OrganizationSignup.module.css';
import { FaHandHoldingHeart, FaBuilding, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import logo from '../assets/logo.png';

function OrganizationSignup() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <img src={logo} alt="Logo" className={styles.logo} />
        <h1 className={styles.title}>Join Our Community</h1>
        <p className={styles.subtitle}>
          Select your organization type to get started
        </p>
        
        <div className={styles.cardsGrid}>
          <Link to="/charity-signup" className={styles.card}>
            <div className={styles.cardIcon}>
              <FaHandHoldingHeart />
            </div>
            <h2 className={styles.cardTitle}>Charitable Organization</h2>
            <p className={styles.cardDescription}>
              Perfect for non-profits and charitable organizations
            </p>
            <ul className={styles.cardFeatures}>
              <li>
                <FaArrowRight className={styles.featureIcon} />
                <span>Create fundraising campaigns</span>
              </li>
              <li>
                <FaArrowRight className={styles.featureIcon} />
                <span>Connect with donors</span>
              </li>
              <li>
                <FaArrowRight className={styles.featureIcon} />
                <span>Track donations & impact</span>
              </li>
              <li>
                <FaArrowRight className={styles.featureIcon} />
                <span>Access analytics dashboard</span>
              </li>
            </ul>
            <div className={styles.cardButton}>
              <span>Sign Up as Charity</span>
              <FaArrowRight />
            </div>
          </Link>

          <Link to="/business-signup" className={styles.card}>
            <div className={styles.cardIcon}>
              <FaBuilding />
            </div>
            <h2 className={styles.cardTitle}>Business Partner</h2>
            <p className={styles.cardDescription}>
              For businesses looking to make a difference
            </p>
            <ul className={styles.cardFeatures}>
              <li>
                <FaArrowRight className={styles.featureIcon} />
                <span>Create matching programs</span>
              </li>
              <li>
                <FaArrowRight className={styles.featureIcon} />
                <span>Partner with charities</span>
              </li>
              <li>
                <FaArrowRight className={styles.featureIcon} />
                <span>Monitor giving initiatives</span>
              </li>
              <li>
                <FaArrowRight className={styles.featureIcon} />
                <span>Generate impact reports</span>
              </li>
            </ul>
            <div className={styles.cardButton}>
              <span>Sign Up as Business</span>
              <FaArrowRight />
            </div>
          </Link>
        </div>

        <div className={styles.footer}>
          <Link to="/login" className={styles.backLink}>
            <FaArrowLeft />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrganizationSignup;