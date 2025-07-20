import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { 
  FaCreditCard, 
  FaUniversity, 
  FaPlus, 
  FaTrash, 
  FaStar,
  FaCheck 
} from 'react-icons/fa';
import styles from './PaymentMethods.module.css';
import api from '../../services/api.service';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [defaultMethodId, setDefaultMethodId] = useState(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payment-methods');
      setPaymentMethods(response.data.paymentMethods || []);
      setDefaultMethodId(response.data.defaultMethodId);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      await api.post(`/payment-methods/${methodId}/set-default`);
      setDefaultMethodId(methodId);
      // Update local state
      setPaymentMethods(methods => 
        methods.map(method => ({
          ...method,
          isDefault: method.id === methodId
        }))
      );
    } catch (error) {
      console.error('Error setting default payment method:', error);
      alert('Failed to set default payment method');
    }
  };

  const handleDelete = async (methodId) => {
    if (!window.confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      await api.delete(`/payment-methods/${methodId}`);
      setPaymentMethods(methods => methods.filter(m => m.id !== methodId));
    } catch (error) {
      console.error('Error deleting payment method:', error);
      alert('Failed to delete payment method');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading payment methods...</div>;
  }

  return (
    <div className={styles.paymentMethods}>
      <div className={styles.header}>
        <h2>Payment Methods</h2>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
        >
          <FaPlus /> Add Payment Method
        </button>
      </div>

      {paymentMethods.length === 0 ? (
        <div className={styles.empty}>
          <p>No payment methods saved</p>
          <p>Add a payment method to make donations faster and easier</p>
        </div>
      ) : (
        <div className={styles.methodsList}>
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              isDefault={method.id === defaultMethodId}
              onSetDefault={handleSetDefault}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showAddForm && (
        <AddPaymentMethodModal
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setShowAddForm(false);
            fetchPaymentMethods();
          }}
        />
      )}
    </div>
  );
};

// Payment Method Card Component
const PaymentMethodCard = ({ method, isDefault, onSetDefault, onDelete }) => {
  const getIcon = () => {
    if (method.type === 'card') return <FaCreditCard />;
    if (method.type === 'bank_account') return <FaUniversity />;
    return null;
  };

  const getBrandLogo = (brand) => {
    const brandLogos = {
      visa: '/card-logos/visa.svg',
      mastercard: '/card-logos/mastercard.svg',
      amex: '/card-logos/amex.svg',
      discover: '/card-logos/discover.svg'
    };
    return brandLogos[brand?.toLowerCase()];
  };

  return (
    <div className={`${styles.methodCard} ${isDefault ? styles.default : ''}`}>
      <div className={styles.methodIcon}>
        {getIcon()}
      </div>
      
      <div className={styles.methodInfo}>
        <div className={styles.methodMain}>
          {method.type === 'card' && getBrandLogo(method.brand) && (
            <img 
              src={getBrandLogo(method.brand)} 
              alt={method.brand} 
              className={styles.brandLogo}
            />
          )}
          <span className={styles.methodBrand}>
            {method.brand || method.bank_name || 'Payment Method'}
          </span>
          <span className={styles.methodLast4}>
            •••• {method.last4}
          </span>
          {method.type === 'card' && (
            <span className={styles.methodExpiry}>
              Exp: {method.exp_month}/{method.exp_year}
            </span>
          )}
        </div>
        
        {isDefault && (
          <div className={styles.defaultBadge}>
            <FaStar /> Default
          </div>
        )}
      </div>

      <div className={styles.methodActions}>
        {!isDefault && (
          <button
            className={styles.setDefaultButton}
            onClick={() => onSetDefault(method.id)}
          >
            Set as Default
          </button>
        )}
        <button
          className={styles.deleteButton}
          onClick={() => onDelete(method.id)}
          aria-label="Delete payment method"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

// Add Payment Method Modal
const AddPaymentMethodModal = ({ onClose, onSuccess }) => {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setupPaymentMethod();
  }, []);

  const setupPaymentMethod = async () => {
    try {
      const response = await api.post('/payment-methods/setup-intent');
      setClientSecret(response.data.clientSecret);
    } catch (error) {
      console.error('Error setting up payment method:', error);
      alert('Failed to initialize payment setup');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Add Payment Method</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {loading ? (
          <div className={styles.loading}>Setting up payment...</div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <AddPaymentForm onSuccess={onSuccess} onClose={onClose} />
          </Elements>
        ) : (
          <div className={styles.error}>Failed to initialize payment setup</div>
        )}
      </div>
    </div>
  );
};

// Add Payment Form Component
const AddPaymentForm = ({ onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: setupError } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment-methods',
        },
        redirect: 'if_required'
      });

      if (setupError) {
        throw new Error(setupError.message);
      }

      // If we get here, the setup was successful
      onSuccess();
    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.addPaymentForm}>
      <PaymentElement 
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'bank'],
          fields: {
            billingDetails: {
              address: 'auto'
            }
          }
        }}
      />

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onClose}
          disabled={processing}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.saveButton}
          disabled={!stripe || processing}
        >
          {processing ? 'Saving...' : 'Save Payment Method'}
        </button>
      </div>
    </form>
  );
};

export default PaymentMethods;