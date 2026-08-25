const express = require('express');
const router = express.Router();
const User = require('../models/user');
const path = require('path')


router.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../public', 'login.html')));
router.get('/signup', (req, res) => res.sendFile(path.join(__dirname, '../public', 'register.html')));

router.post('/signup', async (req, res) => {
  try {
    const { regRole, regName, regEmail, regPhone, regPassword, regPasswordConfirm } = req.body;

    if (regPassword !== regPasswordConfirm) {
      return res.redirect('/signup?error=' + encodeURIComponent('Passwords do not match.'));
    }

    const existingUser = await User.findOne({ email: regEmail });
    if (existingUser) {
      return res.redirect('/signup?error=' + encodeURIComponent('Email is already registered.'));
    }

    await User.create({
      role: regRole,
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword
    });

    return res.redirect('/login');
  } catch (err) {
    console.error('Signup error:', err);
    return res.redirect('/signup?error=' + encodeURIComponent('Server error during registration.'));
  }
});

router.post('/login', async (req, res) => {
  try {
    const { loginRole, loginEmail, loginPassword } = req.body;

    const user = await User.findOne({ role: loginRole, email: loginEmail });
    if (!user) {
      return res.redirect('/login?error=' + encodeURIComponent('Invalid email or role selected.'));
    }

    const isMatch = await user.matchPassword(loginPassword);
    if (!isMatch) {
      return res.redirect('/login?error=' + encodeURIComponent('Invalid password.'));
    }

    req.session.user = { id: user._id, email: user.email, name: user.name, role: user.role };
    return res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    return res.redirect('/login?error=' + encodeURIComponent('Server error during login.'));
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;