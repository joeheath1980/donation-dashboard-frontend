import React from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminUserManagement from './AdminUserManagement';
import AdminDonationManagement from './AdminDonationManagement';
import AdminCampaignManagement from './AdminCampaignManagement';
import AdminBusinessPartnerManagement from './AdminBusinessPartnerManagement';
import AdminAnalyticsReporting from './AdminAnalyticsReporting';
import AdminContentManagement from './AdminContentManagement';
import AdminCharityManagement from './AdminCharityManagement';
import AdminReceiptApproval from './AdminReceiptApproval';
import AdminMatchingEngine from './AdminMatchingEngine';
import AdminSystemIntegration from './AdminSystemIntegration';
import styles from './AdminDashboard.module.css';
import './SharedStyles.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.header}>
        <h1 className={`${styles.title} gradientTitle`}>Admin Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
      </div>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          <li className={styles.navItem}><Link to="/admin/users" className={styles.navLink}>User Management</Link></li>
          <li className={styles.navItem}><Link to="/admin/donations" className={styles.navLink}>Donation Management</Link></li>
          <li className={styles.navItem}><Link to="/admin/receipt-approvals" className={styles.navLink}>Receipt Approvals</Link></li>
          <li className={styles.navItem}><Link to="/admin/matching-engine" className={styles.navLink}>Matching Engine</Link></li>
          <li className={styles.navItem}><Link to="/admin/campaigns" className={styles.navLink}>Campaign Management</Link></li>
          <li className={styles.navItem}><Link to="/admin/businesses" className={styles.navLink}>Business Partner Management</Link></li>
          <li className={styles.navItem}><Link to="/admin/charities" className={styles.navLink}>Charity Management</Link></li>
          <li className={styles.navItem}><Link to="/admin/reports" className={styles.navLink}>Analytics and Reporting</Link></li>
          <li className={styles.navItem}><Link to="/admin/content" className={styles.navLink}>Content Management</Link></li>
          <li className={styles.navItem}><Link to="/admin/system" className={styles.navLink}>System Integration</Link></li>
        </ul>
      </nav>
      <div className={styles.content}>
        <Routes>
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="donations" element={<AdminDonationManagement />} />
          <Route path="receipt-approvals" element={<AdminReceiptApproval />} />
          <Route path="matching-engine" element={<AdminMatchingEngine />} />
          <Route path="campaigns" element={<AdminCampaignManagement />} />
          <Route path="businesses" element={<AdminBusinessPartnerManagement />} />
          <Route path="charities" element={<AdminCharityManagement />} />
          <Route path="reports" element={<AdminAnalyticsReporting />} />
          <Route path="content" element={<AdminContentManagement />} />
          <Route path="system" element={<AdminSystemIntegration />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;