const express = require('express');
const path = require('path');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'landing.html'));
});

router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'dashboard.html'));
});

router.get('/survey/:token', (req, res) => {
  const { token } = req.params;
  const record = db.prepare('SELECT * FROM survey_tokens WHERE token = ? AND used = 0').get(token);
  if (!record) {
    return res.status(404).send('<h2>This survey link has already been used or is invalid.</h2>');
  }
  res.sendFile(path.join(__dirname, '..', 'views', 'survey.html'));
});

module.exports = router;
