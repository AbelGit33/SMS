const express = require('express');
const db = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res) => {
  const { limit } = req.query;
  res.json(db.getActivity(parseInt(limit) || 20));
});

module.exports = router;
