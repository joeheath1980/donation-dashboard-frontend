import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import sharedStyles from './SharedStyles.css';
import oneOffStyles from './OneOffContributions.module.css';
import { format, parseISO, parse } from 'date-fns';
import DonationModal from './DonationModal';
import { FaEdit, FaTrash, FaCheckCircle, FaPlus } from 'react-icons/fa';
import InstantTooltip from './InstantTooltip';
import { createPortal } from 'react-dom';
import axios from 'axios';
import DefaultBusinessLogo from './DefaultBusinessLogo';

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

function OneOffContributionsComponent({ displayAll }) {
  const { user, getAuthHeaders } = useAuth();
  const [oneOffContributions, setOneOffContributions] = useState([]);
  const [localContributions, setLocalContributions] = useState([]);
  const [editingContribution, setEditingContribution] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const contributionListRef = useRef(null);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  const fetchContributions = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/contributions/one-off`, {
        headers: getAuthHeaders()
      });
      setOneOffContributions(response.data);
    } catch (err) {
      console.error('Error fetching one-off contributions:', err);
      setError('Failed to load one-off contributions. Please try again later.');
    }
  }, [getAuthHeaders]);

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
        await axios.delete(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/contributions/one-off/${contributionId}`, {
          headers: getAuthHeaders()
        });
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
      let url = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/contributions/one-off`;
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

      const response = await axios({
        method: method,
        url: url,
        data: formData,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

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

  const displayedContributions = displayAll ? localContributions : localContributions.slice(0, 5);

  if (!user) {
    return <div className={sharedStyles.card}>Please log in to view your one-off contributions.</div>;
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
    <div className={`${sharedStyles.container} ${oneOffStyles.oneOffComponentContainer}`}>
      <div className={oneOffStyles.oneOffSection}>
        <div className={sharedStyles.flexBetween}>
          <button onClick={handleAddNew} className={oneOffStyles.addNewContributionButton}>
            <FaPlus /> Add New One-Off Contribution
          </button>
        </div>
        {error && (
          <div className={`${sharedStyles.alert} ${sharedStyles.error}`}>
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
                    <div className={sharedStyles.cardHeader}>
                      <h3 className={sharedStyles.cardTitle}>
                        {contribution.charity}
                        {hasMatches && (
                          <span className={oneOffStyles.matchBadge}>
                            🎯 Matched
                          </span>
                        )}
                      </h3>
                      <div className={sharedStyles.validationButton}>
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
                            href={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}${contribution.receiptUrl}`}
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
                      <InstantTooltip text="Edit contribution">
                        <button onClick={() => handleEditOrValidate(contribution)} className={`${sharedStyles.iconButton} ${oneOffStyles.tealIcon}`} aria-label="Edit Contribution">
                          <FaEdit />
                        </button>
                      </InstantTooltip>
                      <InstantTooltip text="Delete contribution">
                        <button
                          onClick={() => handleDelete(contribution._id)}
                          className={`${sharedStyles.iconButton} ${oneOffStyles.tealIcon}`}
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
            <p className={sharedStyles.textCenter}>No one-off contributions found.</p>
          )}
          {showScrollIndicator && <div className={sharedStyles.scrollIndicator} />}
        </div>
        <div className={sharedStyles.flexBetween}>
          {!displayAll && localContributions.length > 5 && (
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

export default OneOffContributionsComponent;