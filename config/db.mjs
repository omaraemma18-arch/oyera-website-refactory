import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.mjs';

export default async function connectDB() {
  const uri = process.env.DATABASE || process.env.MONGO_URI || 'mongodb://localhost:27017/oyera_auto';
  await mongoose.connect(uri);
  await seedAdmin();
}

async function seedAdmin() {
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) return;

  const name = process.env.SEED_ADMIN_NAME || 'Admin';
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@oyera.com').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ name, email, passwordHash, role: 'admin' });

  console.log(`Created seed admin user: ${email}`);
}