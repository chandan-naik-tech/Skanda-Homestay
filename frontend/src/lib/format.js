export function formatMoney(amount, currency = '₹') {
  if (amount === null || amount === undefined || amount === '' || Number.isNaN(Number(amount))) return '';
  return `${currency}${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/** "30 minutes" -> 30, "1 hr 15 min" -> 75, "45" -> 45; otherwise null. */
export function minutesFrom(text) {
  if (!text) return null;
  const s = String(text).toLowerCase();
  const h = /(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/.exec(s);
  const m = /(\d+)\s*(?:m|min|mins|minute|minutes)\b/.exec(s);
  if (h || m) return Math.round((h ? parseFloat(h[1]) * 60 : 0) + (m ? parseInt(m[1], 10) : 0));
  const bare = /^\s*(\d+)\s*$/.exec(s);
  return bare ? parseInt(bare[1], 10) : null;
}

export function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

/**
 * A rough price estimate: nights x nightly price (+ cleaning fee when set).
 * Returns null unless the owner has set a nightly price and the dates are valid.
 * Other charges are listed separately because the site cannot know how they apply.
 */
export function estimateStay({ nights, pricePerNight, cleaningFee }) {
  const price = Number(pricePerNight);
  if (!Number.isFinite(price) || price <= 0 || !Number.isInteger(nights) || nights < 1) return null;
  const cleaning = Number(cleaningFee);
  const fee = Number.isFinite(cleaning) && cleaning > 0 ? cleaning : 0;
  return { nights, room: nights * price, cleaning: fee, total: nights * price + fee };
}
