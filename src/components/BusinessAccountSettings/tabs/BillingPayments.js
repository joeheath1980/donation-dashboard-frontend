import React, { useState, useEffect } from 'react';
import { businessAccountService } from '../../../services/businessAccountService';
import { toast } from 'react-toastify';
import styles from './BillingPayments.module.css';

function BillingPayments({ paymentMethods: initialMethods, onUpdate }) {
  const [paymentMethods, setPaymentMethods] = useState(initialMethods || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await businessAccountService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Use dummy data for demo
      setPaymentMethods([
        {
          id: '1',
          type: 'card',
          brand: 'Visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2025,
          isDefault: true
        },
        {
          id: '2',
          type: 'card',
          brand: 'Mastercard',
          last4: '5555',
          expMonth: 6,
          expYear: 2024,
          isDefault: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      await businessAccountService.setDefaultPaymentMethod(methodId);
      toast.success('Default payment method updated');
      fetchPaymentMethods();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to update default payment method');
    }
  };

  const handleRemoveMethod = async (methodId) => {
    const method = paymentMethods.find(m => m.id === methodId);
    
    if (method?.isDefault) {
      toast.error('Cannot remove default payment method. Please set another method as default first.');
      return;
    }

    if (!window.confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      await businessAccountService.removePaymentMethod(methodId);
      toast.success('Payment method removed successfully');
      fetchPaymentMethods();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error removing payment method:', error);
      toast.error('Failed to remove payment method');
    }
  };

  const getCardIcon = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      case 'discover': return '💳';
      default: return '💳';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2>Payment Methods</h2>
          <p className={styles.subtitle}>Manage your payment methods for donations and subscriptions</p>
        </div>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddModal(true)}
        >
          + Add Payment Method
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading payment methods...</div>
      ) : paymentMethods.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💳</div>
          <h3>No payment methods</h3>
          <p>Add a payment method to start processing donations</p>
          <button 
            className={styles.addButton}
            onClick={() => setShowAddModal(true)}
          >
            Add Your First Payment Method
          </button>
        </div>
      ) : (
        <div className={styles.paymentMethodsList}>
          {paymentMethods.map(method => (
            <div key={method.id} className={styles.paymentMethodCard}>
              <div className={styles.cardInfo}>
                <div className={styles.cardIcon}>{getCardIcon(method.brand)}</div>
                <div className={styles.cardDetails}>
                  {method.type === 'card' ? (
                    <>
                      <div className={styles.cardNumber}>
                        <span className={styles.brand}>{method.brand}</span>
                        <span className={styles.last4}>•••• {method.last4}</span>
                      </div>
                      <div className={styles.cardExpiry}>
                        Expires {method.expMonth}/{method.expYear}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.cardNumber}>
                        <span className={styles.brand}>Bank Account</span>
                        <span className={styles.last4}>•••• {method.last4}</span>
                      </div>
                      <div className={styles.cardExpiry}>
                        {method.bankName}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className={styles.cardActions}>
                {method.isDefault && (
                  <span className={styles.defaultBadge}>Default</span>
                )}
                {!method.isDefault && (
                  <button 
                    className={styles.setDefaultButton}
                    onClick={() => handleSetDefault(method.id)}
                  >
                    Set as Default
                  </button>
                )}
                <button 
                  className={styles.removeButton}
                  onClick={() => handleRemoveMethod(method.id)}
                  title="Remove payment method"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.section}>
        <h2>Billing History</h2>
        <div className={styles.comingSoon}>
          <div className={styles.comingSoonIcon}>📊</div>
          <h3>Coming Soon</h3>
          <p>View your complete billing history, download invoices, and track spending</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Billing Information</h2>
        <div className={styles.billingInfo}>
          <div className={styles.infoRow}>
            <label>Billing Email</label>
            <span>billing@company.com</span>
            <button className={styles.editButton}>Edit</button>
          </div>
          <div className={styles.infoRow}>
            <label>Billing Address</label>
            <span>123 Main St, City, State 12345</span>
            <button className={styles.editButton}>Edit</button>
          </div>
          <div className={styles.infoRow}>
            <label>Tax ID</label>
            <span>Not provided</span>
            <button className={styles.editButton}>Add</button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddPaymentModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchPaymentMethods();
            if (onUpdate) onUpdate();
          }}
        />
      )}
    </div>
  );
}

function AddPaymentModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Note: In a real implementation, you would integrate Stripe Elements here
    // to securely collect card details and get a payment method ID
    
    toast.info('Stripe integration required for adding payment methods');
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Add Payment Method</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.stripeNotice}>
            <div className={styles.noticeIcon}>ℹ️</div>
            <div>
              <h4>Stripe Integration Required</h4>
              <p>To add payment methods securely, Stripe Elements needs to be integrated. This ensures PCI compliance and secure card handling.</p>
              <p className={styles.noticeSubtext}>
                Please contact your development team to complete the Stripe setup.
              </p>
            </div>
          </div>
          
          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BillingPayments;