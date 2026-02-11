'use client';

import { useState } from 'react';

export default function TestPushButton() {
  const [status, setStatus] = useState<string>('');

  const sendTestPush = async () => {
    setStatus('Sending...');
    try {
      const res = await fetch('/api/notifications/test', { method: 'POST' });
      const data = await res.json() as { message?: string; error?: string };
      setStatus(data.message ?? data.error ?? 'Done');
    } catch (e) {
      setStatus('Error: ' + String(e));
    }
  };

  return (
    <div style={{ padding: 20, border: '1px solid #ccc', borderRadius: 8, margin: 20 }}>
      <button onClick={sendTestPush} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Send Test Push
      </button>
      {status && <p style={{ marginTop: 10 }}>{status}</p>}
    </div>
  );
}
