import React from 'react';
import { apiClient } from '../services/api.service';

// Renders a button styled like other action buttons that downloads CSR report.
// Tries signed URL first; falls back to local download.
export default function CSRDownloadButton({ className = '', label = 'Download CSR Report', children }) {
  const handleClick = async () => {
    try {
      // 1) Try signed URL (S3)
      const urlRes = await apiClient.get('/api/business/onboarding/csr-report/url');
      const data = urlRes?.data;
      if (data && data.url) {
        window.open(data.url, '_blank', 'noopener');
        return;
      }
    } catch {}

    try {
      // 2) Fallback to local download
      const dlRes = await apiClient.get('/api/business/onboarding/csr-report/download', { responseType: 'blob' });
      const blob = dlRes.data;
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = 'csr-report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (e) {
      alert('Could not download CSR report.');
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children || label}
    </button>
  );
}
