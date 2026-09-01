import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Button, Input } from '@/components/ui';

export default function AuthForm({ mode, onSubmit }) {
  const isSignup = mode === 'signup';
  const formRef = useRef(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  useGSAP(
    () => {
      gsap.from('.auth-item', {
        y: 22,
        opacity: 0,
        duration: 0.55,
        stagger: 0.07,
        ease: 'power3.out',
      });
    },
    { scope: formRef, dependencies: [mode] }
  );

  const update = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (isSignup && values.password !== values.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (values.password.length < 6) {
      setError('Use at least 6 characters for the password.');
      return;
    }

    setPending(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err.message);
      gsap.fromTo(
        formRef.current,
        { x: -8 },
        { x: 0, duration: 0.35, ease: 'elastic.out(1, 0.5)' }
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {isSignup && (
        <label className="auth-item block space-y-1.5">
          <span className="text-xs text-zinc-400">Name</span>
          <Input
            required
            placeholder="Your name"
            value={values.name}
            onChange={update('name')}
            className="bg-[#2f2f2f] py-2.5 text-sm"
          />
        </label>
      )}

      <label className="auth-item block space-y-1.5">
        <span className="text-xs text-zinc-400">Email</span>
        <Input
          required
          type="email"
          placeholder="you@school.edu"
          value={values.email}
          onChange={update('email')}
          className="bg-[#2f2f2f] py-2.5 text-sm"
        />
      </label>

      <label className="auth-item block space-y-1.5">
        <span className="text-xs text-zinc-400">Password</span>
        <Input
          required
          type="password"
          placeholder="At least 6 characters"
          value={values.password}
          onChange={update('password')}
          className="bg-[#2f2f2f] py-2.5 text-sm"
        />
      </label>

      {isSignup && (
        <label className="auth-item block space-y-1.5">
          <span className="text-xs text-zinc-400">Confirm password</span>
          <Input
            required
            type="password"
            placeholder="Repeat password"
            value={values.confirm}
            onChange={update('confirm')}
            className="bg-[#2f2f2f] py-2.5 text-sm"
          />
        </label>
      )}

      {error && (
        <p className="auth-item text-xs text-rose-300" role="alert">
          {error}
        </p>
      )}

      <div className="auth-item pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={pending}
          className="w-full rounded-full py-3 text-sm"
        >
          {pending ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}
        </Button>
      </div>

      <p className="auth-item text-center text-xs text-zinc-500">
        Accounts are stored in this browser only until backend auth is added.
      </p>

      <p className="auth-item text-center text-sm text-zinc-400">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <Link to="/login" className="text-white hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{' '}
            <Link to="/signup" className="text-white hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
