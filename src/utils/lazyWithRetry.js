// Lazy loader with retry to mitigate transient ChunkLoadError during HMR or cache issues
import { lazy } from 'react';

export default function lazyWithRetry(factory, { retries = 2, retryDelay = 500 } = {}) {
  let attempt = 0;

  const load = () =>
    factory().catch((err) => {
      // Only retry on ChunkLoadError-like failures
      const name = err?.name || '';
      const message = String(err?.message || '');
      const isChunkError =
        name === 'ChunkLoadError' ||
        message.includes('ChunkLoadError') ||
        message.includes('Loading chunk');

      if (isChunkError && attempt < retries) {
        attempt += 1;
        return new Promise((resolve) => setTimeout(resolve, retryDelay)).then(load);
      }

      // Last resort: force reload to refresh manifest
      if (isChunkError && typeof window !== 'undefined') {
        // Delay slightly to allow UX message if any
        setTimeout(() => window.location.reload(), 300);
      }
      throw err;
    });

  return lazy(load);
}

