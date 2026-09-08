import { CheckCircle2, MapPin, Monitor, RefreshCcw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import Toast from '../../components/common/Toast.jsx';
import { useApi } from '../../hooks/useApi.js';
import { terminalService } from '../../services/terminalService.js';
import { clearKioskTerminal, getKioskTerminal, setKioskTerminal } from '../../utils/storage.js';

function getSafeNext(value) {
  if (!value || value === '/kiosk/setup') return '/kiosk/smiley';
  return value.startsWith('/kiosk/') ? value : '/kiosk/smiley';
}

export default function KioskSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTerminal = getKioskTerminal();
  const [selectedCode, setSelectedCode] = useState(currentTerminal?.terminalCode || '');
  const [message, setMessage] = useState('');
  const { data, loading, error, reload } = useApi(() => terminalService.list(), []);
  const terminals = data || [];
  const selectedTerminal = useMemo(
    () => terminals.find(terminal => terminal.terminal_code === selectedCode),
    [terminals, selectedCode],
  );

  function saveTerminal(event) {
    event.preventDefault();
    if (!selectedTerminal) {
      setMessage('Please select the terminal for this tablet.');
      return;
    }
    setKioskTerminal(selectedTerminal);
    navigate(getSafeNext(searchParams.get('next')), { replace: true });
  }

  function removeSetup() {
    clearKioskTerminal();
    setSelectedCode('');
    setMessage('Tablet setup was cleared.');
  }

  return (
    <section className="kiosk-panel kiosk-setup-panel">
      <div className="kiosk-heading">
        <span className="kiosk-eyebrow">Tablet Setup</span>
        <h1>Choose this tablet</h1>
        <p>Select the terminal once on this device. Votes from this tablet will be tagged with that terminal and its assigned location/departments.</p>
      </div>

      <form className="setup-card" onSubmit={saveTerminal}>
        {currentTerminal ? (
          <div className="setup-current">
            <CheckCircle2 size={22} aria-hidden="true" />
            <div>
              <strong>Current tablet: {currentTerminal.terminalCode}</strong>
              <span>{currentTerminal.name}{currentTerminal.locationName ? ' · ' + currentTerminal.locationName : ''}</span>
            </div>
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="kiosk-terminal">Terminal</label>
          <select
            id="kiosk-terminal"
            value={selectedCode}
            onChange={event => setSelectedCode(event.target.value)}
            disabled={loading}
          >
            <option value="">Select terminal</option>
            {terminals.map(terminal => (
              <option key={terminal.id} value={terminal.terminal_code}>
                {terminal.terminal_code} — {terminal.name}{terminal.location_name ? ' · ' + terminal.location_name : ''}
              </option>
            ))}
          </select>
          <p className="field-hint">This setting is saved only in this tablet browser.</p>
        </div>

        {selectedTerminal ? (
          <div className="terminal-preview">
            <span><Monitor size={18} aria-hidden="true" /> {selectedTerminal.name}</span>
            <span><MapPin size={18} aria-hidden="true" /> {selectedTerminal.location_name || 'No location name'}</span>
          </div>
        ) : null}

        {loading ? <Loading label="Loading terminals" /> : null}
        {error ? <div className="empty-state">{error}</div> : null}
        {!loading && !error && !terminals.length ? <div className="empty-state">No active terminals found. Add terminals in Admin first.</div> : null}

        <div className="button-row">
          <Button type="submit" icon={CheckCircle2} disabled={loading || !selectedTerminal}>Save Tablet</Button>
          <Button type="button" variant="secondary" icon={RefreshCcw} onClick={() => reload().catch(() => {})} disabled={loading}>Refresh</Button>
          {currentTerminal ? <Button type="button" variant="danger" icon={Trash2} onClick={removeSetup}>Clear</Button> : null}
        </div>
      </form>

      <Toast message={message} />
    </section>
  );
}
