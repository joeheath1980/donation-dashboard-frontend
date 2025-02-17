import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import DropIn from 'braintree-web-drop-in-react';
import sharedStyles from './SharedStyles.css';
import styles from './PaymentStyles.module.css';

const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PayPal Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h3 className={sharedStyles.error}>Sorry, there was a problem loading the PayPal button.</h3>;
    }
    return this.props.children;
  }
}

const ManagePaymentsComponent = () => {
  const [clientToken, setClientToken] = useState(null);
  const [instance, setInstance] = useState(null);
  const [amount, setAmount] = useState('');
  const [selectedCharity, setSelectedCharity] = useState('');
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tokenResponse, charitiesResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/braintree/client_token`),
          axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/charities`)
        ]);
        setClientToken(tokenResponse.data.clientToken);
        setCharities(charitiesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load necessary data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBraintreePayment = async () => {
    if (instance) {
      try {
        const { nonce } = await instance.requestPaymentMethod();
        const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/braintree/checkout`, {
          paymentMethodNonce: nonce,
          amount: amount,
          charityId: selectedCharity
        });
        if (response.data.success) {
          alert('Payment successful!');
        } else {
          alert('Payment failed. Please try again.');
        }
      } catch (error) {
        console.error('Payment error:', error);
        alert('An error occurred while processing the payment. Please try again.');
      }
    }
  };

  const validateAndFormatAmount = (value) => {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
      return null;
    }
    return numericValue.toFixed(2);
  };

  const createOrder = (data, actions) => {
    const validAmount = validateAndFormatAmount(amount);
    if (!validAmount) {
      return Promise.reject(new Error('Invalid amount'));
    }
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: validAmount,
        },
      }],
    });
  };

  const onApprove = async (data, actions) => {
    try {
      await actions.order.capture();
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002'}/api/paypal/capture-order`, {
        orderId: data.orderID,
        charityId: selectedCharity
      });
      if (response.data.success) {
        alert('Payment successful!');
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      alert('An error occurred while processing the PayPal payment. Please try again.');
    }
  };

  if (loading) {
    return <div className={styles.loadingContainer}>Loading...</div>;
  }

  if (error) {
    return <div className={sharedStyles.error}>{error}</div>;
  }

  if (charities.length === 0) {
    return <div className={styles.message}>No charities available. Please check back later.</div>;
  }

  const paypalOptions = {
    "client-id": PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  };

  const isAmountValid = validateAndFormatAmount(amount) !== null;

  return (
    <div className={sharedStyles.container}>
      <h1 className={sharedStyles.heading}>Make a Donation</h1>

      <div className={`${sharedStyles.card} ${styles.formLayout}`}>
        <div className={sharedStyles.formGroup}>
          <label htmlFor="amount" className={sharedStyles.label}>Donation Amount</label>
          <div className={styles.inputGroup}>
            <span className={styles.currencySymbol}>$</span>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              step="0.01"
              min="0.01"
              className={sharedStyles.input}
            />
          </div>
        </div>

        <div className={sharedStyles.formGroup}>
          <label htmlFor="charity" className={sharedStyles.label}>Select Charity</label>
          <select
            id="charity"
            value={selectedCharity}
            onChange={(e) => setSelectedCharity(e.target.value)}
            className={sharedStyles.select}
          >
            <option value="">Select a charity</option>
            {charities.map((charity) => (
              <option key={charity.id} value={charity.id}>
                {charity.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`${sharedStyles.card} ${styles.paymentSection}`}>
        <h2 className={sharedStyles.subheading}>Credit Card Payment</h2>
        {clientToken ? (
          <>
            <div className={styles.dropInContainer}>
              <DropIn
                options={{
                  authorization: clientToken,
                  paypal: false
                }}
                onInstance={(dropinInstance) => setInstance(dropinInstance)}
              />
            </div>
            <button
              onClick={handleBraintreePayment}
              disabled={!instance || !isAmountValid || !selectedCharity}
              className={sharedStyles.button}
            >
              Complete Donation
            </button>
          </>
        ) : (
          <div className={styles.message}>Loading payment options...</div>
        )}
      </div>

      <div className={`${sharedStyles.card} ${styles.paymentSection}`}>
        <h2 className={sharedStyles.subheading}>PayPal Payment</h2>
        {PAYPAL_CLIENT_ID ? (
          <ErrorBoundary>
            <div className={styles.paypalContainer}>
              <PayPalScriptProvider options={paypalOptions}>
                <PayPalButtons
                  createOrder={createOrder}
                  onApprove={onApprove}
                  disabled={!isAmountValid || !selectedCharity}
                  style={{ layout: "horizontal" }}
                />
              </PayPalScriptProvider>
            </div>
          </ErrorBoundary>
        ) : (
          <div className={sharedStyles.error}>
            PayPal integration is currently unavailable. Please try another payment method.
          </div>
        )}
      </div>

      <div className={`${sharedStyles.card} ${styles.infoSection}`}>
        <h3 className={sharedStyles.subheading}>Test Payment Information</h3>
        <ul className={styles.list}>
          <li>Visa: 4111 1111 1111 1111</li>
          <li>MasterCard: 5555 5555 5555 4444</li>
          <li>American Express: 3714 496353 98431</li>
        </ul>
        <p className={styles.note}>Use any future expiration date and any CVV for testing.</p>
      </div>
    </div>
  );
};

export default ManagePaymentsComponent;