import React from 'react';
import styles from './PasswordStrengthIndicator.module.css';

const PasswordStrengthIndicator = ({ password, requirements, strength }) => {
  const getStrengthText = () => {
    switch (strength) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Medium';
      case 3:
        return 'Strong';
      case 4:
        return 'Very Strong';
      default:
        return '';
    }
  };

  const getStrengthClass = () => {
    switch (strength) {
      case 0:
      case 1:
        return styles.weak;
      case 2:
        return styles.medium;
      case 3:
        return styles.strong;
      case 4:
        return styles.veryStrong;
      default:
        return '';
    }
  };

  if (!password) return null;

  // Use data attribute for dynamic width instead of inline style
  const strengthPercentage = Math.round((strength / 4) * 100);
  
  return (
    <div className={styles.passwordStrengthContainer}>
      <div className={styles.strengthBar}>
        <div 
          className={`${styles.strengthFill} ${getStrengthClass()}`}
          data-width={strengthPercentage}
        />
      </div>
      <div className={styles.strengthText}>
        Password Strength: <span className={getStrengthClass()}>{getStrengthText()}</span>
      </div>
      <div className={styles.requirements}>
        <div className={`${styles.requirement} ${requirements.length ? styles.met : ''}`}>
          <span className={styles.icon}>{requirements.length ? '✓' : '×'}</span>
          At least 8 characters
        </div>
        <div className={`${styles.requirement} ${requirements.uppercase ? styles.met : ''}`}>
          <span className={styles.icon}>{requirements.uppercase ? '✓' : '×'}</span>
          One uppercase letter
        </div>
        <div className={`${styles.requirement} ${requirements.lowercase ? styles.met : ''}`}>
          <span className={styles.icon}>{requirements.lowercase ? '✓' : '×'}</span>
          One lowercase letter
        </div>
        <div className={`${styles.requirement} ${requirements.number ? styles.met : ''}`}>
          <span className={styles.icon}>{requirements.number ? '✓' : '×'}</span>
          One number
        </div>
        <div className={`${styles.requirement} ${requirements.special ? styles.met : ''}`}>
          <span className={styles.icon}>{requirements.special ? '✓' : '×'}</span>
          One special character
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;