import { useEffect, useState } from 'react';
import { getHealth } from '@/api/client';

export function useBackendHealth(intervalMs = 15000) {
  const [health, setHealth] = useState({
    status: 'unknown',
    detail: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function ping() {
      try {
        const data = await getHealth();
        if (!cancelled) {
          setHealth({
            status: data.status === 'ok' ? 'ok' : 'not_ready',
            detail: data.detail ?? null,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setHealth({
            status: 'offline',
            detail: error.message,
          });
        }
      }
    }

    ping();
    const timer = setInterval(ping, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [intervalMs]);

  return health;
}
