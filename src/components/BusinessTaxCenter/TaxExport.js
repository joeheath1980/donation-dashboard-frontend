import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecureTokenStorage } from '../../utils/auth.utils';
import apiServices from '../../services/api.service';
import styles from './TaxExport.module.css';
import { RiArrowLeftLine } from 'react-icons/ri';

const TaxExport = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [exportConfig, setExportConfig] = useState({
    format: 'pdf',
    dateRange: 'year',
    year: currentYear,
    startDate: '',
    endDate: '',
    includeReceipts: true,
    includeSummary: true,
    includeCharityBreakdown: true,
    groupBy: 'month'
  });
  const [exporting, setExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState([]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const api = apiServices.client;
      const response = await api.post('/api/business/tax/export', exportConfig, { responseType: 'blob' });
      if (response && response.status === 200) {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const extension = exportConfig.format === 'excel' ? 'xlsx' : exportConfig.format;
        a.download = `tax_export_${Date.now()}.${extension}`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        // Add to export history
        setExportHistory([
          {
            date: new Date(),
            format: exportConfig.format,
            type: exportConfig.dateRange === 'year' ? `${exportConfig.year} Tax Year` : 'Custom Range'
          },
          ...exportHistory
        ]);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setExporting(false);
    }
  };

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: '📄', description: 'Professional formatted tax document' },
    { value: 'excel', label: 'Excel Spreadsheet', icon: '📊', description: 'Detailed data for analysis' },
    { value: 'csv', label: 'CSV File', icon: '📋', description: 'Simple format for import' },
    { value: 'quickbooks', label: 'QuickBooks', icon: '💼', description: 'Compatible with QuickBooks' },
    { value: 'xero', label: 'Xero', icon: '☁️', description: 'Ready for Xero import' }
  ];

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <button 
          onClick={() => navigate('/business/tax-center')} 
          className={styles.backButton}
        >
          <RiArrowLeftLine /> Back to Tax Centre
        </button>
      </nav>
      
      <div className={styles.header}>
        <h1>Export Tax Documents</h1>
        <p className={styles.subtitle}>Generate comprehensive tax reports in your preferred format</p>
      </div>

      <div className={styles.exportForm}>
        <div className={styles.section}>
          <h2>Export Format</h2>
          <div className={styles.formatGrid}>
            {formatOptions.map(format => (
              <div
                key={format.value}
                className={`${styles.formatCard} ${exportConfig.format === format.value ? styles.selected : ''}`}
                onClick={() => setExportConfig({...exportConfig, format: format.value})}
              >
                <div className={styles.formatIcon}>{format.icon}</div>
                <h3>{format.label}</h3>
                <p>{format.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2>Date Range</h2>
          <div className={styles.dateOptions}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="dateRange"
                value="year"
                checked={exportConfig.dateRange === 'year'}
                onChange={(e) => setExportConfig({...exportConfig, dateRange: e.target.value})}
              />
              <span>Tax Year</span>
            </label>
            {exportConfig.dateRange === 'year' && (
              <select
                className={styles.yearSelect}
                value={exportConfig.year}
                onChange={(e) => setExportConfig({...exportConfig, year: Number(e.target.value)})}
              >
                {[...Array(5)].map((_, i) => {
                  const year = currentYear - i;
                  return <option key={year} value={year}>{year}/{year + 1}</option>;
                })}
              </select>
            )}
          </div>
          
          <div className={styles.dateOptions}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="dateRange"
                value="custom"
                checked={exportConfig.dateRange === 'custom'}
                onChange={(e) => setExportConfig({...exportConfig, dateRange: e.target.value})}
              />
              <span>Custom Date Range</span>
            </label>
            {exportConfig.dateRange === 'custom' && (
              <div className={styles.customDateInputs}>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={exportConfig.startDate}
                  onChange={(e) => setExportConfig({...exportConfig, startDate: e.target.value})}
                />
                <span>to</span>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={exportConfig.endDate}
                  onChange={(e) => setExportConfig({...exportConfig, endDate: e.target.value})}
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2>Include in Export</h2>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={exportConfig.includeReceipts}
                onChange={(e) => setExportConfig({...exportConfig, includeReceipts: e.target.checked})}
              />
              <span>Individual Receipts</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={exportConfig.includeSummary}
                onChange={(e) => setExportConfig({...exportConfig, includeSummary: e.target.checked})}
              />
              <span>Tax Summary Report</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={exportConfig.includeCharityBreakdown}
                onChange={(e) => setExportConfig({...exportConfig, includeCharityBreakdown: e.target.checked})}
              />
              <span>Charity Breakdown</span>
            </label>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Group Data By</h2>
          <select
            className={styles.groupSelect}
            value={exportConfig.groupBy}
            onChange={(e) => setExportConfig({...exportConfig, groupBy: e.target.value})}
          >
            <option value="month">Month</option>
            <option value="quarter">Quarter</option>
            <option value="charity">Charity</option>
            <option value="none">No Grouping</option>
          </select>
        </div>

        <button
          className={styles.exportButton}
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Generating Export...' : 'Export Documents'}
        </button>
      </div>

      {exportHistory.length > 0 && (
        <div className={styles.historySection}>
          <h2>Recent Exports</h2>
          <div className={styles.historyList}>
            {exportHistory.slice(0, 5).map((item, index) => (
              <div key={index} className={styles.historyItem}>
                <div className={styles.historyIcon}>📥</div>
                <div className={styles.historyContent}>
                  <span className={styles.historyFormat}>{item.format.toUpperCase()}</span>
                  <span className={styles.historyType}>{item.type}</span>
                  <span className={styles.historyDate}>
                    {item.date.toLocaleDateString('en-GB')} at {item.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.infoSection}>
        <h2>Export Information</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h3>🔒 Security</h3>
            <p>All exports are encrypted and transmitted securely. Downloaded files are for your records only.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>📊 Accounting Software</h3>
            <p>QuickBooks and Xero formats are optimised for direct import into your accounting system.</p>
          </div>
          <div className={styles.infoCard}>
            <h3>📱 Mobile Compatible</h3>
            <p>PDF exports are optimised for viewing on all devices including mobile and tablet.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxExport;
