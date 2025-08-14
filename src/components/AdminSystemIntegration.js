import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaServer, 
  FaEnvelope, 
  FaCreditCard, 
  FaDatabase, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaTimesCircle,
  FaSync,
  FaWifi,
  FaClock,
  FaChartLine,
  FaKey
} from 'react-icons/fa';
import styles from './AdminSharedStyles.module.css';
import integrationStyles from './AdminSystemIntegration.module.css';

const AdminSystemIntegration = () => {
  const { user } = useAuth();
  const [services, setServices] = useState({
    database: { status: 'checking', message: '', lastChecked: null },
    email: { status: 'checking', message: '', lastChecked: null },
    payment: { status: 'checking', message: '', lastChecked: null },
    websocket: { status: 'checking', message: '', lastChecked: null },
    redis: { status: 'checking', message: '', lastChecked: null },
    openai: { status: 'checking', message: '', lastChecked: null }
  });
  const [emailStats, setEmailStats] = useState({
    processed: 0,
    failed: 0,
    queued: 0,
    avgProcessingTime: 0
  });
  const [wsConnections, setWsConnections] = useState({
    active: 0,
    peak: 0,
    messagesPerMinute: 0
  });
  const [apiKeys, setApiKeys] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [newApiKey, setNewApiKey] = useState('');

  const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

  useEffect(() => {
    checkAllServices();
    const interval = setInterval(checkAllServices, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkAllServices = async () => {
    try {
      setRefreshing(true);
      
      // Check MongoDB
      checkService('database', '/api/health/database');
      
      // Check Email Service (AWS SES)
      checkService('email', '/api/health/email');
      
      // Check Payment Service (Stripe)
      checkService('payment', '/api/health/payment');
      
      // Check WebSocket
      checkService('websocket', '/api/health/websocket');
      
      // Check Redis
      checkService('redis', '/api/health/redis');
      
      // Check OpenAI
      checkService('openai', '/api/health/openai');
      
      // Fetch additional stats
      fetchEmailStats();
      fetchWebSocketStats();
      fetchApiKeyStatus();
      
    } catch (error) {
      console.error('Error checking services:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const checkService = async (serviceName, endpoint) => {
    try {
      const response = await axios.get(
        `${apiUrl}${endpoint}`,
        {
          headers: { 'x-auth-token': user.token },
          timeout: 10000
        }
      );
      
      setServices(prev => ({
        ...prev,
        [serviceName]: {
          status: response.data.status || 'operational',
          message: response.data.message || 'Service is operational',
          lastChecked: new Date(),
          details: response.data.details
        }
      }));
    } catch (error) {
      setServices(prev => ({
        ...prev,
        [serviceName]: {
          status: 'error',
          message: error.response?.data?.message || `Failed to connect to ${serviceName}`,
          lastChecked: new Date(),
          error: error.message
        }
      }));
    }
  };

  const fetchEmailStats = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/admin/integrations/email-stats`,
        {
          headers: { 'x-auth-token': user.token }
        }
      );
      setEmailStats(response.data);
    } catch (error) {
      console.error('Error fetching email stats:', error);
    }
  };

  const fetchWebSocketStats = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/admin/integrations/websocket-stats`,
        {
          headers: { 'x-auth-token': user.token }
        }
      );
      setWsConnections(response.data);
    } catch (error) {
      console.error('Error fetching WebSocket stats:', error);
    }
  };

  const fetchApiKeyStatus = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/admin/integrations/api-keys`,
        {
          headers: { 'x-auth-token': user.token }
        }
      );
      setApiKeys(response.data);
    } catch (error) {
      console.error('Error fetching API key status:', error);
    }
  };

  const handleUpdateApiKey = async () => {
    try {
      await axios.post(
        `${apiUrl}/api/admin/integrations/api-keys/${selectedService}`,
        { apiKey: newApiKey },
        {
          headers: { 'x-auth-token': user.token }
        }
      );
      alert(`${selectedService} API key updated successfully`);
      setShowApiKeyModal(false);
      setNewApiKey('');
      setSelectedService('');
      checkAllServices();
    } catch (error) {
      console.error('Error updating API key:', error);
      alert('Failed to update API key');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <FaCheckCircle className="text-success" />;
      case 'degraded':
        return <FaExclamationTriangle className="color-hex-f59e0b" />;
      case 'error':
        return <FaTimesCircle className="color-hex-ef4444" />;
      default:
        return <FaSync className={styles.spinner} className="color-hex-3b82f6" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return '#10b981';
      case 'degraded':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  };

  const serviceIcons = {
    database: <FaDatabase />,
    email: <FaEnvelope />,
    payment: <FaCreditCard />,
    websocket: <FaWifi />,
    redis: <FaServer />,
    openai: <FaChartLine />
  };

  const serviceNames = {
    database: 'MongoDB Database',
    email: 'AWS SES Email Service',
    payment: 'Stripe Payment Processing',
    websocket: 'WebSocket Server',
    redis: 'Redis Cache',
    openai: 'OpenAI API'
  };

  return (
    <div className={styles.managementContainer}>
      <div className={integrationStyles.header}>
        <h2 className={styles.managementTitle}>System Integration Monitoring</h2>
        <button
          onClick={checkAllServices}
          disabled={refreshing}
          className={`${styles.button} ${styles.primaryButton}`}
        >
          <FaSync className={refreshing ? styles.spinner : ''} /> Refresh Status
        </button>
      </div>

      {/* Service Status Grid */}
      <div className={integrationStyles.servicesGrid}>
        {Object.entries(services).map(([key, service]) => (
          <div key={key} className={integrationStyles.serviceCard}>
            <div className={integrationStyles.serviceHeader}>
              <div className={integrationStyles.serviceTitle}>
                {serviceIcons[key]}
                <span>{serviceNames[key]}</span>
              </div>
              {getStatusIcon(service.status)}
            </div>
            
            <div className={integrationStyles.serviceStatus}>
              <span 
                className={integrationStyles.statusBadge}
                style={{ backgroundColor: getStatusColor(service.status) }}
              >
                {service.status.toUpperCase()}
              </span>
            </div>

            <p className={integrationStyles.serviceMessage}>{service.message}</p>
            
            {service.lastChecked && (
              <div className={integrationStyles.lastChecked}>
                <FaClock />
                <span>Last checked: {new Date(service.lastChecked).toLocaleTimeString()}</span>
              </div>
            )}

            {service.details && (
              <div className={integrationStyles.serviceDetails}>
                {Object.entries(service.details).map(([detailKey, detailValue]) => (
                  <div key={detailKey} className={integrationStyles.detailItem}>
                    <span className={integrationStyles.detailKey}>{detailKey}:</span>
                    <span className={integrationStyles.detailValue}>{detailValue}</span>
                  </div>
                ))}
              </div>
            )}

            {(key === 'openai' || key === 'payment' || key === 'email') && (
              <button
                onClick={() => {
                  setSelectedService(key);
                  setShowApiKeyModal(true);
                }}
                className={integrationStyles.configButton}
              >
                <FaKey /> Configure API Key
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Statistics Section */}
      <div className={integrationStyles.statsSection}>
        <div className={styles.card}>
          <h3>Email Processing Statistics</h3>
          <div className={integrationStyles.statsGrid}>
            <div className={integrationStyles.statItem}>
              <span className={integrationStyles.statLabel}>Processed</span>
              <span className={integrationStyles.statValue}>{emailStats.processed}</span>
            </div>
            <div className={integrationStyles.statItem}>
              <span className={integrationStyles.statLabel}>Failed</span>
              <span className={integrationStyles.statValue} className="color-hex-ef4444">
                {emailStats.failed}
              </span>
            </div>
            <div className={integrationStyles.statItem}>
              <span className={integrationStyles.statLabel}>Queued</span>
              <span className={integrationStyles.statValue}>{emailStats.queued}</span>
            </div>
            <div className={integrationStyles.statItem}>
              <span className={integrationStyles.statLabel}>Avg Processing Time</span>
              <span className={integrationStyles.statValue}>
                {emailStats.avgProcessingTime.toFixed(2)}s
              </span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h3>WebSocket Connections</h3>
          <div className={integrationStyles.statsGrid}>
            <div className={integrationStyles.statItem}>
              <span className={integrationStyles.statLabel}>Active Connections</span>
              <span className={integrationStyles.statValue}>{wsConnections.active}</span>
            </div>
            <div className={integrationStyles.statItem}>
              <span className={integrationStyles.statLabel}>Peak Today</span>
              <span className={integrationStyles.statValue}>{wsConnections.peak}</span>
            </div>
            <div className={integrationStyles.statItem}>
              <span className={integrationStyles.statLabel}>Messages/Min</span>
              <span className={integrationStyles.statValue}>{wsConnections.messagesPerMinute}</span>
            </div>
          </div>
        </div>
      </div>

      {/* API Configuration Table */}
      <div className={styles.card}>
        <h3>API Configuration Status</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Service</th>
              <th>API Key Status</th>
              <th>Last Updated</th>
              <th>Environment</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(apiKeys).map(([service, info]) => (
              <tr key={service}>
                <td>{service.toUpperCase()}</td>
                <td>
                  <span className={`${styles.statusBadge} ${info.configured ? styles.active : styles.inactive}`}>
                    {info.configured ? 'Configured' : 'Not Configured'}
                  </span>
                </td>
                <td>{info.lastUpdated ? new Date(info.lastUpdated).toLocaleDateString() : 'Never'}</td>
                <td>{info.environment || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* API Key Configuration Modal */}
      {showApiKeyModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Configure {selectedService.toUpperCase()} API Key</h3>
            
            <div className={styles.formGroup}>
              <label>API Key</label>
              <input
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                className={styles.input}
                placeholder="Enter new API key..."
              />
            </div>

            <div className={integrationStyles.apiKeyWarning}>
              <FaExclamationTriangle />
              <p>Warning: Updating API keys will affect all active integrations. Ensure you have the correct key before proceeding.</p>
            </div>

            <div className={styles.modalButtons}>
              <button 
                onClick={() => { 
                  setShowApiKeyModal(false); 
                  setNewApiKey('');
                  setSelectedService('');
                }} 
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateApiKey} 
                className={styles.saveButton}
                disabled={!newApiKey}
              >
                Update API Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSystemIntegration;