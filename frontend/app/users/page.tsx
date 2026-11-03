'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { User, UserResult, UsersResult } from '../../lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [id, setId] = useState('');
  const [found, setFound] = useState<User | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try { setUsers((await api<UsersResult>('/user')).users); setError(''); }
    catch (err) { setError((err as Error).message); }
  }
  useEffect(() => { void load(); }, []);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setFound(null);
    try {
      const result = await api<UserResult>(`/user/${encodeURIComponent(id)}`);
      // user-service answers "User not found" with a 200 and no user.
      if (!result.user) throw new Error(result.message);
      setFound(result.user);
    } catch (err) { setError((err as Error).message); }
  }

  function startEdit(user: User) {
    setEditing(user); setName(user.name); setEmail(user.email); setPassword(''); setError('');
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    try {
      // Password is only sent when a new one was typed.
      const changes = password ? { name, email, password } : { name, email };
      const result = await api<UserResult>(`/user/${editing.id}`, { method: 'PUT', body: JSON.stringify(changes) });
      if (!result.user) throw new Error(result.message);
      setEditing(null); setFound(null); await load();
    } catch (err) { setError((err as Error).message); }
  }

  async function remove(user: User) {
    if (!confirm(`Delete user "${user.name}"?`)) return;
    try {
      await api(`/user/${user.id}`, { method: 'DELETE' });
      if (editing?.id === user.id) setEditing(null);
      if (found?.id === user.id) setFound(null);
      await load();
    } catch (err) { setError((err as Error).message); }
  }

  const actions = (user: User) => <div className="actions">
    <button className="secondary" onClick={() => startEdit(user)}>Edit</button>
    <button className="danger" onClick={() => remove(user)}>Delete</button>
  </div>;

  return <><div className="eyebrow">USER SERVICE</div><h1>Users</h1>
    <div className="two-column"><section className="panel">
      {editing ? <><h2>Edit user #{editing.id}</h2>
        <form onSubmit={save}>
          <label>Name<input required minLength={3} value={name} onChange={e => setName(e.target.value)} /></label>
          <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
          <label>New password<input type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave empty to keep current" /></label>
          <button>Save</button>
          <button type="button" className="secondary" onClick={() => setEditing(null)}>Cancel</button>
        </form></>
      : <><h2>Find user by id</h2>
        <form onSubmit={search}><label>User id<input type="number" min="1" required value={id} onChange={e => setId(e.target.value)} placeholder="1" /></label>
        <button>Search</button></form>
        {found && <ul className="items"><li><div><strong>{found.name}</strong><small>#{found.id} · {found.email}</small></div>{actions(found)}</li></ul>}</>}
      </section>
      <section className="panel"><div className="section-head"><h2>All users</h2><button className="secondary" onClick={load}>Refresh</button></div>
      {users.length ? <ul className="items">{users.map(user => <li key={user.id}><div><strong>{user.name}</strong><small>#{user.id} · {user.email}</small></div>{actions(user)}</li>)}</ul> : <p className="muted">No users found.</p>}
      </section></div>{error && <p className="error" role="alert">{error}</p>}</>;
}
