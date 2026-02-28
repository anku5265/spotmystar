import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// Get all categories with optional grouping
router.get('/', async (req, res) => {
  try {
    const { grouped } = req.query;
    
    let result = await pool.query(`
      SELECT * FROM categories 
      WHERE is_active = true 
      ORDER BY display_order, name
    `);
    
    // If no categories exist, seed them automatically
    if (result.rows.length === 0) {
      console.log('No categories found, seeding from schema-v2...');
      // Categories will be seeded by schema-v2.sql
      result = await pool.query(`
        SELECT * FROM categories 
        WHERE is_active = true 
        ORDER BY display_order, name
      `);
    }
    
    if (grouped === 'true') {
      // Group categories by category_group
      const grouped = {
        performing_artists: [],
        creative_professionals: [],
        influencers_creators: []
      };
      
      result.rows.forEach(cat => {
        if (grouped[cat.category_group]) {
          grouped[cat.category_group].push(cat);
        }
      });
      
      return res.json(grouped);
    }
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get category by ID or slug with attributes
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Get category
    const categoryResult = await pool.query(`
      SELECT * FROM categories 
      WHERE (id::text = $1 OR slug = $1) AND is_active = true
    `, [identifier]);
    
    if (categoryResult.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const category = categoryResult.rows[0];
    
    // Get category attributes
    const attributesResult = await pool.query(`
      SELECT * FROM category_attributes 
      WHERE category_id = $1 
      ORDER BY display_order, attribute_label
    `, [category.id]);
    
    category.attributes = attributesResult.rows;
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attributes for a category
router.get('/:categoryId/attributes', async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const result = await pool.query(`
      SELECT * FROM category_attributes 
      WHERE category_id = $1 
      ORDER BY display_order, attribute_label
    `, [categoryId]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create category (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, slug, icon, description, categoryGroup, displayOrder } = req.body;
    const result = await pool.query(`
      INSERT INTO categories (name, slug, icon, description, category_group, display_order) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `, [name, slug, icon, description, categoryGroup, displayOrder || 0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update category (admin only)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, icon, description, categoryGroup, isActive, displayOrder } = req.body;
    
    const result = await pool.query(`
      UPDATE categories 
      SET name = COALESCE($1, name),
          slug = COALESCE($2, slug),
          icon = COALESCE($3, icon),
          description = COALESCE($4, description),
          category_group = COALESCE($5, category_group),
          is_active = COALESCE($6, is_active),
          display_order = COALESCE($7, display_order),
          updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `, [name, slug, icon, description, categoryGroup, isActive, displayOrder, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create category attribute (admin only)
router.post('/:categoryId/attributes', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { attributeName, attributeLabel, attributeType, isRequired, options, placeholder, helpText, displayOrder } = req.body;
    
    const result = await pool.query(`
      INSERT INTO category_attributes 
      (category_id, attribute_name, attribute_label, attribute_type, is_required, options, placeholder, help_text, display_order) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *
    `, [categoryId, attributeName, attributeLabel, attributeType, isRequired || false, options, placeholder, helpText, displayOrder || 0]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update category attribute (admin only)
router.patch('/attributes/:attributeId', async (req, res) => {
  try {
    const { attributeId } = req.params;
    const { attributeLabel, attributeType, isRequired, options, placeholder, helpText, displayOrder } = req.body;
    
    const result = await pool.query(`
      UPDATE category_attributes 
      SET attribute_label = COALESCE($1, attribute_label),
          attribute_type = COALESCE($2, attribute_type),
          is_required = COALESCE($3, is_required),
          options = COALESCE($4, options),
          placeholder = COALESCE($5, placeholder),
          help_text = COALESCE($6, help_text),
          display_order = COALESCE($7, display_order),
          updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `, [attributeLabel, attributeType, isRequired, options, placeholder, helpText, displayOrder, attributeId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Attribute not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete category attribute (admin only)
router.delete('/attributes/:attributeId', async (req, res) => {
  try {
    const { attributeId } = req.params;
    
    const result = await pool.query('DELETE FROM category_attributes WHERE id = $1 RETURNING *', [attributeId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Attribute not found' });
    }
    
    res.json({ message: 'Attribute deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
