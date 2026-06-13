import { Link } from 'react-router-dom';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80';

export function formatPrice(price, currency = 'SAR') {
  if (!price || Number(price) === 0) return 'Free';
  return `${currency} ${Number(price).toLocaleString()}`;
}

export function formatDateTime(datetime) {
  if (!datetime) return '';
  const d = new Date(datetime);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function EventCard({ event }) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="glass group flex flex-col overflow-hidden rounded-3xl shadow-xl transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-pink-500/15"
    >
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={event.image || PLACEHOLDER}
          alt={event.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-semibold leading-snug text-white">{event.name}</h3>
        <p className="mt-1 text-sm text-slate-400">{event.location}</p>
        {event.datetime && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-pink-200/90">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDateTime(event.datetime)}
          </p>
        )}
        <div className="mt-auto pt-4">
          <span className="inline-block rounded-full bg-gradient-to-r from-pink-500/20 to-orange-500/20 px-3 py-1 text-sm font-semibold text-pink-200 ring-1 ring-inset ring-pink-400/30">
            {formatPrice(event.price, event.currency)}
          </span>
        </div>
      </div>
    </Link>
  );
}
