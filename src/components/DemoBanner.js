import React, { useState } from 'react';
import { useDemoMode } from '../hooks/useDemoMode';
import { FaInfoCircle, FaTimes } from 'react-icons/fa';
import styles from './DemoBanner.module.css';

const DemoBanner = () => {
  const { demoMode, loading } = useDemoMode();
  const [showGuide, setShowGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (loading || !demoMode?.enabled || dismissed) return null;

  return (
    <>
      <div className={styles.demoBanner}>
        <div className={styles.bannerContent}>
          <div className={styles.mainInfo}>
            <FaInfoCircle className={styles.infoIcon} />
            <span className={styles.bannerText}>
              <strong>Demo Mode Active</strong> - You're viewing demonstration data. 
              No real transactions will be processed.
            </span>
          </div>
          <div className={styles.actions}>
            <button 
              className={styles.guideButton}
              onClick={() => setShowGuide(true)}
            >
              View Demo Guide
            </button>
            <button 
              className={styles.dismissButton}
              onClick={() => setDismissed(true)}
              aria-label="Dismiss banner"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      </div>

      {showGuide && (
        <div className={styles.guideOverlay} onClick={() => setShowGuide(false)}>
          <div className={styles.guideContent} onClick={e => e.stopPropagation()}>
            <h2>Demo Mode Guide</h2>
            <button 
              className={styles.closeGuide}
              onClick={() => setShowGuide(false)}
            >
              <FaTimes />
            </button>
            
            <div className={styles.guideSection}>
              <h3>What is Demo Mode?</h3>
              <p>Demo mode allows you to explore all features of Do-Nation without making real transactions or affecting real data.</p>
            </div>

            <div className={styles.guideSection}>
              <h3>Available Demo Accounts</h3>
              <ul>
                <li><strong>Individual Users:</strong> Test accounts for each tier (Bronze, Silver, Gold, Platinum)</li>
                <li><strong>Businesses:</strong> Small, Medium, and Enterprise business accounts</li>
                <li><strong>Charities:</strong> Various charity organizations</li>
              </ul>
            </div>

            <div className={styles.guideSection}>
              <h3>Key Features to Try</h3>
              <ul>
                <li>Make test donations with demo payment methods</li>
                <li>Explore matching campaigns from business partners</li>
                <li>View impact visualization and scoring</li>
                <li>Test email forwarding and receipt processing</li>
                <li>Browse public profiles and search functionality</li>
              </ul>
            </div>

            <div className={styles.guideSection}>
              <h3>Important Notes</h3>
              <ul>
                <li>All transactions are simulated - no real money is involved</li>
                <li>Demo data is reset periodically</li>
                <li>Email notifications are disabled in demo mode</li>
                <li>Some features may be limited or modified for demonstration purposes</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DemoBanner;