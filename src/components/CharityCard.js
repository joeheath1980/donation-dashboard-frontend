import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaInfoCircle, FaMapMarkerAlt, FaUsers, FaGlobe } from 'react-icons/fa';
import styles from './CharityCard.module.css';

const CharityCard = ({ charity }) => {
  const charityKey = charity.ABN || charity._id;
  const charityName = charity.Charity_Legal_Name || charity.name;
  const isVerified = charity.Registration_Status === 'Registered';
  
  // Format operating states
  const getOperatingStates = () => {
    const states = [];
    if (charity.Operates_in_ACT === 'Y') states.push('ACT');
    if (charity.Operates_in_NSW === 'Y') states.push('NSW');
    if (charity.Operates_in_NT === 'Y') states.push('NT');
    if (charity.Operates_in_QLD === 'Y') states.push('QLD');
    if (charity.Operates_in_SA === 'Y') states.push('SA');
    if (charity.Operates_in_TAS === 'Y') states.push('TAS');
    if (charity.Operates_in_VIC === 'Y') states.push('VIC');
    if (charity.Operates_in_WA === 'Y') states.push('WA');
    return states;
  };

  // Get beneficiary count
  const getBeneficiaryCount = () => {
    let count = 0;
    if (charity.Aboriginal_or_TSI === 'Y') count++;
    if (charity.Adults === 'Y') count++;
    if (charity.Aged_Persons === 'Y') count++;
    if (charity.Children === 'Y') count++;
    if (charity.Early_Childhood === 'Y') count++;
    if (charity.Families === 'Y') count++;
    if (charity.Youth === 'Y') count++;
    if (charity.Females === 'Y') count++;
    if (charity.Males === 'Y') count++;
    if (charity.Financially_Disadvantaged === 'Y') count++;
    if (charity.Migrants_Refugees_or_Asylum_Seekers === 'Y') count++;
    if (charity.People_at_risk_of_homelessness === 'Y') count++;
    if (charity.People_with_Disabilities === 'Y') count++;
    if (charity.Rural_Regional_Remote_Communities === 'Y') count++;
    if (charity.Veterans_or_their_families === 'Y') count++;
    if (charity.Victims_of_Disasters === 'Y') count++;
    return count;
  };

  const operatingStates = getOperatingStates();
  const beneficiaryCount = getBeneficiaryCount();
  const yearEstablished = charity.Date_Organisation_Established 
    ? new Date(charity.Date_Organisation_Established).getFullYear() 
    : null;

  return (
    <div className={`${styles.card} ${charity.trending ? styles.trending : ''}`}>
      {charity.trending && (
        <div className={styles.trendingBadge}>🔥 Trending</div>
      )}
      
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.charityName}>
          {charityName}
          {isVerified && (
            <FaCheckCircle className={styles.verifiedBadge} title="Registered Charity" />
          )}
        </h3>
        {charity.impactScore && (
          <div className={styles.scoreDisplay}>
            <span className={styles.scoreLabel}>Impact</span>
            <span className={styles.scoreValue}>{charity.impactScore}</span>
          </div>
        )}
      </div>

      {/* Main Activity */}
      <div className={styles.mainActivity}>
        <span className={styles.activityBadge}>
          {charity.Main_Activity || charity.category || 'Charitable Activities'}
        </span>
      </div>

      {/* Key Info Grid */}
      <div className={styles.infoGrid}>
        {/* Location */}
        <div className={styles.infoItem}>
          <FaMapMarkerAlt className={styles.infoIcon} />
          <span>{charity.Town_City || charity.State}, {charity.State}</span>
        </div>

        {/* Operating Reach */}
        {operatingStates.length > 0 && (
          <div className={styles.infoItem}>
            <FaGlobe className={styles.infoIcon} />
            <span>
              {operatingStates.length === 8 
                ? 'Australia-wide' 
                : `${operatingStates.length} state${operatingStates.length > 1 ? 's' : ''}`
              }
            </span>
          </div>
        )}

        {/* Beneficiaries */}
        {beneficiaryCount > 0 && (
          <div className={styles.infoItem}>
            <FaUsers className={styles.infoIcon} />
            <span>{beneficiaryCount} beneficiary group{beneficiaryCount > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Size */}
        {charity.Charity_Size && (
          <div className={styles.infoItem}>
            <span className={styles.sizeLabel}>Size:</span>
            <span>{charity.Charity_Size}</span>
          </div>
        )}

        {/* Year Established */}
        {yearEstablished && (
          <div className={styles.infoItem}>
            <span className={styles.establishedLabel}>Est.</span>
            <span>{yearEstablished}</span>
          </div>
        )}
      </div>

      {/* Special Badges */}
      <div className={styles.badges}>
        {charity.PBI === 'Y' && (
          <span className={styles.pbiBadge} title="Public Benevolent Institution">PBI</span>
        )}
        {charity.HPC === 'Y' && (
          <span className={styles.hpcBadge} title="Health Promotion Charity">HPC</span>
        )}
        {charity.Charity_Type && charity.Charity_Type !== 'Other' && (
          <span className={styles.typeBadge}>{charity.Charity_Type}</span>
        )}
      </div>

      {/* Purpose Summary */}
      {charity.purposeSummary && charity.purposeSummary.length > 0 && (
        <div className={styles.purposeSummary}>
          <p className={styles.purposeText}>
            {charity.purposeSummary[0]}
            {charity.purposeSummary.length > 1 && (
              <span className={styles.morePurposes}> +{charity.purposeSummary.length - 1} more</span>
            )}
          </p>
        </div>
      )}

      {/* Financial Snapshot */}
      {charity.Total_Revenue_AIS && (
        <div className={styles.financialSnapshot}>
          <span className={styles.revenueLabel}>Annual Revenue:</span>
          <span className={styles.revenueValue}>
            ${parseInt(charity.Total_Revenue_AIS).toLocaleString()}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <Link 
          to={`/charity/${charityKey}`} 
          className={styles.viewDetailsButton}
        >
          <FaInfoCircle /> View Details
        </Link>
        <Link 
          to={`/donate/${charityKey}`} 
          className={styles.donateButton}
        >
          💳 Donate
        </Link>
      </div>
    </div>
  );
};

export default CharityCard;