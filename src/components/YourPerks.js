import React, { useContext } from 'react';
import './SharedStyles.css';
import styles from './YourPerks.module.css';
import PersonalImpactScore from './PersonalImpactScore';
import { ImpactContext } from '../contexts/ImpactContext';
import { 
  FaCalendarAlt, 
  FaHandshake, 
  FaGift, 
  FaUserPlus, 
  FaGlassCheers, 
  FaLaptop, 
  FaUmbrellaBeach,
  FaShareAlt 
} from 'react-icons/fa';

function YourPerks() {
  const { 
    impactScore,
    lastYearImpactScore,
    tier,
    pointsToNextTier,
  } = useContext(ImpactContext);

  const scoreChange = impactScore - lastYearImpactScore;
  const arrow = scoreChange > 0 ? '▲' : scoreChange < 0 ? '▼' : '';

  // Keeping the original perks data structure
  const perks = [
    {
      name: 'Exclusive Events',
      icon: <FaCalendarAlt className={`${styles.perkIcon} icon`} />,
      description: 'Access to invitation-only charity events and galas.',
      details: [
        {
          name: 'Charity Gala',
          date: '15/10/2024',
          location: 'Melbourne',
          icon: <FaGlassCheers className={`${styles.eventIcon} icon`} />
        },
        {
          name: 'Virtual Workshop',
          date: '22/11/2024',
          location: 'Online',
          icon: <FaLaptop className={`${styles.eventIcon} icon`} />
        },
        {
          name: 'Beach Cleanup Drive',
          date: '05/12/2024',
          location: 'Sydney',
          icon: <FaUmbrellaBeach className={`${styles.eventIcon} icon`} />
        }
      ],
      badge: { text: 'New', type: 'new' }
    },
    {
      name: 'Priority Matching',
      icon: <FaHandshake className={`${styles.perkIcon} icon`} />,
      description: 'Get first access to new matching opportunities from our partners.',
      details: [
        'New matching opportunities are released to our top-tier donors first.',
        'You\'ll receive personalized notifications for matches that align with your interests.',
        'Exclusive 24-hour window to claim matches before they\'re open to all users.'
      ],
      badge: { text: 'Featured', type: 'featured' }
    },
    {
      name: 'Partner Rewards and Savings',
      icon: <FaGift className={`${styles.perkIcon} icon`} />,
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
    <div className={`${styles.perksContainer} container`}>
      <h1 className={`${styles.header} heading`}>Your Perks</h1>
      <p className={`${styles.intro} text`}>
        As a valued member of DonateSpace, you have access to exclusive perks. 
        Here's what you can enjoy:
      </p>

      {/* Keep the Impact Score component untouched */}
      <div className={`${styles.impactScoreContainer} scoreContainer`}>
        <PersonalImpactScore
          impactScore={impactScore}
          scoreChange={scoreChange}
          arrow={arrow}
          tier={tier}
          pointsToNextTier={pointsToNextTier}
        />
      </div>

      {/* Updated Perks Grid - All perks visible from the start */}
      <div className={`${styles.perksList} list`}>
        {perks.map((perk) => (
          <div key={perk.name} className={`${styles.perkCard} card`}>
            <div className={`${styles.perkHeader} cardHeader`}>
              {perk.icon}
              <h2 className="cardTitle">{perk.name}</h2>
              {perk.badge && (
                <span className={`${styles.badge} ${styles[perk.badge.type]}`}>
                  {perk.badge.text}
                </span>
              )}
            </div>
            <p className="description">{perk.description}</p>
            
            {/* Always show perk details - no toggle/expand functionality */}
            <div className={`${styles.perkDetails} details`}>
              {perk.name === 'Exclusive Events' ? (
                <div className={`${styles.eventList} eventGrid`}>
                  {perk.details.map((event, index) => (
                    <div key={index} className={`${styles.eventCard} eventItem`}>
                      <div className={`${styles.eventIconContainer} iconWrapper`}>
                        {event.icon}
                      </div>
                      <div className={`${styles.eventInfo} eventContent`}>
                        <h3 className="eventTitle">{event.name}</h3>
                        <p className="eventDetails">{event.date} - {event.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : perk.name === 'Partner Rewards and Savings' ? (
                <ul className={`${styles.offerList} offerGrid`}>
                  {perk.details.map((offer, index) => (
                    <li key={index} className={`${styles.offerItem} offerRow`}>
                      <div className={styles.offerInfo}>
                        <span className={`${styles.offerTitle} offerText`}>{offer.offer}</span>
                        <span className={styles.offerDescription}>from {offer.partner}</span>
                      </div>
                      <button className={`${styles.redeemButton} button`}>Redeem</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className={`${styles.featureList} list`}>
                  {perk.details.map((detail, index) => (
                    <li key={index} className={`${styles.featureItem} listItem`}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Referral Program Section */}
      <div className={`${styles.referralProgram} referralSection`}>
        <div className={styles.referralHeader}>
          <FaShareAlt className={`${styles.referralIcon} icon`} />
          <h2 className="heading">Invite friends, earn rewards!</h2>
        </div>
        <p className={`${styles.referralText} text`}>
          Help us grow our community! When you refer a friend, both of you will receive bonus points 
          toward your Impact Score and exclusive rewards.
        </p>
        <button className={`${styles.referralButton} button`}>Share Referral Link</button>
      </div>

      {/* Enhanced Call to Action Section */}
      <div className={`${styles.callToAction} ctaSection`}>
        <h2 className="heading">Ready to unlock more perks?</h2>
        <p className={`${styles.ctaText} text`}>
          Complete your profile to unlock additional perks and personalized recommendations 
          based on your interests and goals.
        </p>
        <div className={`${styles.ctaButtons} buttonGroup`}>
          <button className={`${styles.ctaButton} ${styles.primary} button`}>Volunteer Now</button>
          <button className={`${styles.ctaButton} ${styles.secondary} button`}>Donate Now</button>
        </div>
      </div>
    </div>
  );
}

export default YourPerks;