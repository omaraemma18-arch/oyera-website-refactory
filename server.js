const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');


//static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to  request bodies
app.use(express.json());

// Basic GET route
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, 'public', 'services.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/inventory', (req, res) => res.sendFile(path.join(__dirname, 'public', 'inventory.html')));
app.get('/additems', (req, res) => res.sendFile(path.join(__dirname, 'public', 'additems.html')));





// Simple request time logger
app.use((req, res, next) => {
   console.log("A new request received at " + Date.now());
next();
});

//handling non existent routes
//should allwys be the last route
    app.use((req,res) =>{
    res.status(404).send('oopps route not found....')
    })  ;
// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});