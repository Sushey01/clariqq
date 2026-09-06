import { useEffect, useRef, useState } from 'react';
import { getAuthConfig } from '@/api/client';

function loadGis() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    const script = existing || document.createElement('script');
    script.addEventListener('load', () => {
      if (window.google?.accounts?.id) resolve(window.google);
      else reject(new Error('Google sign-in failed to load.'));
    });
    script.addEventListener('error', () => reject(new Error('Google sign-in failed to load.')));
    if (!existing) {
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

export default function GoogleSignInButton({ text = 'signin_with', onCredential, disabled }) {
  const slotRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function mount() {
      setError('');
      try {
        const envId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const config = envId ? { google_client_id: envId } : await getAuthConfig();
        const clientId = (config.google_client_id || '').trim();
        if (!clientId) {
          throw new Error('GOOGLE_CLIENT_ID is missing. Save it in the repo-root .env file.');
        }
        const google = await loadGis();
        if (cancelled || !slotRef.current) return;
        slotRef.current.innerHTML = '';
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) onCredential(response.credential);
          },
        });
        google.accounts.id.renderButton(slotRef.current, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          text,
          shape: 'pill',
          width: Math.min(slotRef.current.parentElement?.clientWidth || 320, 400),
        });
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    }

    mount();
    return () => {
      cancelled = true;
    };
  }, [onCredential, text]);

  return (
    <div className="space-y-2">
      <div ref={slotRef} className={disabled ? 'pointer-events-none opacity-50' : ''} />
      {error && (
        <p className="text-xs text-rose-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
