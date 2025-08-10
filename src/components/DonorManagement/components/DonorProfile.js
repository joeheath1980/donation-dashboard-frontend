import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './DonorProfile.module.css';
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaDollarSign,
  FaCalendarAlt,
  FaChartLine,
  FaStar,
  FaHandshake,
  FaHistory,
  FaPaperPlane,
  FaNotesMedical
} from 'react-icons/fa';

function DonorProfile({ donor, onClose }) {
  const { getAuthHeaders } = useAuth();
  const [donorDetails, setDonorDetails] = useState(null);
  const [donationHistory, setDonationHistory] = useState([]);
  const [communicationLog, setCommunicationLog] = useState([]);
  const [notes, setNotes] = useState('');
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonorDetails();
  }, [donor]);

  const fetchDonorDetails = async () => {
    try {
      setLoading(true);
      // API call would go here
      // const response = await axios.get(...);
      
      // For demo, use mock data
      setDonorDetails({
        ...donor,
        phone: '+61 400 123 456',
        address: 'Sydney, NSW',
        firstDonation: '2023-05-15',
        preferredContact: 'email',
        interests: ['Education', 'Environment', 'Health']
      });
      
      setDonationHistory([
        { date: '2025-01-15', amount: 100, campaign: 'Annual Appeal', matched: true },
        { date: '2024-12-20', amount: 50, campaign: 'Holiday Giving', matched: false },
        { date: '2024-11-15', amount: 100, campaign: 'Monthly', matched: true },
        { date: '2024-10-15', amount: 100, campaign: 'Monthly', matched: true }
      ]);
      
      setCommunicationLog([
        { date: '2025-01-16', type: 'email', subject: 'Thank you for your donation' },
        { date: '2024-12-21', type: 'email', subject: 'Holiday wishes from our team' },
        { date: '2024-11-01', type: 'email', subject: 'Impact report Q3 2024' }
      ]);
      
      setNotes(donor.notes || '');
    } catch (error) {
      console.error('Error fetching donor details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      // API call would go here
      setNotes(notes + '\n' + new Date().toLocaleDateString() + ': ' + newNote);
      setNewNote('');
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleSendThankYou = async () => {
    try {
      // API call would go here
      alert('Thank you email sent successfully!');
    } catch (error) {
      console.error('Error sending thank you:', error);
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
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <div className={styles.loading}>Loading donor profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <h2>Donor Profile</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.profileSection}>
          <div className={styles.profileHeader}>
            <div className={styles.avatar}>
              <FaUser />
            </div>
            <div className={styles.profileInfo}>
              <h3>{donorDetails.name}</h3>
              <p className={styles.email}>
                <FaEnvelope /> {donorDetails.email}
              </p>
              {donorDetails.phone && (
                <p className={styles.phone}>
                  <FaPhone /> {donorDetails.phone}
                </p>
              )}
              <div className={styles.tags}>
                {donorDetails.tags?.map((tag, index) => (
                  <span key={index} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
            <div className={styles.quickActions}>
              <button onClick={handleSendThankYou} className={styles.actionButton}>
                <FaPaperPlane /> Send Thank You
              </button>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.stat}>
              <FaDollarSign className={styles.statIcon} />
              <div>
                <span className={styles.statLabel}>Total Donated</span>
                <span className={styles.statValue}>{formatCurrency(donorDetails.totalDonated)}</span>
              </div>
            </div>
            <div className={styles.stat}>
              <FaCalendarAlt className={styles.statIcon} />
              <div>
                <span className={styles.statLabel}>Member Since</span>
                <span className={styles.statValue}>{formatDate(donorDetails.firstDonation)}</span>
              </div>
            </div>
            <div className={styles.stat}>
              <FaChartLine className={styles.statIcon} />
              <div>
                <span className={styles.statLabel}>Donation Count</span>
                <span className={styles.statValue}>{donorDetails.donationCount}</span>
              </div>
            </div>
            <div className={styles.stat}>
              <FaStar className={styles.statIcon} />
              <div>
                <span className={styles.statLabel}>Impact Score</span>
                <span className={styles.statValue}>{donorDetails.impactScore}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tabsContainer}>
          <div className={styles.tabContent}>
            <h4><FaHistory /> Donation History</h4>
            <div className={styles.historyList}>
              {donationHistory.map((donation, index) => (
                <div key={index} className={styles.historyItem}>
                  <div className={styles.historyDate}>{formatDate(donation.date)}</div>
                  <div className={styles.historyDetails}>
                    <span className={styles.amount}>{formatCurrency(donation.amount)}</span>
                    <span className={styles.campaign}>{donation.campaign}</span>
                    {donation.matched && <FaHandshake className={styles.matchedIcon} title="Matched" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.tabContent}>
            <h4><FaEnvelope /> Communication Log</h4>
            <div className={styles.commList}>
              {communicationLog.map((comm, index) => (
                <div key={index} className={styles.commItem}>
                  <div className={styles.commDate}>{formatDate(comm.date)}</div>
                  <div className={styles.commSubject}>{comm.subject}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.tabContent}>
            <h4><FaNotesMedical /> Notes</h4>
            <div className={styles.notesSection}>
              <div className={styles.existingNotes}>{notes || 'No notes yet'}</div>
              <div className={styles.addNote}>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className={styles.noteInput}
                />
                <button onClick={handleSaveNote} className={styles.saveButton}>
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonorProfile;