import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import businessAPI from '../services/businessAPI';
import styles from './BusinessCampaignList.module.css';
import { 
  RiAddLine,
  RiEyeLine,
  RiEditLine,
  RiFileCopyLine,
  RiBarChartLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiSubtractLine,
  RiMoreFill,
  RiDeleteBinLine,
  RiPauseLine,
  RiPlayLine,
  RiDownloadLine,
  RiArrowLeftLine,
  RiArrowRightLine
} from 'react-icons/ri';
import VerificationGate from './VerificationGate';

function BusinessCampaignList() {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    search: '',
    sortBy: 'created',
    sortOrder: 'desc'
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const response = await businessAPI.campaigns.list();
      // Use dummy data if API fails
      setCampaigns(response.data?.campaigns || getDummyCampaigns());
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setCampaigns(getDummyCampaigns());
    } finally {
      setLoading(false);
    }
  };

  const getDummyCampaigns = () => [
    {
      _id: '1',
      name: 'Holiday Giving Campaign 2024',
      status: 'active',
      type: 'all',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-12-31'),
      budget: 100000,
      spent: 45000,
      matches: 234,
      activeUsers: 156,
      avgMatchAmount: 192,
      performance: { trend: 'up', percentage: 23 },
      charities: ['Red Cross', 'UNICEF', 'WWF'],
      createdAt: new Date('2024-10-15')
    },
    {
      _id: '2',
      name: 'Employee Matching Program Q4',
      status: 'active',
      type: 'employee',
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-12-31'),
      budget: 50000,
      spent: 23000,
      matches: 112,
      activeUsers: 89,
      avgMatchAmount: 205,
      performance: { trend: 'stable', percentage: 2 },
      charities: ['Doctors Without Borders', 'UNICEF'],
      createdAt: new Date('2024-09-20')
    },
    {
      _id: '3',
      name: 'Back to School Campaign',
      status: 'completed',
      type: 'customer',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2024-09-30'),
      budget: 30000,
      spent: 28500,
      matches: 189,
      activeUsers: 134,
      avgMatchAmount: 150,
      performance: { trend: 'up', percentage: 45 },
      charities: ['Education Foundation', 'School Supplies for Kids'],
      createdAt: new Date('2024-07-15')
    },
    {
      _id: '4',
      name: 'Earth Day Special',
      status: 'paused',
      type: 'all',
      startDate: new Date('2024-04-15'),
      endDate: new Date('2024-04-30'),
      budget: 20000,
      spent: 12000,
      matches: 78,
      activeUsers: 56,
      avgMatchAmount: 153,
      performance: { trend: 'down', percentage: -12 },
      charities: ['WWF', 'Ocean Conservancy', 'Greenpeace'],
      createdAt: new Date('2024-04-01')
    },
    {
      _id: '5',
      name: 'New Customer Welcome',
      status: 'draft',
      type: 'customer',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-03-31'),
      budget: 40000,
      spent: 0,
      matches: 0,
      activeUsers: 0,
      avgMatchAmount: 0,
      performance: { trend: 'stable', percentage: 0 },
      charities: ['Multiple Charities'],
      createdAt: new Date('2024-11-20')
    }
  ];

  // Filter campaigns based on current filters
  const filteredCampaigns = useMemo(() => {
    let filtered = [...campaigns];
    
    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }
    
    // Date range filter
    const now = new Date();
    if (filters.dateRange === 'active') {
      filtered = filtered.filter(c => 
        new Date(c.startDate) <= now && new Date(c.endDate) >= now
      );
    } else if (filters.dateRange === 'upcoming') {
      filtered = filtered.filter(c => new Date(c.startDate) > now);
    } else if (filters.dateRange === 'past') {
      filtered = filtered.filter(c => new Date(c.endDate) < now);
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.charities.some(charity => charity.toLowerCase().includes(searchLower))
      );
    }
    
    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0;
      switch (filters.sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'budget':
          compareValue = a.budget - b.budget;
          break;
        case 'spent':
          compareValue = a.spent - b.spent;
          break;
        case 'matches':
          compareValue = a.matches - b.matches;
          break;
        case 'performance':
          compareValue = a.performance.percentage - b.performance.percentage;
          break;
        case 'created':
        default:
          compareValue = new Date(a.createdAt) - new Date(b.createdAt);
          break;
      }
      return filters.sortOrder === 'asc' ? compareValue : -compareValue;
    });
    
    return filtered;
  }, [campaigns, filters]);

  // Pagination
  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCampaigns.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCampaigns, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);

  // Actions
  const handleStatusChange = async (campaignId, newStatus) => {
    try {
      if (newStatus === 'paused') {
        await businessAPI.campaigns.pause(campaignId);
      } else if (newStatus === 'active') {
        await businessAPI.campaigns.resume(campaignId);
      } else if (newStatus === 'completed') {
        await businessAPI.campaigns.end(campaignId);
      }
      
      // Update local state
      setCampaigns(prev => prev.map(c => 
        c._id === campaignId ? { ...c, status: newStatus } : c
      ));
    } catch (err) {
      setError('Failed to update campaign status');
      console.error(err);
    }
  };

  const handleDuplicate = async (campaign) => {
    try {
      const newCampaign = {
        ...campaign,
        name: `${campaign.name} (Copy)`,
        status: 'draft',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        spent: 0,
        matches: 0,
        activeUsers: 0
      };
      delete newCampaign._id;
      
      await businessAPI.campaigns.create(newCampaign);
      fetchCampaigns();
    } catch (err) {
      setError('Failed to duplicate campaign');
      console.error(err);
    }
  };

  const handleDelete = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await businessAPI.campaigns.delete(campaignId);
        setCampaigns(prev => prev.filter(c => c._id !== campaignId));
      } catch (err) {
        setError('Failed to delete campaign');
        console.error(err);
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedCampaigns.length === 0) return;
    
    switch (action) {
      case 'pause':
        for (const id of selectedCampaigns) {
          await handleStatusChange(id, 'paused');
        }
        break;
      case 'resume':
        for (const id of selectedCampaigns) {
          await handleStatusChange(id, 'active');
        }
        break;
      case 'delete':
        if (window.confirm(`Delete ${selectedCampaigns.length} campaigns?`)) {
          for (const id of selectedCampaigns) {
            await handleDelete(id);
          }
        }
        break;
    }
    setSelectedCampaigns([]);
  };

  const toggleCampaignSelection = (campaignId) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const toggleAllSelection = () => {
    if (selectedCampaigns.length === paginatedCampaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(paginatedCampaigns.map(c => c._id));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return styles.statusActive;
      case 'paused': return styles.statusPaused;
      case 'completed': return styles.statusCompleted;
      case 'draft': return styles.statusDraft;
      default: return '';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Campaign Management</h1>
        <VerificationGate>
          <Link to="/create-business-campaign" className={styles.createButton}>
            <RiAddLine /> Create New Campaign
          </Link>
        </VerificationGate>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <div className={styles.filterGroup}>
          <label>Status</label>
          <select 
            value={filters.status} 
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Date Range</label>
          <select 
            value={filters.dateRange} 
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="all">All Time</option>
            <option value="active">Currently Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Search</label>
          <input
            type="text"
            placeholder="Search campaigns..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Sort By</label>
          <div className={styles.sortControls}>
            <select 
              value={filters.sortBy} 
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className={styles.filterSelect}
            >
              <option value="created">Created Date</option>
              <option value="name">Name</option>
              <option value="budget">Budget</option>
              <option value="spent">Amount Spent</option>
              <option value="matches">Total Matches</option>
              <option value="performance">Performance</option>
            </select>
            <button
              className={styles.sortOrderButton}
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
              }))}
            >
              {filters.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCampaigns.length > 0 && (
        <div className={styles.bulkActions}>
          <span>{selectedCampaigns.length} selected</span>
          <button onClick={() => handleBulkAction('pause')} className={styles.bulkButton}>
            Pause Selected
          </button>
          <button onClick={() => handleBulkAction('resume')} className={styles.bulkButton}>
            Resume Selected
          </button>
          <button onClick={() => handleBulkAction('delete')} className={styles.bulkButtonDanger}>
            Delete Selected
          </button>
        </div>
      )}

      {/* Campaigns Table */}
      {loading ? (
        <div className={styles.loading}>Loading campaigns...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : filteredCampaigns.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No campaigns found</h3>
          <p>Try adjusting your filters or create a new campaign.</p>
        </div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.campaignsTable}>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.length === paginatedCampaigns.length && paginatedCampaigns.length > 0}
                      onChange={toggleAllSelection}
                    />
                  </th>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Budget</th>
                  <th>Performance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCampaigns.map(campaign => (
                  <tr key={campaign._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedCampaigns.includes(campaign._id)}
                        onChange={() => toggleCampaignSelection(campaign._id)}
                      />
                    </td>
                    <td>
                      <div className={styles.campaignInfo}>
                        <h3>{campaign.name}</h3>
                        <p className={styles.campaignCharities}>
                          {campaign.charities.slice(0, 3).join(', ')}
                          {campaign.charities.length > 3 && ` +${campaign.charities.length - 3} more`}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td>
                      <span className={styles.campaignType}>
                        {campaign.type === 'all' ? 'All Users' : 
                         campaign.type === 'employee' ? 'Employees' : 'Customers'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.dateRange}>
                        <span>{formatDate(campaign.startDate)}</span>
                        <span className={styles.dateSeparator}><RiArrowRightLine /></span>
                        <span>{formatDate(campaign.endDate)}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.budgetInfo}>
                        <div className={styles.budgetBar}>
                          <div 
                            className={styles.budgetFill}
                            style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                          />
                        </div>
                        <span className={styles.budgetText}>
                          {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.performanceMetrics}>
                        <div className={styles.metric}>
                          <span className={styles.metricValue}>{campaign.matches}</span>
                          <span className={styles.metricLabel}>Matches</span>
                        </div>
                        <div className={styles.metric}>
                          <span className={styles.metricValue}>{campaign.activeUsers}</span>
                          <span className={styles.metricLabel}>Users</span>
                        </div>
                        <div className={styles.metric}>
                          <span className={`${styles.metricValue} ${styles[`trend${campaign.performance.trend}`]}`}>
                            {campaign.performance.trend === 'up' ? <RiArrowUpLine /> : 
                             campaign.performance.trend === 'down' ? <RiArrowDownLine /> : <RiSubtractLine />}
                            {Math.abs(campaign.performance.percentage)}%
                          </span>
                          <span className={styles.metricLabel}>Trend</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          onClick={() => navigate(`/business/campaigns/${campaign._id}`)}
                          className={styles.actionButton}
                          title="View Details"
                        >
                          <RiEyeLine />
                        </button>
                        <button
                          onClick={() => navigate(`/business/campaigns/${campaign._id}/edit`)}
                          className={styles.actionButton}
                          title="Edit"
                          disabled={campaign.status === 'completed'}
                        >
                          <RiEditLine />
                        </button>
                        <button
                          onClick={() => handleDuplicate(campaign)}
                          className={styles.actionButton}
                          title="Duplicate"
                        >
                          <RiFileCopyLine />
                        </button>
                        <button
                          onClick={() => navigate(`/business/campaigns/${campaign._id}/analytics`)}
                          className={styles.actionButton}
                          title="Analytics"
                        >
                          <RiBarChartLine />
                        </button>
                        <div className={styles.moreActions}>
                          <button className={styles.moreButton}><RiMoreFill /></button>
                          <div className={styles.dropdown}>
                            {campaign.status === 'active' && (
                              <button onClick={() => handleStatusChange(campaign._id, 'paused')}>
                                Pause Campaign
                              </button>
                            )}
                            {campaign.status === 'paused' && (
                              <button onClick={() => handleStatusChange(campaign._id, 'active')}>
                                Resume Campaign
                              </button>
                            )}
                            {campaign.status !== 'completed' && (
                              <button onClick={() => handleStatusChange(campaign._id, 'completed')}>
                                End Campaign
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(campaign._id)}
                              className={styles.deleteButton}
                            >
                              Delete Campaign
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={styles.paginationButton}
              >
                Previous
              </button>
              
              <div className={styles.pageNumbers}>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`${styles.pageNumber} ${currentPage === index + 1 ? styles.active : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={styles.paginationButton}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Summary Stats */}
      <div className={styles.summaryStats}>
        <div className={styles.statCard}>
          <h3>Total Campaigns</h3>
          <p className={styles.statValue}>{campaigns.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Active Campaigns</h3>
          <p className={styles.statValue}>{campaigns.filter(c => c.status === 'active').length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Budget</h3>
          <p className={styles.statValue}>
            {formatCurrency(campaigns.reduce((sum, c) => sum + c.budget, 0))}
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Matches</h3>
          <p className={styles.statValue}>
            {campaigns.reduce((sum, c) => sum + c.matches, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default BusinessCampaignList;
