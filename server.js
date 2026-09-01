// server.mjs
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

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

mongoose.connect(process.env.DATABASE, {});
mongoose.connection
  .once('open', () => {
    console.log('Connected to MongoDB successfully..');
  })
  .on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

app.use(addInventoryRoutes);
app.use(authRoutes);
app.use(addNewCustomerRoutes);
app.use(serviceRecordsRoutes);

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, 'public', 'services.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/inventory', (req, res) => res.sendFile(path.join(__dirname, 'public', 'inventory.html')));
app.get('/addinventory', (req, res) => res.sendFile(path.join(__dirname, 'public', 'addinventory.html')));
app.get('/servicerecords', (req, res) => res.sendFile(path.join(__dirname, 'public', 'servicerecords.html')));
app.get('/addnewcustomer', (req, res) => res.sendFile(path.join(__dirname, 'public', 'addnewcustomer.html')));

app.use((req, res) => {
  res.status(404).send('Oopps, route not found....');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});