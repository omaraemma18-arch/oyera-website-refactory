import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.mjs';

function signToken(user) {
  return jwt.sign(
    { id: user._id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/login — used by both admins and technicians
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter your email and password.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const token = signToken(user);
    res.json({ token, user: user.toSafeObject() });
  } catch {
    res.status(500).json({ error: 'Something went wrong logging in. Please try again.' });
  }
}

// POST /api/auth/register-technician — admin only, creates a technician account
export async function registerTechnician(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const technician = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: 'technician',
    });

    res.status(201).json({ user: technician.toSafeObject() });
  } catch {
    res.status(500).json({ error: 'Something went wrong creating the account. Please try again.' });
  }
}

// GET /api/auth/me — used to restore a session and to identify the logged-in user in the UI
export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: user.toSafeObject() });
  } catch {
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

// GET /api/auth/technicians — admin only, list of technicians (for reference/management)
export async function listTechnicians(req, res) {
  try {
    const technicians = await User.find({ role: 'technician' }).sort({ name: 1 });
    res.json({ technicians: technicians.map((t) => t.toSafeObject()) });
  } catch {
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
