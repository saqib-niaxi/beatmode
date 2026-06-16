// Tiny fetch wrapper. All requests go to /api/* which Vite proxies to :3001.

async function request(url, options = {}) {
  const { headers, ...rest } = options;
  const res = await fetch(url, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

// ---- Public ----
export const getEvents = () => request('/api/events');
export const getEvent = (id) => request(`/api/events/${id}`);
export const getOwnerPhone = () => request('/api/owner-phone');
export const createBooking = (booking) =>
  request('/api/bookings', { method: 'POST', body: JSON.stringify(booking) });

// ---- Admin ----
// All admin calls send the password in the x-admin-password header.
const adminHeaders = (password) => ({ 'x-admin-password': password });

export const adminLogin = (password) =>
  request('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) });

export const changeAdminPassword = (currentPassword, newPassword) =>
  request('/api/admin/password', {
    method: 'POST',
    headers: adminHeaders(currentPassword),
    body: JSON.stringify({ currentPassword, newPassword }),
  });

export const getAdminBookings = (password) =>
  request('/api/admin/bookings', { headers: adminHeaders(password) });

export const createEvent = (password, body) =>
  request('/api/admin/events', {
    method: 'POST',
    headers: adminHeaders(password),
    body: JSON.stringify(body),
  });

export const updateEvent = (password, id, body) =>
  request(`/api/admin/events/${id}`, {
    method: 'PUT',
    headers: adminHeaders(password),
    body: JSON.stringify(body),
  });

export const deleteEvent = (password, id) =>
  request(`/api/admin/events/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(password),
  });
