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
    // Navigate to donation form with the opportunity data
    navigate(`/donate/${opportunity.charityId}`, {
      state: {
        matchingOpportunity: opportunity,
        campaignId: opportunity.campaignId,
        suggestedAmount: opportunity.suggestedAmount
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