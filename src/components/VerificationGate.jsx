import React, { useEffect, useState } from 'react';
import apiServices from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';
import { USER_TYPES, STORAGE_KEYS } from '../config/api.config';

// Simple wrapper to gate child actions until business verification is complete
// Props:
// - children: node to render when verified
// - fallback: node to render when pending (optional)
// - showBanner: whether to render a small pending banner (default true)
// - inlineDisable: if true, wraps children in a disabled-looking span when pending
export default function VerificationGate({ children, fallback = null, showBanner = true, inlineDisable = true }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'verified' | 'pending' | 'unknown'
  const { user } = useAuth();

  // Determine if the current session is a business account
  const userType = (() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.USER_TYPE);
    } catch {
      return null;
    }
  })();
  const isBusiness = user?.isBusiness || userType === USER_TYPES.BUSINESS;

  useEffect(() => {
    let cancelled = false;

    // Only fetch business verification status for business accounts
    if (!isBusiness) {
      setStatus('verified'); // Bypass gating for non-business users
      return () => { cancelled = true; };
    }

    const fetchStatus = async () => {
      try {
        const res = await apiServices.client.get('/api/business/me');
        const ver = res?.data?.csrProfile?.verificationStatus || 'pending';
        if (!cancelled) setStatus(ver === 'verified' ? 'verified' : 'pending');
      } catch {
        if (!cancelled) setStatus('unknown');
      }
    };
    fetchStatus();
    return () => { cancelled = true; };
  }, [isBusiness]);

  if (status === 'loading') return null;
  const isVerified = status === 'verified';

  if (isVerified) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  const Disabled = (
    <span style={{ pointerEvents: 'none', opacity: 0.6, cursor: 'not-allowed' }}>
      {children}
    </span>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {inlineDisable ? Disabled : null}
      {showBanner && (
        <div style={{
          padding: '8px 10px', background: '#fff4e5', border: '1px solid #ffd8a8', borderRadius: 8,
          color: '#92400e', fontSize: 13
        }}>
          Pending verification: Your business account is being reviewed. You can browse but cannot create campaigns yet.
        </div>
      )}
    </div>
  );
}
