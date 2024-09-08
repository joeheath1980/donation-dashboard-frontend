import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './WelcomePage.module.css';

const WelcomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (user) {
      navigate('/profile');
    }
  };

  return (
    <div className={styles.welcomePage}>
      <header className={styles.header}>
        <h1 onClick={handleLogoClick} className={styles.logo}>Do-Nation</h1>
      </header>

      <div className={styles.hero}>
        <div>
          <h1>Welcome to Do-Nation</h1>
          <p>Empower your giving journey with our intelligent donation tracking platform</p>
        </div>
      </div>

      <div className={styles.container}>
        <section className={styles.section}>
          <h2>Track Your Impact</h2>
          <p>Do-Nation helps you effortlessly track and visualize your charitable contributions. See the difference you're making in the world with our intuitive dashboard.</p>
        </section>

        <section className={styles.section}>
          <h2>Smart Donation Insights</h2>
          <p>Our AI-powered system automatically categorizes your donations and provides valuable insights into your giving patterns. Make informed decisions about your philanthropy.</p>
        </section>

        <section className={styles.section}>
          <h2>Seamless Integration</h2>
          <p>Connect your email and easily import donation receipts. Do-Nation works behind the scenes to keep your giving history up-to-date without any manual input.</p>
        </section>

        <section className={styles.section}>
          <h2>Set and Achieve Giving Goals</h2>
          <p>Define your charitable objectives and let Do-Nation help you stay on track. Monitor your progress and celebrate your milestones along the way.</p>
        </section>
      </div>

      <Link to="/login" className={styles.ctaButton}>Get Started</Link>
    </div>
  );
};

export default WelcomePage;