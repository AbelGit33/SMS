const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  const user = db.findUserByUsername(username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = generateToken(user);
  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  });
});

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  const existing = db.findUserByUsername(username);
  if (existing) {
    return res.status(409).json({ message: 'Username or email already exists' });
  }
  const hash = bcrypt.hashSync(password, 10);
  const user = db.createUser(username, email, hash);
  const token = generateToken(user);
  res.status(201).json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
  });
});

router.get('/me', (req, res) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token' });
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'sms-jwt-secret-2024');
    const user = db.findUserById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
