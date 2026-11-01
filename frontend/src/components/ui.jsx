import { LuLoaderCircle } from 'react-icons/lu';
import { useReveal } from '../hooks.js';
import { useSite } from '../content/SiteContext.jsx';
import LogoMark from './LogoMark.jsx';

/** Fades a block in once, when it first scrolls into view. */
export function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`} style={delay ? { '--d': `${delay}ms` } : undefined} {...rest}>
      {children}
    </Tag>
  );
}

export function Logo({ inverse = false }) {
  const { content } = useSite();
  const { name, logoImage } = content.brand;
  return (
    <span className={`logo ${inverse ? 'logo--inverse' : ''}`}>
      {logoImage ? (
        <img className="logo__img" src={logoImage} alt="" width="40" height="40" />
      ) : (
        <LogoMark size={42} className="logo__svg" />
      )}
      <span className="logo__name">{name}</span>
    </span>
  );
}

/** Small honest label on any illustration that is not a real photo of the property. */
export function SampleBadge({ children = 'Sample illustration' }) {
  return <span className="sample-badge">{children}</span>;
}

export function Spinner({ label = 'Loading' }) {
  return <LuLoaderCircle className="spin" aria-label={label} role="img" />;
}

export function SectionHead({ title, lede, id }) {
  return (
    <header className="section-head">
      <h2 id={id}>{title}</h2>
      {lede ? <p className="lede">{lede}</p> : null}
    </header>
  );
}

/** Label + control + error text, wired together for screen readers. */
export function FormField({ id, label, error, hint, required, children, className = '' }) {
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      <label htmlFor={id}>
        {label}
        {required ? <span className="req" aria-hidden="true"> *</span> : null}
        {!required ? <span className="opt"> (optional)</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="field__hint" id={`${id}-hint`}>{hint}</p> : null}
      {error ? <p className="field__error" id={`${id}-error`} role="alert">{error}</p> : null}
    </div>
  );
}

export function describedBy(id, error, hint) {
  const ids = [error && `${id}-error`, hint && !error && `${id}-hint`].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}
