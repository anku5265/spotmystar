import pool from '../config/db.js';

/**
 * Generate a unique numeric code with DB collision check
 * Uses a single query with retry — minimal connections
 */
async function generateUniqueCode(table, column, min, max) {
  // Try up to 10 random values in one shot using NOT IN
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidates = Array.from({ length: 10 }, () =>
      Math.floor(min + Math.random() * (max - min))
    );
    const result = await pool.query(
      `SELECT ${column} FROM ${table} WHERE ${column} = ANY($1::bigint[])`,
      [candidates]
    );
    const taken = new Set(result.rows.map(r => r[column]));
    const free = candidates.find(c => !taken.has(c));
    if (free !== undefined) return free;
    // Expand range if needed
    if (attempt === 3) { min = min * 10; max = max * 10; }
  }
  // Fallback: timestamp-based unique
  return Date.now() % (max - min) + min;
}

export async function generateArtistCode() {
  return generateUniqueCode('artists', 'artist_code', 1000, 9999);
}

export async function generateUserCode() {
  return generateUniqueCode('users', 'user_code', 1000, 9999);
}

export async function generateBookingCode() {
  return generateUniqueCode('bookings', 'booking_code', 10000001, 99999999);
}

export const formatArtistCode  = (code) => code ? `A${code}` : null;
export const formatUserCode    = (code) => code ? `U${code}` : null;
export const formatBookingCode = (code) => code ? `B${code}` : null;
