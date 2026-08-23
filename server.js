const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');



// Middleware to parse incoming data
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

//static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to  request bodies
app.use(express.json());

//login post route
app.post('/login', (req, res) => {
console.log(req.body)
});
//signup post route
app.post('/signup', (req, res) => {
console.log(req.body)
});
//addinventory
app.post('/addinventory', (req, res) => {
console.log(req.body)
});
//addnnewcustomer
app.post('/addnewcustomer', (req, res) => {
console.log(req.body)
});


// Basic GET route
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/services', (req, res) => res.sendFile(path.join(__dirname, 'public', 'services.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/inventory', (req, res) => res.sendFile(path.join(__dirname, 'public', 'inventory.html')));
app.get('/addinventory', (req, res) => res.sendFile(path.join(__dirname, 'public', 'addinventory.html')));
app.get('/addnewcustomer', (req, res) => res.sendFile(path.join(__dirname, 'public', 'addnewcustomer.html')));




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