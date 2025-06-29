import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaCheckCircle, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import styles from './DonationsComponent.module.css';
import sharedStyles from './SharedStyles.css';
import DonationModal from './DonationModal';
import DonationItem from './DonationItem';
import InstantTooltip from './InstantTooltip';
import { createPortal } from 'react-dom';
import { format, parseISO, parse } from 'date-fns';
import { donationService } from '../services/api.service';
import { createLogger } from '../utils/logger';

const logger = createLogger('DonationsComponent');

function formatDate(dateString) {
  let date;

  try {
    date = parseISO(dateString);
  } catch (error) {
    try {
      date = parse(dateString, "EEE, dd MMM solubilities HH:mm:ss xx", new Date());
    } catch (error) {
      logger.error("Failed to parse date", { dateString });
      return dateString;
    }
  }

  return format(date, 'dd/MM/yyyy');
}

function DonationsComponent({ displayAll }) {
  const { user, getAuthHeaders } = useAuth();
  const [donations, setDonations] = useState([]);
  const [localDonations, setLocalDonations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentDonation, setCurrentDonation] = useState(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [error, setError] = useState('');
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

  // Memoize displayed donations to prevent unnecessary recalculations
  const displayedDonations = useMemo(
    () => displayAll ? localDonations : localDonations.slice(0, 5),
    [displayAll, localDonations]
  );

  // Memoize receipt click handler
  const handleReceiptClick = useCallback((receiptUrl) => {
    const fullUrl = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}${receiptUrl}`;
    window.open(fullUrl, '_blank');
  }, []);

  if (!user) {
    return <div className={sharedStyles.card}>Please log in to view your donations.</div>;
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
          {displayedDonations.length > 0 ? (
            <>
              {displayedDonations.map((donation) => (
                <DonationItem
                  key={donation._id}
                  donation={donation}
                  onEdit={handleEditOrValidate}
                  onDelete={handleDelete}
                  onReceiptClick={handleReceiptClick}
                />
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