import { useState } from 'react'
import { useQRStore } from '../../store/qrStore'
import { formatEmail, formatPhone, formatVCard, formatWifi } from '../../utils/dataFormatters'
import { Globe, Type, Mail, Phone, User, Wifi, Code } from 'lucide-react'

const tabs = [
  { key: 'url', label: 'URL', icon: Globe },
  { key: 'text', label: 'Text', icon: Type },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'phone', label: 'Phone', icon: Phone },
  { key: 'vcard', label: 'vCard', icon: User },
  { key: 'wifi', label: 'WiFi', icon: Wifi },
  { key: 'json', label: 'JSON', icon: Code },
];

export function DataInputSection() {
  const { dataType, setDataType, setData, data } = useQRStore();
  const [formState, setFormState] = useState({
    url: 'https://example.com',
    text: '',
    email: { to: '', subject: '', body: '' },
    phone: '',
    vcard: { firstName: '', lastName: '', phone: '', email: '', org: '', title: '', url: '' },
    wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
    json: '{}',
  });

  const updateForm = (type, value) => {
    const newState = { ...formState, [type]: value };
    setFormState(newState);

    // Build data string
    let dataStr = '';
    switch (type) {
      case 'url': dataStr = value; break;
      case 'text': dataStr = value; break;
      case 'email': dataStr = formatEmail(value); break;
      case 'phone': dataStr = formatPhone(value); break;
      case 'vcard': dataStr = formatVCard(value); break;
      case 'wifi': dataStr = formatWifi(value); break;
      case 'json':
        try { dataStr = JSON.stringify(JSON.parse(value)); }
        catch { dataStr = value; }
        break;
      default: dataStr = value;
    }
    setData(dataStr);
  };

  const handleTabChange = (key) => {
    setDataType(key);
    // Rebuild data for the selected tab
    const val = formState[key];
    switch (key) {
      case 'url': setData(val || 'https://example.com'); break;
      case 'text': setData(val || 'Hello World'); break;
      case 'email': setData(formatEmail(val)); break;
      case 'phone': setData(formatPhone(val)); break;
      case 'vcard': setData(formatVCard(val)); break;
      case 'wifi': setData(formatWifi(val)); break;
      case 'json':
        try { setData(JSON.stringify(JSON.parse(val))); }
        catch { setData(val || '{}'); }
        break;
    }
  };

  return (
    <div className="space-y-3">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`cyber-tab flex items-center gap-1 ${dataType === key ? 'active' : ''}`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Forms */}
      <div className="space-y-2">
        {dataType === 'url' && (
          <input
            type="url"
            className="cyber-input"
            placeholder="https://example.com"
            value={formState.url}
            onChange={(e) => updateForm('url', e.target.value)}
          />
        )}

        {dataType === 'text' && (
          <textarea
            className="cyber-input"
            placeholder="Enter your text..."
            rows={3}
            value={formState.text}
            onChange={(e) => updateForm('text', e.target.value)}
          />
        )}

        {dataType === 'email' && (
          <div className="space-y-2">
            <input
              className="cyber-input"
              placeholder="recipient@example.com"
              value={formState.email.to}
              onChange={(e) => updateForm('email', { ...formState.email, to: e.target.value })}
            />
            <input
              className="cyber-input"
              placeholder="Subject"
              value={formState.email.subject}
              onChange={(e) => updateForm('email', { ...formState.email, subject: e.target.value })}
            />
            <textarea
              className="cyber-input"
              placeholder="Body"
              rows={2}
              value={formState.email.body}
              onChange={(e) => updateForm('email', { ...formState.email, body: e.target.value })}
            />
          </div>
        )}

        {dataType === 'phone' && (
          <input
            className="cyber-input"
            placeholder="+1234567890"
            value={formState.phone}
            onChange={(e) => updateForm('phone', e.target.value)}
          />
        )}

        {dataType === 'vcard' && (
          <div className="grid grid-cols-2 gap-2">
            {[
              ['firstName', 'First Name'],
              ['lastName', 'Last Name'],
              ['phone', 'Phone'],
              ['email', 'Email'],
              ['org', 'Organization'],
              ['title', 'Job Title'],
              ['url', 'Website'],
            ].map(([field, placeholder]) => (
              <input
                key={field}
                className={`cyber-input ${field === 'url' ? 'col-span-2' : ''}`}
                placeholder={placeholder}
                value={formState.vcard[field]}
                onChange={(e) => updateForm('vcard', { ...formState.vcard, [field]: e.target.value })}
              />
            ))}
          </div>
        )}

        {dataType === 'wifi' && (
          <div className="space-y-2">
            <input
              className="cyber-input"
              placeholder="Network Name (SSID)"
              value={formState.wifi.ssid}
              onChange={(e) => updateForm('wifi', { ...formState.wifi, ssid: e.target.value })}
            />
            <input
              className="cyber-input"
              type="password"
              placeholder="Password"
              value={formState.wifi.password}
              onChange={(e) => updateForm('wifi', { ...formState.wifi, password: e.target.value })}
            />
            <div className="flex items-center gap-3">
              <label className="text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">Encryption:</label>
              <select
                className="cyber-input !w-auto"
                value={formState.wifi.encryption}
                onChange={(e) => updateForm('wifi', { ...formState.wifi, encryption: e.target.value })}
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None</option>
              </select>
              <label className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer">
                <div
                  className={`toggle-switch ${formState.wifi.hidden ? 'active' : ''}`}
                  onClick={() => updateForm('wifi', { ...formState.wifi, hidden: !formState.wifi.hidden })}
                />
                Hidden
              </label>
            </div>
          </div>
        )}

        {dataType === 'json' && (
          <div className="space-y-2">
            <textarea
              className="cyber-input font-mono text-xs"
              placeholder='{"device":"sensor-01","cmd":"read"}'
              rows={5}
              value={formState.json}
              onChange={(e) => updateForm('json', e.target.value)}
            />
            <p className="text-[10px] text-[var(--text-secondary)]">
              Raw JSON payload for hardware/IoT devices
            </p>
          </div>
        )}
      </div>

      {/* Current data preview */}
      <div className="mt-2 p-2 bg-[var(--bg-secondary)] rounded border border-[var(--border-dim)]">
        <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mb-1">Encoded Data</div>
        <div className="text-[11px] text-[var(--neon-green)] font-mono break-all max-h-16 overflow-y-auto">
          {data || '(empty)'}
        </div>
      </div>
    </div>
  );
}