import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './BusinessTaxCenter.module.css';
import {
  RiMoneyDollarCircleLine,
  RiBarChartLine,
  RiFileTextLine,
  RiCalendarLine,
  RiLineChartLine,
  RiFilePaper2Line,
  RiDownloadLine,
  RiFocusLine,
  RiInformationLine
} from 'react-icons/ri';

const BusinessTaxCenter = () => {
  const [stats, setStats] = useState({
    ytdDonations: 0,
    taxSavings: 0,
    receiptsCount: 0,
    lastExportDate: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaxStats();
  }, []);

  const fetchTaxStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3002'}/api/business/tax/summary/${new Date().getFullYear()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats({
          ytdDonations: data.totalDonations || 0,
          taxSavings: data.estimatedTaxSavings || 0,
          receiptsCount: data.receiptsCount || 0,
          lastExportDate: data.lastExportDate
        });
      }
    } catch (error) {
      console.error('Error fetching tax stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div className={styles.loading}>Loading tax information...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Tax Centre</h1>
        <p className={styles.subtitle}>Manage your charitable tax deductions and optimise your giving strategy</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><RiMoneyDollarCircleLine /></div>
          <div className={styles.statContent}>
            <h3>YTD Donations</h3>
            <p className={styles.statValue}>{formatCurrency(stats.ytdDonations)}</p>
            <span className={styles.statLabel}>Total charitable giving</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}><RiBarChartLine /></div>
          <div className={styles.statContent}>
            <h3>Tax Savings</h3>
            <p className={styles.statValue}>{formatCurrency(stats.taxSavings)}</p>
            <span className={styles.statLabel}>Estimated this year</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}><RiFileTextLine /></div>
          <div className={styles.statContent}>
            <h3>Tax Receipts</h3>
            <p className={styles.statValue}>{stats.receiptsCount}</p>
            <span className={styles.statLabel}>Available for download</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}><RiCalendarLine /></div>
          <div className={styles.statContent}>
            <h3>Last Export</h3>
            <p className={styles.statValue}>
              {stats.lastExportDate ? new Date(stats.lastExportDate).toLocaleDateString('en-GB') : 'Never'}
            </p>
            <span className={styles.statLabel}>Tax document export</span>
          </div>
        </div>
      </div>

      <div className={styles.sectionsGrid}>
        <Link to="/business/tax-center/summary" className={styles.sectionCard}>
          <div className={styles.sectionIcon}><RiLineChartLine /></div>
          <h2>Tax Summary</h2>
          <p>View detailed breakdowns of your charitable contributions by quarter, month, and charity</p>
          <span className={styles.sectionAction}>View Summary →</span>
        </Link>

        <Link to="/business/tax-center/receipts" className={styles.sectionCard}>
          <div className={styles.sectionIcon}><RiFilePaper2Line /></div>
          <h2>Tax Receipts</h2>
          <p>Access and download all your charitable donation receipts for tax filing</p>
          <span className={styles.sectionAction}>Manage Receipts →</span>
        </Link>

        <Link to="/business/tax-center/export" className={styles.sectionCard}>
          <div className={styles.sectionIcon}><RiDownloadLine /></div>
          <h2>Export Documents</h2>
          <p>Export tax documents in various formats including CSV, Excel, PDF, and accounting software</p>
          <span className={styles.sectionAction}>Export Data →</span>
        </Link>

        <Link to="/business/tax-center/planning" className={styles.sectionCard}>
          <div className={styles.sectionIcon}><RiFocusLine /></div>
          <h2>Tax Planning</h2>
          <p>Calculate optimal donation strategies and maximise your tax benefits</p>
          <span className={styles.sectionAction}>Plan Strategy →</span>
        </Link>
      </div>

      <div className={styles.alertBanner}>
        <div className={styles.alertIcon}><RiInformationLine /></div>
        <div className={styles.alertContent}>
          <h3>Tax Year Reminder</h3>
          <p>The UK tax year ends on 5 April. You have {Math.ceil((new Date(new Date().getFullYear() + (new Date().getMonth() < 3 ? 0 : 1), 3, 5) - new Date()) / (1000 * 60 * 60 * 24))} days remaining to maximise your charitable tax deductions for this tax year.</p>
        </div>
      </div>
    </div>
  );
};

export default BusinessTaxCenter;