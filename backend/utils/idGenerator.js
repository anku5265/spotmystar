/**
 * ID Generator utility — simplified, no DB dependency for booking IDs
 */

/**
 * Generate a unique booking reference string (no DB check needed)
 * Format: BK + timestamp + random (e.g. BK1234ABCD)
 */
export function generateBookingId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random = '';
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return 'BK' + random;
}

export function validateBookingId(bookingId) {
  return /^BK[A-Z0-9]{5}$/.test(bookingId);
}
