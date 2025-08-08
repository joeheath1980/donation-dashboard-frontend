import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { businessAccountService } from '../../services/businessAccountService';
import CompanyProfile from './tabs/CompanyProfile';
import TeamManagement from './tabs/TeamManagement';
import Security from './tabs/Security';
import Notifications from './tabs/Notifications';
import BillingPayments from './tabs/BillingPayments';
import styles from './BusinessAccountSettings.module.css';
import { toast } from 'react-toastify';
import {
  RiBuildingLine,
  RiGroupLine,
  RiShieldCheckLine,
  RiBellLine,
  RiBankCardLine
} from 'react-icons/ri';

function BusinessAccountSettings() {
  const [activeTab, setActiveTab] = useState('company');
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchAccountSettings();
  }, []);

  const fetchAccountSettings = async () => {
    try {
      setLoading(true);
      const data = await businessAccountService.getAccountSettings();
      setAccountData(data);
    } catch (err) {
      console.error('Error fetching account settings:', err);
      setError('Failed to load account settings');
      toast.error('Failed to load account settings');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'company', label: 'Company Profile', icon: <RiBuildingLine /> },
    { id: 'team', label: 'Team Management', icon: <RiGroupLine /> },
    { id: 'security', label: 'Security', icon: <RiShieldCheckLine /> },
    { id: 'notifications', label: 'Notifications', icon: <RiBellLine /> },
    { id: 'billing', label: 'Billing & Payments', icon: <RiBankCardLine /> }
  ];

  const renderTabContent = () => {
    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!accountData) return null;

    switch (activeTab) {
      case 'company':
        return (
          <CompanyProfile 
            data={accountData.company} 
            profileSettings={accountData.profileSettings}
            onUpdate={fetchAccountSettings}
          />
        );
      case 'team':
        return (
          <TeamManagement 
            teamMembers={accountData.teamMembers || []}
            onUpdate={fetchAccountSettings}
          />
        );
      case 'security':
        return (
          <Security 
            email={accountData.company?.email}
            onUpdate={fetchAccountSettings}
          />
        );
      case 'notifications':
        return (
          <Notifications 
            preferences={accountData.notificationPreferences}
            onUpdate={fetchAccountSettings}
          />
        );
      case 'billing':
        return (
          <BillingPayments 
            paymentMethods={accountData.paymentMethods || []}
            onUpdate={fetchAccountSettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Account Settings</h1>
        <p className={styles.subtitle}>Manage your business account and preferences</p>
      </div>

      <div className={styles.content}>
        <div className={styles.tabNavigation}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

export default BusinessAccountSettings;