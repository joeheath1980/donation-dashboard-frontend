import React, { useState, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { CHARITY_CATEGORIES, formatABN, validateABN, ABN_HELPER_TEXT } from '../constants/charityCategories';
import styles from './DonationModal.module.css';
import './SharedStyles.css';

const CharitySearch = lazy(() => import('./CharitySearch/CharitySearch'));

const DonationModal = ({ donation, onConfirm, onCancel, type = 'regular' }) => {
  const [editedDonation, setEditedDonation] = useState(donation || {
    charity: '',
    charityABN: '',
    charityId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    charityType: '',
    isMonthly: false,
    receipt: null
  });
  const [abnStatus, setAbnStatus] = useState('');
  const [selectedCharity, setSelectedCharity] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    // Handle ABN formatting
    if (name === 'charityABN') {
      const formattedABN = formatABN(value);
      setEditedDonation(prev => ({
        ...prev,
        charityABN: formattedABN
      }));
      
      // Validate ABN
      if (value.length > 0) {
        if (validateABN(value)) {
          setAbnStatus('✓ Valid ABN format');
        } else {
          setAbnStatus('ABN should be 11 digits');
        }
      } else {
        setAbnStatus('');
      }
    } else {
      setEditedDonation(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : 
                 type === 'file' ? files[0] :
                 value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {
      ...editedDonation,
      charityId: selectedCharity?._id || editedDonation.charityId
    };
    onConfirm(submissionData);
  };

  const handleCharitySelect = (charity) => {
    setSelectedCharity(charity);
    setEditedDonation(prev => ({
      ...prev,
      charity: charity.name,
      charityABN: formatABN(charity.abn || charity.ABN || ''),
      charityId: charity._id,
      charityType: charity.category || ''
    }));
    // Update ABN status if ABN exists
    if (charity.abn) {
      setAbnStatus('✓ Valid ABN format');
    }
  };


  const modalContent = (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>
          {donation ? `Edit ${type === 'regular' ? 'Donation' : 'One-Off Contribution'}` : 
                     `Add New ${type === 'regular' ? 'Donation' : 'One-Off Contribution'}`}
        </h2>
        <button className={styles.closeButton} onClick={onCancel}>&times;</button>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="charity" className={styles.label}>Charity:</label>
            <Suspense fallback={<div>Loading search...</div>}>
              <CharitySearch
                onCharitySelect={handleCharitySelect}
                initialValue={editedDonation.charity}
                placeholder="Search for a charity..."
                required
              />
            </Suspense>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="charityABN" className={styles.label}>Charity ABN:</label>
            <input
              type="text"
              id="charityABN"
              name="charityABN"
              placeholder="XX XXX XXX XXX"
              value={editedDonation.charityABN}
              onChange={handleChange}
              className={styles.input}
              maxLength="14" // 11 digits + 3 spaces
              readOnly={!!selectedCharity?.abn}
            />
            <small className={styles.helperText}>
              {abnStatus || ABN_HELPER_TEXT}
            </small>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="amount" className={styles.label}>Amount:</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={editedDonation.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="date" className={styles.label}>Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={editedDonation.date.split('T')[0]}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="charityType" className={styles.label}>Charity Type:</label>
            <select
              id="charityType"
              name="charityType"
              value={editedDonation.charityType}
              onChange={handleChange}
              required
              className={styles.select}
              disabled={!!selectedCharity?.category}
            >
              <option value="">Select a charity type</option>
              {CHARITY_CATEGORIES.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          {type === 'regular' && (
            <div className={styles.formGroup}>
              <label htmlFor="isMonthly" className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  id="isMonthly"
                  name="isMonthly"
                  checked={editedDonation.isMonthly}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
                Monthly Donation
              </label>
            </div>
          )}
          <div className={styles.formGroup}>
            <label htmlFor="receipt" className={styles.label}>Upload Receipt (optional):</label>
            <input
              type="file"
              id="receipt"
              name="receipt"
              onChange={handleChange}
              accept="image/*,.pdf"
              className={styles.fileInput}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button type="submit" className={`${styles.button} ${styles.primaryButton}`}>Confirm</button>
            <button type="button" onClick={onCancel} className={`${styles.button} ${styles.secondaryButton}`}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DonationModal;