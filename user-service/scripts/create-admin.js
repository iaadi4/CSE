import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

async function generateAdminSQL() {
  const username = 'admin';
  const email = 'admin@example.com';
  const password = 'Admin@123'; // Change this to a secure password
  const role = 'admin';
  
  // Generate password hash
  const password_hash = await bcrypt.hash(password, 10);
  const id = randomUUID();
  
  const sql = `
INSERT INTO users (id, username, email, password_hash, role, created_at)
VALUES (
  '${id}',
  '${username}',
  '${email}',
  '${password_hash}',
  '${role}',
  NOW()
);
  `.trim();
  
  console.log('SQL Command to create admin user:');
  console.log('=====================================');
  console.log(sql);
  console.log('=====================================');
  console.log('\nCredentials:');
  console.log('Username:', username);
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Role:', role);
}

generateAdminSQL().catch(console.error);
