import { useState, useEffect } from 'react';
import { createBooking, getOwnerPhone } from '../api.js';
import { formatDateTime } from './EventCard.jsx';
import Portal from './Portal.jsx';

export default function BookingModal({ event, onClose }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    instagram: '',
    referredBy: '',
  });
  const [ownerPhone, setOwnerPhone] = useState('');
  const [phoneState, setPhoneState] = useState('loading'); // loading | ok | missing
  const [status, setStatus] = useState('idle'); // idle | success
  const [error, setError] = useState('');

  useEffect(() => {
    // Load the owner's WhatsApp number so the link is ready before the click.
    getOwnerPhone()
      .then((d) => {
        if (d.phone) {
          setOwnerPhone(d.phone);
          setPhoneState('ok');
        } else {
          setPhoneState('missing');
        }
      })
      .catch(() => setPhoneState('missing'));

    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const buildWhatsAppText = () => {
    const lines = ['*New Booking Request*', `Event: ${event.name}`];
    if (event.datetime) lines.push(`When: ${formatDateTime(event.datetime)}`);
    lines.push(`Name: ${form.name}`);
    if (form.email) lines.push(`Email: ${form.email}`);
    if (form.phone) lines.push(`WhatsApp: ${form.phone}`);
    if (form.instagram) lines.push(`Instagram: ${form.instagram}`);
    if (form.referredBy) lines.push(`Referred By: ${form.referredBy}`);
    return lines.join('\n');
  };

  // Live wa.me link. Using a real <a> means the browser opens it as a genuine
  // user click (never blocked as a popup).
  const waHref = ownerPhone
    ? `https://wa.me/${ownerPhone}?text=${encodeURIComponent(buildWhatsAppText())}`
    : '';

  const handleSend = (e) => {
    if (!form.name.trim()) {
      e.preventDefault();
      setError('Please enter your name.');
      return;
    }
    if (!waHref) {
      e.preventDefault();
      setError('WhatsApp number is not available. Make sure the backend is running, then refresh.');
      return;
    }
    // Don't preventDefault — let the anchor open WhatsApp in a new tab.
    setError('');
    createBooking({ ...form, eventId: event.id, eventName: event.name }).catch(() => {});
    // Defer the success screen so the re-render can't cancel the tab opening.
    setTimeout(() => setStatus('success'), 350);
  };

  return (
    <Portal>
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="glass w-full max-w-md rounded-3xl p-5 shadow-2xl sm:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {status === 'success' ? (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-500 shadow-lg shadow-pink-500/30">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-5 text-2xl font-bold text-white">Almost there!</h2>
              <p className="mt-2 text-slate-300">
                WhatsApp has opened in a new tab — just press{' '}
                <span className="font-semibold text-white">Send</span> to confirm your booking for{' '}
                <span className="font-medium text-white">{event.name}</span>.
              </p>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm text-pink-300 hover:underline"
                >
                  Didn't open? Tap here to open WhatsApp.
                </a>
              )}
              <button onClick={onClose} className="btn-gradient mt-6 w-full rounded-xl py-3 font-semibold">
                Done
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-white">Book this event</h2>
                  <p className="truncate text-sm text-slate-400">{event.name}</p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                <Field label="Name" required value={form.name} onChange={update('name')} placeholder="Your full name" />
                <Field label="Email" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" />
                <Field label="WhatsApp number" value={form.phone} onChange={update('phone')} placeholder="+966 5x xxx xxxx" />
                <Field label="Instagram handle" value={form.instagram} onChange={update('instagram')} placeholder="@yourhandle" />
                <Field label="Referred by" value={form.referredBy} onChange={update('referredBy')} placeholder="Who told you about this?" />

                {error && <p className="text-sm text-red-400">{error}</p>}
                {phoneState === 'missing' && (
                  <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
                    Couldn't load the organizer's WhatsApp number. Make sure the backend is running, then refresh the page.
                  </p>
                )}

                <a
                  href={waHref || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleSend}
                  className={`btn-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold ${
                    phoneState === 'loading' ? 'pointer-events-none opacity-70' : ''
                  }`}
                >
                  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 01-1.26-4.36c0-4.54 3.7-8.23 8.25-8.23 4.54 0 8.23 3.69 8.23 8.23 0 4.55-3.69 8.25-8.23 8.25zm4.52-6.16c-.25-.12-1.47-.72-1.69-.8-.23-.09-.39-.12-.56.12-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.38-1.73-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.14.17-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.25 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
                  </svg>
                  {phoneState === 'loading' ? 'Loading…' : 'Send via WhatsApp'}
                </a>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
    </Portal>
  );
}

function Field({ label, required, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">
        {label}{' '}
        {required ? <span className="text-pink-400">*</span> : <span className="text-slate-500">(optional)</span>}
      </span>
      <input {...props} required={required} className="glass-input" />
    </label>
  );
}
