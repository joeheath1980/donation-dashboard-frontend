import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './WelcomePage.module.css';
import logoSvg from '../assets/download.svg';

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
        <Link to="/login" className={styles.ctaButton}>Get Started</Link>
      </header>

      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.welcomeText}>Welcome to</h1>
          <div className={styles.logoContainer} onClick={handleLogoClick}>
            <img src={logoSvg} alt="Do-Nation Logo" className={styles.logo} />
          </div>
        </div>
      </div>

      <div className={styles.featuresContainer}>
        <section className={styles.feature}>
          <div className={styles.featureIcon}>📊</div>
          <h2>Track Your Impact</h2>
          <p>Effortlessly visualize your charitable contributions and see the difference you're making in the world.</p>
        </section>

        <section className={styles.feature}>
          <div className={styles.featureIcon}>🧠</div>
          <h2>Smart Donation Insights</h2>
          <p>Our AI-powered system categorizes your donations and provides valuable insights into your giving patterns.</p>
        </section>

        <section className={styles.feature}>
          <div className={styles.featureIcon}>🔗</div>
          <h2>Seamless Integration</h2>
          <p>Connect your email and easily import donation receipts. We'll keep your giving history up-to-date automatically.</p>
        </section>

        <section className={styles.feature}>
          <div className={styles.featureIcon}>🎯</div>
          <h2>Set and Achieve Giving Goals</h2>
          <p>Define your charitable objectives and let us help you stay on track. Celebrate your milestones along the way.</p>
        </section>
      </div>

      <footer className={styles.footer}>
        <p>&copy; 2023 Do-Nation. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WelcomePage;