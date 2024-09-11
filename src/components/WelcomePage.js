import React from 'react';
import { Link } from 'react-router-dom';
import styles from './WelcomePage.module.css';
import logoSvg from '../assets/download.svg';
import heroImage from '../assets/joe1980_light_trails_tracing_the_activity_of_two_young_people_b68a16e7-3e53-4c8b-b824-9edc7aa00c80_0.png';

const WelcomePage = () => {
  return (
    <div className={styles.welcomePage}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <img src={logoSvg} alt="Do-Nation Logo" className={styles.logo} />
          <h1 className={styles.logoText}>Do-Nation</h1>
        </div>
        <Link to="/login" className={styles.headerCta}>Sign In</Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroImageContainer}>
          <img src={heroImage} alt="Young people activity" className={styles.heroImage} />
        </div>
        <div className={styles.heroContent}>
          <h2 className={styles.heroTitle}>Welcome to Do-Nation</h2>
          <p className={styles.heroSubtitle}>Empower your giving journey with our intelligent donation tracking platform</p>
          <Link to="/signup" className={styles.ctaButton}>Get Started</Link>
        </div>
      </section>

      <div className={styles.featuresContainer}>
        <section className={styles.feature}>
          <div className={styles.featureIcon}>&#128200;</div>
          <h3>Track Your Impact</h3>
          <p>Effortlessly visualize your charitable contributions and see the difference you're making in the world.</p>
          <Link to="/learn-more" className={styles.learnMoreButton}>Learn More</Link>
        </section>

        <section className={styles.feature}>
          <div className={styles.featureIcon}>&#129504;</div>
          <h3>Smart Donation Insights</h3>
          <p>Our AI-powered system categorizes your donations and provides valuable insights into your giving patterns.</p>
          <Link to="/learn-more" className={styles.learnMoreButton}>Learn More</Link>
        </section>

        <section className={styles.feature}>
          <div className={styles.featureIcon}>&#128279;</div>
          <h3>Seamless Integration</h3>
          <p>Connect your email and easily import donation receipts. We'll keep your giving history up-to-date automatically.</p>
          <Link to="/learn-more" className={styles.learnMoreButton}>Learn More</Link>
        </section>

        <section className={styles.feature}>
          <div className={styles.featureIcon}>&#127919;</div>
          <h3>Set and Achieve Giving Goals</h3>
          <p>Define your charitable objectives and let us help you stay on track. Celebrate your milestones along the way.</p>
          <Link to="/learn-more" className={styles.learnMoreButton}>Learn More</Link>
        </section>
      </div>

      <footer className={styles.footer}>
        <p>&copy; 2023 Do-Nation. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WelcomePage;