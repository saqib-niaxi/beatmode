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

// Split "EUPHORIA — A Different Experience" into a bold title and a tagline.
// Falls back to the location when there's no tagline.
export function splitTitle(event) {
  const parts = String(event.name || '').split(/[—–-]/);
  const title = parts[0].trim();
  const tagline = parts.slice(1).join('—').trim() || event.location || '';
  return { title, tagline };
}

export default function EventCard({ event }) {
  const { title, tagline } = splitTitle(event);

  return (
    <Link to={`/events/${event.id}`} className="event-card group">
      <img
        src={event.image || PLACEHOLDER}
        alt={event.name}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = PLACEHOLDER;
        }}
        className="event-card__img"
      />
      <div className="event-card__overlay">
        <h3 className="text-3xl font-bold uppercase tracking-[0.18em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] sm:text-4xl">
          {title}
        </h3>
        {tagline && (
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80">
            {tagline}
          </p>
        )}
      </div>
    </Link>
  );
}
