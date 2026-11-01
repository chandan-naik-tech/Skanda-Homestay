import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LuMessageCircle, LuPhone, LuUser, LuX } from 'react-icons/lu';
import { useSite } from '../content/SiteContext.jsx';
import { useLockBodyScroll } from '../hooks.js';
import { filled, isSampleImage } from '../lib/merge.js';
import { normalizeWhatsAppNumber, telUrl, whatsAppUrl } from '../lib/whatsapp.js';

const initialsOf = (name) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('');

/** Everything the chip and the pop-up need, worked out once. */
function useOwnerProfile() {
  const { content, showPlaceholders } = useSite();
  const { owner, contact } = content;
  const name = filled(owner.name) ? owner.name.trim() : '';
  const wa = normalizeWhatsAppNumber(contact.whatsapp, contact.defaultCountryCode);
  const phone = filled(contact.phone) ? contact.phone.trim() : filled(contact.whatsapp) ? contact.whatsapp.trim() : '';
  const realPhoto = filled(owner.photo) && !isSampleImage(owner.photo);
  // A bundled sample illustration is only shown while setting up. Visitors never see it standing in for a person.
  const photo = realPhoto || (showPlaceholders && filled(owner.photo)) ? owner.photo : '';
  return {
    name,
    phone,
    photo,
    isSample: !!photo && !realPhoto,
    tel: phone ? telUrl(phone, contact.defaultCountryCode) : '',
    waUrl: wa ? whatsAppUrl(wa, `Hello! I'd like to know more about ${content.brand.name}.`) : '',
    showPlaceholders,
    visible: showPlaceholders || !!name || !!phone || realPhoto,
  };
}

function Avatar({ p, size }) {
  if (p.photo) return <img className="owner-avatar__img" src={p.photo} alt="" width={size} height={size} decoding="async" />;
  const letters = initialsOf(p.name);
  return <span className="owner-avatar__fallback" aria-hidden="true">{letters || <LuUser />}</span>;
}

/** Small owner profile in the top bar. Tap it for a larger photo, the name and the contact number. */
export default function OwnerChip() {
  const p = useOwnerProfile();
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);

  if (!p.visible) return null;

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus?.());
  };
  const label = [p.name || 'Owner', p.phone].filter(Boolean).join(', ');

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="owner-chip"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Owner: ${label}. Open owner profile`}
        onClick={() => setOpen(true)}
      >
        <span className="owner-avatar owner-avatar--sm"><Avatar p={p} size={40} /></span>
        <span className="owner-chip__text" aria-hidden="true">
          <span className="owner-chip__name">{p.name || (p.showPlaceholders ? <span className="todo">Add your name</span> : 'Owner')}</span>
          {p.phone ? <span className="owner-chip__phone">{p.phone}</span> : p.showPlaceholders ? <span className="owner-chip__phone"><span className="todo">Add phone</span></span> : null}
        </span>
      </button>
      {open ? createPortal(<OwnerPopup p={p} onClose={close} />, document.body) : null}
    </>
  );
}

function OwnerPopup({ p, onClose }) {
  const root = useRef(null);
  const closeBtn = useRef(null);
  useLockBodyScroll(true);

  useEffect(() => { closeBtn.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab') return;
      const focusable = root.current?.querySelectorAll('button:not([disabled]), a[href]');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  return (
    <div className="owner-pop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="owner-pop__card" ref={root} role="dialog" aria-modal="true" aria-labelledby="owner-pop-name">
        <button ref={closeBtn} type="button" className="owner-pop__close" onClick={onClose} aria-label="Close owner profile"><LuX aria-hidden="true" /></button>
        <div className="owner-avatar owner-avatar--lg">
          <Avatar p={p} size={160} />
        </div>
        {p.isSample ? <p className="owner-pop__note">Placeholder picture. Add your photo in defaultContent.js.</p> : null}
        <p className="owner-pop__role">Your host</p>
        <h2 id="owner-pop-name" className="owner-pop__name">
          {p.name || (p.showPlaceholders ? <span className="todo">Add your name</span> : 'Owner')}
        </h2>
        {p.tel ? (
          <a className="owner-pop__phone" href={p.tel}><LuPhone aria-hidden="true" />{p.phone}</a>
        ) : p.showPlaceholders ? (
          <p className="owner-pop__phone owner-pop__phone--empty"><LuPhone aria-hidden="true" /><span className="todo">Add your phone number</span></p>
        ) : null}
        {p.tel ? <p className="owner-pop__hint">Tap the number to call</p> : null}
        {p.waUrl ? (
          <a className="btn btn--primary owner-pop__wa" href={p.waUrl} target="_blank" rel="noopener noreferrer"><LuMessageCircle aria-hidden="true" />Chat on WhatsApp</a>
        ) : null}
      </div>
    </div>
  );
}
