import pool from './config/db.js';
import bcrypt from 'bcryptjs';

const resetAdmin = async () => {
  try {
    // Delete existing admin
    await pool.query("DELETE FROM users WHERE email = 'admin@spotmystar.com'");
    console.log('Deleted old admin');
    
    // Create new admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (email, name, password, role) VALUES ($1, $2, $3, $4)',
      ['admin@spotmystar.com', 'Admin', hashedPassword, 'admin']
    );
    console.log('✅ Created new admin');
    console.log('Email: admin@spotmystar.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

resetAdmin();
