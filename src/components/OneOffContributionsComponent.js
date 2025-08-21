import React, { useEffect, useState, useCallback, useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './SharedStyles.css';
import oneOffStyles from './OneOffContributions.module.css';
import { format, parseISO, parse } from 'date-fns';
import DonationModal from './DonationModal';
import { 
  FaEdit, 
  FaTrash, 
  FaCheckCircle, 
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
import InstantTooltip from './InstantTooltip';
import { createPortal } from 'react-dom';
import { FaQuestionCircle } from 'react-icons/fa';
import apiServices from '../services/api.service';
import DefaultBusinessLogo from './DefaultBusinessLogo';
import { API_CONFIG } from '../config/api.config';

function formatDate(dateString) {
  let date;

  try {
    date = parseISO(dateString);
  } catch (error) {
    try {
      date = parse(dateString, "EEE, dd MMM solubilities HH:mm:ss xx", new Date());
    } catch (error) {
      console.error("Failed to parse date:", dateString);
      return dateString;
    }
  }

  return format(date, 'dd/MM/yyyy');
}

const OneOffContributionsComponent = forwardRef(({ displayAll }, ref) => {
  const { user } = useAuth();
  const [oneOffContributions, setOneOffContributions] = useState([]);
  const [localContributions, setLocalContributions] = useState([]);
  const [editingContribution, setEditingContribution] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const contributionListRef = useRef(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
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
  
  // Expose openModal method to parent component
  useImperativeHandle(ref, () => ({
    openModal: () => {
      setEditingContribution(null);
      setShowModal(true);
    }
  }));

  const fetchContributions = useCallback(async () => {
    try {
      const api = apiServices.client;
      const response = await api.get('/api/contributions/one-off');
      setOneOffContributions(response.data);
    } catch (err) {
      console.error('Error fetching one-off contributions:', err);
      setError('Failed to load one-off contributions. Please try again later.');
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchContributions();
    }
  }, [user, fetchContributions]);

  useEffect(() => {
    setLocalContributions(oneOffContributions);
  }, [oneOffContributions]);

  useEffect(() => {
    const handleScroll = () => {
      if (contributionListRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contributionListRef.current;
        setShowScrollIndicator(scrollTop === 0 && scrollHeight > clientHeight);
      }
    };

    const listElement = contributionListRef.current;
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

  const handleDelete = async (contributionId) => {
    if (window.confirm('Are you sure you want to delete this contribution?')) {
      try {
        const api = apiServices.client;
        await api.delete(`/api/contributions/one-off/${contributionId}`);
        setLocalContributions(prevContributions => prevContributions.filter(contribution => contribution._id !== contributionId));
        await fetchContributions();
      } catch (error) {
        console.error('Error deleting contribution:', error);
        setError(`Failed to delete contribution: ${error.message}`);
      }
    }
  };

  const handleEditOrValidate = (contribution) => {
    setEditingContribution(contribution);
    setShowModal(true);
  };

  const handleSave = async (editedContribution) => {
    try {
      let url = `/api/contributions/one-off`;
      let method = 'POST';

      if (editingContribution && editingContribution._id) {
        url += `/${editingContribution._id}`;
        method = 'PUT';
      }

      const formData = new FormData();
      for (const key in editedContribution) {
        if (key === 'receipt' && editedContribution.receipt instanceof File) {
          formData.append('receipt', editedContribution.receipt);
        } else if (key === 'amount') {
          formData.append(key, parseFloat(editedContribution.amount));
        } else {
          formData.append(key, editedContribution[key]);
        }
      }

      const api = apiServices.client;
      const response = await api.request({ method, url, data: formData, headers: { 'Content-Type': 'multipart/form-data' } });

      const updatedContribution = response.data;

      if (editingContribution && editingContribution._id) {
        setLocalContributions(prevContributions =>
          prevContributions.map(contribution =>
            contribution._id === updatedContribution._id ? updatedContribution : contribution
          )
        );
      } else {
        setLocalContributions(prevContributions => [...prevContributions, updatedContribution]);
      }

      setShowModal(false);
      setEditingContribution(null);
      await fetchContributions();
    } catch (error) {
      console.error('Error updating contribution:', error);
      setError(`Failed to update contribution: ${error.message}`);
    }
  };

  const handleAddNew = () => {
    setEditingContribution(null);
    setShowModal(true);
  };

  // Filter contributions based on criteria
  const filteredContributions = useMemo(() => {
    return localContributions.filter(contribution => {
      // Charity filter
      if (filters.charity && !contribution.charity?.toLowerCase().includes(filters.charity.toLowerCase())) {
        return false;
      }
      
      // Date range filter
      const contributionDate = new Date(contribution.date);
      if (filters.dateFrom && contributionDate < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && contributionDate > new Date(filters.dateTo)) {
        return false;
      }
      
      // Amount range filter
      const amount = parseFloat(contribution.amount);
      if (filters.amountMin && amount < parseFloat(filters.amountMin)) {
        return false;
      }
      if (filters.amountMax && amount > parseFloat(filters.amountMax)) {
        return false;
      }
      
      // Match status filter
      const hasMatches = contribution.matches && contribution.matches.length > 0;
      if (filters.status === 'matched' && !hasMatches) {
        return false;
      }
      if (filters.status === 'unmatched' && hasMatches) {
        return false;
      }
      
      return true;
    });
  }, [localContributions, filters]);

  // Get unique charity names for filter dropdown
  const charityNames = useMemo(() => {
    const names = [...new Set(oneOffContributions.map(c => c.charity).filter(Boolean))];
    return names.sort();
  }, [oneOffContributions]);

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
  const handleReceiptDownload = async (contribution) => {
    try {
      if (!contribution.receiptUrl) {
        setError('No receipt available for this contribution.');
        return;
      }
      
      // For now, just open the receipt in a new tab
      // In the future, this could be enhanced to download as PDF
      const receiptUrl = `${API_CONFIG.BASE_URL}${contribution.receiptUrl}`;
      window.open(receiptUrl, '_blank');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      setError('Failed to download receipt. Please try again.');
    }
  };

  // Bulk download receipts
  const handleBulkDownload = async () => {
    setDownloadingReceipts(true);
    try {
      // Get filtered contributions that have receipts
      const contributionsWithReceipts = filteredContributions.filter(c => c.receiptUrl);
      
      if (contributionsWithReceipts.length === 0) {
        setError('No receipts available to download.');
        setDownloadingReceipts(false);
        return;
      }
      
      // For now, open all receipts in new tabs (with a limit to prevent browser blocking)
      // In the future, this should be enhanced to create a zip file on the backend
      const maxToOpen = 5;
      if (contributionsWithReceipts.length > maxToOpen) {
        if (!window.confirm(`This will open ${maxToOpen} receipts in new tabs. Continue?`)) {
          setDownloadingReceipts(false);
          return;
        }
      }
      
      contributionsWithReceipts.slice(0, maxToOpen).forEach((contribution, index) => {
        setTimeout(() => {
          const receiptUrl = `${API_CONFIG.BASE_URL}${contribution.receiptUrl}`;
          window.open(receiptUrl, '_blank');
        }, index * 500); // Delay to prevent popup blocking
      });
      
      if (contributionsWithReceipts.length > maxToOpen) {
        setError(`Opened first ${maxToOpen} receipts. Please use individual download buttons for remaining receipts.`);
      }
    } catch (error) {
      console.error('Error downloading bulk receipts:', error);
      setError('Failed to download receipts. Please try again.');
    } finally {
      setTimeout(() => setDownloadingReceipts(false), 2000);
    }
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = filteredContributions.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
    const matched = filteredContributions.filter(c => c.matches && c.matches.length > 0).length;
    const unmatched = filteredContributions.length - matched;
    
    return {
      total: total.toFixed(2),
      count: filteredContributions.length,
      matched,
      unmatched
    };
  }, [filteredContributions]);

  const displayedContributions = displayAll ? filteredContributions : filteredContributions.slice(0, 5);

  if (!user) {
    return <div className="card">Please log in to view your one-off contributions.</div>;
  }

  const modalContent = showModal && (
    <DonationModal
      donation={editingContribution}
      onConfirm={handleSave}
      onCancel={() => {
        setShowModal(false);
        setEditingContribution(null);
      }}
      type="one-off"
    />
  );

  return (
    <div className={`container ${oneOffStyles.oneOffComponentContainer}`}>
      <div className={oneOffStyles.oneOffSection}>
        <div className={oneOffStyles.headerSection}>
          <div className={oneOffStyles.headerActions}>
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className={`${oneOffStyles.filterButton} ${hasActiveFilters ? oneOffStyles.active : ''}`}
            >
              <FaFilter /> Filter {hasActiveFilters && `(${Object.values(filters).filter(v => v && v !== 'all').length})`}
            </button>
            <button 
              onClick={handleBulkDownload} 
              className={oneOffStyles.downloadButton}
              disabled={downloadingReceipts || filteredContributions.filter(c => c.receiptUrl).length === 0}
              title={filteredContributions.filter(c => c.receiptUrl).length === 0 ? "Available once you have at least one donation with a receipt" : "Download all available receipts"}
            >
              <FaFileDownload /> {downloadingReceipts ? 'Downloading...' : 'Download Receipts'}
            </button>
          </div>

          {/* Summary Statistics */}
          <div className={oneOffStyles.summaryStats}>
            <div className={oneOffStyles.statItem}>
              <span className={oneOffStyles.statLabel}>Total:</span>
              <span className={oneOffStyles.statValue}>${summaryStats.total}</span>
            </div>
            <div className={oneOffStyles.statItem}>
              <span className={oneOffStyles.statLabel}>Contributions:</span>
              <span className={oneOffStyles.statValue}>{summaryStats.count}</span>
            </div>
            <div className={oneOffStyles.statItem}>
              <span className={oneOffStyles.statLabel}>
                Matched:
                <InstantTooltip text="Matched donations are contributions doubled by partner sponsors">
                  <FaQuestionCircle style={{ marginLeft: '4px', fontSize: '12px', color: '#6b7280', cursor: 'help' }} />
                </InstantTooltip>
              </span>
              <span className={oneOffStyles.statValue}>{summaryStats.matched}</span>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className={oneOffStyles.filterPanel}>
            <div className={oneOffStyles.filterGrid}>
              <div className={oneOffStyles.filterGroup}>
                <label>
                  <FaBuilding /> Charity
                </label>
                <select 
                  value={filters.charity} 
                  onChange={(e) => handleFilterChange('charity', e.target.value)}
                  className={oneOffStyles.filterSelect}
                >
                  <option value="">All Charities</option>
                  {charityNames.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              <div className={oneOffStyles.filterGroup}>
                <label>
                  <FaCalendarAlt /> Date From
                </label>
                <input 
                  type="date" 
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className={oneOffStyles.filterInput}
                />
              </div>

              <div className={oneOffStyles.filterGroup}>
                <label>
                  <FaCalendarAlt /> Date To
                </label>
                <input 
                  type="date" 
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className={oneOffStyles.filterInput}
                />
              </div>

              <div className={oneOffStyles.filterGroup}>
                <label>
                  <FaDollarSign /> Min Amount
                </label>
                <input 
                  type="number" 
                  value={filters.amountMin}
                  onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                  placeholder="0"
                  min="0"
                  className={oneOffStyles.filterInput}
                />
              </div>

              <div className={oneOffStyles.filterGroup}>
                <label>
                  <FaDollarSign /> Max Amount
                </label>
                <input 
                  type="number" 
                  value={filters.amountMax}
                  onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                  placeholder="999999"
                  min="0"
                  className={oneOffStyles.filterInput}
                />
              </div>

              <div className={oneOffStyles.filterGroup}>
                <label>
                  <FaReceipt /> Status
                </label>
                <select 
                  value={filters.status} 
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className={oneOffStyles.filterSelect}
                >
                  <option value="all">All</option>
                  <option value="matched">Matched Only</option>
                  <option value="unmatched">Unmatched Only</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className={oneOffStyles.clearFiltersButton}>
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
        <div className={oneOffStyles.oneOffList} ref={contributionListRef}>
          {displayedContributions && displayedContributions.length > 0 ? (
            <>
              {displayedContributions.map((contribution) => {
                // Calculate total impact including matches
                const totalMatched = contribution.matches ? 
                  contribution.matches.reduce((sum, match) => sum + match.matchAmount, 0) : 0;
                const totalImpact = contribution.amount + totalMatched;
                const hasMatches = contribution.matches && contribution.matches.length > 0;
                
                return (
                  <div key={contribution._id} className={`${oneOffStyles.oneOffCard} ${hasMatches ? oneOffStyles.matchedContribution : ''}`}>
                    <div className="cardHeader">
                      <h3 className="cardTitle">
                        {contribution.charity}
                        {hasMatches && (
                          <span className={oneOffStyles.matchBadge}>
                            🎯 Matched
                          </span>
                        )}
                      </h3>
                      <div className="validationButton">
                        <InstantTooltip text={contribution.receiptUrl ? "Receipt uploaded" : "No receipt uploaded"}>
                          <FaCheckCircle className={contribution.receiptUrl ? oneOffStyles.validationIcon : oneOffStyles.validationIconPending} />
                        </InstantTooltip>
                      </div>
                    </div>
                    
                    {/* Business Match Logos */}
                    {hasMatches && (
                      <div className={oneOffStyles.matchingBusinesses}>
                        {contribution.matches.map((match, index) => (
                          <div key={index} className={oneOffStyles.businessMatch}>
                            {match.businessLogo ? (
                              <img 
                                src={match.businessLogo} 
                                alt={match.businessName}
                                className={oneOffStyles.businessLogo}
                              />
                            ) : (
                              <DefaultBusinessLogo size={32} />
                            )}
                            <span className={oneOffStyles.matchInfo}>
                              {match.businessName} matched {match.multiplier}x
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className={oneOffStyles.oneOffContent}>
                      <p><strong>Date:</strong> {formatDate(contribution.date)}</p>
                      <p><strong>Your Donation:</strong> ${contribution.amount.toFixed(2)}</p>
                      
                      {/* Impact Summary */}
                      {hasMatches && (
                        <div className={oneOffStyles.impactSummary}>
                          <p className={oneOffStyles.matchedAmount}>
                            <strong>Matched Amount:</strong> ${totalMatched.toFixed(2)}
                          </p>
                          <p className={oneOffStyles.totalImpact}>
                            <strong>Total Impact:</strong> 
                            <span className={oneOffStyles.impactValue}>${totalImpact.toFixed(2)}</span>
                          </p>
                        </div>
                      )}
                      
                      <p><strong>Charity Type:</strong> {contribution.charityType || 'Not specified'}</p>
                      {contribution.receiptUrl && (
                        <p>
                          <strong>Receipt:</strong>
                          <a
                            href={`${API_CONFIG.BASE_URL}${contribution.receiptUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link"
                          >
                            View Receipt
                          </a>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              handleReceiptDownload(contribution);
                            }}
                            className={oneOffStyles.receiptDownloadButton}
                            className="ml-10 p-2px-8px font-size-12"
                          >
                            <FaDownload /> Download
                          </button>
                        </p>
                      )}
                    </div>
                    <div className="cardActions">
                      <InstantTooltip text="Edit contribution">
                        <button onClick={() => handleEditOrValidate(contribution)} className={`iconButton ${oneOffStyles.tealIcon}`} aria-label="Edit Contribution">
                          <FaEdit />
                        </button>
                      </InstantTooltip>
                      <InstantTooltip text="Delete contribution">
                        <button
                          onClick={() => handleDelete(contribution._id)}
                          className={`iconButton ${oneOffStyles.tealIcon}`}
                          aria-label="Delete Contribution"
                        >
                          <FaTrash />
                        </button>
                      </InstantTooltip>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className={oneOffStyles.emptyState}>
              {hasActiveFilters ? (
                <p>No contributions match your filters.</p>
              ) : (
                <>
                  <p>No one-off donations yet.</p>
                  <p className={oneOffStyles.emptyStateSubtext}>Explore causes to make your first impact.</p>
                  <button 
                    onClick={() => window.location.href = '/search-charities'} 
                    className={oneOffStyles.findCauseButton}
                  >
                    Find a Cause
                  </button>
                </>
              )}
            </div>
          )}
          {showScrollIndicator && <div className="scrollIndicator" />}
        </div>
        <div className="flexBetween">
          {!displayAll && filteredContributions.length > 5 && (
            <button onClick={() => {}} className="button secondary">
              See All ({filteredContributions.length})
            </button>
          )}
        </div>
      </div>
      {createPortal(modalContent, document.body)}
    </div>
  );
});

export default OneOffContributionsComponent;
