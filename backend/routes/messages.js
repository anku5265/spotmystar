import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/messages/conversations — get all conversations for logged-in artist/user
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const { id, role } = req.user;

    // Get all unique conversations (latest message per conversation partner)
    const result = await pool.query(`
      SELECT DISTINCT ON (partner_id)
        partner_id,
        partner_type,
        partner_name,
        message,
        is_read,
        sender_id,
        created_at,
        booking_id
      FROM (
        SELECT
          CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END as partner_id,
          CASE WHEN sender_id = $1 THEN receiver_type ELSE sender_type END as partner_type,
          message,
          is_read,
          sender_id,
          created_at,
          booking_id
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1
        ORDER BY created_at DESC
      ) sub
      LEFT JOIN (
        SELECT id as uid, COALESCE(name, full_name, stage_name) as partner_name FROM users
        UNION ALL
        SELECT id as uid, COALESCE(stage_name, full_name) as partner_name FROM artists
      ) people ON people.uid = sub.partner_id
      ORDER BY partner_id, created_at DESC
    `, [id]);

    // Count unread per conversation
    const unreadResult = await pool.query(`
      SELECT sender_id as partner_id, COUNT(*) as unread_count
      FROM messages
      WHERE receiver_id = $1 AND is_read = false
      GROUP BY sender_id
    `, [id]);

    const unreadMap = {};
    unreadResult.rows.forEach(r => { unreadMap[r.partner_id] = parseInt(r.unread_count); });

    const conversations = result.rows.map(r => ({
      partnerId: r.partner_id,
      partnerType: r.partner_type,
      partnerName: r.partner_name || 'Unknown',
      lastMessage: r.message,
      lastMessageTime: r.created_at,
      unreadCount: unreadMap[r.partner_id] || 0,
      bookingId: r.booking_id,
      isOwn: String(r.sender_id) === String(id),
    }));

    res.json(conversations);
  } catch (error) {
    console.error('Conversations error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/messages/:partnerId — get messages with a specific person
router.get('/:partnerId', verifyToken, async (req, res) => {
  try {
    const { id } = req.user;
    const { partnerId } = req.params;

    const result = await pool.query(`
      SELECT m.*,
        CASE WHEN m.sender_id = $1 THEN 'me' ELSE 'them' END as direction
      FROM messages m
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC
    `, [id, partnerId]);

    // Mark messages as read
    await pool.query(`
      UPDATE messages SET is_read = true
      WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false
    `, [id, partnerId]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/messages — send a message
router.post('/', verifyToken, async (req, res) => {
  try {
    const { id, role } = req.user;
    const { receiverId, receiverType, message, bookingId } = req.body;

    if (!receiverId || !receiverType || !message?.trim()) {
      return res.status(400).json({ message: 'receiverId, receiverType and message are required' });
    }

    const result = await pool.query(`
      INSERT INTO messages (sender_id, sender_type, receiver_id, receiver_type, message, booking_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [id, role, receiverId, receiverType, message.trim(), bookingId || null]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/messages/read/:partnerId — mark all messages from partner as read
router.patch('/read/:partnerId', verifyToken, async (req, res) => {
  try {
    const { id } = req.user;
    const { partnerId } = req.params;

    await pool.query(`
      UPDATE messages SET is_read = true
      WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false
    `, [id, partnerId]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/messages/unread/count — total unread count
router.get('/unread/count', verifyToken, async (req, res) => {
  try {
    const { id } = req.user;
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = $1 AND is_read = false',
      [id]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
