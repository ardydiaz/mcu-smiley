import { Building2, Check, CheckCircle2, LogOut, MapPin, Monitor, RefreshCcw, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Loading from '../../components/common/Loading.jsx';
import Toast from '../../components/common/Toast.jsx';
import { useApi } from '../../hooks/useApi.js';
import { terminalService } from '../../services/terminalService.js';
import { clearKioskAuthSession, clearKioskTerminal, getKioskAuthUser, getKioskDeviceId, getKioskTerminal, setKioskTerminal } from '../../utils/storage.js';

function getSafeNext(value) {
  if (!value || value === '/kiosk/setup') return '/kiosk/smiley';
  return value.startsWith('/kiosk/') ? value : '/kiosk/smiley';
}

export default function KioskSetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deviceId = getKioskDeviceId();
  const currentTerminal = getKioskTerminal();
  const kioskUser = getKioskAuthUser();
  const [selectedCode, setSelectedCode] = useState(currentTerminal?.terminalCode || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const { data, loading, error, reload } = useApi(() => terminalService.listAvailableForKiosk(deviceId), [deviceId]);
  const terminals = data || [];
  const selectedTerminal = useMemo(
    () => terminals.find(terminal => terminal.terminal_code === selectedCode),
    [terminals, selectedCode],
  );
  const filteredTerminals = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return terminals;
    return terminals.filter(terminal => [
      terminal.terminal_code,
      terminal.name,
      terminal.location_name,
      terminal.department_names,
    ].filter(Boolean).join(' ').toLowerCase().includes(term));
  }, [terminals, searchTerm]);

  useEffect(() => {
    const events = new EventSource(terminalService.kioskEventsUrl());
    const refresh = () => reload().catch(() => {});
    events.addEventListener('terminal-reservations-changed', refresh);
    return () => {
      events.removeEventListener('terminal-reservations-changed', refresh);
      events.close();
    };
  }, [reload]);

  async function saveTerminal(event) {
    event.preventDefault();
    if (!selectedTerminal) {
      setMessage('Please select the terminal for this tablet.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const terminal = await terminalService.assignForKiosk({ terminalCode: selectedTerminal.terminal_code, deviceId });
      setKioskTerminal(terminal);
      navigate(getSafeNext(searchParams.get('next')), { replace: true });
    } catch (error) {
      setMessage(error.message || 'Unable to select terminal.');
      await reload().catch(() => {});
    } finally {
      setSaving(false);
    }
  }

  async function removeSetup() {
    const terminalCode = currentTerminal?.terminalCode;
    clearKioskTerminal();
    setSelectedCode('');
    setMessage('Tablet setup was cleared.');
    if (terminalCode) {
      await terminalService.releaseForKiosk({ terminalCode, deviceId }).catch(() => {});
      await reload().catch(() => {});
    }
  }

  function signOut() {
    clearKioskAuthSession();
    navigate('/kiosk/login', { replace: true });
  }

  return (
    <section className="kiosk-panel kiosk-setup-panel">
      <div className="kiosk-heading">
        <span className="kiosk-eyebrow">Tablet Setup</span>
        <h1>Choose this tablet</h1>
        <p>Select the terminal once on this device. Votes from this tablet will be tagged with that terminal and its assigned location/departments.</p>
      </div>

      <form className="setup-card" onSubmit={saveTerminal}>
        {kioskUser ? (
          <div className="setup-signed-in-row">
            <span>Signed in as <strong>{kioskUser.name}</strong> ({kioskUser.email})</span>
            <Button type="button" variant="secondary" icon={LogOut} onClick={signOut} disabled={saving}>Sign out</Button>
          </div>
        ) : null}

        {currentTerminal ? (
          <div className="setup-current">
            <CheckCircle2 size={22} aria-hidden="true" />
            <div>
              <strong>Current tablet: {currentTerminal.terminalCode}</strong>
              <span>{currentTerminal.name}{currentTerminal.locationName ? ' - ' + currentTerminal.locationName : ''}</span>
              <span>{currentTerminal.departmentNames ? 'Department: ' + currentTerminal.departmentNames : 'No department assigned'}</span>
            </div>
          </div>
        ) : null}

        <div className="field setup-terminal-field">
          <label htmlFor="kiosk-terminal-search">Terminal</label>
          <div className="department-picker terminal-picker">
            <label className="department-search" htmlFor="kiosk-terminal-search">
              <Search size={18} aria-hidden="true" />
              <input
                id="kiosk-terminal-search"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Search by tablet code, location, or department..."
                disabled={loading || saving}
              />
            </label>

            {!loading && filteredTerminals.length ? (
              <div className="terminal-picker-list">
                <div className="department-grid">
                  {filteredTerminals.map(terminal => {
                    const isSelected = terminal.terminal_code === selectedCode;
                    return (
                      <button
                        type="button"
                        key={terminal.id}
                        className={'department-card' + (isSelected ? ' is-selected' : '')}
                        onClick={() => setSelectedCode(terminal.terminal_code)}
                        disabled={saving}
                        aria-pressed={isSelected}
                      >
                        <span className="department-icon" aria-hidden="true"><Monitor size={22} /></span>
                        <span className="department-copy">
                          <strong>{terminal.terminal_code}</strong>
                          <span>{terminal.name}</span>
                          <span className="terminal-card-meta"><MapPin size={14} aria-hidden="true" /> {terminal.location_name || 'No location'}</span>
                          <span className="terminal-card-meta"><Building2 size={14} aria-hidden="true" /> {terminal.department_names || 'No department assigned'}</span>
                        </span>
                        <span className="department-arrow" aria-hidden="true">{isSelected ? <Check size={16} /> : '→'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {!loading && terminals.length && !filteredTerminals.length ? (
              <div className="empty-state">No terminals match your search.</div>
            ) : null}
          </div>
          <p className="field-hint">This setting is saved only in this tablet browser.</p>
        </div>

        {loading ? <Loading label="Loading available terminals" /> : null}
        {error ? <div className="empty-state">{error}</div> : null}
        {!loading && !error && !terminals.length ? <div className="empty-state">No available terminals found. Clear another kiosk setup or add terminals in Admin first.</div> : null}

        <div className="button-row setup-actions">
          <Button type="submit" icon={CheckCircle2} disabled={loading || saving || !selectedTerminal}>{saving ? 'Saving' : 'Save Tablet'}</Button>
          <Button type="button" variant="secondary" icon={RefreshCcw} onClick={() => reload().catch(() => {})} disabled={loading || saving}>Refresh</Button>
          {currentTerminal ? <Button type="button" variant="danger" icon={Trash2} onClick={removeSetup} disabled={saving}>Clear</Button> : null}
        </div>
      </form>

      <Toast message={message} />
    </section>
  );
}
