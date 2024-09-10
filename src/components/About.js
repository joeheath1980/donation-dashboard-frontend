import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../About.module.css';
import logo from '../assets/download.svg';

const About = () => {
  return (
    <div className={styles.aboutContainer}>
      <img src={logo} alt="Do-Nation Logo" className={styles.logo} />
      <h1 className={styles.heading}>About Do-Nation</h1>
      <div className={styles.separator}></div>
      
      <div className={styles.contentColumns}>
        <div className={styles.mainContent}>
          <p>
            At Do-Nation, we believe in the power of <strong>generosity</strong> to transform lives and communities. Our platform is designed to nurture the <em>generous spirit</em> within each of us, making it easier than ever to contribute to causes that matter.
          </p>
          
          <p>
            We understand that giving is not just about financial contributions—it's about creating a <strong>lasting impact</strong> and fostering a sense of connection with the world around us. That's why we've created a space where individuals can explore, engage, and contribute in ways that resonate with their personal values and goals.
          </p>
          
          <p>
            Do-Nation is more than just a donation platform; it's a community of like-minded individuals committed to making a difference. We provide tools and insights that help you track your giving journey, understand your impact, and discover new opportunities to help.
          </p>
          
          <p>
            Our mission is to empower you to give thoughtfully and effectively, whether it's through regular donations, one-time contributions, or volunteering your time and skills. We believe that every act of kindness, no matter how small, has the potential to create ripples of positive change.
          </p>
        </div>
        
        <div className={styles.sidebar}>
          <div className={styles.quoteBox}>
            <blockquote>"Life's most persistent and urgent question is, 'What are you doing for others?'"</blockquote>
            <cite>- Martin Luther King Jr.</cite>
          </div>
          
          <div className={styles.impactStats}>
            <h3>Our Impact</h3>
            <ul>
              <li>10,000+ Donors</li>
              <li>$1M+ Raised</li>
              <li>500+ Charities Supported</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className={styles.highlightBox}>
        <p>
          <strong>Welcome to Do-Nation</strong> — where your generosity meets opportunity, and together, we create a world of positive change.
        </p>
      </div>
      
      <Link to="/signup" className={styles.ctaButton}>Join Us Today</Link>
    </div>
  );
};

export default About;