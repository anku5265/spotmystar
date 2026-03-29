import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Max file size: 5MB
const MAX_SIZE = 5 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

/**
 * POST /api/upload/image
 * Accepts: multipart/form-data with field "image"
 * Returns: { url: "https://..." }
 *
 * Uses Supabase Storage — no disk storage needed (works on Vercel serverless)
 */
router.post('/image', verifyToken, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ message: 'Storage not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to environment.' });
    }

    // Parse multipart manually using raw body
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ message: 'Content-Type must be multipart/form-data' });
    }

    // Use multer in memory mode (no disk — works on Vercel)
    const multer = (await import('multer')).default;
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (req, file, cb) => {
        if (ALLOWED_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
        }
      }
    }).single('image');

    // Wrap multer in promise
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const { buffer, mimetype, originalname } = req.file;
    const ext = originalname.split('.').pop().toLowerCase() || 'jpg';
    const folder = req.query.folder || 'general';
    const fileName = `${folder}/${req.user.id}_${Date.now()}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('artist-profiles')
      .upload(fileName, buffer, {
        contentType: mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ message: 'Upload failed: ' + uploadError.message });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('artist-profiles')
      .getPublicUrl(fileName);

    res.json({
      success: true,
      url: publicUrl,
      fileName
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    res.status(500).json({ message: error.message });
  }
});

export default router;
