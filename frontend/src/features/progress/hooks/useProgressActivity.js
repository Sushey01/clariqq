import { useEffect, useState } from 'react';
import { getProgressActivity } from '@/api/client';
import { getAccessToken } from '@/auth/storage';

export default function useProgressActivity(weeks = 53) {
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    if (!getAccessToken()) return undefined;
    let cancelled = false;
    getProgressActivity(weeks)
      .then((data) => {
        if (!cancelled) setActivity(data);
      })
      .catch(() => {
        if (!cancelled) setActivity(null);
      });
    return () => {
      cancelled = true;
    };
  }, [weeks]);

  return activity;
}
