import express from 'express';
import User from '../models/user.js';

const router = express.Router();

// Login POST route
router.post('/login', async (req, res) => {
  try {
    const { loginRole, loginEmail, loginPassword } = req.body;

    const user = await User.findOne({
      role: loginRole,
      email: loginEmail,
    });

    if (!user) {
      return res.send('Invalid email, password, or role. <a href="/login">Try again</a>');
    }

    console.log(`Login successful: ${user.email}`);
    return res.redirect('/dashboard');

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).send('Server error during login. <a href="/login">Try again</a>');
  }
});

// Signup POST route
router.post('/signup', async (req, res) => {
  try {
    const {
      regRole, 
      regName, 
      regEmail, 
      regPhone, 
      regPassword, 
      regPasswordConfirm
    } = req.body;

    // Verify passwords match
    if (regPassword !== regPasswordConfirm) {
      return res.send('Passwords do not match. <a href="/signup">Try again</a>');
    }

    // Check if the user exists
    const existingUser = await User.findOne({ email: regEmail });
    if (existingUser) {
      return res.send('Email is already registered. <a href="/signup">Try again</a>');
    }
    
    // Create user in MongoDB
    await User.create({
      role: regRole,
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword
    });

    console.log(`User registered successfully: ${regEmail}`);
    return res.redirect('/login');

  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).send('Server error during registration. <a href="/signup">Try again</a>');
  }
});

export default router;