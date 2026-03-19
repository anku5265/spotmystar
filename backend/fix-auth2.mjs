import { readFileSync, writeFileSync } from 'fs';

let c = readFileSync('backend/routes/auth.js', 'utf8');

// Remove import
c = c.replace("import { generateUserId } from '../utils/idGenerator.js';\r\n", '');
c = c.replace("import { generateUserId } from '../utils/idGenerator.js';\n", '');

// Find and replace the problematic section using indexOf
const oldSection = "user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, phone, user_id'";
const idx = c.indexOf(oldSection);
console.log('Found at index:', idx);

if (idx !== -1) {
  // Find start of the generateUserId block
  const genStart = c.indexOf('    // Generate unique User ID');
  const insertEnd = c.indexOf("      [name, email, phone, hashedPassword, 'user', userId]") + 
                    "      [name, email, phone, hashedPassword, 'user', userId]\r\n    );".length;
  
  const newSection = "    // Create user\r\n    const result = await pool.query(\r\n      'INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone',\r\n      [name, email, phone, hashedPassword, 'user']\r\n    );";
  
  c = c.substring(0, genStart) + newSection + c.substring(insertEnd);
  console.log('Replaced INSERT section');
}

// Fix the malformed name line
c = c.replace("        id: user.id,\r\nname: user.name,", "        id: user.id,\r\n        name: user.name,");
c = c.replace("        id: user.id,\nname: user.name,", "        id: user.id,\n        name: user.name,");

writeFileSync('backend/routes/auth.js', c, 'utf8');
console.log('Done!');
