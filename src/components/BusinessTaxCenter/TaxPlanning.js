import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecureTokenStorage } from '../../utils/auth.utils';
import apiServices from '../../services/api.service';
import styles from './TaxPlanning.module.css';
import {
  RiGiftLine,
  RiBriefcaseLine,
  RiCalendarLine,
  RiLineChartLine,
  RiArrowLeftLine
} from 'react-icons/ri';

const TaxPlanning = () => {
  const navigate = useNavigate();
  const [planningData, setPlanningData] = useState({
    targetAmount: 10000,
    taxRate: 40,
    currentDonations: 0,
    remainingTarget: 0,
    potentialSavings: 0
  });
  
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculatePlanning();
  }, [planningData.targetAmount, planningData.taxRate]);

  const calculatePlanning = async () => {
    setLoading(true);
    try {
      const api = apiServices.client;
      const response = await api.post('/api/business/tax/planning', {
        targetAmount: planningData.targetAmount,
        taxRate: planningData.taxRate
      });
      if (response && response.status === 200) {
        const data = response.data;
        setPlanningData(prev => ({
          ...prev,
          currentDonations: data.currentYearDonations || 0,
          remainingTarget: data.remainingTarget || 0,
          potentialSavings: data.potentialSavings || 0
        }));
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error calculating tax planning:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const taxBrackets = [
    { rate: 0, threshold: 0, label: 'Personal Allowance (£0 - £12,570)' },
    { rate: 20, threshold: 12570, label: 'Basic Rate (£12,571 - £50,270)' },
    { rate: 40, threshold: 50270, label: 'Higher Rate (£50,271 - £125,140)' },
    { rate: 45, threshold: 125140, label: 'Additional Rate (Over £125,140)' }
  ];

  const strategies = [
    {
      title: 'Gift Aid Maximisation',
      description: 'Ensure all donations qualify for Gift Aid to increase your tax relief by 25%',
      savings: planningData.targetAmount * 0.25,
      icon: <RiGiftLine />
    },
    {
      title: 'Payroll Giving',
      description: 'Donate directly from your salary before tax for immediate tax relief',
      savings: planningData.targetAmount * planningData.taxRate / 100,
      icon: <RiBriefcaseLine />
    },
    {
      title: 'Carry Back Relief',
      description: 'Carry back donations to previous tax year if more beneficial',
      savings: planningData.targetAmount * 0.05,
      icon: <RiCalendarLine />
    },
    {
      title: 'Share Donations',
      description: 'Donate shares instead of cash to avoid capital gains tax',
      savings: planningData.targetAmount * 0.15,
      icon: <RiLineChartLine />
    }
  ];

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <button 
          onClick={() => navigate('/business/tax-center')} 
          className={styles.backButton}
        >
          <RiArrowLeftLine /> Back to Tax Centre
        </button>
      </nav>
      
      <div className={styles.header}>
        <h1>Tax Planning Calculator</h1>
        <p className={styles.subtitle}>Optimise your charitable giving strategy for maximum tax efficiency</p>
      </div>

      <div className={styles.calculator}>
        <div className={styles.inputSection}>
          <h2>Planning Parameters</h2>
          
          <div className={styles.inputGroup}>
            <label>Annual Giving Target</label>
            <div className={styles.currencyInput}>
              <span>£</span>
              <input
                type="number"
                value={planningData.targetAmount}
                onChange={(e) => setPlanningData({...planningData, targetAmount: Number(e.target.value)})}
                min="0"
                step="1000"
              />
            </div>
            <span className={styles.helper}>Your desired annual charitable contribution</span>
          </div>

          <div className={styles.inputGroup}>
            <label>Tax Rate</label>
            <div className={styles.taxRateSelector}>
              {taxBrackets.map(bracket => (
                <button
                  key={bracket.rate}
                  className={`${styles.taxRateBtn} ${planningData.taxRate === bracket.rate ? styles.selected : ''}`}
                  onClick={() => setPlanningData({...planningData, taxRate: bracket.rate})}
                >
                  <span className={styles.rateValue}>{bracket.rate}%</span>
                  <span className={styles.rateLabel}>{bracket.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.resultsSection}>
          <h2>Tax Planning Results</h2>
          
          <div className={styles.resultsGrid}>
            <div className={styles.resultCard}>
              <h3>Current Year Donations</h3>
              <p className={styles.resultValue}>{formatCurrency(planningData.currentDonations)}</p>
              <span className={styles.resultLabel}>Already contributed</span>
            </div>

            <div className={styles.resultCard}>
              <h3>Remaining Target</h3>
              <p className={styles.resultValue}>{formatCurrency(planningData.remainingTarget)}</p>
              <span className={styles.resultLabel}>To reach your goal</span>
            </div>

            <div className={styles.resultCard}>
              <h3>Potential Tax Savings</h3>
              <p className={styles.resultValue}>{formatCurrency(planningData.potentialSavings)}</p>
              <span className={styles.resultLabel}>Maximum benefit</span>
            </div>

            <div className={styles.resultCard}>
              <h3>Effective Cost</h3>
              <p className={styles.resultValue}>
                {formatCurrency(planningData.targetAmount - planningData.potentialSavings)}
              </p>
              <span className={styles.resultLabel}>After tax relief</span>
            </div>
          </div>

          <div className={styles.progressBar}>
            <div className={styles.progressLabel}>
              <span>Progress to Target</span>
              <span>{Math.round((planningData.currentDonations / planningData.targetAmount) * 100)}%</span>
            </div>
            <div className={styles.progressTrack}>
              <div 
                className={styles.progressFill}
                style={{ width: `${Math.min((planningData.currentDonations / planningData.targetAmount) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.strategiesSection}>
        <h2>Tax Optimisation Strategies</h2>
        <div className={styles.strategiesGrid}>
          {strategies.map((strategy, index) => (
            <div key={index} className={styles.strategyCard}>
              <div className={styles.strategyIcon}>{strategy.icon}</div>
              <h3>{strategy.title}</h3>
              <p>{strategy.description}</p>
              <div className={styles.strategySavings}>
                Potential savings: {formatCurrency(strategy.savings)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className={styles.recommendationsSection}>
          <h2>Personalised Recommendations</h2>
          <div className={styles.recommendationsList}>
            {recommendations.map((rec, index) => (
              <div key={index} className={styles.recommendationCard}>
                <div className={styles.recNumber}>{index + 1}</div>
                <div className={styles.recContent}>
                  <h3>{rec.title}</h3>
                  <p>{rec.description}</p>
                  <div className={styles.recActions}>
                    <span className={styles.recImpact}>Impact: {formatCurrency(rec.impact)}</span>
                    <button className={styles.recButton}>Learn More</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.taxCalendar}>
        <h2>Tax Year Timeline</h2>
        <div className={styles.timeline}>
          <div className={styles.timelineItem}>
            <div className={styles.timelineDate}>6 April</div>
            <div className={styles.timelineContent}>
              <h4>Tax Year Begins</h4>
              <p>Start of new tax year - plan your giving strategy</p>
            </div>
          </div>
          <div className={styles.timelineItem}>
            <div className={styles.timelineDate}>31 October</div>
            <div className={styles.timelineContent}>
              <h4>Paper Return Deadline</h4>
              <p>Submit paper self-assessment if applicable</p>
            </div>
          </div>
          <div className={styles.timelineItem}>
            <div className={styles.timelineDate}>31 January</div>
            <div className={styles.timelineContent}>
              <h4>Online Return Deadline</h4>
              <p>Submit online self-assessment and pay tax due</p>
            </div>
          </div>
          <div className={styles.timelineItem}>
            <div className={styles.timelineDate}>5 April</div>
            <div className={styles.timelineContent}>
              <h4>Tax Year Ends</h4>
              <p>Last day to make donations for current tax year</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxPlanning;
