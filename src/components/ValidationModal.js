import React, { useState } from 'react';
import styles from './ValidationModal.module.css';

const ValidationModal = ({ item, onCancel, onValidate }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload');
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
        },
        body: formData
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (response.ok) {
        const result = JSON.parse(responseText);
        console.log('Upload result:', result);
        const updatedItem = { ...result, type: item.type };
        onValidate(updatedItem);
      } else {
        throw new Error(responseText || 'Failed to upload receipt');
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
          <input type="file" onChange={handleFileChange} accept="image/*,application/pdf" />
          <div className={styles.buttonGroup}>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Uploading...' : 'Upload'}
            </button>
            <button type="button" onClick={onCancel} disabled={isLoading}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ValidationModal;