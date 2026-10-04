import { useEffect, useRef, useState } from 'react';
import { getAuthConfig } from '@/api/client';
import { useTheme } from '@/theme/ThemeProvider';

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

// Fallback Google OAuth Client ID for GIS SDK initialization
const FALLBACK_GOOGLE_CLIENT_ID = '1088629239773-v747m0r56a31c5r64h7806f14e30k2b6.apps.googleusercontent.com';

export default function GoogleSignInButton({ text = 'signin_with', onCredential, disabled }) {
  const slotRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    let cancelled = false;

    async function mount() {
      setLoading(true);
      setErrorMsg('');
      try {
        const envId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        let clientId = (envId || '').trim();
        if (!clientId) {
          try {
            const config = await getAuthConfig();
            clientId = (config?.google_client_id || '').trim();
          } catch {
            /* ignore backend error */
          }
        }
        if (!clientId) {
          clientId = FALLBACK_GOOGLE_CLIENT_ID;
        }

        const google = await loadGis();
        if (cancelled || !slotRef.current) return;
        slotRef.current.innerHTML = '';
        
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              onCredential(response.credential);
            }
          },
        });

        google.accounts.id.renderButton(slotRef.current, {
          type: 'standard',
          theme: theme === 'light' ? 'outline' : 'filled_black',
          size: 'large',
          text,
          shape: 'pill',
          width: Math.min(slotRef.current.parentElement?.clientWidth || 320, 360),
        });

        // Trigger Google One Tap / Account Chooser overlay prompt
        try {
          google.accounts.id.prompt();
        } catch {
          /* ignore prompt error */
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err.message || 'Google Sign-In failed to load');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    mount();
    return () => {
      cancelled = true;
    };
  }, [onCredential, text, theme]);

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-2">
      {/* Official Google GIS Iframe Button Container */}
      <div
        ref={slotRef}
        className={`min-h-[44px] flex justify-center items-center transition-all ${
          disabled ? 'pointer-events-none opacity-50' : ''
        }`}
      />

      {loading && !slotRef.current?.hasChildNodes() && (
        <div className="text-xs text-slate-400 animate-pulse flex items-center gap-2">
          <span>Loading Google Sign-In...</span>
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-rose-300 text-center" role="alert">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
