import pool from '../config/db.js';

/**
 * Generate a unique code with collision check
 * @param {string} table - 'users' | 'artists' | 'bookings'
 * @param {string} column - 'user_code' | 'artist_code' | 'booking_code'
 * @param {number} min - range start
 * @param {number} max - range end
 */
async function generateUniqueCode(table, column, min, max) {
  let code, exists;
  let attempts = 0;
  do {
    code = Math.floor(min + Math.random() * (max - min));
    const result = await pool.query(
      `SELECT 1 FROM ${table} WHERE ${column} = $1 LIMIT 1`,
      [code]
    );
    exists = result.rows.length > 0;
    attempts++;
    // If range exhausted, expand
    if (attempts > 50) { min = min * 10; max = max * 10; attempts = 0; }
  } while (exists);
  return code;
}

/** Artist code: A1000 – A9999 (stored as integer, displayed with prefix) */
export async function generateArtistCode() {
  return generateUniqueCode('artists', 'artist_code', 1000, 9999);
}

/** User code: U1000 – U9999 */
export async function generateUserCode() {
  return generateUniqueCode('users', 'user_code', 1000, 9999);
}

/** Booking code: 10000001 – 99999999 (8 digits) */
export async function generateBookingCode() {
  return generateUniqueCode('bookings', 'booking_code', 10000001, 99999999);
}

/** Format for display */
export const formatArtistCode  = (code) => code ? `A${code}` : null;
export const formatUserCode    = (code) => code ? `U${code}` : null;
export const formatBookingCode = (code) => code ? `B${code}` : null;
