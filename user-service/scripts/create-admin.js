import bcrypt from 'bcryptjs';
import { prisma } from "../src/db.js";

async function generateAdminSQL() {
  const username = 'admin1';
  const email = 'admin1@example.com';
  const password = 'Admin@123'; // Change this to a secure password
  const role = 'admin';
  
  // Generate password hash
  const password_hash = await bcrypt.hash(password, 10);
  
  await prisma.users.create({
    data: {
      username,
      email,
      password_hash,
      role,
    }
  })

  console.log('\nCredentials:');
  console.log('Username:', username);
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Role:', role);
}

generateAdminSQL().catch(console.error);
