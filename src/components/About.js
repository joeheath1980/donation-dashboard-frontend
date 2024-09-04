import React from 'react';
import styles from '../About.module.css';

function About() {
  return (
    <div className={styles.aboutContainer}>
      <h1 className={styles.header}>About Do-Nation</h1>
      <p className={styles.content}>
        At Do-Nation, we're amplifying the generous spirit of Australians to create a ripple effect of positive change across our communities and beyond.
      </p>
      <p className={styles.content}>
        We've built a vibrant digital platform where compassion meets technology, enabling Australians to embrace their generous side and make a lasting impact. Here, you can track your charitable journey, connect with causes you care about, and see the real-world impact of your contributions.
      </p>
      <p className={styles.content}>
        Our innovative matching system brings together passionate individuals with forward-thinking brands, amplifying the power of giving. Whether you're donating funds, volunteering time, or spreading awareness, every action counts and is celebrated.
      </p>
      <p className={styles.content}>
        Do-Nation turns giving into an exciting journey of personal growth and community building. Set your impact goals, choose your causes, and watch as your generosity creates waves of positive change.
      </p>
      <p className={styles.content}>
        Join us in fostering a culture where giving more, doing more, and helping more becomes second nature. Together, let's unleash the power of collective generosity and shape a brighter, more connected Australia.
      </p>
      <p className={styles.content}>
        Welcome to Do-Nation – where your generosity finds its home, and your impact knows no bounds.
      </p>
    </div>
  );
}

export default About;