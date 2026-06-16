import { useEffect, useState } from 'react';
import {
  adminLogin,
  getAdminBookings,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../api.js';
import { formatPrice } from '../components/EventCard.jsx';
import Portal from '../components/Portal.jsx';

const EMPTY_EVENT = { name: '', location: '', price: '', currency: 'SAR', datetime: '', description: '', image: '' };

export default function Admin() {
  const [password, setPassword] = useState(sessionStorage.getItem('adminPw') || '');
  const [authed, setAuthed] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Auto-login if a password is already cached.
  useEffect(() => {
    if (password && !authed) {
      adminLogin(password)
        .then(() => setAuthed(true))
        .catch(() => sessionStorage.removeItem('adminPw'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await adminLogin(password);
      sessionStorage.setItem('adminPw', password);
      setAuthed(true);
    } catch (err) {
      setLoginError(err.message);
    }
  };

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24">
        <div className="glass rounded-3xl p-8 shadow-2xl">
          <h1 className="mb-6 text-2xl font-bold text-white">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="glass-input"
            />
            {loginError && <p className="text-sm text-red-400">{loginError}</p>}
            <button className="btn-gradient w-full rounded-xl py-2.5 font-semibold">Log in</button>
          </form>
        </div>
      </div>
    );
  }

  return <Dashboard password={password} onLogout={() => { sessionStorage.removeItem('adminPw'); setAuthed(false); }} />;
}

function Dashboard({ password, onLogout }) {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [toast, setToast] = useState('');

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const refresh = () => {
    getEvents().then(setEvents).catch((e) => flash(e.message));
    getAdminBookings(password).then(setBookings).catch((e) => flash(e.message));
  };

  useEffect(refresh, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Admin{' '}
          <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
            Dashboard
          </span>
        </h1>
        <button onClick={onLogout} className="text-sm text-slate-400 transition hover:text-white">
          Log out
        </button>
      </div>

      {toast && (
        <div className="mb-6 rounded-2xl border border-pink-400/30 bg-pink-400/10 p-3 text-sm text-pink-100">
          {toast}
        </div>
      )}

      <EventsCard events={events} password={password} onChanged={refresh} flash={flash} />
      <BookingsCard bookings={bookings} />
    </div>
  );
}

/* ------------------------------ Events ------------------------------ */

function EventsCard({ events, password, onChanged, flash }) {
  const [editing, setEditing] = useState(null); // null | event-or-EMPTY_EVENT
  const [toDelete, setToDelete] = useState(null); // event pending deletion
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteEvent(password, toDelete.id);
      flash('Event deleted.');
      setToDelete(null);
      onChanged();
    } catch (e) {
      flash(e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="glass mb-8 rounded-3xl p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Events ({events.length})</h2>
        <button
          onClick={() => setEditing({ ...EMPTY_EVENT })}
          className="btn-gradient rounded-xl px-4 py-2 text-sm font-semibold"
        >
          + Add event
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-slate-400">
            <tr>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Location</th>
              <th className="py-2 pr-4">Price</th>
              <th className="py-2 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id} className="border-b border-white/10">
                <td className="py-2.5 pr-4 font-medium text-slate-100">{ev.name}</td>
                <td className="py-2.5 pr-4 text-slate-400">{ev.location}</td>
                <td className="py-2.5 pr-4 text-slate-300">{formatPrice(ev.price, ev.currency)}</td>
                <td className="py-2.5 pr-4 text-right">
                  <button onClick={() => setEditing(ev)} className="mr-3 text-pink-300 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => setToDelete(ev)} className="text-red-400 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr>
                <td colSpan="4" className="py-4 text-center text-slate-500">No events yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <EventForm
          event={editing}
          password={password}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onChanged();
          }}
          flash={flash}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete event?"
          message={`"${toDelete.name}" will be permanently removed. This cannot be undone.`}
          confirmLabel={deleting ? 'Deleting…' : 'Delete'}
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </section>
  );
}

function ConfirmDialog({ title, message, confirmLabel, busy, onConfirm, onCancel }) {
  return (
    <Portal>
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="glass w-full max-w-sm rounded-3xl p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-300">{message}</p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              onClick={onCancel}
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 font-semibold text-slate-200 transition hover:bg-white/10 sm:flex-1"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={busy}
              className="rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-red-500/25 transition hover:brightness-110 disabled:opacity-60 sm:flex-1"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
    </Portal>
  );
}

