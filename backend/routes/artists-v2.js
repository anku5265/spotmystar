import express from 'express';
import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Search artists with filters (supports multi-category)
router.get('/search', async (req, res) => {
  try {
    const { city, category, minPrice, maxPrice, search } = req.query;
    
    let query = `
      SELECT DISTINCT a.*, 
        array_agg(DISTINCT c.name) as categories,
        array_agg(DISTINCT c.icon) as category_icons
      FROM artists a 
      LEFT JOIN artist_categories ac ON a.id = ac.artist_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE a.status = 'approved' AND a.is_verified = true
    `;
    const params = [];
    let paramCount = 1;

    if (city) {
      query += ` AND (LOWER(a.primary_city) LIKE LOWER($${paramCount}) OR $${paramCount} = ANY(a.service_locations))`;
      params.push(`%${city}%`);
      paramCount++;
    }

    if (category) {
      query += ` AND ac.category_id = $${paramCount}`;
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

    query += ` GROUP BY a.id ORDER BY a.rating DESC, a.total_bookings DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get featured artists
router.get('/featured', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT a.*, 
        array_agg(DISTINCT c.name) as categories,
        array_agg(DISTINCT c.icon) as category_icons
      FROM artists a 
      LEFT JOIN artist_categories ac ON a.id = ac.artist_id
      LEFT JOIN categories c ON ac.category_id = c.id
      WHERE a.status = 'approved' AND a.is_verified = true 
      GROUP BY a.id
      ORDER BY a.rating DESC, a.total_bookings DESC 
      LIMIT 6
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get artist by stage name or ID with all details including dynamic attributes
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { skipViewCount } = req.query;
    
    // Get artist basic info
    const artistResult = await pool.query(`
      SELECT a.*
      FROM artists a 
      WHERE a.stage_name = $1 OR a.id::text = $1
    `, [identifier]);

    if (artistResult.rows.length === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const artist = artistResult.rows[0];

    // Get artist categories
    const categoriesResult = await pool.query(`
      SELECT c.*, ac.is_primary
      FROM categories c
      JOIN artist_categories ac ON c.id = ac.category_id
      WHERE ac.artist_id = $1
      ORDER BY ac.is_primary DESC, c.name
    `, [artist.id]);

    artist.categories = categoriesResult.rows;

    // Get artist dynamic attribute values
    const attributesResult = await pool.query(`
      SELECT ca.attribute_name, ca.attribute_label, ca.attribute_type, aav.value
      FROM artist_attribute_values aav
      JOIN category_attributes ca ON aav.attribute_id = ca.id
      WHERE aav.artist_id = $1
      ORDER BY ca.display_order
    `, [artist.id]);

    artist.attributes = attributesResult.rows;

    // Increment views only if skipViewCount is not true
    if (skipViewCount !== 'true') {
      await pool.query('UPDATE artists SET views = views + 1 WHERE id = $1', [artist.id]);
    }

    res.json(artist);
  } catch (error) {
    console.error('Get artist error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Artist registration (multi-step with dynamic attributes)
router.post('/register', async (req, res) => {
  try {
    const {
      // Step 1: Basic Info
      fullName,
      stageName,
      email,
      phone,
      password,
      
      // Step 2: Categories
      categories, // Array of category IDs
      primaryCategory, // Primary category ID
      
      // Step 3: Profile
      shortBio,
      detailedDescription,
      primaryCity,
      serviceLocations, // Array of cities
      yearsOfExperience,
      
      // Step 4: Pricing
      pricingModel,
      priceMin,
      priceMax,
      
      // Step 5: Media
      profileImage,
      coverImage,
      portfolioImages,
      portfolioVideos,
      
      // Step 6: Social Links
      instagram,
      youtube,
      facebook,
      twitter,
      linkedin,
      website,
      
      // Step 7: Dynamic Attributes
      dynamicAttributes, // Object with attribute_id: value pairs
      
      // Terms
      termsAccepted,
      privacyAccepted
    } = req.body;

    // Validation
    if (!fullName || !stageName || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!categories || categories.length === 0) {
      return res.status(400).json({ message: 'Please select at least one category' });
    }

    if (!termsAccepted || !privacyAccepted) {
      return res.status(400).json({ message: 'Please accept terms and privacy policy' });
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

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert artist
      const artistResult = await client.query(`
        INSERT INTO artists (
          full_name, stage_name, email, phone, password,
          short_bio, detailed_description,
          primary_city, service_locations,
          years_of_experience,
          pricing_model, price_min, price_max,
          profile_image, cover_image, portfolio_images, portfolio_videos,
          instagram, youtube, facebook, twitter, linkedin, website,
          terms_accepted, privacy_accepted,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, 'submitted')
        RETURNING id, full_name, stage_name, email, status, is_verified
      `, [
        fullName, stageName, email, phone, hashedPassword,
        shortBio, detailedDescription,
        primaryCity, serviceLocations || [],
        yearsOfExperience || 0,
        pricingModel || 'per_event', priceMin || 0, priceMax || 0,
        profileImage, coverImage, portfolioImages || [], portfolioVideos || [],
        instagram, youtube, facebook, twitter, linkedin, website,
        termsAccepted, privacyAccepted
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
            await client.query(`
              INSERT INTO artist_attribute_values (artist_id, attribute_id, value)
              VALUES ($1, $2, $3)
            `, [artist.id, attributeId, typeof value === 'object' ? JSON.stringify(value) : String(value)]);
          }
        }
      }

      await client.query('COMMIT');

      // Generate JWT token
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

// Update artist profile
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const allowedFields = [
      'full_name', 'stage_name', 'phone',
      'short_bio', 'detailed_description',
      'primary_city', 'service_locations',
      'years_of_experience',
      'pricing_model', 'price_min', 'price_max',
      'profile_image', 'cover_image', 'portfolio_images', 'portfolio_videos',
      'instagram', 'youtube', 'facebook', 'twitter', 'linkedin', 'website'
    ];

    const setClause = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (setClause.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    values.push(id);
    const query = `
      UPDATE artists 
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating artist:', error);
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

// Update artist dynamic attributes
router.patch('/:id/attributes', async (req, res) => {
  try {
    const { id } = req.params;
    const { attributes } = req.body; // Object with attribute_id: value pairs

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const [attributeId, value] of Object.entries(attributes)) {
        if (value !== null && value !== undefined && value !== '') {
          // Upsert attribute value
          await client.query(`
            INSERT INTO artist_attribute_values (artist_id, attribute_id, value)
            VALUES ($1, $2, $3)
            ON CONFLICT (artist_id, attribute_id) 
            DO UPDATE SET value = $3, updated_at = NOW()
          `, [id, attributeId, typeof value === 'object' ? JSON.stringify(value) : String(value)]);
        } else {
          // Delete if value is empty
          await client.query(`
            DELETE FROM artist_attribute_values 
            WHERE artist_id = $1 AND attribute_id = $2
          `, [id, attributeId]);
        }
      }

      await client.query('COMMIT');
      res.json({ message: 'Attributes updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating attributes:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
