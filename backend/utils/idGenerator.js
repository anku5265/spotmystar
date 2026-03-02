/**
 * Unique ID Generator for SpotMYstar
 * Generates unique IDs for Users, Artists, and Bookings
 */

import pool from '../config/db.js';

/**
 * Generate 4-digit User ID (1000-9999)
 * Format: Numeric only
 */
export async function generateUserId() {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    // Generate random 4-digit number (1000-9999)
    const userId = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Check if ID already exists
    const result = await pool.query(
      'SELECT id FROM users WHERE user_id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return userId;
    }
    
    attempts++;
  }
  
  throw new Error('Failed to generate unique User ID after maximum attempts');
}

/**
 * Generate 5-digit Artist ID (10000-99999)
 * Format: Numeric only
 */
export async function generateArtistId() {
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    // Generate random 5-digit number (10000-99999)
    const artistId = Math.floor(10000 + Math.random() * 90000).toString();
    
    // Check if ID already exists
    const result = await pool.query(
      'SELECT id FROM artists WHERE artist_id = $1',
      [artistId]
    );
    
    if (result.rows.length === 0) {
      return artistId;
    }
    
    attempts++;
  }
  
  throw new Error('Failed to generate unique Artist ID after maximum attempts');
}

/**
 * Generate 7-character Booking ID (BK + 5 alphanumeric)
 * Format: BK12A3F (BK prefix + 5 random alphanumeric characters)
 */
export async function generateBookingId() {
  let attempts = 0;
  const maxAttempts = 100;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  while (attempts < maxAttempts) {
    // Generate 5 random alphanumeric characters
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const bookingId = 'BK' + randomPart;
    
    // Check if ID already exists
    const result = await pool.query(
      'SELECT id FROM bookings WHERE booking_id = $1',
      [bookingId]
    );
    
    if (result.rows.length === 0) {
      return bookingId;
    }
    
    attempts++;
  }
  
  throw new Error('Failed to generate unique Booking ID after maximum attempts');
}

/**
 * Validate User ID format (4 digits)
 */
export function validateUserId(userId) {
  return /^\d{4}$/.test(userId);
}

/**
 * Validate Artist ID format (5 digits)
 */
export function validateArtistId(artistId) {
  return /^\d{5}$/.test(artistId);
}

/**
 * Validate Booking ID format (BK + 5 alphanumeric)
 */
export function validateBookingId(bookingId) {
  return /^BK[A-Z0-9]{5}$/.test(bookingId);
}
