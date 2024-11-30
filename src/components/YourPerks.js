import React, { useContext, useState } from 'react';
import cleanStyles from './CleanDesign.module.css';
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
      icon: <FaCalendarAlt className={`${styles.perkIcon} ${cleanStyles.icon}`} />,
      description: 'Access to invitation-only charity events and galas.',
      details: [
        {
          name: 'Charity Gala',
          date: '15/10/2024',
          location: 'Melbourne',
          icon: <FaGlassCheers className={`${styles.eventIcon} ${cleanStyles.icon}`} />
        },
        {
          name: 'Virtual Workshop',
          date: '22/11/2024',
          location: 'Online',
          icon: <FaLaptop className={`${styles.eventIcon} ${cleanStyles.icon}`} />
        },
        {
          name: 'Beach Cleanup Drive',
          date: '05/12/2024',
          location: 'Sydney',
          icon: <FaUmbrellaBeach className={`${styles.eventIcon} ${cleanStyles.icon}`} />
        }
      ],
    },
    {
      name: 'Priority Matching',
      icon: <FaHandshake className={`${styles.perkIcon} ${cleanStyles.icon}`} />,
      description: 'Get first access to new matching opportunities from our partners.',
      details: [
        'New matching opportunities are released to our top-tier donors first.',
        'You\'ll receive personalized notifications for matches that align with your interests.',
        'Exclusive 24-hour window to claim matches before they\'re open to all users.'
      ],
    },
    {
      name: 'Partner Rewards and Savings',
      icon: <FaGift className={`${styles.perkIcon} ${cleanStyles.icon}`} />,
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
    <div className={`${styles.perksContainer} ${cleanStyles.container}`}>
      <h1 className={`${styles.header} ${cleanStyles.heading}`}>Your Perks</h1>
      <p className={`${styles.intro} ${cleanStyles.text}`}>
        As a valued member of DonateSpace, you have access to exclusive perks. 
        Here's what you can enjoy:
      </p>

      <div className={`${styles.impactScoreContainer} ${cleanStyles.scoreContainer}`}>
        <PersonalImpactScore
          impactScore={impactScore}
          scoreChange={scoreChange}
          arrow={arrow}
          tier={tier}
          pointsToNextTier={pointsToNextTier}
        />
      </div>

      <div className={`${styles.perksList} ${cleanStyles.list}`}>
        {perks.map((perk) => (
          <div key={perk.name} className={`${styles.perkCard} ${cleanStyles.card}`}>
            <div className={`${styles.perkHeader} ${cleanStyles.cardHeader}`} onClick={() => togglePerk(perk.name)}>
              {perk.icon}
              <h2 className={cleanStyles.cardTitle}>{perk.name}</h2>
              {expandedPerks[perk.name] ? 
                <FaChevronUp className={`${styles.expandIcon} ${cleanStyles.icon}`} /> : 
                <FaChevronDown className={`${styles.expandIcon} ${cleanStyles.icon}`} />
              }
            </div>
            <p className={cleanStyles.description}>{perk.description}</p>
            {expandedPerks[perk.name] && (
              <div className={`${styles.perkDetails} ${cleanStyles.details}`}>
                {perk.name === 'Exclusive Events' ? (
                  <div className={`${styles.eventList} ${cleanStyles.eventGrid}`}>
                    {perk.details.map((event, index) => (
                      <div key={index} className={`${styles.eventCard} ${cleanStyles.eventItem}`}>
                        <div className={`${styles.eventIconContainer} ${cleanStyles.iconWrapper}`}>
                          {event.icon}
                        </div>
                        <div className={`${styles.eventInfo} ${cleanStyles.eventContent}`}>
                          <h3 className={cleanStyles.eventTitle}>{event.name}</h3>
                          <p className={cleanStyles.eventDetails}>{event.date} - {event.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : perk.name === 'Partner Rewards and Savings' ? (
                  <ul className={`${styles.offerList} ${cleanStyles.offerGrid}`}>
                    {perk.details.map((offer, index) => (
                      <li key={index} className={`${styles.offerItem} ${cleanStyles.offerRow}`}>
                        <span className={cleanStyles.offerText}>{offer.offer} from {offer.partner}</span>
                        <button className={`${styles.redeemButton} ${cleanStyles.button}`}>Redeem</button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className={cleanStyles.list}>
                    {perk.details.map((detail, index) => (
                      <li key={index} className={cleanStyles.listItem}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={`${styles.referralProgram} ${cleanStyles.referralSection}`}>
        <h2 className={cleanStyles.heading}><FaUserPlus className={`${styles.referralIcon} ${cleanStyles.icon}`} /> Invite friends, earn rewards!</h2>
        <button className={`${styles.referralButton} ${cleanStyles.button}`}>Share Referral Link</button>
      </div>

      <div className={`${styles.callToAction} ${cleanStyles.ctaSection}`}>
        <h2 className={cleanStyles.heading}>Ready to unlock more perks?</h2>
        <div className={`${styles.ctaButtons} ${cleanStyles.buttonGroup}`}>
          <button className={`${styles.ctaButton} ${cleanStyles.button}`}>Volunteer Now</button>
          <button className={`${styles.ctaButton} ${cleanStyles.button}`}>Donate Now</button>
        </div>
      </div>
    </div>
  );
}

export default YourPerks;