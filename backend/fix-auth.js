import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('./backend/routes/auth.js', 'utf8');

// Remove generateUserId import
content = content.replace("import { generateUserId } from '../utils/idGenerator.js';\n", '');

// Fix the INSERT query - remove user_id
content = content.replace(
  `    // Generate unique User ID
    const userId = await generateUserId();

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, phone, password, role, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, phone, user_id',
      [name, email, phone, hashedPassword, 'user', userId]
    );`,
  `    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone',
      [name, email, phone, hashedPassword, 'user']
    );`
);

// Remove userId from response
content = content.replace("        userId: user.user_id,\n        ", '');

writeFileSync('./backend/routes/auth.js', content, 'utf8');
console.log('Fixed!');
