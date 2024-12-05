import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CleanDesign.module.css';
import { FaHandHoldingHeart, FaBuilding, FaArrowRight } from 'react-icons/fa';

function OrganizationSignup() {
  return (
    <div className={styles.container} style={{ padding: '60px 20px' }}>
      <div className={styles.textCenter} style={{ maxWidth: '600px', margin: '0 auto 40px' }}>
        <h1 className={styles.gradientTitle} style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
          Choose Your Path
        </h1>
        <p className={styles.description} style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Select the type of organization you represent and join our community of change-makers
        </p>
      </div>
      
      <div className={styles.grid} style={{ gap: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <div className={styles.card} style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <Link to="/charity-signup" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.cardHeader} style={{ marginBottom: '20px' }}>
              <FaHandHoldingHeart size={40} color="var(--primary-color)" />
            </div>
            <h2 className={styles.title} style={{ fontSize: '1.75rem', marginBottom: '15px', color: 'var(--primary-color)' }}>
              Charitable Organization
            </h2>
            <div className={styles.cardContent} style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: '15px' }}>Join as a charitable organization to:</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0' }}>
                <li style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
                  <FaArrowRight size={14} color="var(--primary-color)" />
                  <span>Create impactful fundraising campaigns</span>
                </li>
                <li style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
                  <FaArrowRight size={14} color="var(--primary-color)" />
                  <span>Connect with passionate donors</span>
                </li>
                <li style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
                  <FaArrowRight size={14} color="var(--primary-color)" />
                  <span>Track donations and measure impact</span>
                </li>
                <li style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
                  <FaArrowRight size={14} color="var(--primary-color)" />
                  <span>Access detailed analytics dashboard</span>
                </li>
              </ul>
            </div>
            <div className={styles.cardActions} style={{ marginTop: '25px' }}>
              <span className={styles.button}>Get Started →</span>
            </div>
          </Link>
        </div>

        <div className={styles.card} style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <Link to="/business-signup" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.cardHeader} style={{ marginBottom: '20px' }}>
              <FaBuilding size={40} color="var(--primary-color)" />
            </div>
            <h2 className={styles.title} style={{ fontSize: '1.75rem', marginBottom: '15px', color: 'var(--primary-color)' }}>
              Business Partner
            </h2>
            <div className={styles.cardContent} style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: '15px' }}>Join as a business partner to:</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0' }}>
                <li style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
                  <FaArrowRight size={14} color="var(--primary-color)" />
                  <span>Create matching opportunities</span>
                </li>
                <li style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
                  <FaArrowRight size={14} color="var(--primary-color)" />
                  <span>Partner with impactful charities</span>
                </li>
                <li style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
                  <FaArrowRight size={14} color="var(--primary-color)" />
                  <span>Monitor corporate giving initiatives</span>
                </li>
                <li style={{ margin: '12px 0', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
                  <FaArrowRight size={14} color="var(--primary-color)" />
                  <span>Generate comprehensive impact reports</span>
                </li>
              </ul>
            </div>
            <div className={styles.cardActions} style={{ marginTop: '25px' }}>
              <span className={styles.button}>Get Started →</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrganizationSignup;