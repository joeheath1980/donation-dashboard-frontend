import React, { useContext, useEffect, useState, useRef } from 'react';
import { ImpactContext } from '../contexts/ImpactContext';
import cleanStyles from './CleanDesign.module.css';
import { format, parseISO, parse } from 'date-fns';
import DonationModal from './DonationModal';
import { FaEdit, FaTrash, FaCheckCircle, FaPlus } from 'react-icons/fa';
import InstantTooltip from './InstantTooltip';
import { createPortal } from 'react-dom';

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
  const { donations, fetchImpactData, isAuthenticated } = useContext(ImpactContext);
  const [localDonations, setLocalDonations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentDonation, setCurrentDonation] = useState(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const donationListRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchImpactData();
    }
  }, [fetchImpactData, isAuthenticated]);

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
      handleScroll(); // Check initial scroll state
    }

    return () => {
      if (listElement) {
        listElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleDelete = async (donationId) => {
    console.log('Attempting to delete donation with ID:', donationId);
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        const response = await fetch(`http://localhost:3002/api/donations/${donationId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

        if (response.ok) {
          console.log('Donation deleted successfully');
          setLocalDonations(prevDonations => prevDonations.filter(donation => donation._id !== donationId));
          if (isAuthenticated) {
            fetchImpactData();
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete donation');
        }
      } catch (error) {
        console.error('Error deleting donation:', error);
        alert(`Failed to delete donation: ${error.message}`);
      }
    }
  };

  const handleEditOrValidate = (donation) => {
    console.log('Edit or Validate button clicked for donation:', donation);
    setCurrentDonation(donation);
    setShowModal(true);
  };

  const handleConfirm = async (editedDonation) => {
    console.log('Saving donation:', editedDonation);

    try {
      let url = 'http://localhost:3002/api/donations';
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

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const updatedDonation = await response.json();
        console.log('Server response:', updatedDonation);
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
        if (isAuthenticated) {
          fetchImpactData();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update donation');
      }
    } catch (error) {
      console.error('Error updating donation:', error);
      alert(`Failed to update donation: ${error.message}`);
    }
  };

  const handleAddNew = () => {
    setCurrentDonation(null);
    setShowModal(true);
  };

  const displayedDonations = displayAll ? localDonations : localDonations.slice(0, 5);

  if (!isAuthenticated) {
    return <div className={cleanStyles.card}>Please log in to view your donations.</div>;
  }

  const modalContent = showModal && (
    <DonationModal
      donation={currentDonation}
      onConfirm={handleConfirm}
      onCancel={() => setShowModal(false)}
    />
  );

  return (
    <>
      <div className={`${cleanStyles.grid} ${cleanStyles.donationSection}`}>
        <div className={cleanStyles.addButtonContainer}>
          <button onClick={handleAddNew} className={`${cleanStyles.button} ${cleanStyles.primary} ${cleanStyles.compact}`}>
            <FaPlus /> Add New Donation
          </button>
        </div>
        <div className={cleanStyles.donationList} ref={donationListRef}>
          {displayedDonations && displayedDonations.length > 0 ? (
            <>
              {displayedDonations.map((donation) => (
                <div key={donation._id} className={cleanStyles.card}>
                  <div className={cleanStyles.cardHeader}>
                    <h3 className={cleanStyles.cardTitle}>{donation.charity}</h3>
                    <div className={cleanStyles.validationButton}>
                      {donation.needsValidation && !donation.isValidated && (
                        <InstantTooltip text="Receipt required for validation">
                          <FaCheckCircle style={{ color: 'gray' }} />
                        </InstantTooltip>
                      )}
                      {donation.isValidated && (
                        <InstantTooltip text="Donation validated">
                          <FaCheckCircle style={{ color: '#2d8f7b' }} />
                        </InstantTooltip>
                      )}
                    </div>
                  </div>
                  <div className={cleanStyles.cardContent}>
                    <p><strong>Date:</strong> {formatDate(donation.date)}</p>
                    <p>
                      <strong>Amount:</strong> ${donation.amount.toFixed(2)}
                      {donation.isMonthly && <span className={cleanStyles.highlight}> (Monthly)</span>}
                    </p>
                    <p><strong>Charity Type:</strong> {donation.charityType || 'Not specified'}</p>
                    {donation.receiptUrl && (
                      <p>
                        <strong>Receipt:</strong> 
                        <a 
                          href={`http://localhost:3002${donation.receiptUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={cleanStyles.link}
                        >
                          View Receipt
                        </a>
                      </p>
                    )}
                  </div>
                  <div className={cleanStyles.cardActions}>
                    <InstantTooltip text={donation.needsValidation && !donation.isValidated ? "Edit or Validate donation" : "Edit donation"}>
                      <button onClick={() => handleEditOrValidate(donation)} className={cleanStyles.iconButton} aria-label="Edit or Validate Donation">
                        <FaEdit />
                      </button>
                    </InstantTooltip>
                    <InstantTooltip text="Delete donation">
                      <button
                        onClick={() => handleDelete(donation._id)}
                        className={cleanStyles.iconButton}
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
            <p className={cleanStyles.textCenter}>No donations to display.</p>
          )}
          {showScrollIndicator && <div className={cleanStyles.scrollIndicator} />}
        </div>
        <div className={cleanStyles.findMoreContainer}>
          {!displayAll && localDonations.length > 5 && (
            <button onClick={() => {}} className={`${cleanStyles.button} ${cleanStyles.secondary}`}>
              See All
            </button>
          )}
        </div>
      </div>
      {createPortal(modalContent, document.body)}
    </>
  );
}

export default DonationsComponent;