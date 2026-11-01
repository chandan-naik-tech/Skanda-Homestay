const isSamplePath = (v) => typeof v === 'string' && v.startsWith('/placeholders/');

/** Deep-merge `overrides` onto `base`. Objects merge, arrays and primitives replace. */
export function deepMerge(base, overrides) {
  if (overrides === undefined || overrides === null) return base;
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
  // A saved path to a bundled sample picture means "never replaced". Let a real default photo win,
  // so putting your own photo in defaultContent.js is not blocked by a stale saved sample.
  if (isSamplePath(overrides) && typeof base === 'string' && !isSamplePath(base)) return base;
  // Same idea for a saved list of pictures (the gallery): if every saved picture is still a bundled sample and the
  // defaults now hold real photos, the owner never customised it, so the defaults win.
  if (Array.isArray(overrides) && Array.isArray(base) && overrides.length && overrides.every((x) => isSamplePath(x?.src)) && base.some((x) => x?.src && !isSamplePath(x.src))) return base;
  if (!isObj(base) || !isObj(overrides)) return overrides;
  const out = { ...base };
  for (const key of Object.keys(overrides)) out[key] = deepMerge(base[key], overrides[key]);
  return out;
}

/** True when a value has real content (non-empty string, number, or non-empty list). */
export function filled(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim() !== '';
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

/** Placeholder illustrations ship with the project; real photos live elsewhere. */
export function isSampleImage(src) {
  return typeof src === 'string' && src.startsWith('/placeholders/');
}
