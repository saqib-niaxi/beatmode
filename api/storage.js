// Storage abstraction. Uses Upstash Redis when its env vars are present
// (i.e. on Vercel / production), and falls back to local JSON files for
// zero-config local development.
//
// Keys: "events" and "bookings" — each holds a JSON array, exactly like the
// original file-based model, so the rest of the app barely changed.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');

// Support both the plain Upstash names and the names Vercel's Upstash/KV
// integration injects (KV_REST_API_URL / KV_REST_API_TOKEN).
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const useRedis = Boolean(REDIS_URL && REDIS_TOKEN);

let redisPromise;
async function getRedis() {
  if (!redisPromise) {
    redisPromise = import('@upstash/redis').then(
      ({ Redis }) => new Redis({ url: REDIS_URL, token: REDIS_TOKEN })
    );
  }
  return redisPromise;
}

export function storageMode() {
  return useRedis ? 'redis' : 'files';
}

export async function readData(key, fallback) {
  if (useRedis) {
    const redis = await getRedis();
    const value = await redis.get(key);
    return value === null || value === undefined ? fallback : value;
  }
  // Local file fallback
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${key}.json`), 'utf-8'));
  } catch {
    return fallback;
  }
}

export async function writeData(key, data) {
  if (useRedis) {
    const redis = await getRedis();
    await redis.set(key, data);
    return;
  }
  writeFileArray(key, data);
}

/* --------------------------- List helpers ------------------------------- */
// Used for `bookings`, which is append-heavy and may receive concurrent
// writes. On Redis we use a LIST with atomic RPUSH so simultaneous bookings
// can never overwrite each other (the bug you'd get from read-modify-write
// of a whole array). Local file mode is single-process, so a plain
// read-push-write is safe there.

export async function listAll(key, fallback = []) {
  if (useRedis) {
    const redis = await getRedis();
    const items = await redis.lrange(key, 0, -1);
    return Array.isArray(items) ? items : fallback;
  }
  return readFileArray(key, fallback);
}

export async function listPush(key, item) {
  if (useRedis) {
    const redis = await getRedis();
    await redis.rpush(key, item); // atomic append
    return;
  }
  const arr = readFileArray(key, []);
  arr.push(item);
  writeFileArray(key, arr);
}

// Replace the whole list (used only by the seed script).
export async function listReplace(key, items) {
  if (useRedis) {
    const redis = await getRedis();
    await redis.del(key);
    if (items.length) await redis.rpush(key, ...items);
    return;
  }
  writeFileArray(key, items);
}

/* ------------------------------ File I/O -------------------------------- */

function readFileArray(key, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${key}.json`), 'utf-8'));
  } catch {
    return fallback;
  }
}

function writeFileArray(key, data) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {
    /* ignore */
  }
  fs.writeFileSync(path.join(DATA_DIR, `${key}.json`), JSON.stringify(data, null, 2), 'utf-8');
}
