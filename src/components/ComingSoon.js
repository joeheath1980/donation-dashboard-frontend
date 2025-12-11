import React from 'react';
import { FaRocket } from 'react-icons/fa';
import styles from './ComingSoon.module.css';

const ComingSoon = ({
  title,
  description,
  icon: Icon = FaRocket
}) => (
  <div className={styles.container}>
    <div className={styles.iconWrapper}>
      <Icon className={styles.icon} />
    </div>
    <h3 className={styles.title}>{title}</h3>
    <span className={styles.badge}>Coming Soon</span>
    <p className={styles.description}>{description}</p>
  </div>
);

export default ComingSoon;
