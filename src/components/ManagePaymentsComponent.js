import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import DropIn from 'braintree-web-drop-in-react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';
const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;

console.log('API_URL:', API_URL);
console.log('PayPal Client ID:', PAYPAL_CLIENT_ID);

// Error Boundary Component
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
      return <h3>Sorry, there was a problem loading the PayPal button.</h3>;
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
          axios.get(`${API_URL}/api/braintree/client_token`),
          axios.get(`${API_URL}/api/charity`) // Updated from '/api/charities' to '/api/charity'
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
        const response = await axios.post(`${API_URL}/api/braintree/checkout`, {
          paymentMethodNonce: nonce,
          amount: amount,
          charityId: selectedCharity
        });
        if (response.data.success) {
          alert('Payment successful!');
          // Handle successful payment (e.g., update UI, clear form)
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
    console.log('Creating PayPal order');
    const validAmount = validateAndFormatAmount(amount);
    if (!validAmount) {
      console.error('Invalid amount:', amount);
      return Promise.reject(new Error('Invalid amount'));
    }
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: validAmount,
          },
        },
      ],
    });
  };

  const onApprove = async (data, actions) => {
    console.log('PayPal payment approved');
    try {
      const details = await actions.order.capture();
      console.log('Order captured:', details);
      const response = await axios.post(`${API_URL}/api/paypal/capture-order`, {
        orderId: data.orderID,
        charityId: selectedCharity
      });
      if (response.data.success) {
        alert('Payment successful!');
        // Handle successful payment (e.g., update UI, clear form)
      } else {
        console.error('Backend reported payment failure:', response.data);
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      alert('An error occurred while processing the PayPal payment. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (charities.length === 0) {
    return <div>No charities available. Please check back later.</div>;
  }

  const paypalOptions = {
    "client-id": PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  };

  const isAmountValid = validateAndFormatAmount(amount) !== null;

  return (
    <div>
      <h2>Manage Payments</h2>
      <div>
        <label htmlFor="amount">Amount: </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          step="0.01"
          min="0.01"
        />
      </div>
      <div>
        <label htmlFor="charity">Select Charity: </label>
        <select
          id="charity"
          value={selectedCharity}
          onChange={(e) => setSelectedCharity(e.target.value)}
        >
          <option value="">Select a charity</option>
          {charities.map((charity) => (
            <option key={charity.id} value={charity.id}>
              {charity.name}
            </option>
          ))}
        </select>
      </div>
      <h3>Pay with Credit Card</h3>
      {clientToken ? (
        <DropIn
          options={{
            authorization: clientToken,
            paypal: false
          }}
          onInstance={(dropinInstance) => setInstance(dropinInstance)}
        />
      ) : (
        <div>Loading payment options...</div>
      )}
      <button onClick={handleBraintreePayment} disabled={!instance || !isAmountValid || !selectedCharity}>
        Pay with Credit Card
      </button>
      <h3>Pay with PayPal</h3>
      {PAYPAL_CLIENT_ID ? (
        <ErrorBoundary>
          <PayPalScriptProvider options={paypalOptions}>
            <PayPalButtons 
              createOrder={createOrder} 
              onApprove={onApprove} 
              disabled={!isAmountValid || !selectedCharity}
              style={{ layout: "horizontal" }}
            />
          </PayPalScriptProvider>
        </ErrorBoundary>
      ) : (
        <div>
          PayPal Client ID not configured. Please check your environment variables.
          <br />
          Make sure REACT_APP_PAYPAL_CLIENT_ID is set in your .env file and that you've restarted your development server after making changes.
        </div>
      )}
      <div>
        <h3>Test Credit Card Numbers:</h3>
        <ul>
          <li>Visa: 4111 1111 1111 1111</li>
          <li>MasterCard: 5555 5555 5555 4444</li>
          <li>American Express: 3714 496353 98431</li>
        </ul>
        <p>Use any future expiration date and any CVV.</p>
      </div>
    </div>
  );
};

export default ManagePaymentsComponent;