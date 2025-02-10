import React from 'react';
import { Link } from 'react-router-dom';
import styles from './WelcomePage.module.css';
import sharedStyles from './SharedStyles.css';
import logoSvg from '../assets/logo.png';
import heroImage from '../assets/joe1980_light_trails_tracing_the_activity_of_two_young_people_b68a16e7-3e53-4c8b-b824-9edc7aa00c80_0.png';
import { 
  RiBarChartLine, 
  RiLightbulbLine, 
  RiRefreshLine, 
  RiPieChartLine,
  RiFacebookFill,
  RiTwitterFill,
  RiInstagramFill
} from 'react-icons/ri';

const WelcomePage = () => {
  return (
    <div className={styles.welcomePage}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <img src={logoSvg} alt="Do-Nation Logo" className={styles.logo} />
        </div>
        <Link to="/login" className={`${styles.headerCta} ${sharedStyles.button}`}>Sign In</Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroImageContainer}>
          <img src={heroImage} alt="Young people activity" className={styles.heroImage} />
          <div className={styles.heroOverlay}></div>
        </div>
        <div className={`${styles.heroContent} ${sharedStyles.container}`}>
          <h2 className={`${styles.heroTitle} ${sharedStyles.gradientTitle}`}>
            Welcome to <span className={styles.highlight}>Do-Nation</span>
          </h2>
          <p className={`${styles.heroSubtitle} ${sharedStyles.text}`}>
            Empower your giving journey with our intelligent donation tracking platform
          </p>
          <Link to="/signup" className={`${styles.ctaButton} ${sharedStyles.button}`}>Get Started</Link>
        </div>
      </section>

      <div className={styles.featuresContainer}>
        <section className={`${styles.feature} ${sharedStyles.card}`}>
          <div className={styles.featureIcon}>
            <RiBarChartLine className={styles.heroicon} />
          </div>
          <h3 className={`${styles.featureTitle} ${sharedStyles.subHeader}`}>Track Your Impact</h3>
          <p>Effortlessly visualize your charitable contributions and see the difference you're making in the world.</p>
          <Link to="/learn-more" className={`${styles.learnMoreButton} ${sharedStyles.button}`}>Learn More</Link>
        </section>

        <section className={`${styles.feature} ${sharedStyles.card}`}>
          <div className={styles.featureIcon}>
            <RiLightbulbLine className={styles.heroicon} />
          </div>
          <h3 className={`${styles.featureTitle} ${sharedStyles.subHeader}`}>Smart Donation Insights</h3>
          <p>Our AI-powered system categorizes your donations and provides valuable insights into your giving patterns.</p>
          <Link to="/learn-more" className={`${styles.learnMoreButton} ${sharedStyles.button}`}>Learn More</Link>
        </section>

        <section className={`${styles.feature} ${sharedStyles.card}`}>
          <div className={styles.featureIcon}>
            <RiRefreshLine className={styles.heroicon} />
          </div>
          <h3 className={`${styles.featureTitle} ${sharedStyles.subHeader}`}>Seamless Integration</h3>
          <p>Connect your email and easily import donation receipts. We'll keep your giving history up-to-date automatically.</p>
          <Link to="/learn-more" className={`${styles.learnMoreButton} ${sharedStyles.button}`}>Learn More</Link>
        </section>

        <section className={`${styles.feature} ${sharedStyles.card}`}>
          <div className={styles.featureIcon}>
            <RiPieChartLine className={styles.heroicon} />
          </div>
          <h3 className={`${styles.featureTitle} ${sharedStyles.subHeader}`}>Set and Achieve Giving Goals</h3>
          <p>Define your charitable objectives and let us help you stay on track. Celebrate your milestones along the way.</p>
          <Link to="/learn-more" className={`${styles.learnMoreButton} ${sharedStyles.button}`}>Learn More</Link>
        </section>
      </div>

      <footer className={styles.footer}>
        <p>&copy; 2024 Do-Nation. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <a href="/privacy" className={sharedStyles.link}>Privacy Policy</a>
          <a href="/terms" className={sharedStyles.link}>Terms of Service</a>
        </div>
        <div className={styles.socialIcons}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={`${styles.socialIcon} ${sharedStyles.link}`}>
            <RiFacebookFill />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={`${styles.socialIcon} ${sharedStyles.link}`}>
            <RiTwitterFill />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={`${styles.socialIcon} ${sharedStyles.link}`}>
            <RiInstagramFill />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default WelcomePage;