import { filled } from '../lib/merge.js';

/** Minutes in a text like "40 minutes" or "1 hour 10 minutes" (0 when there is no number). */
function minutesOf(text) {
  const h = /(\d+(?:\.\d+)?)\s*h/i.exec(text);
  const m = /(\d+)\s*m/i.exec(text);
  const bare = /^\s*(\d+)\s*$/.exec(text);
  return (h ? parseFloat(h[1]) * 60 : 0) + (m ? parseInt(m[1], 10) : 0) + (bare ? parseInt(bare[1], 10) : 0);
}

/** How far along the little road the car drives: the longest trip fills it, shorter trips a proportional part. */
function share(time, all) {
  const longest = Math.max(...all.map((d) => minutesOf(d.time)));
  const mine = minutesOf(time);
  return longest > 0 && mine > 0 ? Math.max(14, Math.round((mine / longest) * 100)) : 100;
}

/** The "By road from the stay" card: emoji tile, note, time pill and a little road with a car for each place. Used at the top of the page and beside the map. */
export default function DriveCard({ drive, className = '' }) {
  if (!drive || !drive.length) return null;
  return (
    <aside className={`trip ${className}`.trim()} aria-label="Drive times from the stay">
      <header className="trip__head">
        <span className="trip__badge" aria-hidden="true">🚗</span>
        <div>
          <strong>By road from the stay</strong>
          <small>Approximate drive times</small>
        </div>
      </header>
      <ul className="trip__list">
        {drive.map((d) => (
          <li key={d.place}>
            <span className="trip__emoji" aria-hidden="true">{d.emoji || '📍'}</span>
            <span className="trip__body">
              <span className="trip__place">{d.place}</span>
              {filled(d.note) ? <span className="trip__note">{d.note}</span> : null}
            </span>
            <span className="trip__time">{d.time.replace(/minutes?/i, 'min')}</span>
            <span className="trip__road" aria-hidden="true" style={{ '--w': `${share(d.time, drive)}%` }}>
              <span className="trip__fill" />
              <span className="trip__car">🚗</span>
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
