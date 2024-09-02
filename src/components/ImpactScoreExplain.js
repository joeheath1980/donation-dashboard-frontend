// src/components/ImpactScoreExplain.js
import React from 'react';
import Progress from './Progress';  // Adjust the path if needed

const ImpactScoreExplain = ({ impactScore, regularDonationScore, oneOffDonationScore, volunteeringScore, engagementBonus }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Understanding Your Impact Score</h2>
      <p className="mb-4">Your Impact Score is calculated based on four main factors:</p>
      
      <div className="space-y-6">
        <ScoreComponent 
          title="Regular Donations" 
          score={regularDonationScore} 
          maxScore={35} 
          description="Based on your monthly average, donation streak, and variety of charities supported."
        />
        
        <ScoreComponent 
          title="One-off Donations" 
          score={oneOffDonationScore} 
          maxScore={25} 
          description="Considers the total amount and number of one-time donations."
        />
        
        <ScoreComponent 
          title="Volunteering" 
          score={volunteeringScore} 
          maxScore={30} 
          description="Calculated from your total volunteer hours and variety of activities."
        />
        
        <ScoreComponent 
          title="Engagement Bonus" 
          score={engagementBonus} 
          maxScore={10} 
          description="Extra points for consistent involvement across all categories and improvement over time."
        />
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Your Total Impact Score</h3>
        <Progress value={impactScore} className="w-full h-4" />
        <p className="text-center mt-2">{impactScore} / 100</p>
      </div>
      
      <p className="mt-6 text-sm text-gray-600">
        Note: Your Impact Score is designed to encourage consistent, diverse, and growing contributions to charitable causes. Keep up the great work!
      </p>
    </div>
  );
};

const ScoreComponent = ({ title, score, maxScore, description }) => {
  const percentage = (score / maxScore) * 100;
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title} ({score}/{maxScore} points)</h3>
      <Progress value={percentage} className="w-full h-3" />
      <p className="text-sm mt-1 text-gray-600">{description}</p>
    </div>
  );
};

export default ImpactScoreExplain;
