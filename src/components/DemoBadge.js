import React from 'react';
import { useDemoMode } from '../hooks/useDemoMode';
import styles from './DemoBadge.module.css';

const DemoBadge = () => {
  const { demoMode } = useDemoMode();

  if (!demoMode?.badge?.show) return null;

  return (
    <div 
      className={styles.demoBadge}
      style={{ 
        backgroundColor: demoMode.badge.color || '#ef4444',
        color: demoMode.badge.textColor || 'white'
      }}
    >
      {demoMode.badge.text || 'DEMO MODE'}
    </div>
  );
};

export default DemoBadge;