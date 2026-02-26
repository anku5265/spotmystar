import pool from './config/db.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Starting database seed...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if admin exists
    const existingAdmin = await pool.query(
      "SELECT * FROM users WHERE email = 'admin@spotmystar.com'"
    );

    if (existingAdmin.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (email, name, password, role) VALUES ($1, $2, $3, $4)",
        ['admin@spotmystar.com', 'Admin', hashedPassword, 'admin']
      );
      console.log('✓ Admin user created (email: admin@spotmystar.com, password: admin123)');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Check if categories exist
    const existingCategories = await pool.query('SELECT COUNT(*) FROM categories');
    
    if (parseInt(existingCategories.rows[0].count) === 0) {
      const categories = [
        ['DJ', '🎧', 'Professional DJs for all events'],
        ['Anchor', '🎤', 'Event hosts and MCs'],
        ['Band', '🎸', 'Live music bands'],
        ['Singer', '🎵', 'Solo singers and vocalists'],
        ['Dancer', '💃', 'Dance performers'],
        ['Comedian', '😂', 'Stand-up comedians']
      ];

      for (const [name, icon, description] of categories) {
        await pool.query(
          'INSERT INTO categories (name, icon, description) VALUES ($1, $2, $3)',
          [name, icon, description]
        );
      }
      console.log('✓ Categories seeded');
    } else {
      console.log('✓ Categories already exist');
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDefault Credentials:');
    console.log('Email: admin@spotmystar.com');
    console.log('Password: admin123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
