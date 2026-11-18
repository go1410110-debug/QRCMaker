export function formatEmail({ to, subject, body }) {
  const params = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${to || ''}${params.length ? '?' + params.join('&') : ''}`;
}

export function formatPhone(phone) {
  return `tel:${phone || ''}`;
}

export function formatVCard({ firstName, lastName, phone, email, org, title, url }) {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName || ''};${firstName || ''};;;`,
    `FN:${firstName || ''} ${lastName || ''}`.trim(),
  ];
  if (org) lines.push(`ORG:${org}`);
  if (title) lines.push(`TITLE:${title}`);
  if (phone) lines.push(`TEL:${phone}`);
  if (email) lines.push(`EMAIL:${email}`);
  if (url) lines.push(`URL:${url}`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

export function formatWifi({ ssid, password, encryption, hidden }) {
  return `WIFI:T:${encryption || 'WPA'};S:${ssid || ''};P:${password || ''};H:${hidden ? 'true' : 'false'};;`;
}