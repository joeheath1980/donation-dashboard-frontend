import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaPlus, 
  FaDownload, 
  FaFileDownload, 
  FaFilter,
  FaCalendarAlt,
  FaBuilding,
  FaDollarSign,
  FaTimes,
  FaReceipt
} from 'react-icons/fa';
import styles from './DonationsComponent.module.css';
import './SharedStyles.css';
import DonationModal from './DonationModal';
import DonationItem from './DonationItem';
import { createPortal } from 'react-dom';
import { donationService } from '../services/api.service';
import { createLogger } from '../utils/logger';

const logger = createLogger('DonationsComponent');

function DonationsComponent({ displayAll }) {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [localDonations, setLocalDonations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentDonation, setCurrentDonation] = useState(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [downloadingReceipts, setDownloadingReceipts] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    charity: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    status: 'all' // all, matched, unmatched
  });
  
  const donationListRef = useRef(null);

  const fetchDonations = useCallback(async () => {
    try {
      const data = await donationService.getDonations();
      setDonations(data);
    } catch (err) {
      logger.error('Error fetching donations', { error: err.message });
      setError('Failed to load donations. Please try again later.');
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchDonations();
    }
  }, [user, fetchDonations]);

  useEffect(() => {
    setLocalDonations(donations);
  }, [donations]);

  useEffect(() => {
    const handleScroll = () => {
      if (donationListRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = donationListRef.current;
        setShowScrollIndicator(scrollTop === 0 && scrollHeight > clientHeight);
      }
    };

    const listElement = donationListRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
      handleScroll();
    }

    return () => {
      if (listElement) {
        listElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Filter donations based on criteria
  const filteredDonations = useMemo(() => {
    return localDonations.filter(donation => {
      // Charity filter
      if (filters.charity && !donation.charityName?.toLowerCase().includes(filters.charity.toLowerCase())) {
        return false;
      }
      
      // Date range filter
      const donationDate = new Date(donation.date);
      if (filters.dateFrom && donationDate < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && donationDate > new Date(filters.dateTo)) {
        return false;
      }
      
      // Amount range filter
      const amount = parseFloat(donation.amount);
      if (filters.amountMin && amount < parseFloat(filters.amountMin)) {
        return false;
      }
      if (filters.amountMax && amount > parseFloat(filters.amountMax)) {
        return false;
      }
      
      // Match status filter
      if (filters.status === 'matched' && !donation.isMatched) {
        return false;
      }
      if (filters.status === 'unmatched' && donation.isMatched) {
        return false;
      }
      
      return true;
    });
  }, [localDonations, filters]);

  // Get unique charity names for filter dropdown
  const charityNames = useMemo(() => {
    const names = [...new Set(donations.map(d => d.charityName).filter(Boolean))];
    return names.sort();
  }, [donations]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      charity: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      status: 'all'
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'all');

  // Download single receipt
  const handleReceiptDownload = async (donation) => {
    try {
      const response = await donationService.downloadReceipt(donation._id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${donation.charityName}-${donation.date}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Error downloading receipt', { error: error.message });
      setError('Failed to download receipt. Please try again.');
    }
  };

  // Bulk download receipts
  const handleBulkDownload = async () => {
    setDownloadingReceipts(true);
    try {
      // Get filtered donation IDs
      const donationIds = filteredDonations.map(d => d._id);
      
      const response = await donationService.downloadBulkReceipts({
        donationIds,
        filters: {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo
        }
      });
      
      const blob = new Blob([response.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `donations-receipts-${new Date().toISOString().split('T')[0]}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Error downloading bulk receipts', { error: error.message });
      setError('Failed to download receipts. Please try again.');
    } finally {
      setDownloadingReceipts(false);
    }
  };

  const handleDelete = useCallback(async (donationId) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) {
      return;
    }

    setError('');
    try {
      await donationService.deleteDonation(donationId);
      setLocalDonations(prevDonations => prevDonations.filter(donation => donation._id !== donationId));
      await fetchDonations();
    } catch (error) {
      logger.error('Error deleting donation', { error: error.message });
      setError(`Unable to delete the donation: ${error.message}. Please try again later.`);
    }
  }, [fetchDonations]);

  const handleEditOrValidate = useCallback((donation) => {
    setError('');
    setCurrentDonation(donation);
    setShowModal(true);
  }, []);

  const handleConfirm = useCallback(async (editedDonation) => {
    setError('');
    try {
      const formData = new FormData();
      for (const key in editedDonation) {
        if (key === 'receipt' && editedDonation.receipt instanceof File) {
          formData.append('receipt', editedDonation.receipt);
        } else if (key === 'amount') {
          formData.append(key, parseFloat(editedDonation.amount));
        } else {
          formData.append(key, editedDonation[key]);
        }
      }

      let updatedDonation;
      if (currentDonation && currentDonation._id) {
        updatedDonation = await donationService.updateDonation(currentDonation._id, formData);
        setLocalDonations(prevDonations =>
          prevDonations.map(donation =>
            donation._id === updatedDonation._id ? updatedDonation : donation
          )
        );
      } else {
        updatedDonation = await donationService.createDonation(formData);
        setLocalDonations(prevDonations => [...prevDonations, updatedDonation]);
      }

      setShowModal(false);
      await fetchDonations();
    } catch (error) {
      logger.error('Error updating donation', { error: error.message });
      setError(`Unable to update the donation: ${error.message}. Please try again later.`);
    }
  }, [currentDonation, fetchDonations]);

  const handleAddNew = useCallback(() => {
    setError('');
    setCurrentDonation(null);
    setShowModal(true);
  }, []);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = filteredDonations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
    const matched = filteredDonations.filter(d => d.isMatched).length;
    const unmatched = filteredDonations.length - matched;
    
    return {
      total: total.toFixed(2),
      count: filteredDonations.length,
      matched,
      unmatched
    };
  }, [filteredDonations]);

  // Memoize displayed donations to prevent unnecessary recalculations
  const displayedDonations = useMemo(
    () => displayAll ? filteredDonations : filteredDonations.slice(0, 5),
    [displayAll, filteredDonations]
  );

  // Memoize receipt click handler
  const handleReceiptClick = useCallback((receiptUrl) => {
    const fullUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}${receiptUrl}`;
    window.open(fullUrl, '_blank');
  }, []);

  if (!user) {
    return <div className="card">Please log in to view your donations.</div>;
  }

  const modalContent = showModal && (
    <DonationModal
      donation={currentDonation}
      onConfirm={handleConfirm}
      onCancel={() => setShowModal(false)}
      type="donation"
    />
  );

  return (
    <div className={`container ${styles.donationComponentContainer}`}>
      <div className={styles.donationSection}>
        <div className={styles.headerSection}>
          <div className={styles.headerActions}>
            <button onClick={handleAddNew} className={styles.addNewDonationButton}>
              <FaPlus /> Add New Donation
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className={`${styles.filterButton} ${hasActiveFilters ? styles.active : ''}`}
            >
              <FaFilter /> Filter {hasActiveFilters && `(${Object.values(filters).filter(v => v && v !== 'all').length})`}
            </button>
            <button 
              onClick={handleBulkDownload} 
              className={styles.downloadButton}
              disabled={downloadingReceipts || filteredDonations.length === 0}
            >
              <FaFileDownload /> {downloadingReceipts ? 'Downloading...' : 'Download Receipts'}
            </button>
          </div>

          {/* Summary Statistics */}
          <div className={styles.summaryStats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total:</span>
              <span className={styles.statValue}>${summaryStats.total}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Donations:</span>
              <span className={styles.statValue}>{summaryStats.count}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Matched:</span>
              <span className={styles.statValue}>{summaryStats.matched}</span>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGrid}>
              <div className={styles.filterGroup}>
                <label>
                  <FaBuilding /> Charity
                </label>
                <select 
                  value={filters.charity} 
                  onChange={(e) => handleFilterChange('charity', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="">All Charities</option>
                  {charityNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>
                  <FaCalendarAlt /> Date From
                </label>
                <input 
                  type="date" 
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className={styles.filterInput}
                />
              </div>

              <div className={styles.filterGroup}>
                <label>
                  <FaCalendarAlt /> Date To
                </label>
                <input 
                  type="date" 
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className={styles.filterInput}
                />
              </div>

              <div className={styles.filterGroup}>
                <label>
                  <FaDollarSign /> Min Amount
                </label>
                <input 
                  type="number" 
                  value={filters.amountMin}
                  onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                  placeholder="0"
                  min="0"
                  className={styles.filterInput}
                />
              </div>

              <div className={styles.filterGroup}>
                <label>
                  <FaDollarSign /> Max Amount
                </label>
                <input 
                  type="number" 
                  value={filters.amountMax}
                  onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                  placeholder="999999"
                  min="0"
                  className={styles.filterInput}
                />
              </div>

              <div className={styles.filterGroup}>
                <label>
                  <FaReceipt /> Status
                </label>
                <select 
                  value={filters.status} 
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All</option>
                  <option value="matched">Matched Only</option>
                  <option value="unmatched">Unmatched Only</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className={styles.clearFiltersButton}>
                <FaTimes /> Clear Filters
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}
        
        <div className={styles.donationList} ref={donationListRef}>
          {displayedDonations.length > 0 ? (
            <>
              {displayedDonations.map((donation) => (
                <DonationItem
                  key={donation._id}
                  donation={donation}
                  onEdit={handleEditOrValidate}
                  onDelete={handleDelete}
                  onReceiptClick={handleReceiptClick}
                  onReceiptDownload={() => handleReceiptDownload(donation)}
                />
              ))}
            </>
          ) : (
            <p className="textCenter">
              {hasActiveFilters ? 'No donations match your filters.' : 'No donations to display.'}
            </p>
          )}
          {showScrollIndicator && <div className="scrollIndicator" />}
        </div>
        
        <div className="flexBetween">
          {!displayAll && filteredDonations.length > 5 && (
            <button onClick={() => {}} className="button secondary">
              See All ({filteredDonations.length})
            </button>
          )}
        </div>
      </div>
      {createPortal(modalContent, document.body)}
    </div>
  );
}

export default DonationsComponent;