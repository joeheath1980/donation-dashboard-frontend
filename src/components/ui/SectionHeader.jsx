import React from 'react';
import styles from './SectionHeader.module.css';

const SectionHeader = ({ kicker, title, subtitle, align = 'left', action }) => (
  <div className={`${styles.section} ${styles[align] || ''}`}>
    {kicker && (
      <div className={styles.kickerRow}>
        <span className={styles.kicker}>{kicker}</span>
      </div>
    )}
    {title && <h2 className={styles.title}>{title}</h2>}
    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    {action && <div className={styles.action}>{action}</div>}
  </div>
);

export default SectionHeader;
