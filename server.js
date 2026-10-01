import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // <--- Make sure bcryptjs is imported for hashing the seed password
import User from './models/User.mjs'; // <--- Import your User model

import addInventoryRoutes from './routes/addInventoryRoutes.mjs';
import authRoutes from './routes/authRoutes.mjs';
import addNewCustomerRoutes from './routes/addNewCustomerRoutes.mjs';
import serviceRecordsRoutes from './routes/serviceRecordsRoutes.mjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Function to automatically create the seed admin if it doesn't exist
async function seedAdminUser() {
  try {
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@oyera.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'opio0741', 10);
      
      await User.create({
        name: process.env.SEED_ADMIN_NAME || 'Admin',
        email: adminEmail,
        passwordHash: hashedPassword,
        role: 'admin'
      });

      console.log(`[Database Seeder] Default admin user created successfully (${adminEmail})`);
    } else {
      console.log(`[Database Seeder] Admin user already exists.`);
    }
  } catch (err) {
    console.error('Error seeding admin user:', err);
  }
}

mongoose.connect(process.env.DATABASE, {});
mongoose.connection
  .once('open', async () => {
    console.log('Connected to MongoDB successfully..');
    await seedAdminUser(); // <--- Automatically runs when connected to Atlas!
  })
  .on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

// api routes
app.use(addInventoryRoutes);
app.use(authRoutes);
app.use(addNewCustomerRoutes);
app.use(serviceRecordsRoutes);

// page routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, 'public', 'services.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/inventory', (req, res) => res.sendFile(path.join(__dirname, 'public', 'inventory.html')));
app.get('/addinventory', (req, res) => res.sendFile(path.join(__dirname, 'public', 'addinventory.html')));
app.get('/addservicerecord', (req, res) => res.sendFile(path.join(__dirname, 'public', 'addservicerecord.html')));
app.get('/addnewcustomer', (req, res) => res.sendFile(path.join(__dirname, 'public', 'addnewcustomer.html')));
app.get('/servicerecords', (req, res) => res.sendFile(path.join(__dirname, 'public', 'servicerecords.html')));
app.get('/customer', (req, res) => res.sendFile(path.join(__dirname, 'public', 'customer.html')));

app.use((req, res) => {
  res.status(404).send('Oopps, route not found....');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});