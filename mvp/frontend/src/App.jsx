import React, { useState } from 'react';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export function App() {
  const [form, setForm] = useState({
    leadName: '',
    businessName: 'Demo SMB',
    leadSource: 'missed_call',
    serviceType: 'consultation'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submitLead(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch(`${API}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await r.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <h1>LeadRescue AI — MVP Dashboard</h1>
      <form onSubmit={submitLead}>
        {Object.keys(form).map((k) => (
          <label key={k}>
            {k}
            <input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          </label>
        ))}
        <button disabled={loading}>{loading ? 'Processing...' : 'Process Lead'}</button>
      </form>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}
