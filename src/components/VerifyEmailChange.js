import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiServices from '../services/api.service';
import { createLogger } from '../utils/logger';
import styles from './VerifyEmailChange.module.css';

const logger = createLogger('VerifyEmailChange');

const VerifyEmailChange = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState({ status: 'loading', message: 'Verifying email change...' });

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (!token) {
          setState({ status: 'error', message: 'Invalid verification link (missing token).' });
          return;
        }
        const api = apiServices.client;
        const { data } = await api.post('/api/users/change-email/verify', { token });
        if (data && (data.success || data.message)) {
          setState({ status: 'success', message: data.message || 'Email changed successfully.' });
        } else {
          setState({ status: 'success', message: 'Email changed successfully.' });
        }
      } catch (error) {
        logger.error('Email change verification failed', { status: error.response?.status, message: error.message });
        const msg = error.response?.data?.message || 'Verification failed. Your link may have expired or was already used.';
        setState({ status: 'error', message: msg });
      }
    };
    run();
  }, [location]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {state.status === 'loading' && (
          <>
            <h2>Verifying your email change…</h2>
            <p>Please wait a moment.</p>
          </>
        )}
        {state.status === 'success' && (
          <>
            <h2>Email Updated</h2>
            <p>{state.message}</p>
            <button className={styles.primary} onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          </>
        )}
        {state.status === 'error' && (
          <>
            <h2>Verification Failed</h2>
            <p>{state.message}</p>
            <button className={styles.secondary} onClick={() => navigate('/settings')}>Back to Settings</button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailChange;

