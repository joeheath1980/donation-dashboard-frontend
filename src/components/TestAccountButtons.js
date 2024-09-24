// src/components/TestAccountButtons.js

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from '../SignUp.module.css'; // Make sure to import the correct CSS module

const TestAccountButtons = () => {
  const {
    createTestUserAccount,
    createTestBusinessAccount,
    createTestAdminAccount,
    createTestCharityAccount,
    fillTestUserCredentials,
    fillTestBusinessCredentials,
    fillTestAdminCredentials,
    fillTestCharityCredentials
  } = useAuth();

  return (
    <div className={styles.testButtons}>
      <button onClick={fillTestUserCredentials}>
        Fill Test User Credentials
      </button>
      <button onClick={fillTestBusinessCredentials}>
        Fill Test Business Credentials
      </button>
      <button onClick={fillTestAdminCredentials}>
        Fill Test Admin Credentials
      </button>
      <button onClick={fillTestCharityCredentials}>
        Fill Test Charity Credentials
      </button>
      <button onClick={createTestUserAccount}>
        Create Test User Account
      </button>
      <button onClick={createTestBusinessAccount}>
        Create Test Business Account
      </button>
      <button onClick={createTestAdminAccount}>
        Create Test Admin Account
      </button>
      <button onClick={createTestCharityAccount}>
        Create Test Charity Account
      </button>
    </div>
  );
};

export default TestAccountButtons;