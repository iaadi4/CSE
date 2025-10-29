import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

async function createTestUser() {
  const username = 'testuser';
  const email = 'test@example.com';
  const password = 'password123';
  const role = 'investor';

  const password_hash = await bcrypt.hash(password, 10);
  const uuid = randomUUID();

  const sql = `INSERT INTO users (id, uuid, username, email, password_hash, role, created_at, updated_at) VALUES (
    '${uuid}',
    '${randomUUID()}',
    '${username}',
    '${email}',
    '${password_hash}',
    '${role}',
    NOW(),
    NOW()
  );`;

  console.log(sql);
}

createTestUser().catch(console.error);