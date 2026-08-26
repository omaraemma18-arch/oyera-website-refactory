const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// 1. Parsers & Static Files
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, 'public')));

// 2. time loger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 3.mongo  database Connection
mongoose.connect(process.env.DATABASE, {});
mongoose.connection
  .once('open', () => {
    console.log('Connected to MongoDB successfully..');
  })
  .on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

// 4. Router Imports & Mounting
const addInventoryRoutes = require('./routes/addInventoryRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/', addInventoryRoutes);
app.use('/', authRoutes);

// 5. Additional POST Routes
app.post('/addnewcustomer', (req, res) => {
  console.log('Customer Data:', req.body);
  res.redirect('/dashboard');
});

// routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, 'public', 'services.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/inventory', (req, res) => res.sendFile(path.join(__dirname, 'public', 'inventory.html')));
app.get('/addinventory', (req, res) => res.sendFile(path.join(__dirname, 'public', 'addinventory.html')));
app.get('/addnewcustomer', (req, res) => res.sendFile(path.join(__dirname, 'public', 'addnewcustomer.html')));

// 7. handling non exroutes
app.use((req, res) => {
  res.status(404).send('Oopps, route not found....');
});

// 8. Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});