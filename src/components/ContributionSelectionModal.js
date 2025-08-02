import React from 'react';
import { FaDonate, FaHandsHelping, FaBullhorn, FaTimes } from 'react-icons/fa';
import modalStyles from './ModalStyles.module.css';
import styles from './ContributionSelectionModal.module.css';

const ContributionSelectionModal = ({ isOpen, onClose, onSelectType }) => {
  if (!isOpen) return null;

  const contributionTypes = [
    {
      id: 'oneoff',
      title: 'Add One-off Donation',
      icon: FaDonate,
      description: 'Record a one-time donation to a charity',
      color: '#4CAF50'
    },
    {
      id: 'regular',
      title: 'Add Regular Donation',
      icon: FaDonate,
      description: 'Set up a recurring donation',
      color: '#2E7D32'
    },
    {
      id: 'volunteer',
      title: 'Add Volunteer Hours',
      icon: FaHandsHelping,
      description: 'Log your volunteer activities and hours',
      color: '#2196F3'
    },
    {
      id: 'fundraising',
      title: 'Add Fundraising Campaign',
      icon: FaBullhorn,
      description: 'Create a new fundraising campaign',
      color: '#FF9800'
    }
  ];

  const handleSelect = (typeId) => {
    onSelectType(typeId);
    onClose();
  };

  return (
    <div className={modalStyles.modalOverlay} onClick={onClose}>
      <div className={`${modalStyles.modalContent} ${styles.selectionModal}`} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className={modalStyles.closeButton}
          aria-label="Close modal"
        >
          <FaTimes />
        </button>
        
        <h2 className={styles.modalTitle}>Add Your Contributions</h2>
        <p className={styles.modalSubtitle}>Select the type of contribution you'd like to add</p>
        
        <div className={styles.optionsGrid}>
          {contributionTypes.map((type) => (
            <button
              key={type.id}
              className={styles.optionCard}
              onClick={() => handleSelect(type.id)}
              style={{ '--hover-color': type.color }}
            >
              <type.icon className={styles.optionIcon} style={{ color: type.color }} />
              <h3 className={styles.optionTitle}>{type.title}</h3>
              <p className={styles.optionDescription}>{type.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContributionSelectionModal;