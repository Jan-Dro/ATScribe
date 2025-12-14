import { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import type { PlatformType, FillResult } from '../shared/types';

function Popup() {
  const [platform, setPlatform] = useState<PlatformType>('generic');
  const [filling, setFilling] = useState(false);
  const [result, setResult] = useState<FillResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectPlatform();
  }, []);

  async function detectPlatform() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      const response = await chrome.tabs.sendMessage(tab.id, { type: 'DETECT_PLATFORM' });
      setPlatform(response.platform);
    } catch (err) {
      console.error('Failed to detect platform:', err);
    }
  }

  async function handleFillPage() {
    setFilling(true);
    setResult(null);
    setError(null);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) {
        throw new Error('No active tab found');
      }

      const response = await chrome.tabs.sendMessage(tab.id, { type: 'FILL_PAGE' });

      if (response.success) {
        setResult(response.result);
      } else {
        setError(response.result.errors.join(', '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fill page');
    } finally {
      setFilling(false);
    }
  }

  function handleOpenOptions() {
    chrome.runtime.openOptionsPage();
  }

  return (
    <div>
      <h1>Job Autofill</h1>

      <div className="platform">
        Detected: <strong>{platform}</strong>
      </div>

      <button
        className="primary-btn"
        onClick={handleFillPage}
        disabled={filling}
      >
        {filling ? 'Filling...' : 'Fill This Page'}
      </button>

      <button className="secondary-btn" onClick={handleOpenOptions}>
        Open Options
      </button>

      {result && (
        <div className={`status ${result.errors.length > 0 ? 'error' : 'success'}`}>
          <strong>Result:</strong>
          <div className="status-log">
            <div>Filled: {result.filled} fields</div>
            <div>Skipped: {result.skipped} fields</div>
            {result.errors.length > 0 && (
              <div>Errors: {result.errors.join(', ')}</div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="status error">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
