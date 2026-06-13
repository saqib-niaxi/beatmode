import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { readData, writeData, listAll, listPush, storageMode } from './storage.js';

dotenv.config();

const EVENTS_KEY = 'events';
const BOOKINGS_KEY = 'bookings';

/* ------------------------------- Config --------------------------------- */
// Owner WhatsApp number and admin password are configured via env vars.
// OWNER_PHONE must be international format, digits only (e.g. 923001234567).

function getOwnerPhone() {
  return (process.env.OWNER_PHONE || '').replace(/[^\d]/g, '');
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || 'admin123';
}

/* ------------------------------- App ------------------------------------ */

const app = express();
app.use(cors());
app.use(express.json());

// Admin auth middleware: expects password in `x-admin-password` header.
function requireAdmin(req, res, next) {
  const provided = req.headers['x-admin-password'];
  if (!provided || provided !== getAdminPassword()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

/* ----------------------------- Public API ------------------------------- */

app.get('/api/owner-phone', (req, res) => {
  res.json({ phone: getOwnerPhone() });
});

app.get('/api/events', async (req, res) => {
  res.json(await readData(EVENTS_KEY, []));
});

app.get('/api/events/:id', async (req, res) => {
  const events = await readData(EVENTS_KEY, []);
  const event = events.find((e) => String(e.id) === String(req.params.id));
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

// Create a booking -> save to the log. The WhatsApp message is sent from the
// user's own WhatsApp on the client (wa.me link), not from here.
app.post('/api/bookings', async (req, res) => {
  const { eventId, name, email, phone, instagram, referredBy } = req.body || {};

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  const events = await readData(EVENTS_KEY, []);
  const event = events.find((e) => String(e.id) === String(eventId));
  const eventName = event ? event.name : req.body.eventName || 'Unknown event';

  const booking = {
    id: Date.now().toString(),
    eventId: eventId || null,
    eventName,
    name: name.trim(),
    email: (email || '').trim(),
    phone: (phone || '').trim(),
    instagram: (instagram || '').trim(),
    referredBy: (referredBy || '').trim(),
    timestamp: new Date().toISOString(),
  };

  await listPush(BOOKINGS_KEY, booking); // atomic append — safe under concurrent bookings

  res.status(201).json({ success: true, booking });
});

/* ------------------------------ Admin API ------------------------------- */

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password && password === getAdminPassword()) {
    return res.json({ success: true });
  }
  res.status(401).json({ error: 'Incorrect password' });
});

app.get('/api/admin/bookings', requireAdmin, async (req, res) => {
  res.json(await listAll(BOOKINGS_KEY, []));
});

app.post('/api/admin/events', requireAdmin, async (req, res) => {
  const events = await readData(EVENTS_KEY, []);
  const { name, location, price, description, image, currency, datetime } = req.body || {};

  // All fields are required except the image.
  const requiredText = { name, location, datetime, currency, description };
  for (const [field, value] of Object.entries(requiredText)) {
    if (!value || !String(value).trim()) {
      return res.status(400).json({ error: `${field} is required.` });
    }
  }
  if (price === undefined || price === null || price === '') {
    return res.status(400).json({ error: 'price is required.' });
  }

  const event = {
    id: Date.now().toString(),
    name: name.trim(),
    location: (location || '').trim(),
    price: Number(price) || 0,
    currency: (currency || 'SAR').trim(),
    datetime: (datetime || '').trim(),
    description: (description || '').trim(),
    image: (image || '').trim(),
  };
  events.push(event);
  await writeData(EVENTS_KEY, events);
  res.status(201).json(event);
});

app.put('/api/admin/events/:id', requireAdmin, async (req, res) => {
  const events = await readData(EVENTS_KEY, []);
  const idx = events.findIndex((e) => String(e.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Event not found' });

  const { name, location, price, description, image, currency, datetime } = req.body || {};
  events[idx] = {
    ...events[idx],
    ...(name !== undefined && { name: name.trim() }),
    ...(location !== undefined && { location: location.trim() }),
    ...(price !== undefined && { price: Number(price) || 0 }),
    ...(currency !== undefined && { currency: currency.trim() }),
    ...(datetime !== undefined && { datetime: datetime.trim() }),
    ...(description !== undefined && { description: description.trim() }),
    ...(image !== undefined && { image: image.trim() }),
  };
  await writeData(EVENTS_KEY, events);
  res.json(events[idx]);
});

app.delete('/api/admin/events/:id', requireAdmin, async (req, res) => {
  const events = await readData(EVENTS_KEY, []);
  const next = events.filter((e) => String(e.id) !== String(req.params.id));
  if (next.length === events.length) return res.status(404).json({ error: 'Event not found' });
  await writeData(EVENTS_KEY, next);
  res.json({ success: true });
});

/* --------------------------- Export / listen ---------------------------- */
// On Vercel this module is imported and `app` is used as the function handler.
// Locally (node api/index.js) we start a normal HTTP server.

export default app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT} (storage: ${storageMode()})`);
    if (!getOwnerPhone()) {
      console.warn('WARNING: OWNER_PHONE not set — the WhatsApp button has no number to send to.');
    }
  });
}
