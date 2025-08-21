import React, { useState, useEffect } from 'react';
import apiServices from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminMatchingEngine.module.css';
import sharedStyles from './AdminSharedStyles.module.css';

const AdminMatchingEngine = () => {
  const { user } = useAuth();
  const [activeMatches, setActiveMatches] = useState([]);
  const [matchingRules, setMatchingRules] = useState([]);
  const [matchingStats, setMatchingStats] = useState({
    totalMatches: 0,
    activeMatches: 0,
    totalMatched: 0,
    averageMultiplier: 0,
    topBusinesses: [],
    topCharities: []
  });
  const [tierMultipliers, setTierMultipliers] = useState({
    bronze: 1,
    silver: 2,
    gold: 3,
    platinum: 4
  });
  const [loading, setLoading] = useState(true);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [newRule, setNewRule] = useState({
    businessId: '',
    charityIds: [],
    matchRatio: 1,
    maxDailyBudget: 1000,
    minDonation: 2,
    maxDonation: 50,
    userTiers: ['bronze', 'silver', 'gold', 'platinum'],
    isActive: true
  });

  const apiUrl = process.env.REACT_APP_API_BASE_URL || '';

  useEffect(() => {
    fetchMatchingData();
  }, []);

  const fetchMatchingData = async () => {
    try {
      setLoading(true);
      const api = apiServices.client;
      const [rulesRes, statsRes, activeRes] = await Promise.all([
        api.get(`${apiUrl}/api/admin/matching/rules`),
        api.get(`${apiUrl}/api/admin/matching/stats`),
        api.get(`${apiUrl}/api/admin/matching/active`)
      ]);
      
      setMatchingRules(rulesRes.data || []);
      setMatchingStats(statsRes.data || matchingStats);
      setActiveMatches(activeRes.data || []);
      
      // Get tier multipliers from config if available
      if (statsRes.data.tierMultipliers) {
        setTierMultipliers(statsRes.data.tierMultipliers);
      }
    } catch (error) {
      console.error('Error fetching matching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      const api = apiServices.client;
      await api.post(`${apiUrl}/api/admin/matching/rules`, newRule);
      alert('Matching rule created successfully');
      setShowRuleModal(false);
      resetRuleForm();
      fetchMatchingData();
    } catch (error) {
      console.error('Error creating rule:', error);
      alert('Failed to create matching rule');
    }
  };

  const handleUpdateRule = async () => {
    try {
      const api = apiServices.client;
      await api.put(`${apiUrl}/api/admin/matching/rules/${selectedRule._id}` , newRule);
      alert('Matching rule updated successfully');
      setShowRuleModal(false);
      resetRuleForm();
      fetchMatchingData();
    } catch (error) {
      console.error('Error updating rule:', error);
      alert('Failed to update matching rule');
    }
  };

  const handleToggleRule = async (ruleId, isActive) => {
    try {
      const api = apiServices.client;
      await api.patch(`${apiUrl}/api/admin/matching/rules/${ruleId}/toggle`, { isActive });
      fetchMatchingData();
    } catch (error) {
      console.error('Error toggling rule:', error);
      alert('Failed to update rule status');
    }
  };

  const handleUpdateMultipliers = async () => {
    try {
      const api = apiServices.client;
      await api.post(`${apiUrl}/api/admin/matching/multipliers`, tierMultipliers);
      alert('Tier multipliers updated successfully');
      setShowConfigModal(false);
    } catch (error) {
      console.error('Error updating multipliers:', error);
      alert('Failed to update tier multipliers');
    }
  };

  const resetRuleForm = () => {
    setNewRule({
      businessId: '',
      charityIds: [],
      matchRatio: 1,
      maxDailyBudget: 1000,
      minDonation: 2,
      maxDonation: 50,
      userTiers: ['bronze', 'silver', 'gold', 'platinum'],
      isActive: true
    });
    setSelectedRule(null);
  };

  const openEditModal = (rule) => {
    setSelectedRule(rule);
    setNewRule({
      businessId: rule.businessId,
      charityIds: rule.charityIds || [],
      matchRatio: rule.matchRatio,
      maxDailyBudget: rule.maxDailyBudget,
      minDonation: rule.minDonation,
      maxDonation: rule.maxDonation,
      userTiers: rule.userTiers || ['bronze', 'silver', 'gold', 'platinum'],
      isActive: rule.isActive
    });
    setShowRuleModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className={sharedStyles.managementContainer}>
      <h2 className={sharedStyles.managementTitle}>Matching Engine Management</h2>

      {/* Statistics Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Matches</h3>
          <p className={styles.statNumber}>{matchingStats.totalMatches.toLocaleString()}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Active Rules</h3>
          <p className={styles.statNumber}>{matchingRules.filter(r => r.isActive).length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Matched</h3>
          <p className={styles.statNumber}>{formatCurrency(matchingStats.totalMatched)}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Avg Multiplier</h3>
          <p className={styles.statNumber}>{matchingStats.averageMultiplier.toFixed(1)}x</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={sharedStyles.controls}>
        <button onClick={() => setShowRuleModal(true)} className={sharedStyles.button}>
          Create New Rule
        </button>
        <button onClick={() => setShowConfigModal(true)} className={sharedStyles.button}>
          Configure Multipliers
        </button>
      </div>

      {/* Active Matches Section */}
      <div className={styles.section}>
        <h3>Real-time Active Matches</h3>
        {activeMatches.length > 0 ? (
          <div className={styles.activeMatchesGrid}>
            {activeMatches.map((match) => (
              <div key={match.id} className={styles.activeMatchCard}>
                <div className={styles.matchHeader}>
                  <span className={styles.businessName}>{match.businessName}</span>
                  <span className={styles.matchAmount}>{formatCurrency(match.matchAmount)}</span>
                </div>
                <div className={styles.matchDetails}>
                  <p>User: {match.userName} ({match.userTier})</p>
                  <p>Charity: {match.charityName}</p>
                  <p>Multiplier: {match.multiplier}x</p>
                  <p className={styles.timestamp}>{new Date(match.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noData}>No active matches at this moment</p>
        )}
      </div>

      {/* Matching Rules Table */}
      <div className={styles.section}>
        <h3>Matching Rules</h3>
        {loading ? (
          <div className={sharedStyles.loading}>Loading matching rules...</div>
        ) : (
          <table className={sharedStyles.table}>
            <thead>
              <tr>
                <th>Business</th>
                <th>Match Ratio</th>
                <th>Daily Budget</th>
                <th>Donation Range</th>
                <th>User Tiers</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {matchingRules.map((rule) => (
                <tr key={rule._id}>
                  <td>{rule.businessName || rule.businessId}</td>
                  <td>{rule.matchRatio}:1</td>
                  <td>{formatCurrency(rule.maxDailyBudget)}</td>
                  <td>{formatCurrency(rule.minDonation)} - {formatCurrency(rule.maxDonation)}</td>
                  <td>{rule.userTiers?.join(', ') || 'All'}</td>
                  <td>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={rule.isActive}
                        onChange={(e) => handleToggleRule(rule._id, e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </td>
                  <td>
                    <button
                      onClick={() => openEditModal(rule)}
                      className={sharedStyles.editButton}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Top Performers */}
      <div className={styles.topPerformersGrid}>
        <div className={styles.section}>
          <h3>Top Businesses by Matching</h3>
          {matchingStats.topBusinesses?.length > 0 ? (
            <table className={styles.miniTable}>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Total Matched</th>
                  <th>Match Count</th>
                </tr>
              </thead>
              <tbody>
                {matchingStats.topBusinesses.map((business, index) => (
                  <tr key={index}>
                    <td>{business.name}</td>
                    <td>{formatCurrency(business.totalMatched)}</td>
                    <td>{business.matchCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.noData}>No data available</p>
          )}
        </div>

        <div className={styles.section}>
          <h3>Top Charities by Matches</h3>
          {matchingStats.topCharities?.length > 0 ? (
            <table className={styles.miniTable}>
              <thead>
                <tr>
                  <th>Charity</th>
                  <th>Total Received</th>
                  <th>Match Count</th>
                </tr>
              </thead>
              <tbody>
                {matchingStats.topCharities.map((charity, index) => (
                  <tr key={index}>
                    <td>{charity.name}</td>
                    <td>{formatCurrency(charity.totalReceived)}</td>
                    <td>{charity.matchCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.noData}>No data available</p>
          )}
        </div>
      </div>

      {/* Rule Creation/Edit Modal */}
      {showRuleModal && (
        <div className={sharedStyles.modal}>
          <div className={sharedStyles.modalContent}>
            <h3>{selectedRule ? 'Edit Matching Rule' : 'Create New Matching Rule'}</h3>
            
            <div className={sharedStyles.formGroup}>
              <label>Business ID</label>
              <input
                type="text"
                value={newRule.businessId}
                onChange={(e) => setNewRule({ ...newRule, businessId: e.target.value })}
                className={sharedStyles.input}
                placeholder="Enter business ID"
                disabled={selectedRule !== null}
              />
            </div>

            <div className={sharedStyles.formGroup}>
              <label>Match Ratio (e.g., 2 for 2:1 matching)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newRule.matchRatio}
                onChange={(e) => setNewRule({ ...newRule, matchRatio: parseInt(e.target.value) })}
                className={sharedStyles.input}
              />
            </div>

            <div className={sharedStyles.formGroup}>
              <label>Maximum Daily Budget ($)</label>
              <input
                type="number"
                min="100"
                value={newRule.maxDailyBudget}
                onChange={(e) => setNewRule({ ...newRule, maxDailyBudget: parseFloat(e.target.value) })}
                className={sharedStyles.input}
              />
            </div>

            <div className={styles.rangeInputs}>
              <div className={sharedStyles.formGroup}>
                <label>Min Donation ($)</label>
                <input
                  type="number"
                  min="1"
                  value={newRule.minDonation}
                  onChange={(e) => setNewRule({ ...newRule, minDonation: parseFloat(e.target.value) })}
                  className={sharedStyles.input}
                />
              </div>
              <div className={sharedStyles.formGroup}>
                <label>Max Donation ($)</label>
                <input
                  type="number"
                  min="1"
                  value={newRule.maxDonation}
                  onChange={(e) => setNewRule({ ...newRule, maxDonation: parseFloat(e.target.value) })}
                  className={sharedStyles.input}
                />
              </div>
            </div>

            <div className={sharedStyles.formGroup}>
              <label>Eligible User Tiers</label>
              <div className={styles.checkboxGroup}>
                {['bronze', 'silver', 'gold', 'platinum'].map((tier) => (
                  <label key={tier} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={newRule.userTiers.includes(tier)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewRule({ ...newRule, userTiers: [...newRule.userTiers, tier] });
                        } else {
                          setNewRule({ ...newRule, userTiers: newRule.userTiers.filter(t => t !== tier) });
                        }
                      }}
                    />
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div className={sharedStyles.modalButtons}>
              <button onClick={() => { setShowRuleModal(false); resetRuleForm(); }} className={sharedStyles.cancelButton}>
                Cancel
              </button>
              <button 
                onClick={selectedRule ? handleUpdateRule : handleCreateRule} 
                className={sharedStyles.saveButton}
              >
                {selectedRule ? 'Update Rule' : 'Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tier Multiplier Configuration Modal */}
      {showConfigModal && (
        <div className={sharedStyles.modal}>
          <div className={sharedStyles.modalContent}>
            <h3>Configure Tier Multipliers</h3>
            <p className={styles.configDescription}>
              Set the matching multipliers for each user tier. These multipliers apply to all matching rules.
            </p>
            
            {Object.entries(tierMultipliers).map(([tier, multiplier]) => (
              <div key={tier} className={sharedStyles.formGroup}>
                <label>{tier.charAt(0).toUpperCase() + tier.slice(1)} Tier</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  value={multiplier}
                  onChange={(e) => setTierMultipliers({
                    ...tierMultipliers,
                    [tier]: parseFloat(e.target.value)
                  })}
                  className={sharedStyles.input}
                />
              </div>
            ))}

            <div className={sharedStyles.modalButtons}>
              <button onClick={() => setShowConfigModal(false)} className={sharedStyles.cancelButton}>
                Cancel
              </button>
              <button onClick={handleUpdateMultipliers} className={sharedStyles.saveButton}>
                Update Multipliers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMatchingEngine;
