const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const pagesRouter = require('./routes/pages');
const apiRouter = require('./routes/api');

app.use('/', pagesRouter);
app.use('/api', apiRouter);

// Serve widget.js from public folder at /widget.js
app.get('/widget.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'widget.js'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PulseScore running on http://0.0.0.0:${PORT}`);
});
