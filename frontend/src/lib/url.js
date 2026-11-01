/** URL guards. Owner-edited content is rendered into href/src/iframe attributes, so only safe web addresses get through. */

/** Returns the URL when it is a plain https:// address, otherwise ''. Blocks javascript:, data:, http:, etc. */
export function httpsUrl(value) {
  if (typeof value !== 'string') return '';
  const v = value.trim();
  return /^https:\/\/[^\s<>"']{4,1990}$/.test(v) ? v : '';
}

/**
 * Only Google Maps and OpenStreetMap embeds may be shown inside the page:
 *  - "Share > Embed a map" links from Google Maps (.../maps/embed?pb=...)
 *  - the key-free place embed  https://www.google.com/maps?q=<place>&output=embed
 *  - OpenStreetMap "export/embed.html" links
 */
export function mapEmbedUrl(value) {
  const v = httpsUrl(value);
  if (!v) return '';
  if (/^https:\/\/(www\.google\.com\/maps\/embed\?|www\.openstreetmap\.org\/export\/embed\.html\?)/.test(v)) return v;
  if (/^https:\/\/(www|maps)\.google\.com\/maps\?/.test(v) && /[?&]output=embed(&|$)/.test(v)) return v;
  return '';
}

/** If someone pasted the whole <iframe ...> snippet from Google Maps, pull out its src address. */
export function extractIframeSrc(value) {
  if (typeof value !== 'string') return value;
  const m = /<iframe[^>]*\ssrc=["']([^"']+)["']/i.exec(value);
  return m ? m[1].replaceAll('&amp;', '&') : value;
}