function EventForm({ event, password, onClose, onSaved, flash }) {
  const [form, setForm] = useState({ ...EMPTY_EVENT, ...event });
  const isNew = !event.id;
  const update = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (isNew) await createEvent(password, form);
      else await updateEvent(password, event.id, form);
      flash(isNew ? 'Event created.' : 'Event updated.');
      onSaved();
    } catch (err) {
      flash(err.message);
    }
  };

  return (
    <Portal>
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="glass w-full max-w-lg rounded-3xl p-5 shadow-2xl sm:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="mb-4 text-lg font-bold text-white">{isNew ? 'Add event' : 'Edit event'}</h3>
        <form onSubmit={submit} className="space-y-3">
          <Input label="Name" value={form.name} onChange={update('name')} required />
          <Input label="Location" value={form.location} onChange={update('location')} required />
          <Input label="Date & time" type="datetime-local" value={form.datetime} onChange={update('datetime')} required />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Price" type="number" min="0" value={form.price} onChange={update('price')} required />
            <Input label="Currency" value={form.currency} onChange={update('currency')} required />
          </div>
          <ImagePicker value={form.image} onChange={(v) => setForm({ ...form, image: v })} flash={flash} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-300">
              Description <span className="text-pink-400">*</span>
            </span>
            <textarea rows="4" value={form.description} onChange={update('description')} required className="glass-input" />
          </label>
          <div className="flex gap-3 pt-2">
            <button className="btn-gradient flex-1 rounded-xl py-2.5 font-semibold">
              {isNew ? 'Create' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
    </Portal>
  );
}

/* Reads an image File and returns a downscaled JPEG data URL (keeps the DB small). */
function fileToCompressedDataURL(file, maxSize = 1000, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a valid image.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const scale = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function ImagePicker({ value, onChange, flash }) {
  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      flash('Please choose an image file.');
      return;
    }
    try {
      const dataUrl = await fileToCompressedDataURL(file);
      onChange(dataUrl);
    } catch (err) {
      flash(err.message);
    } finally {
      e.target.value = ''; // allow re-picking the same file
    }
  };

  return (
    <div className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">Image (optional)</span>
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="" className="h-16 w-16 flex-shrink-0 rounded-xl border border-white/15 object-cover" />
        ) : (
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border border-dashed border-white/20 text-xs text-slate-500">
            None
          </div>
        )}
        <div className="flex flex-1 flex-wrap gap-2">
          <label className="cursor-pointer rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
            {value ? 'Change image' : 'Upload image'}
            <input type="file" accept="image/*" onChange={pick} className="hidden" />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, required, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">
        {label} {required && <span className="text-pink-400">*</span>}
      </span>
      <input {...props} required={required} className="glass-input" />
    </label>
  );
}

/* ----------------------------- Bookings ----------------------------- */

function BookingsCard({ bookings }) {
  const sorted = [...bookings].sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

  return (
    <section className="glass rounded-3xl p-6 shadow-xl">
      <h2 className="mb-4 text-lg font-semibold text-white">Bookings ({bookings.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 text-slate-400">
            <tr>
              <th className="py-2 pr-4">When</th>
              <th className="py-2 pr-4">Event</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Contact</th>
              <th className="py-2 pr-4">Referred</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((b) => (
              <tr key={b.id} className="border-b border-white/10 align-top">
                <td className="py-2.5 pr-4 whitespace-nowrap text-slate-400">
                  {b.timestamp ? new Date(b.timestamp).toLocaleString() : '—'}
                </td>
                <td className="py-2.5 pr-4 text-slate-200">{b.eventName}</td>
                <td className="py-2.5 pr-4 font-medium text-slate-100">{b.name}</td>
                <td className="py-2.5 pr-4 text-slate-400">
                  {b.phone && <div>📱 {b.phone}</div>}
                  {b.email && <div>✉️ {b.email}</div>}
                  {b.instagram && <div>📷 {b.instagram}</div>}
                  {!b.phone && !b.email && !b.instagram && '—'}
                </td>
                <td className="py-2.5 pr-4 text-slate-400">{b.referredBy || '—'}</td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 text-center text-slate-500">No bookings yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
