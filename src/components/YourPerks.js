import React, { useContext, useState } from 'react';
import styles from '../YourPerks.module.css';
import PersonalImpactScore from './PersonalImpactScore';
import { ImpactContext } from '../contexts/ImpactContext';
import { FaCalendarAlt, FaHandshake, FaGift, FaUserPlus, FaChevronDown, FaChevronUp, FaGlassCheers, FaLaptop, FaUmbrellaBeach } from 'react-icons/fa';

function YourPerks() {
  const { 
    impactScore,
    lastYearImpactScore,
    tier,
    pointsToNextTier,
  } = useContext(ImpactContext);

  const scoreChange = impactScore - lastYearImpactScore;
  const arrow = scoreChange > 0 ? '▲' : scoreChange < 0 ? '▼' : '';

  const [expandedPerk, setExpandedPerk] = useState(null);

  const togglePerk = (perkName) => {
    setExpandedPerk(expandedPerk === perkName ? null : perkName);
  };

  const perks = [
    {
      name: 'Exclusive Events',
      icon: <FaCalendarAlt className={styles.perkIcon} />,
      description: 'Access to invitation-only charity events and galas.',
      details: [
        {
          name: 'Charity Gala',
          date: '15/10/2024',
          location: 'Melbourne',
          icon: <FaGlassCheers className={styles.eventIcon} />
        },
        {
          name: 'Virtual Workshop',
          date: '22/11/2024',
          location: 'Online',
          icon: <FaLaptop className={styles.eventIcon} />
        },
        {
          name: 'Beach Cleanup Drive',
          date: '05/12/2024',
          location: 'Sydney',
          icon: <FaUmbrellaBeach className={styles.eventIcon} />
        }
      ],
    },
    {
      name: 'Priority Matching',
      icon: <FaHandshake className={styles.perkIcon} />,
      description: 'Get first access to new matching opportunities from our partners.',
      details: [
        'New matching opportunities are released to our top-tier donors first.',
        'You\'ll receive personalized notifications for matches that align with your interests.',
        'Exclusive 24-hour window to claim matches before they\'re open to all users.'
      ],
    },
    {
      name: 'Partner Rewards and Savings',
      icon: <FaGift className={styles.perkIcon} />,
      description: 'Enjoy special discounts and rewards from our partner organizations.',
      details: [
        {
          offer: 'Save 15% on sustainable fashion',
          partner: 'EcoStyle'
        },
        {
          offer: 'Enjoy free shipping on all purchases',
          partner: 'GreenLiving'
        },
        {
          offer: 'Get a free month of Premium subscription',
          partner: 'GoodReads'
        }
      ],
    },
  ];

  return (
    <div className={styles.perksContainer}>
      <h1 className={styles.header}>Your Perks</h1>
      <p className={styles.intro}>
        As a valued member of DonateSpace, you have access to exclusive perks. 
        Here's what you can enjoy:
      </p>

      <div className={styles.impactScoreContainer}>
        <PersonalImpactScore
          impactScore={impactScore}
          scoreChange={scoreChange}
          arrow={arrow}
          tier={tier}
          pointsToNextTier={pointsToNextTier}
        />
      </div>

      <div className={styles.perksList}>
        {perks.map((perk) => (
          <div key={perk.name} className={styles.perkCard}>
            <div className={styles.perkHeader} onClick={() => togglePerk(perk.name)}>
              {perk.icon}
              <h2>{perk.name}</h2>
              {expandedPerk === perk.name ? <FaChevronUp className={styles.expandIcon} /> : <FaChevronDown className={styles.expandIcon} />}
            </div>
            <p>{perk.description}</p>
            {expandedPerk === perk.name && (
              <div className={styles.perkDetails}>
                {perk.name === 'Exclusive Events' ? (
                  <div className={styles.eventList}>
                    {perk.details.map((event, index) => (
                      <div key={index} className={styles.eventCard}>
                        <div className={styles.eventIconContainer}>
                          {event.icon}
                        </div>
                        <div className={styles.eventInfo}>
                          <h3>{event.name}</h3>
                          <p>{event.date} - {event.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : perk.name === 'Partner Rewards and Savings' ? (
                  <ul className={styles.offerList}>
                    {perk.details.map((offer, index) => (
                      <li key={index} className={styles.offerItem}>
                        <span>{offer.offer} from {offer.partner}</span>
                        <button className={styles.redeemButton}>Redeem</button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul>
                    {perk.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.referralProgram}>
        <h2><FaUserPlus className={styles.referralIcon} /> Invite friends, earn rewards!</h2>
        <button className={styles.referralButton}>Share Referral Link</button>
      </div>

      <div className={styles.callToAction}>
        <h2>Ready to unlock more perks?</h2>
        <div className={styles.ctaButtons}>
          <button className={styles.ctaButton}>Volunteer Now</button>
          <button className={styles.ctaButton}>Donate Now</button>
        </div>
      </div>
    </div>
  );
}

export default YourPerks;