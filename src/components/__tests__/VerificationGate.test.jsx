import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VerificationGate from '../../components/VerificationGate.jsx';

// Mocks
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockedUser })
}));

jest.mock('../../services/api.service', () => ({
  client: {
    get: jest.fn(() => Promise.resolve({ data: { csrProfile: { verificationStatus: 'verified' } } }))
  }
}));

let mockedUser = null;

describe('VerificationGate', () => {
  beforeEach(() => {
    // Reset localStorage userType before each test
    try { localStorage.removeItem('userType'); } catch {}
    mockedUser = null;
    jest.clearAllMocks();
  });

  it('renders children immediately for non-business users (bypass gating)', async () => {
    // Simulate regular user
    mockedUser = { isBusiness: false };
    try { localStorage.setItem('userType', 'user'); } catch {}

    render(
      <VerificationGate>
        <div data-testid="content">content</div>
      </VerificationGate>
    );

    // Should render without waiting
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('enforces verification for business users (pending -> disabled)', async () => {
    // Simulate business user
    mockedUser = { isBusiness: true };
    try { localStorage.setItem('userType', 'business'); } catch {}

    // Override API to return pending
    const api = require('../../services/api.service');
    api.client.get.mockResolvedValueOnce({ data: { csrProfile: { verificationStatus: 'pending' } } });

    render(
      <VerificationGate>
        <button>Protected Action</button>
      </VerificationGate>
    );

    await waitFor(() => {
      // Banner should appear for pending
      expect(screen.getByText(/Pending verification/i)).toBeInTheDocument();
    });
  });

  it('allows actions when business is verified', async () => {
    mockedUser = { isBusiness: true };
    try { localStorage.setItem('userType', 'business'); } catch {}

    const api = require('../../services/api.service');
    api.client.get.mockResolvedValueOnce({ data: { csrProfile: { verificationStatus: 'verified' } } });

    render(
      <VerificationGate>
        <div data-testid="verified">ok</div>
      </VerificationGate>
    );

    await waitFor(() => {
      expect(screen.getByTestId('verified')).toBeInTheDocument();
    });
  });
});
