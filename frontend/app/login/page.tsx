'use client';
import { FormEvent, useState } from 'react';
import { api } from '../../lib/api';
import type { User, UserResult } from '../../lib/types';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = mode === 'login'
        ? await api<UserResult>('/user/login', { method: 'PUT', body: JSON.stringify({ email, password }) })
        : await api<UserResult>('/user', { method: 'POST', body: JSON.stringify({ name, email, password }) });
      // user-service reports failures like "Invalid email or password" with a 200 and no user.
      if (!result.user) throw new Error(result.message);
      setUser(result.user); setPassword('');
    } catch (err) { setError((err as Error).message); setUser(null); }
    finally { setBusy(false); }
  }

  return <><div className="eyebrow">USER SERVICE</div><h1>{mode === 'login' ? 'Login' : 'Register'}</h1>
    <div className="two-column"><section className="panel">
      <form onSubmit={submit}>
        {mode === 'register' && <label>Name<input required value={name} onChange={e => setName(e.target.value)} placeholder="Sara Ahmed" /></label>}
        <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="sara@example.com" /></label>
        <label>Password<input type="password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
        <button disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}</button>
        <button type="button" className="secondary" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          {mode === 'login' ? 'No account? Register' : 'Have an account? Login'}
        </button>
      </form></section>
      <section className="panel"><h2>Account</h2>
        {user ? <ul className="items"><li><div><strong>{user.name}</strong><small>#{user.id} · {user.email}</small></div></li></ul>
          : <p className="muted">Not logged in.</p>}
      </section></div>{error && <p className="error" role="alert">{error}</p>}</>;
}
