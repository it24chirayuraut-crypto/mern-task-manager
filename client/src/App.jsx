import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [filter, setFilter] = useState('all');
  const [msg, setMsg] = useState({ text: '', error: false });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`${API}/api/tasks`);
      if (!res.ok) throw new Error();
      setTasks(await res.json());
    } catch {
      setMsg({ text: 'Cannot reach the server.', error: true });
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (!res.ok) throw new Error();
      setTitle('');
      setMsg({ text: 'Added to your list.', error: false });
      await load();
    } catch {
      setMsg({ text: 'Could not add the task.', error: true });
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (t) => {
    await fetch(`${API}/api/tasks/${t._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !t.done }),
    });
    load();
  };

  const remove = async (id) => {
    await fetch(`${API}/api/tasks/${id}`, { method: 'DELETE' });
    setMsg({ text: 'Task removed.', error: false });
    load();
  };

  const doneCount = tasks.filter((t) => t.done).length;
  const percent = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;
  const shown = tasks.filter((t) =>
    filter === 'all' ? true : filter === 'done' ? t.done : !t.done
  );

  return (
    <div className="wrap">
      <div className="top">
        <h1>To<span>.</span>Do</h1>
        <div className="counter">{doneCount} of {tasks.length} done</div>
      </div>

      <div className="progress"><div style={{ width: `${percent}%` }} /></div>

      <form className="add" onSubmit={add}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing today?"
        />
        <button disabled={saving}>{saving ? '...' : 'Add'}</button>
      </form>
      {msg.text && <p className={`msg ${msg.error ? 'error' : ''}`}>{msg.text}</p>}

      <div className="tabs">
        {['all', 'active', 'done'].map((f) => (
          <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="empty">Nothing here yet.</div>
      ) : (
        shown.map((t) => (
          <div className={`item ${t.done ? 'done' : ''}`} key={t._id}>
            <input type="checkbox" checked={t.done} onChange={() => toggle(t)} />
            <div className="text">
              <p className="title">{t.title}</p>
              <p className="when">{new Date(t.createdAt).toLocaleString()}</p>
            </div>
            <button className="x" onClick={() => remove(t._id)} aria-label="Delete">×</button>
          </div>
        ))
      )}
    </div>
  );
}