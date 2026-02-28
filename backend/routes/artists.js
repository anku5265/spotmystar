import express from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Search artists with filters
router.get('/search', async (req, res) => {
  try {
    const { city, category, minPrice, maxPrice, search } = req.query;
    
    let query = `
      SELECT a.*, c.name as category_name 
      FROM artists a 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE (a.status = 'active' OR a.status = 'approved') AND a.is_verified = true
    `;
    const params = [];
    let paramCount = 1;

    if (city) {
      query += ` AND LOWER(a.city) LIKE LOWER($${paramCount})`;
      params.push(`%${city}%`);
      paramCount++;
    }

    if (category) {
      query += ` AND a.category_id = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (minPrice) {
      query += ` AND a.price_min >= $${paramCount}`;
      params.push(parseInt(minPrice));
      paramCount++;
    }

    if (maxPrice) {
      query += ` AND a.price_max <= $${paramCount}`;
      params.push(parseInt(maxPrice));
      paramCount++;
    }

    if (search) {
      query += ` AND (LOWER(a.full_name) LIKE LOWER($${paramCount}) OR LOWER(a.stage_name) LIKE LOWER($${paramCount}))`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY a.rating DESC, a.total_bookings DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get featured artists
router.get('/featured', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, c.name as category_name 
      FROM artists a 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE (a.status = 'active' OR a.status = 'approved') AND a.is_verified = true 
      ORDER BY a.rating DESC, a.total_bookings DESC 
      LIMIT 6
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get artist by stage name or ID (public - increments views)
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { skipViewCount } = req.query; // Add query parameter to skip view increment
    
    const result = await pool.query(`
      SELECT a.*, c.name as category_name 
      FROM artists a 
      LEFT JOIN categories c ON a.category_id = c.id 
      WHERE a.stage_name = $1 OR a.id::text = $1
    `, [identifier]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    // Increment views only if skipViewCount is not true
    if (skipViewCount !== 'true') {
      await pool.query('UPDATE artists SET views = views + 1 WHERE id = $1', [result.rows[0].id]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Artist registration (supports both old and new multi-category format)
router.post('/register', async (req, res) => {
  try {
    const {
      // Old format fields
      fullName, stageName, category, bio, city, priceMin, priceMax, email, whatsapp, instagram, password,
      
      // New format fields
      phone, categories, primaryCategory, shortBio, detailedDescription, primaryCity, serviceLocations,
      yearsOfExperience, pricingModel, youtube, facebook, twitter, linkedin, website,
      dynamicAttributes, termsAccepted, privacyAccepted
    } = req.body;

    // Determine if this is old or new format
    const isNewFormat = categories && Array.isArray(categories);

    // Validate required fields
    if (!fullName || !stageName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (isNewFormat) {
      if (!categories || categories.length === 0) {
        return res.status(400).json({ message: 'Please select at least one category' });
      }
    } else {
      if (!category) {
        return res.status(400).json({ message: 'Please select a category' });
      }
    }

    // Check if artist exists
    const existing = await pool.query(
      'SELECT * FROM artists WHERE email = $1 OR stage_name = $2',
      [email, stageName]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Artist already exists with this email or stage name' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let artistResult;

      if (isNewFormat) {
        // New multi-category registration
        artistResult = await client.query(`
          INSERT INTO artists (
            full_name, stage_name, email, phone, password,
            short_bio, detailed_description,
            primary_city, city, service_locations,
            years_of_experience,
            pricing_model, price_min, price_max,
            instagram, youtube, facebook, twitter, linkedin, website,
            whatsapp,
            terms_accepted, privacy_accepted,
            status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $4, $20, $21, 'submitted')
          RETURNING id, full_name, stage_name, email, status, is_verified
        `, [
          fullName, stageName, email, phone || whatsapp || '', hashedPassword,
          shortBio || '', detailedDescription || '',
          primaryCity || city || '', // This will be used for both primary_city and city
          serviceLocations || [],
          yearsOfExperience || 0,
          pricingModel || 'per_event', priceMin || 0, priceMax || 0,
          instagram || '', youtube || '', facebook || '', twitter || '', linkedin || '', website || '',
          termsAccepted || false, privacyAccepted || false
        ]);

        const artist = artistResult.rows[0];

        // Insert artist categories
        for (const categoryId of categories) {
          await client.query(`
            INSERT INTO artist_categories (artist_id, category_id, is_primary)
            VALUES ($1, $2, $3)
          `, [artist.id, categoryId, categoryId === primaryCategory]);
        }

        // Insert dynamic attribute values
        if (dynamicAttributes && Object.keys(dynamicAttributes).length > 0) {
          for (const [attributeId, value] of Object.entries(dynamicAttributes)) {
            if (value !== null && value !== undefined && value !== '') {
              const valueStr = Array.isArray(value) ? JSON.stringify(value) : String(value);
              await client.query(`
                INSERT INTO artist_attribute_values (artist_id, attribute_id, value)
                VALUES ($1, $2, $3)
              `, [artist.id, attributeId, valueStr]);
            }
          }
        }
      } else {
        // Old single-category registration (backward compatibility)
        const categoryCheck = await client.query('SELECT id FROM categories WHERE id = $1', [category]);
        if (categoryCheck.rows.length === 0) {
          throw new Error('Invalid category selected');
        }

        artistResult = await client.query(`
          INSERT INTO artists (
            full_name, stage_name, category_id, bio, city, price_min, price_max, 
            email, whatsapp, instagram, password, status,
            phone, primary_city, short_bio
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'submitted', $9, $5, $4)
          RETURNING id, full_name, stage_name, email, status, is_verified
        `, [fullName, stageName, category, bio, city, priceMin, priceMax, email, whatsapp, instagram, hashedPassword]);

        const artist = artistResult.rows[0];

        // Also insert into artist_categories for consistency
        await client.query(`
          INSERT INTO artist_categories (artist_id, category_id, is_primary)
          VALUES ($1, $2, true)
        `, [artist.id, category]);
      }

      await client.query('COMMIT');

      const artist = artistResult.rows[0];
      const token = jwt.sign({ id: artist.id, role: 'artist' }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        message: 'Registration successful! Your profile is under review.',
        token,
        artist: {
          id: artist.id,
          fullName: artist.full_name,
          stageName: artist.stage_name,
          email: artist.email,
          status: artist.status,
          isVerified: artist.is_verified
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Artist registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update artist profile image
router.patch('/:id/profile-image', async (req, res) => {
  try {
    const { id } = req.params;
    const { profileImage } = req.body;

    if (!profileImage) {
      return res.status(400).json({ message: 'Profile image is required' });
    }

    const result = await pool.query(
      'UPDATE artists SET profile_image = $1, updated_at = NOW() WHERE id = $2 RETURNING profile_image',
      [profileImage, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    res.json({ profileImage: result.rows[0].profile_image });
  } catch (error) {
    console.error('Error updating profile image:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
