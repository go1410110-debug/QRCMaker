import { useState, useRef, useEffect } from 'react'
import { useQRStore } from '../../store/qrStore'
import { formatEmail, formatPhone, formatVCard, formatWifi } from '../../utils/dataFormatters'
import debounce from 'lodash.debounce'
import { 
  Globe, 
  Type, 
  Mail, 
  Wifi, 
  Phone, 
  User, 
  Eye, 
  EyeOff, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react'

const SHARE_TYPES = [
  {
    key: 'url',
    label: 'Website Link',
    description: 'Open a webpage or link',
    icon: Globe,
    placeholder: 'https://example.com',
  },
  {
    key: 'text',
    label: 'Plain Text',
    description: 'Display notes or message',
    icon: Type,
    placeholder: 'Hello, welcome to our store!',
  },
  {
    key: 'wifi',
    label: 'WiFi Network',
    description: 'Connect phones to WiFi instantly',
    icon: Wifi,
    placeholder: 'MyHomeWiFi',
  },
  {
    key: 'email',
    label: 'Email',
    description: 'Send a pre-filled email',
    icon: Mail,
    placeholder: 'hello@example.com',
  },
  {
    key: 'phone',
    label: 'Phone Call',
    description: 'Dial a number directly',
    icon: Phone,
    placeholder: '+1 234 567 8900',
  },
  {
    key: 'vcard',
    label: 'Contact Card',
    description: 'Share business vCard info',
    icon: User,
    placeholder: 'John Doe',
  },
];

export function Step1Share() {
  const { dataType, setDataType, setData } = useQRStore();
  const [showWifiPassword, setShowWifiPassword] = useState(false);

  const [formState, setFormState] = useState({
    url: 'https://google.com',
    text: '',
    email: { to: '', subject: '', body: '' },
    phone: '',
    vcard: { firstName: '', lastName: '', phone: '', email: '', org: '', title: '', url: '' },
    wifi: { ssid: '', password: '', encryption: 'WPA', hidden: false },
  });

  // Debounced store sync ref (300ms debounce to prevent canvas UI freezing)
  const debouncedSyncRef = useRef(null);

  useEffect(() => {
    debouncedSyncRef.current = debounce((dataStr) => {
      setData(dataStr);
    }, 300);

    return () => {
      debouncedSyncRef.current?.cancel();
    };
  }, [setData]);

  // Sync data whenever formState changes (with 300ms debounce)
  const updateForm = (type, value) => {
    const newState = { ...formState, [type]: value };
    setFormState(newState);

    let dataStr = '';
    switch (type) {
      case 'url':
        dataStr = value.trim() ? value : 'https://google.com';
        break;
      case 'text':
        dataStr = value;
        break;
      case 'email':
        dataStr = formatEmail(value);
        break;
      case 'phone':
        dataStr = formatPhone(value);
        break;
      case 'vcard':
        dataStr = formatVCard(value);
        break;
      case 'wifi':
        dataStr = formatWifi(value);
        break;
      default:
        dataStr = value;
    }

    // Trigger debounced 300ms canvas update
    debouncedSyncRef.current?.(dataStr);
  };

  const handleSelectType = (key) => {
    // Cancel any pending debounced sync
    debouncedSyncRef.current?.cancel();

    setDataType(key);
    const val = formState[key];
    switch (key) {
      case 'url':
        setData(val || 'https://google.com');
        break;
      case 'text':
        setData(val || 'Scan successful!');
        break;
      case 'email':
        setData(formatEmail(val));
        break;
      case 'phone':
        setData(formatPhone(val));
        break;
      case 'vcard':
        setData(formatVCard(val));
        break;
      case 'wifi':
        setData(formatWifi(val));
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-gray-200/80 dark:border-slate-700/60 p-5 md:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
          1
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
            What do you want to share?
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Pick a type to configure the information stored in your QR code
          </p>
        </div>
      </div>

      {/* Grid of Large Friendly Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {SHARE_TYPES.map(({ key, label, description, icon: Icon }) => {
          const isSelected = dataType === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectType(key)}
              className={`relative p-3.5 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/30 dark:border-blue-500 shadow-xs'
                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50 hover:bg-gray-50/50 dark:hover:bg-slate-700/30'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 text-blue-600 dark:text-blue-400">
                  <CheckCircle2 className="w-4 h-4 fill-blue-600 text-white dark:fill-blue-500 dark:text-slate-900" />
                </div>
              )}
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-900 dark:text-slate-100 block">
                  {label}
                </span>
                <span className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-1">
                  {description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic Input Form */}
      <div className="pt-4 border-t border-gray-100 dark:border-slate-700/60">
        {dataType === 'url' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 flex items-center justify-between">
              <span>Destination Website URL</span>
              {formState.url && formState.url.startsWith('http') && (
                <a
                  href={formState.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-normal text-[11px]"
                >
                  Test Link <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={formState.url}
                onChange={(e) => updateForm('url', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
              />
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400">
              Tip: Include <code className="font-mono text-blue-600 dark:text-blue-400">https://</code> so devices can open the link with one tap.
            </p>
          </div>
        )}

        {dataType === 'text' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                Your Text or Note
              </label>
              <span className="text-[11px] text-gray-400">
                {formState.text.length} characters
              </span>
            </div>
            <textarea
              rows={4}
              value={formState.text}
              onChange={(e) => updateForm('text', e.target.value)}
              placeholder="Type any message, secret note, voucher code, or instructions..."
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
            />
          </div>
        )}

        {dataType === 'wifi' && (
          <div className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5 block">
                Network Name (SSID)
              </label>
              <input
                type="text"
                value={formState.wifi.ssid}
                onChange={(e) => updateForm('wifi', { ...formState.wifi, ssid: e.target.value })}
                placeholder="e.g. CafeGuest_5G"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5 block">
                Network Password
              </label>
              <div className="relative">
                <input
                  type={showWifiPassword ? 'text' : 'password'}
                  value={formState.wifi.password}
                  onChange={(e) => updateForm('wifi', { ...formState.wifi, password: e.target.value })}
                  placeholder="Enter WiFi password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowWifiPassword(!showWifiPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showWifiPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-1 block">
                  Security Type
                </label>
                <select
                  value={formState.wifi.encryption}
                  onChange={(e) => updateForm('wifi', { ...formState.wifi, encryption: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                  <option value="WEP">WEP (Older)</option>
                  <option value="nopass">None (Open Network)</option>
                </select>
              </div>

              <div className="flex items-center sm:pt-6">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-gray-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formState.wifi.hidden}
                    onChange={(e) => updateForm('wifi', { ...formState.wifi, hidden: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Hidden Network</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {dataType === 'email' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5 block">
                Recipient Email
              </label>
              <input
                type="email"
                value={formState.email.to}
                onChange={(e) => updateForm('email', { ...formState.email, to: e.target.value })}
                placeholder="recipient@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5 block">
                Subject
              </label>
              <input
                type="text"
                value={formState.email.subject}
                onChange={(e) => updateForm('email', { ...formState.email, subject: e.target.value })}
                placeholder="e.g. Feedback regarding your order"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5 block">
                Pre-filled Message Body
              </label>
              <textarea
                rows={3}
                value={formState.email.body}
                onChange={(e) => updateForm('email', { ...formState.email, body: e.target.value })}
                placeholder="Enter pre-filled message..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        )}

        {dataType === 'phone' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={formState.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
                placeholder="+1 555 123 4567"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400">
              When scanned, phones will prompt to call this number directly.
            </p>
          </div>
        )}

        {dataType === 'vcard' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1 block">
                  First Name
                </label>
                <input
                  type="text"
                  value={formState.vcard.firstName}
                  onChange={(e) => updateForm('vcard', { ...formState.vcard, firstName: e.target.value })}
                  placeholder="Jane"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1 block">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formState.vcard.lastName}
                  onChange={(e) => updateForm('vcard', { ...formState.vcard, lastName: e.target.value })}
                  placeholder="Doe"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1 block">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formState.vcard.phone}
                  onChange={(e) => updateForm('vcard', { ...formState.vcard, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  value={formState.vcard.email}
                  onChange={(e) => updateForm('vcard', { ...formState.vcard, email: e.target.value })}
                  placeholder="jane.doe@company.com"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1 block">
                  Organization / Company
                </label>
                <input
                  type="text"
                  value={formState.vcard.org}
                  onChange={(e) => updateForm('vcard', { ...formState.vcard, org: e.target.value })}
                  placeholder="Acme Corp"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1 block">
                  Job Title
                </label>
                <input
                  type="text"
                  value={formState.vcard.title}
                  onChange={(e) => updateForm('vcard', { ...formState.vcard, title: e.target.value })}
                  placeholder="Product Designer"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1 block">
                Website
              </label>
              <input
                type="url"
                value={formState.vcard.url}
                onChange={(e) => updateForm('vcard', { ...formState.vcard, url: e.target.value })}
                placeholder="https://janedoe.com"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
