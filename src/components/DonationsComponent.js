import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaCheckCircle, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import styles from './DonationsComponent.module.css';
import sharedStyles from './SharedStyles.css';
import DonationModal from './DonationModal';
import InstantTooltip from './InstantTooltip';
import { createPortal } from 'react-dom';
import { format, parseISO, parse } from 'date-fns';

function formatDate(dateString) {
  let date;
  
  try {
    date = parseISO(dateString);
  } catch (error) {
    try {
      date = parse(dateString, "EEE, dd MMM yyyy HH:mm:ss xx", new Date());
    } catch (error) {
      console.error("Failed to parse date:", dateString);
      return dateString;
    }
  }
  
  return format(date, 'dd/MM/yyyy');
}

function DonationsComponent({ displayAll }) {
  const { user, getAuthHeaders, API_URL } = useAuth();
  const [donations, setDonations] = useState([]);
  const [localDonations, setLocalDonations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentDonation, setCurrentDonation] = useState(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [error, setError] = useState('');
  const donationListRef = useRef(null);

  const fetchDonations = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/donations`, {
        headers: getAuthHeaders()
      });
      setDonations(response.data);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Failed to load donations. Please try again later.');
    }
  }, [API_URL, getAuthHeaders]);

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

  const handleDelete = async (donationId) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) {
      return;
    }

    setError('');
    try {
      await axios.delete(`${API_URL}/api/donations/${donationId}`, {
        headers: getAuthHeaders()
      });

      setLocalDonations(prevDonations => prevDonations.filter(donation => donation._id !== donationId));
      await fetchDonations();
    } catch (error) {
      console.error('Error deleting donation:', error);
      setError(`Unable to delete the donation: ${error.message}. Please try again later.`);
    }
  };

  const handleEditOrValidate = (donation) => {
    setError('');
    setCurrentDonation(donation);
    setShowModal(true);
  };

  const handleConfirm = async (editedDonation) => {
    setError('');
    try {
      let url = `${API_URL}/api/donations`;
      let method = 'POST';

      if (currentDonation && currentDonation._id) {
        url += `/${currentDonation._id}`;
        method = 'PUT';
      }

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

      const response = await axios({
        method: method,
        url: url,
        data: formData,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      const updatedDonation = response.data;
      
      if (currentDonation && currentDonation._id) {
        setLocalDonations(prevDonations =>
          prevDonations.map(donation =>
            donation._id === updatedDonation._id ? updatedDonation : donation
          )
        );
      } else {
        setLocalDonations(prevDonations => [...prevDonations, updatedDonation]);
      }
      
      setShowModal(false);
      await fetchDonations();
    } catch (error) {
      console.error('Error updating donation:', error);
      setError(`Unable to update the donation: ${error.message}. Please try again later.`);
    }
  };

  const handleAddNew = () => {
    setError('');
    setCurrentDonation(null);
    setShowModal(true);
  };

  const displayedDonations = displayAll ? localDonations : localDonations.slice(0, 5);

  if (!user) {
    return <div className={sharedStyles.card}>Please log in to view your donations.</div>;
  }

  const modalContent = showModal && (
    <DonationModal
      donation={currentDonation}
      onConfirm={handleConfirm}
      onCancel={() => setShowModal(false)}
    />
  );

  return (
    <div className={`${sharedStyles.container} ${styles.donationComponentContainer}`}>
      <div className={styles.donationSection}>
        <div className={sharedStyles.flexBetween}>
          <button onClick={handleAddNew} className={styles.addNewDonationButton}>
            <FaPlus /> Add New Donation
          </button>
        </div>
        {error && (
          <div className={`${sharedStyles.alert} ${sharedStyles.error}`}>
            {error}
          </div>
        )}
        <div className={styles.donationList} ref={donationListRef}>
          {displayedDonations && displayedDonations.length > 0 ? (
            <>
              {displayedDonations.map((donation) => (
                <div key={donation._id} className={styles.donationCard}>
                  <div className={sharedStyles.cardHeader}>
                    <h3 className={sharedStyles.cardTitle}>{donation.charity}</h3>
                    <div className={sharedStyles.validationButton}>
                      <InstantTooltip text={donation.receiptUrl ? "Receipt uploaded" : "No receipt uploaded"}>
                        <FaCheckCircle className={donation.receiptUrl ? styles.validationIcon : styles.validationIconPending} />
                      </InstantTooltip>
                    </div>
                  </div>
                  <div className={styles.donationContent}>
                    <p><strong>Date:</strong> {formatDate(donation.date)}</p>
                    <p>
                      <strong>Amount:</strong> ${donation.amount.toFixed(2)}
                      {donation.isMonthly && <span className={sharedStyles.highlight}> (Monthly)</span>}
                    </p>
                    <p><strong>Charity Type:</strong> {donation.charityType || 'Not specified'}</p>
                    {donation.receiptUrl && (
                      <p>
                        <strong>Receipt:</strong> 
                        <a 
                          href={`${API_URL}${donation.receiptUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={sharedStyles.link}
                        >
                          View Receipt
                        </a>
                      </p>
                    )}
                  </div>
                  <div className={sharedStyles.cardActions}>
                    <InstantTooltip text="Edit donation">
                      <button onClick={() => handleEditOrValidate(donation)} className={styles.iconButton} aria-label="Edit Donation">
                        <FaEdit />
                      </button>
                    </InstantTooltip>
                    <InstantTooltip text="Delete donation">
                      <button
                        onClick={() => handleDelete(donation._id)}
                        className={styles.iconButton}
                        aria-label="Delete Donation"
                      >
                        <FaTrash />
                      </button>
                    </InstantTooltip>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <p className={sharedStyles.textCenter}>No donations to display.</p>
          )}
          {showScrollIndicator && <div className={sharedStyles.scrollIndicator} />}
        </div>
        <div className={sharedStyles.flexBetween}>
          {!displayAll && localDonations.length > 5 && (
            <button onClick={() => {}} className={`${sharedStyles.button} ${sharedStyles.secondary}`}>
              See All
            </button>
          )}
        </div>
      </div>
      {createPortal(modalContent, document.body)}
    </div>
  );
}

export default DonationsComponent;