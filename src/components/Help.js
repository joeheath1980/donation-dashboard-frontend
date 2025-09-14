import React from 'react';
import Layout from './Layout';
import styles from './SharedStyles.css';
import { APP_LINKS } from '../config/api.config';

const Help = () => {
  const supportEmail = 'joeheath@do-nation.space';
  const mailto = `mailto:${supportEmail}?subject=Support%20Request`;

  const openBugForm = () => {
    window.open(APP_LINKS.BUG_REPORT_FORM_URL, '_blank', 'noopener');
  };

  return (
    <Layout>
      <div className="container">
        <h1 className="heading">Help & Support</h1>
        <p className="text">Find quick links for reporting issues, reading policies, and getting started as a beta tester.</p>

        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="cardTitle">Report a Bug</h2>
          <p className="description">Use our form to submit issues or suggestions with steps to reproduce.</p>
          <button className="button" onClick={openBugForm}>Open Bug Report Form</button>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="cardTitle">Contact Support</h2>
          <p className="description">Email us for help with account access, questions, or urgent issues.</p>
          <a className="button secondary" href={mailto}>Contact Support</a>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="cardTitle">Policies</h2>
          <ul className="list">
            <li><a href="/terms_of_service.html" target="_blank" rel="noopener noreferrer">Terms of Service</a></li>
            <li><a href="/privacy_policy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a></li>
            <li><a href="/beta_testing_agreement.html" target="_blank" rel="noopener noreferrer">Beta Testing Agreement</a></li>
          </ul>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h2 className="cardTitle">Beta Tester Guide</h2>
          <p className="description">A short guide covering setup, features to test, and how to share feedback.</p>
          <a className="button" href="/beta_tester_guide.html" target="_blank" rel="noopener noreferrer">Open Guide</a>
        </div>
      </div>
    </Layout>
  );
};

export default Help;
