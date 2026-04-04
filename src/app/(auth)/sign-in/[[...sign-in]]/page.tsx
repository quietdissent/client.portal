'use client';

import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const S = {
  card: {
    background: '#EDECEA',
    border: '1px solid #D8D6D1',
    borderRadius: '6px',
    padding: '2rem',
    width: '100%',
    boxSizing: 'border-box',
  } as React.CSSProperties,

  input: {
    width: '100%',
    background: '#F5F4EF',
    border: '1px solid #D8D6D1',
    borderRadius: '6px',
    padding: '10px 12px',
    fontSize: '14px',
    color: '#1A1A1A',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
  } as React.CSSProperties,

  btnPrimary: {
    width: '100%',
    background: '#5F8575',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '14px',
    fontFamily: 'inherit',
    fontWeight: 500,
    cursor: 'pointer',
    boxSizing: 'border-box',
  } as React.CSSProperties,

  btnGoogle: {
    width: '100%',
    background: '#fff',
    color: '#1A1A1A',
    border: '1px solid #D8D6D1',
    borderRadius: '6px',
    padding: '10px 16px',
    fontSize: '14px',
    fontFamily: 'inherit',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxSizing: 'border-box',
  } as React.CSSProperties,
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function SignInPage() {
  const { signIn } = useSignIn();
  const router = useRouter();

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    const { error: err } = await signIn.sso({
      strategy: 'oauth_google',
      redirectCallbackUrl: window.location.origin + '/sso-callback',
      redirectUrl: '/portal/dashboard',
    });
    if (err) {
      setError(err.longMessage ?? err.message);
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: createErr } = await signIn.create({ identifier: email });
    if (createErr) {
      setError(createErr.longMessage ?? createErr.message);
      setLoading(false);
      return;
    }

    const { error: sendErr } = await signIn.emailCode.sendCode({ emailAddress: email });
    if (sendErr) {
      setError(sendErr.longMessage ?? sendErr.message);
      setLoading(false);
      return;
    }

    setStep('code');
    setLoading(false);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: verifyErr } = await signIn.emailCode.verifyCode({ code });
    if (verifyErr) {
      setError(verifyErr.longMessage ?? verifyErr.message);
      setLoading(false);
      return;
    }

    const { error: finalizeErr } = await signIn.finalize();
    if (finalizeErr) {
      setError(finalizeErr.longMessage ?? finalizeErr.message);
      setLoading(false);
      return;
    }

    router.push('/portal/dashboard');
  };

  return (
    <>
      <div className="mb-8 text-center">
        <h1
          className="text-3xl tracking-tight"
          style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', color: '#1A1A1A' }}
        >
          Quiet Dissent
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ fontFamily: 'var(--font-dm-mono), monospace', color: '#7A7875' }}
        >
          Client Portal
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        <div style={S.card}>
          {step === 'email' ? (
            <>
              <button onClick={handleGoogle} disabled={loading} style={S.btnGoogle} type="button">
                <GoogleIcon />
                Continue with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#D8D6D1' }} />
                <span style={{ fontSize: '12px', color: '#7A7875' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: '#D8D6D1' }} />
              </div>

              <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={S.input}
                />
                <button type="submit" disabled={loading} style={S.btnPrimary}>
                  {loading ? 'Sending…' : 'Continue'}
                </button>
              </form>
            </>
          ) : (
            <>
              <p style={{ fontSize: '14px', color: '#4A4A4A', marginBottom: '16px' }}>
                We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
              </p>

              <form onSubmit={handleCodeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  style={S.input}
                />
                <button type="submit" disabled={loading} style={S.btnPrimary}>
                  {loading ? 'Verifying…' : 'Verify'}
                </button>
              </form>

              <button
                onClick={() => { setStep('email'); setError(''); setCode(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#7A7875', marginTop: '12px', padding: 0 }}
                type="button"
              >
                ← Back
              </button>
            </>
          )}

          {error && (
            <p style={{ fontSize: '13px', color: '#C0392B', marginTop: '12px' }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
