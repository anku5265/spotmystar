# SpotMYstar Unique ID Generation System

## Overview
This document describes the unique ID generation system implemented for Users, Artists, and Bookings in SpotMYstar.

## ID Formats

### User ID
- **Format**: 4-digit numeric
- **Range**: 1000-9999
- **Example**: `1234`, `5678`
- **Purpose**: Unique identifier for all registered users
- **Generation**: Automatic during user registration

### Artist ID
- **Format**: 5-digit numeric
- **Range**: 10000-99999
- **Example**: `12345`, `67890`
- **Purpose**: Unique identifier for all registered artists
- **Generation**: Automatic during artist registration

### Booking ID
- **Format**: 7-character alphanumeric (BK + 5 chars)
- **Pattern**: `BK[A-Z0-9]{5}`
- **Example**: `BK12A3F`, `BKXY789`
- **Purpose**: Unique identifier for all booking requests
- **Generation**: Automatic during booking creation

## Database Schema

### Users Table
```sql
ALTER TABLE users ADD COLUMN user_id VARCHAR(4) UNIQUE;
CREATE INDEX idx_users_user_id ON users(user_id);
```

### Artists Table
```sql
ALTER TABLE artists ADD COLUMN artist_id VARCHAR(5) UNIQUE;
CREATE INDEX idx_artists_artist_id ON artists(artist_id);
```

### Bookings Table
```sql
ALTER TABLE bookings ADD COLUMN booking_id VARCHAR(7) UNIQUE;
CREATE INDEX idx_bookings_booking_id ON bookings(booking_id);
```

## Implementation

### ID Generator Module
Location: `backend/utils/idGenerator.js`

Functions:
- `generateUserId()` - Generates unique 4-digit User ID
- `generateArtistId()` - Generates unique 5-digit Artist ID
- `generateBookingId()` - Generates unique 7-character Booking ID
- `validateUserId(id)` - Validates User ID format
- `validateArtistId(id)` - Validates Artist ID format
- `validateBookingId(id)` - Validates Booking ID format

### Uniqueness Validation
Each ID generator:
1. Generates a random ID in the specified format
2. Checks database for existing ID
3. Retries up to 100 times if collision detected
4. Throws error if unable to generate unique ID after max attempts

### Integration Points

#### User Registration
- **Route**: `POST /api/auth/user/register`
- **File**: `backend/routes/auth.js`
- **Action**: Generates and assigns `user_id` during registration

#### Artist Registration
- **Route**: `POST /api/artists/register`
- **File**: `backend/routes/artists.js`
- **Action**: Generates and assigns `artist_id` during registration

#### Booking Creation
- **Route**: `POST /api/bookings`
- **File**: `backend/routes/bookings.js`
- **Action**: Generates and assigns `booking_id` during booking creation

## Migration

### Running the Migration
To add ID columns and generate IDs for existing records:

```bash
node backend/apply-unique-ids.js
```

This script will:
1. Add `user_id`, `artist_id`, and `booking_id` columns
2. Create indexes for faster lookups
3. Generate unique IDs for all existing records
4. Display progress and summary

### Migration Safety
- Uses database transactions (ROLLBACK on error)
- Validates uniqueness before insertion
- Provides detailed logging
- Safe to run multiple times (idempotent)

## API Response Changes

### User Registration Response
```json
{
  "token": "...",
  "user": {
    "id": 1,
    "userId": "1234",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Artist Registration Response
```json
{
  "token": "...",
  "artist": {
    "id": 1,
    "artistId": "12345",
    "fullName": "DJ Rohan",
    "stageName": "DJ Rohan",
    "email": "rohan@example.com"
  }
}
```

### Booking Creation Response
```json
{
  "message": "Booking request sent successfully!",
  "bookingId": "BK12A3F",
  "id": 1
}
```

## Admin Dashboard Integration

The unique IDs are displayed in the Admin Dashboard for:
- User management panel (shows User ID)
- Artist management panel (shows Artist ID)
- Booking management panel (shows Booking ID)

This enables:
- Easy tracking and reference
- Quick search by ID
- Better operational control
- Improved customer support

## Benefits

1. **Traceability**: Every entity has a unique, human-readable identifier
2. **Privacy**: IDs don't expose sequential database IDs
3. **Support**: Easy reference in customer support tickets
4. **Reporting**: Simplified reporting and analytics
5. **Integration**: Clean IDs for external system integration
6. **Security**: Harder to guess than sequential IDs

## Best Practices

1. Always use the ID generators for new records
2. Never manually assign IDs
3. Include IDs in all customer communications
4. Use IDs for search and filtering in admin panels
5. Log IDs in all transaction records
6. Display IDs in confirmation emails

## Troubleshooting

### ID Generation Fails
If ID generation fails after 100 attempts:
- Check database connectivity
- Verify table structure
- Check for index corruption
- Review database logs

### Duplicate ID Error
If duplicate ID error occurs:
- Should never happen with proper implementation
- Check if migration was run correctly
- Verify unique constraints are in place
- Review application logs

## Future Enhancements

Potential improvements:
- Add prefix customization (e.g., USR1234, ART12345)
- Implement ID recycling for deleted records
- Add checksum validation
- Support custom ID formats per tenant
- Add ID history tracking
