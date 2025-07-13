import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmailForwardingGuide, ForwardingStatus } from '../components/EmailForwarding';
import styles from './EmailForwardingPage.module.css';

const EmailForwardingPage = () => {
  const [activeTab, setActiveTab] = useState('guide');
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1>Email Forwarding</h1>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/dashboard')}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Introduction */}
      <div className={styles.introCard}>
        <div className={styles.alert}>
          <strong>Privacy-friendly donation tracking:</strong> Forward your donation receipts 
          without granting access to your entire email inbox. Perfect for users who want to 
          maintain privacy while still tracking their charitable giving.
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'guide' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('guide')}
        >
          📧 Forwarding Guide
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'status' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('status')}
        >
          📊 Status & History
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'guide' && <EmailForwardingGuide />}
        {activeTab === 'status' && <ForwardingStatus />}
      </div>

      {/* Additional Information */}
      <div className={styles.infoCard}>
        <h2>How it works</h2>
        <ol>
          <li>Search your email using our optimized templates to find donation receipts</li>
          <li>Forward found emails to your unique address as attachments</li>
          <li>Our AI processes the emails and extracts donation information</li>
          <li>Review and confirm donations in your dashboard</li>
        </ol>
        <p className={styles.privacy}>
          <strong>Privacy:</strong> We only process emails you explicitly forward. 
          No access to your inbox is required or requested.
        </p>
      </div>
    </div>
  );
};

export default EmailForwardingPage;