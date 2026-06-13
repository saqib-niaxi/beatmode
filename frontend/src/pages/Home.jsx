import { useEffect, useState } from 'react';
import { getEvents } from '../api.js';
import EventCard from '../components/EventCard.jsx';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="mb-12 text-center">
        <span className="mb-4 inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-pink-200 backdrop-blur">
          Discover · Book · Enjoy
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Upcoming{' '}
          <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-orange-400 bg-clip-text text-transparent">
            Events
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
          Find your next night out and book your spot in seconds.
        </p>
      </div>

      {loading && <p className="text-center text-slate-400">Loading events…</p>}
      {error && <p className="text-center text-red-400">Could not load events: {error}</p>}

      {!loading && !error && events.length === 0 && (
        <p className="text-center text-slate-400">No events yet. Check back soon!</p>
      )}

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
