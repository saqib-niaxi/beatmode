import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEvent } from '../api.js';
import { formatPrice, splitTitle } from '../components/EventCard.jsx';
import BookingModal from '../components/BookingModal.jsx';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80';

function formatDateDots(datetime) {
  const d = new Date(datetime);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

function formatStartTime(datetime) {
  const d = new Date(datetime);
  if (isNaN(d.getTime())) return '';
  let h = d.getHours();
  const min = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const time = min ? `${h}:${String(min).padStart(2, '0')}` : `${h}`;
  return `START ${time}${ampm}`;
}

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getEvent(id)
      .then(setEvent)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <p className="py-16 text-center text-sm uppercase tracking-[0.3em] text-white/40">Loading…</p>
    );

  if (error)
    return (
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <p className="text-red-400">{error}</p>
        <Link
          to="/"
          className="mt-6 inline-block text-xs uppercase tracking-[0.25em] text-white/60 hover:text-white"
        >
          ← Back
        </Link>
      </div>
    );

  const { title } = splitTitle(event);

  return (
    <div className="mx-auto w-full max-w-md px-5 pb-10 text-center">
      <div className="mb-6 text-left">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.25em] text-white/50 transition hover:text-white"
        >
          ← Back
        </Link>
      </div>

      <div className="mx-auto aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-[#0a0a0a] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.95)]">
        <img
          src={event.image || PLACEHOLDER}
          alt={event.name}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
          className="h-full w-full object-cover"
        />
      </div>

      <h1 className="mt-9 text-4xl font-bold uppercase tracking-[0.12em] text-white sm:text-5xl">
        {title}
      </h1>

      {event.datetime && (
        <div className="mt-6 space-y-1 text-lg tracking-[0.08em] text-white/85">
          <p>{formatDateDots(event.datetime)}</p>
          <p>{formatStartTime(event.datetime)}</p>
        </div>
      )}

      {event.description && (
        <p className="mx-auto mt-7 max-w-sm whitespace-pre-line text-sm leading-relaxed tracking-wide text-white/70">
          {event.description}
        </p>
      )}

      <p className="mt-7 text-2xl font-semibold tracking-[0.1em] text-white">
        {formatPrice(event.price, event.currency)}
      </p>

      <button
        onClick={() => setShowModal(true)}
        className="btn-outline mt-9 w-full max-w-xs px-10 py-4 text-sm font-semibold uppercase"
      >
        Book Now
      </button>

      {showModal && <BookingModal event={event} onClose={() => setShowModal(false)} />}
    </div>
  );
}
