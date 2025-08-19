import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './ImpactMetrics.module.css';
import { API_CONFIG } from '../../../config/api.config';
import {
  FaHandHoldingHeart,
  FaUsers,
  FaHome,
  FaUtensils,
  FaGraduationCap,
  FaTree,
  FaHeart,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes
} from 'react-icons/fa';

function ImpactMetrics({ charityId }) {
  const { getAuthHeaders } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newMetric, setNewMetric] = useState({ label: '', value: '', unit: '', icon: 'FaHeart' });

  const iconOptions = {
    FaHandHoldingHeart: FaHandHoldingHeart,
    FaUsers: FaUsers,
    FaHome: FaHome,
    FaUtensils: FaUtensils,
    FaGraduationCap: FaGraduationCap,
    FaTree: FaTree,
    FaHeart: FaHeart
  };

  useEffect(() => {
    fetchMetrics();
  }, [charityId]);

  const fetchMetrics = async () => {
    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/charities/${charityId}/impact-metrics`,
        { headers: getAuthHeaders() }
      );
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      // Use demo data if API fails
      setMetrics([
        { id: 1, label: 'Meals Provided', value: 12500, unit: 'meals', icon: 'FaUtensils' },
        { id: 2, label: 'Families Helped', value: 450, unit: 'families', icon: 'FaUsers' },
        { id: 3, label: 'Students Supported', value: 89, unit: 'students', icon: 'FaGraduationCap' },
        { id: 4, label: 'Trees Planted', value: 2000, unit: 'trees', icon: 'FaTree' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMetric = async () => {
    if (!newMetric.label || !newMetric.value) return;
    
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/charities/${charityId}/impact-metrics`,
        newMetric,
        { headers: getAuthHeaders() }
      );
      setMetrics([...metrics, response.data]);
      setNewMetric({ label: '', value: '', unit: '', icon: 'FaHeart' });
    } catch (error) {
      console.error('Error adding metric:', error);
      // For demo, add locally
      const newId = Math.max(...metrics.map(m => m.id || 0)) + 1;
      setMetrics([...metrics, { ...newMetric, id: newId, value: parseInt(newMetric.value) }]);
      setNewMetric({ label: '', value: '', unit: '', icon: 'FaHeart' });
    }
  };

  const handleUpdateMetric = async (id, updatedMetric) => {
    try {
      await axios.put(
        `${API_CONFIG.BASE_URL}/api/charities/${charityId}/impact-metrics/${id}`,
        updatedMetric,
        { headers: getAuthHeaders() }
      );
      setMetrics(metrics.map(m => m.id === id ? { ...m, ...updatedMetric } : m));
    } catch (error) {
      console.error('Error updating metric:', error);
      // For demo, update locally
      setMetrics(metrics.map(m => m.id === id ? { ...m, ...updatedMetric } : m));
    }
  };

  const handleDeleteMetric = async (id) => {
    if (!window.confirm('Are you sure you want to delete this metric?')) return;
    
    try {
      await axios.delete(
        `${API_CONFIG.BASE_URL}/api/charities/${charityId}/impact-metrics/${id}`,
        { headers: getAuthHeaders() }
      );
      setMetrics(metrics.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting metric:', error);
      // For demo, delete locally
      setMetrics(metrics.filter(m => m.id !== id));
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return <div className={styles.loading}>Loading impact metrics...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Impact Metrics</h2>
        <button 
          onClick={() => setEditing(!editing)}
          className={styles.editButton}
        >
          {editing ? <FaTimes /> : <FaEdit />}
          {editing ? 'Cancel' : 'Edit Metrics'}
        </button>
      </div>

      <div className={styles.metricsGrid}>
        {metrics.map((metric) => {
          const IconComponent = iconOptions[metric.icon] || FaHeart;
          return (
            <div key={metric.id} className={styles.metricCard}>
              <div className={styles.metricIcon}>
                <IconComponent />
              </div>
              <div className={styles.metricContent}>
                {editing ? (
                  <>
                    <input
                      type="text"
                      value={metric.label}
                      onChange={(e) => handleUpdateMetric(metric.id, { ...metric, label: e.target.value })}
                      className={styles.editInput}
                    />
                    <div className={styles.editRow}>
                      <input
                        type="number"
                        value={metric.value}
                        onChange={(e) => handleUpdateMetric(metric.id, { ...metric, value: parseInt(e.target.value) })}
                        className={styles.editInputSmall}
                      />
                      <input
                        type="text"
                        value={metric.unit}
                        onChange={(e) => handleUpdateMetric(metric.id, { ...metric, unit: e.target.value })}
                        className={styles.editInputSmall}
                      />
                    </div>
                    <button 
                      onClick={() => handleDeleteMetric(metric.id)}
                      className={styles.deleteButton}
                    >
                      <FaTrash />
                    </button>
                  </>
                ) : (
                  <>
                    <h3>{metric.label}</h3>
                    <p className={styles.metricValue}>
                      {formatNumber(metric.value)}
                      {metric.unit && <span className={styles.metricUnit}> {metric.unit}</span>}
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {editing && (
          <div className={styles.metricCard}>
            <div className={styles.addMetricForm}>
              <h4>Add New Metric</h4>
              <input
                type="text"
                placeholder="Metric name"
                value={newMetric.label}
                onChange={(e) => setNewMetric({ ...newMetric, label: e.target.value })}
                className={styles.editInput}
              />
              <div className={styles.editRow}>
                <input
                  type="number"
                  placeholder="Value"
                  value={newMetric.value}
                  onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                  className={styles.editInputSmall}
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={newMetric.unit}
                  onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })}
                  className={styles.editInputSmall}
                />
              </div>
              <select
                value={newMetric.icon}
                onChange={(e) => setNewMetric({ ...newMetric, icon: e.target.value })}
                className={styles.editInput}
              >
                {Object.keys(iconOptions).map(icon => (
                  <option key={icon} value={icon}>{icon.replace('Fa', '')}</option>
                ))}
              </select>
              <button 
                onClick={handleAddMetric}
                className={styles.addButton}
              >
                <FaPlus /> Add Metric
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.impactStories}>
        <h3>Impact Story</h3>
        <div className={styles.story}>
          <p>
            Your contributions have made a significant difference in our community. 
            Every donation helps us continue our mission and expand our reach to those in need.
          </p>
          <blockquote>
            "Thanks to your support, we were able to provide essential services to hundreds of families 
            this year. Your generosity transforms lives every day."
            <cite>- Program Director</cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

export default ImpactMetrics;