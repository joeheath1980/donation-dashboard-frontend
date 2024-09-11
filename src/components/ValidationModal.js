import React, { useState } from 'react';
import styles from './ValidationModal.module.css';

const ValidationModal = ({ donation, onClose, onUpload }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const response = await fetch(`http://localhost:3002/api/donations/${donation._id}/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const updatedDonation = await response.json();
        onUpload(updatedDonation);
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload receipt');
      }
    } catch (error) {
      console.error('Error uploading receipt:', error);
      alert(`Failed to upload receipt: ${error.message}`);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Upload Receipt</h2>
        <p>Please upload a receipt for your donation to {donation.charity}.</p>
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleFileChange} accept="image/*,application/pdf" />
          <div className={styles.buttonGroup}>
            <button type="submit">Upload</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ValidationModal;