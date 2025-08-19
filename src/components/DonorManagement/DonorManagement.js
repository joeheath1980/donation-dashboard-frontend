import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './DonorManagement.module.css';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaDownload,
  FaEnvelope,
  FaSort,
  FaChevronDown,
  FaChevronUp,
  FaEye,
  FaTag,
  FaStar,
  FaClock,
  FaDollarSign,
  FaHandshake
} from 'react-icons/fa';
import DonorProfile from './components/DonorProfile';
import CommunicationLog from './components/CommunicationLog';
import DonorSegments from './components/DonorSegments';
import BulkActions from './components/BulkActions';
import { API_CONFIG } from '../../config/api.config';

function DonorManagement() {
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonors, setSelectedDonors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // all, major, monthly, lapsed, new
  const [sortBy, setSortBy] = useState('lastDonation'); // lastDonation, totalDonated, name, frequency
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showDonorProfile, setShowDonorProfile] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [activeTab, setActiveTab] = useState('list'); // list, segments, communications

  useEffect(() => {
    // Check if user is a charity (check multiple possible fields)
    const isCharity = user?.isCharity || user?.userType === 'charity' || user?.type === 'charity';
    if (user && !isCharity) {
      navigate('/charity-dashboard');
      return;
    }
    fetchDonors();
  }, [user, currentPage, sortBy, sortOrder, filterBy, searchTerm]);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const charityId = user.charityId || user._id;
      
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/charities/${charityId}/donors`,
        {
          headers: getAuthHeaders(),
          params: {
            page: currentPage,
            limit: 20,
            search: searchTerm,
            sort: sortBy,
            order: sortOrder,
            filter: filterBy
          }
        }
      );
      
      setDonors(response.data.donors || getDemoDonors());
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error fetching donors:', error);
      // Use demo data if API fails
      setDonors(getDemoDonors());
      setTotalPages(3);
    } finally {
      setLoading(false);
    }
  };

  const getDemoDonors = () => [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      totalDonated: 2500,
      lastDonation: '2025-01-15',
      frequency: 'Monthly',
      donationCount: 24,
      isMatched: true,
      impactScore: 850,
      tags: ['Major Donor', 'Monthly Giver']
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'mchen@email.com',
      totalDonated: 750,
      lastDonation: '2025-01-10',
      frequency: 'Quarterly',
      donationCount: 8,
      isMatched: true,
      impactScore: 620,
      tags: ['Recurring']
    },
    {
      id: 3,
      name: 'Emma Williams',
      email: 'emma.w@email.com',
      totalDonated: 150,
      lastDonation: '2024-11-20',
      frequency: 'One-time',
      donationCount: 2,
      isMatched: false,
      impactScore: 320,
      tags: ['Lapsed']
    },
    {
      id: 4,
      name: 'David Brown',
      email: 'dbrown@email.com',
      totalDonated: 5000,
      lastDonation: '2025-01-18',
      frequency: 'Monthly',
      donationCount: 36,
      isMatched: true,
      impactScore: 950,
      tags: ['Major Donor', 'VIP']
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      email: 'lisa.a@email.com',
      totalDonated: 300,
      lastDonation: '2025-01-05',
      frequency: 'One-time',
      donationCount: 3,
      isMatched: false,
      impactScore: 410,
      tags: ['New Donor']
    }
  ];

  const handleSelectDonor = (donorId) => {
    if (selectedDonors.includes(donorId)) {
      setSelectedDonors(selectedDonors.filter(id => id !== donorId));
    } else {
      setSelectedDonors([...selectedDonors, donorId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedDonors.length === donors.length) {
      setSelectedDonors([]);
    } else {
      setSelectedDonors(donors.map(d => d.id));
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleViewDonor = (donor) => {
    setSelectedDonor(donor);
    setShowDonorProfile(true);
  };

  const handleExport = async () => {
    try {
      const charityId = user.charityId || user._id;
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/charities/${charityId}/donors/export`,
        {
          headers: getAuthHeaders(),
          params: { format: 'csv' },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `donors-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting donors:', error);
      alert('Export feature coming soon!');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading donors...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <FaUsers /> Donor Management
          </h1>
          <button 
            onClick={() => navigate('/charity-dashboard')}
            className={styles.backButton}
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'list' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Donor List
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'segments' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('segments')}
        >
          Segments
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'communications' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('communications')}
        >
          Communications
        </button>
      </div>

      {activeTab === 'list' && (
        <div className={styles.content}>
          <div className={styles.controls}>
            <div className={styles.searchBar}>
              <FaSearch />
              <input
                type="text"
                placeholder="Search donors by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filterButtons}>
              <select 
                value={filterBy} 
                onChange={(e) => setFilterBy(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Donors</option>
                <option value="major">Major Donors ($500+)</option>
                <option value="monthly">Monthly Givers</option>
                <option value="new">New Donors</option>
                <option value="lapsed">Lapsed (90+ days)</option>
              </select>
              
              <button 
                onClick={handleExport}
                className={styles.exportButton}
              >
                <FaDownload /> Export
              </button>
              
              {selectedDonors.length > 0 && (
                <button 
                  onClick={() => setShowBulkActions(true)}
                  className={styles.bulkButton}
                >
                  <FaEnvelope /> Actions ({selectedDonors.length})
                </button>
              )}
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.donorTable}>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedDonors.length === donors.length && donors.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th onClick={() => handleSort('name')}>
                    Name 
                    {sortBy === 'name' && (sortOrder === 'asc' ? <FaChevronUp /> : <FaChevronDown />)}
                  </th>
                  <th>Email</th>
                  <th onClick={() => handleSort('totalDonated')}>
                    Total Donated
                    {sortBy === 'totalDonated' && (sortOrder === 'asc' ? <FaChevronUp /> : <FaChevronDown />)}
                  </th>
                  <th onClick={() => handleSort('lastDonation')}>
                    Last Donation
                    {sortBy === 'lastDonation' && (sortOrder === 'asc' ? <FaChevronUp /> : <FaChevronDown />)}
                  </th>
                  <th onClick={() => handleSort('frequency')}>
                    Frequency
                    {sortBy === 'frequency' && (sortOrder === 'asc' ? <FaChevronUp /> : <FaChevronDown />)}
                  </th>
                  <th>Impact Score</th>
                  <th>Tags</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donors.map(donor => (
                  <tr key={donor.id} className={styles.donorRow}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedDonors.includes(donor.id)}
                        onChange={() => handleSelectDonor(donor.id)}
                      />
                    </td>
                    <td className={styles.donorName}>
                      {donor.name}
                      {donor.isMatched && <FaHandshake className={styles.matchedIcon} title="Matched Donor" />}
                    </td>
                    <td>{donor.email}</td>
                    <td className={styles.amount}>{formatCurrency(donor.totalDonated)}</td>
                    <td>{formatDate(donor.lastDonation)}</td>
                    <td>
                      <span className={`${styles.frequency} ${styles[donor.frequency.toLowerCase().replace(' ', '-')]}`}>
                        {donor.frequency}
                      </span>
                    </td>
                    <td>
                      <div className={styles.impactScore}>
                        <span>{donor.impactScore}</span>
                        <div className={styles.scoreBar}>
                          <div 
                            className={styles.scoreProgress} 
                            style={{ width: `${(donor.impactScore / 1000) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.tags}>
                        {donor.tags.map((tag, index) => (
                          <span key={index} className={styles.tag}>{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleViewDonor(donor)}
                        className={styles.viewButton}
                        title="View Profile"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button 
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={styles.pageButton}
            >
              Previous
            </button>
            <span className={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={styles.pageButton}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {activeTab === 'segments' && (
        <div className={styles.content}>
          <DonorSegments charityId={user.charityId || user._id} />
        </div>
      )}

      {activeTab === 'communications' && (
        <div className={styles.content}>
          <CommunicationLog charityId={user.charityId || user._id} />
        </div>
      )}

      {showDonorProfile && selectedDonor && (
        <DonorProfile 
          donor={selectedDonor}
          onClose={() => {
            setShowDonorProfile(false);
            setSelectedDonor(null);
          }}
        />
      )}

      {showBulkActions && (
        <BulkActions
          selectedDonors={selectedDonors}
          donors={donors}
          onClose={() => setShowBulkActions(false)}
          onComplete={() => {
            setShowBulkActions(false);
            setSelectedDonors([]);
            fetchDonors();
          }}
        />
      )}
    </div>
  );
}

export default DonorManagement;