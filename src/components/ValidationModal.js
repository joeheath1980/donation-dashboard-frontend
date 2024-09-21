// src/components/ValidationModal.js

import React, { useState } from 'react';
import styles from './ValidationModal.module.css';

/**
 * ValidationModal Component
 * 
 * This modal allows users to upload a receipt for their donation or contribution.
 * It handles file selection, form submission, and communicates with the server to validate the donation/contribution.
 * 
 * Props:
 * - item: The donation or contribution object to be validated.
 * - onCancel: Function to call when the user cancels the validation.
 * - onValidate: Function to call when the validation is successful.
 */
const ValidationModal = ({ item, onCancel, onValidate }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the file input change event.
   * @param {Event} e - The change event.
   */
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  /**
   * Handles the form submission for uploading the receipt.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('receipt', file);

    console.log('Submitting form with data:', {
      itemId: item._id,
      itemType: item.type,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

    try {
      const endpoint = item.type === 'donation' 
        ? `http://localhost:3002/api/donations/${item._id}/validate`
        : `http://localhost:3002/api/contributions/one-off/${item._id}/validate`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Note: When using FormData, you should NOT set the 'Content-Type' header manually.
          // The browser will set it including the correct boundary.
        },
        body: formData
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json(); // Directly parse JSON
        console.log('Upload result:', result);
        const updatedItem = { ...result, type: item.type };
        onValidate(updatedItem);
      } else {
        // Attempt to parse error message from JSON
        let errorMessage = 'Failed to upload receipt';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.error('Error parsing error response:', jsonError);
          // Fallback to status text if JSON parsing fails
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error uploading receipt:', error);
      alert(`Failed to upload receipt: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!item) {
    return null;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Upload Receipt</h2>
        <p>Please upload a receipt for your {item.type === 'donation' ? 'donation' : 'contribution'} to {item.charity}.</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="receipt">Receipt (PDF or Image):</label>
            <input 
              type="file" 
              id="receipt" 
              name="receipt" 
              accept="image/*,application/pdf" 
              onChange={handleFileChange} 
              required 
            />
          </div>
          <div className={styles.buttonGroup}>
            <button type="submit" disabled={isLoading} className={styles.uploadButton}>
              {isLoading ? 'Uploading...' : 'Upload'}
            </button>
            <button type="button" onClick={onCancel} disabled={isLoading} className={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ValidationModal;
