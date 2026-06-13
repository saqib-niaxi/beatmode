import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEvent } from '../api.js';
import { formatPrice, formatDateTime } from '../components/EventCard.jsx';
import BookingModal from '../components/BookingModal.jsx';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80';

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

  if (loading) return <p className="mx-auto max-w-4xl px-4 py-14 text-slate-400">Loading…</p>;
  if (error)
    return (
      <div className="mx-auto max-w-4xl px-4 py-14">
        <p className="text-red-400">{error}</p>
        <Link to="/" className="mt-4 inline-block text-pink-300 hover:underline">
          ← Back to events
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-white"
      >
        ← Back to events
      </Link>

      <div className="glass overflow-hidden rounded-3xl shadow-2xl">
        <div className="aspect-[16/9]">
          <img
            src={event.image || PLACEHOLDER}
            alt={event.name}
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER;
            }}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-6 sm:p-9">
          <h1 className="text-2xl font-bold text-white sm:text-4xl">{event.name}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-5 w-5 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location}
            </span>
            {event.datetime && (
              <span className="inline-flex items-center gap-1.5">
                <svg className="h-5 w-5 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDateTime(event.datetime)}
              </span>
            )}
            <span className="rounded-full bg-gradient-to-r from-pink-500/20 to-orange-500/20 px-3.5 py-1 text-sm font-semibold text-pink-200 ring-1 ring-inset ring-pink-400/30">
              {formatPrice(event.price, event.currency)}
            </span>
          </div>

          <p className="mt-7 whitespace-pre-line leading-relaxed text-slate-300">{event.description}</p>

          <button
            onClick={() => setShowModal(true)}
            className="btn-gradient mt-9 w-full rounded-2xl py-4 text-lg font-semibold sm:w-auto sm:px-12"
          >
            Book Now
          </button>
        </div>
      </div>

      {showModal && <BookingModal event={event} onClose={() => setShowModal(false)} />}
    </div>
  );
}
