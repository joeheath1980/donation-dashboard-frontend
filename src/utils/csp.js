// Utilities for CSP nonce handling and JSON-LD enablement

export const getCspNonce = () => {
  try {
    const meta = document.querySelector('meta[name="csp-nonce"], meta[property="csp-nonce"]');
    return meta?.getAttribute('content') || null;
  } catch {
    return null;
  }
};

export const isJsonLdEnabled = () => {
  try {
    const v = process.env.REACT_APP_ENABLE_JSON_LD;
    return String(v).toLowerCase() === 'true';
  } catch {
    return false;
  }
};

