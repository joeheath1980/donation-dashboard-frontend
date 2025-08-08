import React, { useContext } from 'react';
import PersonalImpactScore from './PersonalImpactScore';
import styles from './YourImpact.module.css';
import { ImpactContext } from '../contexts/ImpactContext';

const YourImpact = () => {
  const { impactScore, scoreChange, tier, pointsToNextTier } = useContext(ImpactContext);

  return (
    <div className={styles.yourImpactContainer}>
      <PersonalImpactScore
        impactScore={impactScore}
        scoreChange={scoreChange}
        tier={tier}
        pointsToNextTier={pointsToNextTier}
      />
      <div className={styles.scoreCalculationInfo}>
        <h2>How Your Score is Calculated</h2>
        <p className={styles.intro}>
          Your Personal Impact Score recognizes all forms of giving - whether through micro-donations, 
          traditional giving, volunteering, fundraising, or consistent engagement. The score uses a 
          weighted system across five categories:
        </p>
        
        <div className={styles.categoryInfo}>
          <h3>🎁 Donations (30% weight)</h3>
          <div className={styles.subcategory}>
            <h4>Micro Donations (under $15)</h4>
            <ul>
              <li>Base: 8 points per donation</li>
              <li>Frequency bonus: +5 points for each additional micro donation in a day (max 4/day)</li>
              <li>Perfect for daily coffee-sized giving habits</li>
            </ul>
          </div>
          <div className={styles.subcategory}>
            <h4>Traditional Donations ($15+)</h4>
            <ul>
              <li>$1 - $25: 1 point per dollar</li>
              <li>$25 - $50: 0.8 points per dollar</li>
              <li>$50 - $100: 0.6 points per dollar</li>
              <li>$100 - $250: 0.4 points per dollar</li>
              <li>$250 - $500: 0.2 points per dollar</li>
              <li>$500+: 0.1 points per dollar</li>
            </ul>
          </div>
          <p className={styles.note}>Monthly recurring donations receive a 20-point bonus!</p>
        </div>

        <div className={styles.categoryInfo}>
          <h3>🤝 Volunteering (25% weight)</h3>
          <ul>
            <li>Base rate: 2 points per hour</li>
            <li>Session bonuses:
              <ul>
                <li>2+ hours: +2 points</li>
                <li>4+ hours (half day): +4 points</li>
                <li>8+ hours (full day): +8 points</li>
              </ul>
            </li>
            <li>Skill multipliers:
              <ul>
                <li>Professional skills: 1.3x</li>
                <li>Leadership roles: 1.5x</li>
                <li>Emergency response: 2x</li>
              </ul>
            </li>
          </ul>
        </div>

        <div className={styles.categoryInfo}>
          <h3>📢 Fundraising (20% weight)</h3>
          <ul>
            <li>First $100 raised: 0.5 points per dollar</li>
            <li>$100 - $500: 0.3 points per dollar</li>
            <li>$500 - $2,000: 0.2 points per dollar</li>
            <li>$2,000 - $5,000: 0.1 points per dollar</li>
            <li>Above $5,000: 0.05 points per dollar</li>
            <li>Event organising bonus: +20 points per event</li>
            <li>Online campaign bonus: +15 points per campaign</li>
          </ul>
        </div>

        <div className={styles.categoryInfo}>
          <h3>🔥 Consistency (15% weight)</h3>
          <ul>
            <li>Daily streak bonuses:
              <ul>
                <li>7-day streak: +10 points</li>
                <li>30-day streak: +25 points</li>
                <li>90-day streak: +50 points</li>
                <li>180-day streak: +100 points</li>
                <li>365-day streak: +200 points</li>
              </ul>
            </li>
            <li>Monthly consistency: +25 to +100 points based on months active</li>
            <li>Skip protection: 1 skip day allowed per 7 days of activity</li>
          </ul>
        </div>

        <div className={styles.categoryInfo}>
          <h3>💫 Engagement (10% weight)</h3>
          <ul>
            <li>Profile completeness: up to 50 points</li>
            <li>Following charities: 5 points per charity (max 30 points)</li>
            <li>Daily actions: Morning check-ins, voting, sharing progress</li>
            <li>Community participation and impact story engagement</li>
          </ul>
        </div>

        <div className={styles.tierInfo}>
          <h3>Impact Tiers</h3>
          <div className={styles.tiers}>
            <div className={styles.tier}>
              <strong>Giver</strong> (0-299 points): Every journey begins with a single act of kindness
            </div>
            <div className={styles.tier}>
              <strong>Altruist</strong> (300-999 points): Whether daily drops or monthly waves, your kindness creates ripples
            </div>
            <div className={styles.tier}>
              <strong>Philanthropist</strong> (1,000-2,499 points): Strategic giving multiplies impact across communities
            </div>
            <div className={styles.tier}>
              <strong>Champion</strong> (2,500-4,999 points): Champions inspire others through their dedication
            </div>
            <div className={styles.tier}>
              <strong>Visionary</strong> (5,000+ points): Visionaries shape the future of giving
            </div>
          </div>
        </div>

        <p className={styles.totalScoreInfo}>
          <strong>Recent Activity Matters More:</strong> All activities gradually lose value over time 
          to encourage ongoing engagement. Fresh activities (last 30 days) count at 100% value, while 
          activities older than 2 years count at just 10%.
        </p>
      </div>
    </div>
  );
};

export default YourImpact;