import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.mjs';

export default async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/oyera_auto';
  await mongoose.connect(uri);
  await seedAdmin();
}

// Creates the very first admin account if no admin exists yet, so there is
// always a way to log in and start registering technicians.
async function seedAdmin() {
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) return;

  const name = process.env.SEED_ADMIN_NAME || 'Admin';
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@oyera.com').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ name, email, passwordHash, role: 'admin' });

  console.log('----------------------------------------------------');
  console.log('No admin account existed, so one was created:');
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
  console.log('Log in and change this password (or set SEED_ADMIN_* in .env before first run).');
  console.log('----------------------------------------------------');
}
