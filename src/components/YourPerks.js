import React, { useContext, useState } from 'react';
import sharedStyles from './SharedStyles.css';
import styles from './YourPerks.module.css';
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

  // Change to an object to track expanded state for each perk independently
  const [expandedPerks, setExpandedPerks] = useState({});

  const togglePerk = (perkName) => {
    setExpandedPerks(prev => ({
      ...prev,
      [perkName]: !prev[perkName]
    }));
  };

  const perks = [
    {
      name: 'Exclusive Events',
      icon: <FaCalendarAlt className={`${styles.perkIcon} ${sharedStyles.icon}`} />,
      description: 'Access to invitation-only charity events and galas.',
      details: [
        {
          name: 'Charity Gala',
          date: '15/10/2024',
          location: 'Melbourne',
          icon: <FaGlassCheers className={`${styles.eventIcon} ${sharedStyles.icon}`} />
        },
        {
          name: 'Virtual Workshop',
          date: '22/11/2024',
          location: 'Online',
          icon: <FaLaptop className={`${styles.eventIcon} ${sharedStyles.icon}`} />
        },
        {
          name: 'Beach Cleanup Drive',
          date: '05/12/2024',
          location: 'Sydney',
          icon: <FaUmbrellaBeach className={`${styles.eventIcon} ${sharedStyles.icon}`} />
        }
      ],
    },
    {
      name: 'Priority Matching',
      icon: <FaHandshake className={`${styles.perkIcon} ${sharedStyles.icon}`} />,
      description: 'Get first access to new matching opportunities from our partners.',
      details: [
        'New matching opportunities are released to our top-tier donors first.',
        'You\'ll receive personalized notifications for matches that align with your interests.',
        'Exclusive 24-hour window to claim matches before they\'re open to all users.'
      ],
    },
    {
      name: 'Partner Rewards and Savings',
      icon: <FaGift className={`${styles.perkIcon} ${sharedStyles.icon}`} />,
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
    <div className={`${styles.perksContainer} ${sharedStyles.container}`}>
      <h1 className={`${styles.header} ${sharedStyles.heading}`}>Your Perks</h1>
      <p className={`${styles.intro} ${sharedStyles.text}`}>
        As a valued member of DonateSpace, you have access to exclusive perks. 
        Here's what you can enjoy:
      </p>

      <div className={`${styles.impactScoreContainer} ${sharedStyles.scoreContainer}`}>
        <PersonalImpactScore
          impactScore={impactScore}
          scoreChange={scoreChange}
          arrow={arrow}
          tier={tier}
          pointsToNextTier={pointsToNextTier}
        />
      </div>

      <div className={`${styles.perksList} ${sharedStyles.list}`}>
        {perks.map((perk) => (
          <div key={perk.name} className={`${styles.perkCard} ${sharedStyles.card}`}>
            <div className={`${styles.perkHeader} ${sharedStyles.cardHeader}`} onClick={() => togglePerk(perk.name)}>
              {perk.icon}
              <h2 className={sharedStyles.cardTitle}>{perk.name}</h2>
              {expandedPerks[perk.name] ? 
                <FaChevronUp className={`${styles.expandIcon} ${sharedStyles.icon}`} /> : 
                <FaChevronDown className={`${styles.expandIcon} ${sharedStyles.icon}`} />
              }
            </div>
            <p className={sharedStyles.description}>{perk.description}</p>
            {expandedPerks[perk.name] && (
              <div className={`${styles.perkDetails} ${sharedStyles.details}`}>
                {perk.name === 'Exclusive Events' ? (
                  <div className={`${styles.eventList} ${sharedStyles.eventGrid}`}>
                    {perk.details.map((event, index) => (
                      <div key={index} className={`${styles.eventCard} ${sharedStyles.eventItem}`}>
                        <div className={`${styles.eventIconContainer} ${sharedStyles.iconWrapper}`}>
                          {event.icon}
                        </div>
                        <div className={`${styles.eventInfo} ${sharedStyles.eventContent}`}>
                          <h3 className={sharedStyles.eventTitle}>{event.name}</h3>
                          <p className={sharedStyles.eventDetails}>{event.date} - {event.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : perk.name === 'Partner Rewards and Savings' ? (
                  <ul className={`${styles.offerList} ${sharedStyles.offerGrid}`}>
                    {perk.details.map((offer, index) => (
                      <li key={index} className={`${styles.offerItem} ${sharedStyles.offerRow}`}>
                        <span className={sharedStyles.offerText}>{offer.offer} from {offer.partner}</span>
                        <button className={`${styles.redeemButton} ${sharedStyles.button}`}>Redeem</button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className={sharedStyles.list}>
                    {perk.details.map((detail, index) => (
                      <li key={index} className={sharedStyles.listItem}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={`${styles.referralProgram} ${sharedStyles.referralSection}`}>
        <h2 className={sharedStyles.heading}><FaUserPlus className={`${styles.referralIcon} ${sharedStyles.icon}`} /> Invite friends, earn rewards!</h2>
        <button className={`${styles.referralButton} ${sharedStyles.button}`}>Share Referral Link</button>
      </div>

      <div className={`${styles.callToAction} ${sharedStyles.ctaSection}`}>
        <h2 className={sharedStyles.heading}>Ready to unlock more perks?</h2>
        <div className={`${styles.ctaButtons} ${sharedStyles.buttonGroup}`}>
          <button className={`${styles.ctaButton} ${sharedStyles.button}`}>Volunteer Now</button>
          <button className={`${styles.ctaButton} ${sharedStyles.button}`}>Donate Now</button>
        </div>
      </div>
    </div>
  );
}

export default YourPerks;