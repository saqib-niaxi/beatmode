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
    <div className="mx-auto w-full max-w-md px-5 pb-12">
      {loading && (
        <p className="py-10 text-center text-sm uppercase tracking-[0.3em] text-white/40">
          Loading…
        </p>
      )}
      {error && (
        <p className="py-10 text-center text-sm text-red-400">Could not load events: {error}</p>
      )}

      {!loading && !error && events.length === 0 && (
        <p className="py-10 text-center text-sm uppercase tracking-[0.3em] text-white/40">
          No events yet
        </p>
      )}

      <div className="space-y-7">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
