'use client';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Course } from '../../lib/types';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [id, setId] = useState('');
  const [found, setFound] = useState<Course | null>(null);
  const [editing, setEditing] = useState<Course | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try { setCourses(await api<Course[]>('/course/all')); setError(''); }
    catch (err) { setError((err as Error).message); }
  }
  useEffect(() => { void load(); }, []);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setFound(null);
    try { setFound(await api<Course>(`/course/${encodeURIComponent(id)}`)); }
    catch (err) { setError((err as Error).message); }
  }

  function startEdit(course: Course) {
    setEditing(course); setName(course.name); setPrice(String(course.price)); setError('');
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    try {
      await api(`/course/${editing.id}`, { method: 'PUT', body: JSON.stringify({ name, price: Number(price) }) });
      setEditing(null); setFound(null); await load();
    } catch (err) { setError((err as Error).message); }
  }

  async function remove(course: Course) {
    if (!confirm(`Delete course "${course.name}"?`)) return;
    try {
      await api(`/course/${course.id}`, { method: 'DELETE' });
      if (editing?.id === course.id) setEditing(null);
      if (found?.id === course.id) setFound(null);
      await load();
    } catch (err) { setError((err as Error).message); }
  }

  const actions = (course: Course) => <div className="actions">
    <button className="secondary" onClick={() => startEdit(course)}>Edit</button>
    <button className="danger" onClick={() => remove(course)}>Delete</button>
  </div>;

  return <><div className="eyebrow">COURSE SERVICE</div><h1>Courses</h1>
    <div className="two-column"><section className="panel">
      {editing ? <><h2>Edit course #{editing.id}</h2>
        <form onSubmit={save}>
          <label>Name<input required value={name} onChange={e => setName(e.target.value)} /></label>
          <label>Price<input type="number" min="0" step="any" required value={price} onChange={e => setPrice(e.target.value)} /></label>
          <button>Save</button>
          <button type="button" className="secondary" onClick={() => setEditing(null)}>Cancel</button>
        </form></>
      : <><h2>Find course by id</h2>
        <form onSubmit={search}><label>Course id<input type="number" min="1" required value={id} onChange={e => setId(e.target.value)} placeholder="1" /></label>
        <button>Search</button></form>
        {found && <ul className="items"><li><div><strong>{found.name}</strong><small>#{found.id} · {found.price}</small></div>{actions(found)}</li></ul>}</>}
      </section>
      <section className="panel"><div className="section-head"><h2>All courses</h2><button className="secondary" onClick={load}>Refresh</button></div>
      {courses.length ? <ul className="items">{courses.map(course => <li key={course.id}><div><strong>{course.name}</strong><small>#{course.id} · {course.price}</small></div>{actions(course)}</li>)}</ul> : <p className="muted">No courses found.</p>}
      </section></div>{error && <p className="error" role="alert">{error}</p>}</>;
}
