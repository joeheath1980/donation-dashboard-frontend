import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../About.module.css';
import cleanStyles from './CleanDesign.module.css';
import { AboutIcons } from './AboutIcons';

const About = () => {
  return (
    <div className={`${styles.aboutContainer} ${cleanStyles.container}`}>
      <h1 className={`${styles.heading} ${cleanStyles.heading}`}>About</h1>
      <div className={styles.separator}></div>
      
      <div className={styles.contentColumns}>
        <div className={`${styles.mainContent} ${cleanStyles.card}`}>
          <p>
            At Do-Nation, we're redefining giving. Generosity isn't just an act; it's a joy-filled journey that fuels personal growth and inspires a better world.
          </p>
          
          <p>
            Our platform turns philanthropy into a win-win. With AI-powered insights, goal tracking, and gamification elements like badges and impact scores, giving becomes as rewarding for you as it is meaningful for others. Share your achievements, connect with like-minded givers, and spark a movement that transforms generosity into a collective force for good.
          </p>
          
          <p>
            Do-Nation makes giving seamless, personal, and empowering—amplifying the impact on individuals, charities, and communities. With every act of kindness, you're not just donating; you're leading the charge for a more generous nation.
          </p>
        </div>
        
        <div className={styles.sidebar}>
          <div className={`${styles.quoteBox} ${cleanStyles.card}`}>
            <span className={cleanStyles.icon}><AboutIcons.Quote /></span>
            <blockquote>"Life's most persistent and urgent question is, 'What are you doing for others?'"</blockquote>
            <cite>- Martin Luther King Jr.</cite>
          </div>
          
          <div className={`${styles.impactStats} ${cleanStyles.card}`}>
            <div className={cleanStyles.cardHeader}>
              <span className={cleanStyles.icon}><AboutIcons.Impact /></span>
              <h3 className={cleanStyles.cardTitle}>Our Impact</h3>
            </div>
            <ul>
              <li>10,000+ Donors</li>
              <li>$1M+ Raised</li>
              <li>500+ Charities Supported</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className={`${styles.highlightBox} ${cleanStyles.card}`}>
        <span className={cleanStyles.icon}><AboutIcons.Highlight /></span>
        <p>
          <strong>Welcome to Do-Nation</strong> — where your generosity meets opportunity, and together, we create a world of positive change.
        </p>
      </div>
      
      <Link to="/signup" className={`${styles.ctaButton} ${cleanStyles.button}`}>
        <span className={cleanStyles.icon}><AboutIcons.Join /></span>
        Join Us Today
      </Link>
    </div>
  );
};

export default About;