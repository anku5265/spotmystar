import express from 'express';
import pool from '../config/db.js';
import { verifyToken, requireUser } from '../middleware/auth.js';

const router = express.Router();

// GET /api/reviews/artist/:artistId — public
router.get('/artist/:artistId', async (req, res) => {
  try {
    const { artistId } = req.params;
    const { sort = 'recent' } = req.query;

    let orderBy = 'r.created_at DESC';
    if (sort === 'highest') orderBy = 'r.rating DESC, r.created_at DESC';
    if (sort === 'helpful') orderBy = 'r.helpful_count DESC, r.created_at DESC';

    const result = await pool.query(`
      SELECT r.*,
             u.name as user_name,
             a.reply as artist_reply,
             a.reply_at as artist_reply_at
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN review_artist_replies a ON a.review_id = r.id
      WHERE r.artist_id = $1
      ORDER BY ${orderBy}
    `, [artistId]);

    // Summary stats
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total,
        ROUND(AVG(rating)::numeric, 1) as avg_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews WHERE artist_id = $1
    `, [artistId]);

    // Top tags
    const tagsResult = await pool.query(`
      SELECT unnest(tags) as tag, COUNT(*) as count
      FROM reviews WHERE artist_id = $1
      GROUP BY tag ORDER BY count DESC LIMIT 5
    `, [artistId]);

    res.json({
      reviews: result.rows,
      stats: stats.rows[0],
      topTags: tagsResult.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/reviews — user only, must have completed booking
router.post('/', verifyToken, requireUser, async (req, res) => {
  try {
    const { artistId, bookingId, rating, reviewText, tags } = req.body;
    const userId = req.user.id;

    if (!artistId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Artist ID and rating (1-5) are required' });
    }

    // Check: user must have a completed booking with this artist
    const bookingCheck = await pool.query(`
      SELECT id FROM bookings
      WHERE user_id = $1 AND artist_id = $2 AND status = 'completed'
      LIMIT 1
    `, [userId, artistId]);

    if (bookingCheck.rows.length === 0) {
      return res.status(403).json({ message: 'You can only review artists you have booked and completed an event with.' });
    }

    // One review per booking (if bookingId provided)
    if (bookingId) {
      const dupCheck = await pool.query(
        'SELECT id FROM reviews WHERE user_id = $1 AND booking_id = $2',
        [userId, bookingId]
      );
      if (dupCheck.rows.length > 0) {
        return res.status(400).json({ message: 'You have already reviewed this booking.' });
      }
    } else {
      // One review per artist per user
      const dupCheck = await pool.query(
        'SELECT id FROM reviews WHERE user_id = $1 AND artist_id = $2',
        [userId, artistId]
      );
      if (dupCheck.rows.length > 0) {
        return res.status(400).json({ message: 'You have already reviewed this artist.' });
      }
    }

    const result = await pool.query(`
      INSERT INTO reviews (user_id, artist_id, booking_id, rating, review_text, tags)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [userId, artistId, bookingId || null, parseInt(rating), reviewText || '', tags || []]);

    // Update artist avg rating
    await pool.query(`
      UPDATE artists SET
        rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE artist_id = $1),
        updated_at = NOW()
      WHERE id = $1
    `, [artistId]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/reviews/:id — edit own review
router.put('/:id', verifyToken, requireUser, async (req, res) => {
  try {
    const { rating, reviewText, tags } = req.body;
    const result = await pool.query(`
      UPDATE reviews SET rating = $1, review_text = $2, tags = $3, updated_at = NOW()
      WHERE id = $4 AND user_id = $5
      RETURNING *
    `, [rating, reviewText, tags || [], req.params.id, req.user.id]);

    if (result.rows.length === 0) return res.status(404).json({ message: 'Review not found or not yours' });

    // Update artist avg rating
    await pool.query(`
      UPDATE artists SET rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE artist_id = (SELECT artist_id FROM reviews WHERE id = $1))
      WHERE id = (SELECT artist_id FROM reviews WHERE id = $1)
    `, [req.params.id]);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/reviews/:id
router.delete('/:id', verifyToken, requireUser, async (req, res) => {
  try {
    const review = await pool.query('SELECT artist_id FROM reviews WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (review.rows.length === 0) return res.status(404).json({ message: 'Review not found or not yours' });

    await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);

    // Update artist avg rating
    await pool.query(`
      UPDATE artists SET rating = COALESCE((SELECT ROUND(AVG(rating)::numeric, 1) FROM reviews WHERE artist_id = $1), 0)
      WHERE id = $1
    `, [review.rows[0].artist_id]);

    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/reviews/:id/helpful — mark helpful
router.post('/:id/helpful', verifyToken, requireUser, async (req, res) => {
  try {
    await pool.query('UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = $1', [req.params.id]);
    res.json({ message: 'Marked as helpful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/reviews/:id/reply — artist reply
router.post('/:id/reply', verifyToken, async (req, res) => {
  try {
    const { reply } = req.body;
    const review = await pool.query('SELECT artist_id FROM reviews WHERE id = $1', [req.params.id]);
    if (review.rows.length === 0) return res.status(404).json({ message: 'Review not found' });
    if (String(review.rows[0].artist_id) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Only the artist can reply' });
    }

    await pool.query(`
      INSERT INTO review_artist_replies (review_id, reply, reply_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (review_id) DO UPDATE SET reply = $2, reply_at = NOW()
    `, [req.params.id, reply]);

    res.json({ message: 'Reply posted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/reviews/can-review/:artistId — check if user can review
router.get('/can-review/:artistId', verifyToken, requireUser, async (req, res) => {
  try {
    const { artistId } = req.params;
    const userId = req.user.id;

    const booking = await pool.query(`
      SELECT id FROM bookings
      WHERE user_id = $1 AND artist_id = $2 AND status = 'completed'
      LIMIT 1
    `, [userId, artistId]);

    const existing = await pool.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND artist_id = $2',
      [userId, artistId]
    );

    res.json({
      canReview: booking.rows.length > 0 && existing.rows.length === 0,
      hasBooked: booking.rows.length > 0,
      hasReviewed: existing.rows.length > 0,
      bookingId: booking.rows[0]?.id || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
