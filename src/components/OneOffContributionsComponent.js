import React, { useContext, useEffect, useState } from 'react';
import { ImpactContext } from '../contexts/ImpactContext';
import cleanStyles from './CleanDesign.module.css';
import { format, parseISO, parse } from 'date-fns';
import OneOffContributionModal from './OneOffContributionModal';
import ValidationModal from './ValidationModal';
import { FaEdit, FaTrash, FaCheckCircle, FaPlus } from 'react-icons/fa';
import InstantTooltip from './InstantTooltip';

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

function OneOffContributionsComponent({ displayAll }) {
  const { oneOffContributions, onDeleteContribution, fetchImpactData, isAuthenticated } = useContext(ImpactContext);
  const [localContributions, setLocalContributions] = useState([]);
  const [editingContribution, setEditingContribution] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Fetching impact data...');
      fetchImpactData();
    }
  }, [fetchImpactData, isAuthenticated]);

  useEffect(() => {
    console.log('oneOffContributions updated:', oneOffContributions);
    setLocalContributions(oneOffContributions);
  }, [oneOffContributions]);

  const handleDelete = async (contributionId) => {
    if (window.confirm('Are you sure you want to delete this contribution?')) {
      try {
        console.log('Deleting contribution:', contributionId);
        await onDeleteContribution(contributionId);
        console.log('Contribution deleted successfully');
        setLocalContributions(prevContributions => {
          const newContributions = prevContributions.filter(contribution => contribution._id !== contributionId);
          console.log('Updated localContributions after deletion:', newContributions);
          return newContributions;
        });
        if (isAuthenticated) {
          fetchImpactData();
        }
      } catch (error) {
        console.error('Error deleting contribution:', error);
        alert(`Failed to delete contribution: ${error.message}`);
      }
    }
  };

  const handleEdit = (contribution) => {
    console.log('Edit button clicked for contribution:', contribution);
    setEditingContribution(contribution);
    setShowModal(true);
  };

  const handleSave = async (editedContribution) => {
    console.log('Saving contribution:', editedContribution);
    try {
      let url = 'http://localhost:3002/api/contributions/one-off';
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

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const updatedContribution = await response.json();
        console.log('Server response:', updatedContribution);
        if (editingContribution && editingContribution._id) {
          setLocalContributions(prevContributions => {
            const newContributions = prevContributions.map(contribution =>
              contribution._id === updatedContribution._id ? updatedContribution : contribution
            );
            console.log('Updated localContributions after edit:', newContributions);
            return newContributions;
          });
        } else {
          setLocalContributions(prevContributions => [...prevContributions, updatedContribution]);
        }
        setShowModal(false);
        setEditingContribution(null);
        if (isAuthenticated) {
          fetchImpactData();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update contribution');
      }
    } catch (error) {
      console.error('Error updating contribution:', error);
      alert(`Failed to update contribution: ${error.message}`);
    }
  };

  const handleValidate = (contribution) => {
    console.log('Validate button clicked for contribution:', contribution);
    setEditingContribution({...contribution, type: 'contribution'});
    setShowValidationModal(true);
  };

  const handleValidationComplete = async (validatedContribution) => {
    console.log('Validation complete for contribution:', validatedContribution);
    try {
      setLocalContributions(prevContributions =>
        prevContributions.map(contribution =>
          contribution._id === validatedContribution._id ? validatedContribution : contribution
        )
      );
      setShowValidationModal(false);
      setEditingContribution(null);
      if (isAuthenticated) {
        fetchImpactData();
      }
    } catch (error) {
      console.error('Error handling validation completion:', error);
      alert(`Failed to handle validation completion: ${error.message}`);
    }
  };

  const handleAddNew = () => {
    setEditingContribution(null);
    setShowModal(true);
  };

  console.log('Rendering component. Current state:', {
    showModal,
    editingContribution,
    localContributionsCount: localContributions.length,
    displayAll
  });

  const displayedContributions = displayAll ? localContributions : localContributions.slice(0, 5);

  if (!isAuthenticated) {
    return <div className={cleanStyles.card}>Please log in to view your one-off contributions.</div>;
  }

  return (
    <div className={cleanStyles.grid}>
      <div className={cleanStyles.card}>
        <button onClick={handleAddNew} className={`${cleanStyles.button} ${cleanStyles.primary}`}>
          <FaPlus /> Add New One-Off Contribution
        </button>
      </div>
      {displayedContributions && displayedContributions.length > 0 ? (
        <>
          {displayedContributions.map((contribution) => (
            <div key={contribution._id} className={cleanStyles.card}>
              <div className={cleanStyles.cardHeader}>
                <h3 className={cleanStyles.cardTitle}>{contribution.charity}</h3>
                <div className={cleanStyles.validationButton}>
                  {contribution.needsValidation && (
                    <InstantTooltip text={contribution.isValidated ? "Contribution validated" : "Upload receipt for validation"}>
                      <button 
                        onClick={() => handleValidate(contribution)} 
                        className={`${cleanStyles.iconButton} ${cleanStyles.highlight}`}
                        aria-label="Validate Contribution"
                      >
                        <FaCheckCircle style={{ color: contribution.isValidated ? 'green' : 'gray' }} />
                      </button>
                    </InstantTooltip>
                  )}
                </div>
              </div>
              <div className={cleanStyles.cardContent}>
                <p><strong>Date:</strong> {formatDate(contribution.date)}</p>
                <p><strong>Amount:</strong> ${contribution.amount}</p>
                {contribution.charityType && (
                  <p><strong>Charity Type:</strong> {contribution.charityType}</p>
                )}
                {contribution.receiptUrl && (
                  <p>
                    <strong>Receipt:</strong> 
                    <a 
                      href={`http://localhost:3002${contribution.receiptUrl}`} 
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
                <InstantTooltip text="Edit contribution">
                  <button onClick={() => handleEdit(contribution)} className={cleanStyles.iconButton} aria-label="Edit Contribution">
                    <FaEdit />
                  </button>
                </InstantTooltip>
                <InstantTooltip text="Delete contribution">
                  <button
                    onClick={() => handleDelete(contribution._id)}
                    className={cleanStyles.iconButton}
                    aria-label="Delete Contribution"
                  >
                    <FaTrash />
                  </button>
                </InstantTooltip>
              </div>
            </div>
          ))}
        </>
      ) : (
        <p className={cleanStyles.textCenter}>No one-off contributions found.</p>
      )}
      {showModal && (
        <OneOffContributionModal
          contribution={editingContribution}
          onConfirm={handleSave}
          onCancel={() => {
            console.log('Modal closed');
            setShowModal(false);
            setEditingContribution(null);
          }}
        />
      )}
      {showValidationModal && editingContribution && (
        <ValidationModal
          item={editingContribution}
          onValidate={handleValidationComplete}
          onCancel={() => {
            console.log('Validation modal closed');
            setShowValidationModal(false);
            setEditingContribution(null);
          }}
        />
      )}
    </div>
  );
}

export default OneOffContributionsComponent;