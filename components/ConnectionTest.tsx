import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function ConnectionTest() {
  const [status, setStatus] = useState('⏳ Connecting...');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        // First attempt
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for cold starts

        const response = await fetch(`${API_BASE_URL}/health`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setStatus(`✅ Connected - ${data.status || 'OK'}`);
        } else {
          setStatus(`⚠️ Backend responded with ${response.status}`);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          setStatus('⏳ Backend starting (cold start)...');
          // Retry after cold start delay
          setTimeout(() => checkBackend(), 3000);
        } else {
          console.error('Backend connection error:', error);
          setStatus('❌ Cannot connect to backend');
        }
      }
    };

    checkBackend();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-surface border border-border rounded-lg px-4 py-2 text-sm shadow-lg">
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-xs">Backend:</span>
        <span className="text-slate-200">{status}</span>
      </div>
      <div className="text-[10px] text-slate-500 mt-1">
        {API_BASE_URL}
      </div>
    </div>
  );
}
