import React, { useState, useEffect } from 'react';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { stripePromise } from '../utils/stripe';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './SharedStyles.css';
import styles from './PaymentStyles.module.css';
import { FaCreditCard, FaTrash, FaPlus, FaCheck, FaSpinner } from 'react-icons/fa';
import { API_CONFIG } from '../config/api.config';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Payment Methods List Component
const PaymentMethodsList = ({ methods, onRemove, onSetDefault, defaultMethodId, loading }) => {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <p>Loading payment methods...</p>
      </div>
    );
  }

  if (!methods || methods.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FaCreditCard className={styles.emptyIcon} />
        <p>No payment methods saved</p>
        <p className={styles.emptyDescription}>Add a payment method to make donations easier</p>
      </div>
    );
  }

  return (
    <div className={styles.methodsList}>
      {methods.map((method) => (
        <div key={method.id} className={`${styles.methodCard} ${method.id === defaultMethodId ? styles.defaultMethod : ''}`}>
          <div className={styles.methodInfo}>
            <FaCreditCard className={styles.cardIcon} />
            <div className={styles.methodDetails}>
              <span className={styles.cardBrand}>{method.card.brand.toUpperCase()}</span>
              <span className={styles.cardLast4}>•••• {method.card.last4}</span>
              <span className={styles.cardExpiry}>Expires {method.card.exp_month}/{method.card.exp_year}</span>
            </div>
            {method.id === defaultMethodId && (
              <span className={styles.defaultBadge}>
                <FaCheck /> Default
              </span>
            )}
          </div>
          <div className={styles.methodActions}>
            {method.id !== defaultMethodId && (
              <button
                onClick={() => onSetDefault(method.id)}
                className={styles.actionButton}
                title="Set as default"
              >
                Set Default
              </button>
            )}
            <button
              onClick={() => onRemove(method.id)}
              className={`${styles.actionButton} ${styles.deleteButton}`}
              title="Remove payment method"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Add Payment Method Form Component
const AddPaymentMethodForm = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user, getAuthHeaders } = useAuth();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create a SetupIntent when component mounts
    const createSetupIntent = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/stripe/create-setup-intent`,
          {},
          { headers: getAuthHeaders() }
        );
        setClientSecret(response.data.clientSecret);
      } catch (err) {
        console.error('Error creating setup intent:', err);
        setError('Failed to initialize payment form');
      }
    };

    createSetupIntent();
  }, [getAuthHeaders]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: confirmError } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/manage-payments`,
        },
        redirect: 'if_required'
      });

      if (confirmError) {
        setError(confirmError.message);
      } else {
        // Payment method added successfully
        onSuccess();
      }
    } catch (err) {
      console.error('Error confirming setup:', err);
      setError('Failed to add payment method');
    } finally {
      setProcessing(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className={styles.loadingContainer}>
        <FaSpinner className={styles.spinner} />
        <p>Initializing payment form...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <form onSubmit={handleSubmit} className={styles.paymentForm}>
        <PaymentElement />
        {error && <div className={styles.errorMessage}>{error}</div>}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={`${styles.button} ${styles.secondaryButton}`}
            disabled={processing}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${styles.button} ${styles.primaryButton}`}
            disabled={!stripe || processing}
          >
            {processing ? (
              <>
                <FaSpinner className={styles.buttonSpinner} />
                Adding...
              </>
            ) : (
              'Add Payment Method'
            )}
          </button>
        </div>
      </form>
    </Elements>
  );
};

// Main Component
const ManagePaymentsComponent = () => {
  const { user, getAuthHeaders } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [defaultMethodId, setDefaultMethodId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchPaymentMethods();
  }, [refreshKey]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/stripe/payment-methods`,
        { headers: getAuthHeaders() }
      );
      
      setPaymentMethods(response.data.paymentMethods || []);
      setDefaultMethodId(response.data.defaultMethodId);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMethod = async (methodId) => {
    if (!window.confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      await axios.delete(
        `${API_BASE_URL}/api/stripe/payment-methods/${methodId}`,
        { headers: getAuthHeaders() }
      );
      
      // Refresh the list
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Error removing payment method:', err);
      alert('Failed to remove payment method');
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/stripe/payment-methods/${methodId}/set-default`,
        {},
        { headers: getAuthHeaders() }
      );
      
      setDefaultMethodId(methodId);
    } catch (err) {
      console.error('Error setting default payment method:', err);
      alert('Failed to set default payment method');
    }
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container">
      <h1 className="heading">Manage Payment Methods</h1>
      
      {error && (
        <div className={`alert error`}>
          {error}
        </div>
      )}

      <div className="card">
        <div className={styles.cardHeader}>
          <h2 className="cardTitle">Your Payment Methods</h2>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className={`button primary`}
            >
              <FaPlus /> Add Payment Method
            </button>
          )}
        </div>

        {showAddForm ? (
          <AddPaymentMethodForm
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <PaymentMethodsList
            methods={paymentMethods}
            onRemove={handleRemoveMethod}
            onSetDefault={handleSetDefault}
            defaultMethodId={defaultMethodId}
            loading={loading}
          />
        )}
      </div>

      <div className="card">
        <h3 className="cardTitle">About Payment Methods</h3>
        <div className={styles.infoSection}>
          <p>• Payment methods are securely stored by Stripe</p>
          <p>• Your card details are never stored on our servers</p>
          <p>• You can remove payment methods at any time</p>
          <p>• Set a default payment method for faster donations</p>
        </div>
      </div>
    </div>
  );
};

export default ManagePaymentsComponent;