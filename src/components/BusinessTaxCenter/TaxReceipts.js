import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecureTokenStorage } from '../../utils/auth.utils';
import apiServices from '../../services/api.service';
import styles from './TaxReceipts.module.css';
import { RiDownloadLine, RiArrowLeftLine } from 'react-icons/ri';

const TaxReceipts = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipts, setSelectedReceipts] = useState([]);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    charity: '',
    search: ''
  });

  useEffect(() => {
    fetchReceipts();
  }, [filters.year]);

  useEffect(() => {
    filterReceipts();
  }, [receipts, filters]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const api = apiServices.client;
      const response = await api.get('/api/business/tax/receipts', { params: { year: filters.year } });
      if (response && response.status === 200) {
        const data = response.data;
        setReceipts(data.receipts || []);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReceipts = () => {
    let filtered = [...receipts];
    
    if (filters.charity) {
      filtered = filtered.filter(r => 
        r.charityName.toLowerCase().includes(filters.charity.toLowerCase())
      );
    }
    
    if (filters.search) {
      filtered = filtered.filter(r => 
        r.receiptNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        r.charityName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    setFilteredReceipts(filtered);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedReceipts(filteredReceipts.map(r => r.id));
    } else {
      setSelectedReceipts([]);
    }
  };

  const handleSelectReceipt = (receiptId) => {
    if (selectedReceipts.includes(receiptId)) {
      setSelectedReceipts(selectedReceipts.filter(id => id !== receiptId));
    } else {
      setSelectedReceipts([...selectedReceipts, receiptId]);
    }
  };

  const downloadReceipt = async (receiptId) => {
    try {
      const api = apiServices.client;
      const response = await api.get(`/api/business/tax/receipts/${receiptId}/download`, { responseType: 'blob' });
      if (response && response.status === 200) {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt_${receiptId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const downloadBulk = async () => {
    if (selectedReceipts.length === 0) return;
    
    try {
      const api = apiServices.client;
      const response = await api.post('/api/business/tax/receipts/bulk-download', { receiptIds: selectedReceipts }, { responseType: 'blob' });
      if (response && response.status === 200) {
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipts_bulk_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading bulk receipts:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading receipts...</div>;
  }

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
        <h1>Tax Receipts</h1>
        <div className={styles.headerActions}>
          {selectedReceipts.length > 0 && (
            <button className={styles.bulkDownloadBtn} onClick={downloadBulk}>
              Download Selected ({selectedReceipts.length})
            </button>
          )}
        </div>
      </div>

      <div className={styles.filters}>
        <select
          className={styles.filterSelect}
          value={filters.year}
          onChange={(e) => setFilters({...filters, year: Number(e.target.value)})}
        >
          {[...Array(5)].map((_, i) => {
            const year = new Date().getFullYear() - i;
            return <option key={year} value={year}>{year}/{year + 1} Tax Year</option>;
          })}
        </select>

        <input
          type="text"
          className={styles.filterInput}
          placeholder="Filter by charity..."
          value={filters.charity}
          onChange={(e) => setFilters({...filters, charity: e.target.value})}
        />

        <input
          type="text"
          className={styles.filterInput}
          placeholder="Search receipts..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
        />
      </div>

      <div className={styles.receiptsTable}>
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedReceipts.length === filteredReceipts.length && filteredReceipts.length > 0}
                />
              </th>
              <th>Receipt Number</th>
              <th>Date</th>
              <th>Charity</th>
              <th>Amount</th>
              <th>Gift Aid</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReceipts.map(receipt => (
              <tr key={receipt.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedReceipts.includes(receipt.id)}
                    onChange={() => handleSelectReceipt(receipt.id)}
                  />
                </td>
                <td className={styles.receiptNumber}>{receipt.receiptNumber}</td>
                <td>{formatDate(receipt.date)}</td>
                <td className={styles.charityName}>{receipt.charityName}</td>
                <td className={styles.amount}>{formatCurrency(receipt.amount)}</td>
                <td>
                  {receipt.giftAidClaimed ? (
                    <span className={styles.giftAidYes}>✓ Claimed</span>
                  ) : (
                    <span className={styles.giftAidNo}>—</span>
                  )}
                </td>
                <td>
                  <span className={`${styles.status} ${styles[receipt.status]}`}>
                    {receipt.status}
                  </span>
                </td>
                <td>
                  <button
                    className={styles.downloadBtn}
                    onClick={() => downloadReceipt(receipt.id)}
                    title="Download Receipt"
                  >
                    <RiDownloadLine />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReceipts.length === 0 && (
          <div className={styles.noReceipts}>
            <p>No receipts found for the selected criteria</p>
          </div>
        )}
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span>Total Receipts:</span>
          <strong>{filteredReceipts.length}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span>Total Amount:</span>
          <strong>{formatCurrency(filteredReceipts.reduce((sum, r) => sum + r.amount, 0))}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span>Gift Aid Claimed:</span>
          <strong>{formatCurrency(filteredReceipts.filter(r => r.giftAidClaimed).reduce((sum, r) => sum + (r.amount * 0.25), 0))}</strong>
        </div>
      </div>
    </div>
  );
};

export default TaxReceipts;
