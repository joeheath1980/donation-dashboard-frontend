import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchOpportunityFeed from './MatchOpportunityFeed';
import MatchSuccessModal from './MatchSuccessModal';
import styles from './MatchingPage.module.css';

function MatchingPage() {
  const navigate = useNavigate();
  const [showMatchSuccess, setShowMatchSuccess] = useState(false);
  const [matchSuccessData, setMatchSuccessData] = useState(null);

  const handleSelectOpportunity = (opportunity) => {
    // Use selectedCharityId if available (P3/P4), otherwise use charityId (P1/P2)
    const charityId = opportunity.selectedCharityId || opportunity.charityId || opportunity.charity;
    
    if (!charityId) {
      console.error('No charity ID available for navigation', opportunity);
      alert('Please select a charity before proceeding');
      return;
    }
    
    // Navigate to donation form with the opportunity data
    navigate(`/donate/${charityId}`, {
      state: {
        matchingOpportunity: opportunity,
        campaignId: opportunity.campaignId || opportunity.campaign,
        suggestedAmount: opportunity.suggestedAmount || opportunity.donationAmount,
        selectedCharityId: charityId // Explicitly pass the selected charity
      }
    });
  };

  const handleFindNextMatch = () => {
    setShowMatchSuccess(false);
    setMatchSuccessData(null);
  };

  return (
    <div className={styles.matchingPageContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.icon}>🎯</span>
          Matching Opportunities
        </h1>
        <p className={styles.subtitle}>
          Partner with brands to amplify your impact. Your donations get matched by our business partners!
        </p>
      </div>

      <div className={styles.feedContainer}>
        <MatchOpportunityFeed 
          onSelectOpportunity={handleSelectOpportunity}
        />
      </div>

      {/* Match Success Modal */}
      {showMatchSuccess && matchSuccessData && (
        <MatchSuccessModal
          donation={matchSuccessData.donation}
          matches={matchSuccessData.matches}
          onClose={() => {
            setShowMatchSuccess(false);
            setMatchSuccessData(null);
          }}
          onFindNext={handleFindNextMatch}
        />
      )}
    </div>
  );
}

export default MatchingPage;