import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { supabase, supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const BUCKET_NAME = 'artist-profiles'; // Single source of truth

// Ensure bucket exists — creates it if missing (requires service_role key)
async function ensureBucket() {
  const client = supabaseAdmin || supabase;
  const { data: buckets, error } = await client.storage.listBuckets();
  if (error) {
    console.warn('Cannot list buckets (bucket may need manual creation):', error.message);
    return; // Don't throw — let upload attempt proceed
  }

  const exists = buckets.some(b => b.name === BUCKET_NAME);
  if (!exists) {
    const { error: createError } = await client.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: MAX_SIZE,
      allowedMimeTypes: ALLOWED_TYPES,
    });
    if (createError) {
      console.warn(`Cannot auto-create bucket '${BUCKET_NAME}':`, createError.message);
      // Don't throw — bucket may need to be created manually in Supabase dashboard
    } else {
      console.log(`✓ Bucket '${BUCKET_NAME}' created automatically`);
    }
  }
}

/**
 * POST /api/upload/image
 * Accepts: multipart/form-data with field "image"
 * Returns: { url: "https://..." }
 */
router.post('/image', verifyToken, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ message: 'Storage not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to .env' });
    }

    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ message: 'Content-Type must be multipart/form-data' });
    }

    // Parse with multer (memory storage — works on Vercel serverless)
    const multer = (await import('multer')).default;
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Only image files allowed (jpg, png, webp, gif)'));
      }
    }).single('image');

    await new Promise((resolve, reject) => {
      upload(req, res, (err) => { if (err) reject(err); else resolve(); });
    });

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Ensure bucket exists before uploading
    await ensureBucket();

    const { buffer, mimetype, originalname } = req.file;
    const ext = originalname.split('.').pop().toLowerCase() || 'jpg';
    const folder = req.query.folder || 'general';
    const fileName = `${folder}/${req.user.id}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, { contentType: mimetype, upsert: true });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ message: 'Upload failed: ' + uploadError.message });
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    res.json({ success: true, url: publicUrl, fileName });
  } catch (error) {
    console.error('Upload error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum 5MB allowed.' });
    }
    res.status(500).json({ message: error.message });
  }
});

export default router;
