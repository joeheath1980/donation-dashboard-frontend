import React from 'react';
import styles from '../CharityPartner.module.css';

function CharityPartner({ charity }) {
  return (
    <div className={styles.charityContainer}>
      <h1 className={styles.charityName}>{charity.name}</h1>
      <div className={styles.missionStatement}>
        <h2>Mission Statement</h2>
        <p>{charity.missionStatement}</p>
      </div>
      <div className={styles.impactReports}>
        <h2>Impact Reports and Current Projects</h2>
        <ul>
          {charity.projects.map((project, index) => (
            <li key={index}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.actions}>
        <button className={styles.followButton}>Follow</button>
        <button className={styles.matchButton}>Match</button>
        <button className={styles.donateButton}>Donate</button>
      </div>
      <div className={styles.transparencyReports}>
        <h2>Transparency Reports</h2>
        <ul>
          {charity.transparencyReports.map((report, index) => (
            <li key={index}>
              <a href={report.link} target="_blank" rel="noopener noreferrer">{report.title}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CharityPartner;