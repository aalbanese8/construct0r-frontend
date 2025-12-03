import { useEffect, useState } from 'react';

export function ConnectionTest() {
  const [status, setStatus] = useState('checking...');

  useEffect(() => {
    fetch('http://localhost:3001/health')
      .then(res => res.json())
      .then(data => setStatus(`✅ Connected! ${data.status}`))
      .catch(() => setStatus('❌ Cannot connect to backend'));
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-surface border border-border rounded-lg px-4 py-2 text-sm">
      Backend Status: {status}
    </div>
  );
}
