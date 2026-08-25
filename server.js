const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Middleware to parse incoming data
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

//static files
app.use(express.static(path.join(__dirname, 'public')));



//importing mongoose models
const User = require('./models/user');
const addInventoryRoutes = require('./routes/addInventoryRoutes')

app.use('/', addInventoryRoutes);


//3.configarations
//DB configarations
mongoose.connect(process.env.DATABASE,{})
mongoose.connection
.once('open',() =>{
    console.log('connected to monogodb successfully..');
})
.on('error',(err)=>{
    console.error('mongo DB connection error: ',err);
})

//time loger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Request received at ${req.method} ${req.url}`);
  next();
});


// Middleware to  request bodies
app.use(express.json());

//login post route
app.post('/login', async (req, res) => {
  try {
    const { loginRole, loginEmail, loginPassword } = req.body;

    const user = await User.findOne({
      role: loginRole,
      email: loginEmail,
    
    });

    if (!user) {
      return res.status(401).send('Invalid email, password, or role. <a href="/login">Try again</a>');
    }

    console.log(`Login successful: ${user.email}`);
    res.redirect('/dashboard');

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error during login.');
  }
});

//signup post route
app.post('/signup', async(req, res) => {
try{
  const{
    regRole, 
      regName, 
      regEmail, 
      regPhone, 
      regPassword, 
      regPasswordConfirm
  } = req.body;
  //varify passwad
  if(regPassword !== regPasswordConfirm){
       return res.redirect('Passwords do not match. <a href="/signup">Try again</a>');
  }
  //check if the user exists
  const existingUser = await User.findOne({ email:regEmail });
    if (existingUser) {
      return res.redirect('Email is already registered. <a href="/signup">Try again</a>');
    }
    
//creating user in mongo db
await User.create({
      role: regRole,
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword
    });
    console.log(`User registered successfully: ${regEmail}`);
res.redirect('/login')

} catch (err) {
    console.error('Signup error:', err);
    res.redirect('Server error during registration.');
  }
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