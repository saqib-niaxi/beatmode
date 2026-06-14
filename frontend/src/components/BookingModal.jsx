import { useState, useEffect } from 'react';
import { createBooking, getOwnerPhone } from '../api.js';
import { formatDateTime, splitTitle } from './EventCard.jsx';
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

  const { title } = splitTitle(event);

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
    const fields = [
      ['name', 'your name'],
      ['email', 'your email'],
      ['phone', 'your WhatsApp number'],
      ['instagram', 'your Instagram handle'],
      ['referredBy', 'who referred you'],
    ];
    const missing = fields.find(([key]) => !form[key].trim());
    if (missing) {
      e.preventDefault();
      setError(`Please enter ${missing[1]}.`);
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
        className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-black p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,1)] sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 rounded-lg p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {status === 'success' ? (
              <div className="py-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/80">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mt-6 text-2xl font-bold uppercase tracking-[0.1em] text-white">
                  Almost there
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  WhatsApp has opened in a new tab — just press{' '}
                  <span className="font-semibold text-white">Send</span> to confirm your booking for{' '}
                  <span className="font-medium text-white">{title}</span>.
                </p>
                {waHref && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white hover:underline"
                  >
                    Didn't open? Tap here.
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="btn-white mt-7 w-full py-3.5 text-sm uppercase"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                <Field label="Name" required value={form.name} onChange={update('name')} />
                <Field label="Email" type="email" required value={form.email} onChange={update('email')} />
                <Field label="WhatsApp" required value={form.phone} onChange={update('phone')} />
                <Field label="Instagram" required value={form.instagram} onChange={update('instagram')} />
                <Field label="Referred By" required value={form.referredBy} onChange={update('referredBy')} />

                {error && <p className="text-sm text-red-400">{error}</p>}
                {phoneState === 'missing' && (
                  <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-200">
                    Couldn't load the organizer's WhatsApp number. Make sure the backend is running,
                    then refresh the page.
                  </p>
                )}

                <a
                  href={waHref || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleSend}
                  className={`btn-white w-full py-3.5 text-sm uppercase ${
                    phoneState === 'loading' ? 'pointer-events-none opacity-70' : ''
                  }`}
                >
                  {phoneState === 'loading' ? 'Loading…' : 'Submit'}
                </a>
              </form>
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
      <span className="mb-2 block text-sm font-bold uppercase tracking-[0.12em] text-white">
        {label}
      </span>
      <input {...props} required={required} className="pill-input" />
    </label>
  );
}
