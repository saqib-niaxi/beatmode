// One-time seed: pushes the JSON files in api/data into your storage backend.
// Run AFTER setting your Upstash env vars (locally) to populate the Redis DB:
//   node api/seed.js
//
// With no Upstash env vars set it just rewrites the local JSON files (no-op-ish).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { writeData, listReplace, storageMode } from './storage.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');

function load(name) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${name}.json`), 'utf-8'));
  } catch {
    return [];
  }
}

const events = load('events');
const bookings = load('bookings');

await writeData('events', events); // single key (string)
await listReplace('bookings', bookings); // Redis LIST

console.log(`Seeded storage (${storageMode()}): ${events.length} events, ${bookings.length} bookings.`);
process.exit(0);
