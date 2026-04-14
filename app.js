const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { isRedisHealthy } = require('./src/lib/redis');

const app = express();

app.disable('x-powered-by');

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());

app.use('/api/menu', require('./src/routes/menu'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/workers', require('./src/routes/workers'));
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/settings', require('./src/routes/settings'));
app.use('/api/inventory', require('./src/routes/inventory'));

// HEALTH (NO GLOBAL STATE)
app.get('/api/health', async (req, res) => {
  const redis = await isRedisHealthy();

  res.json({
    status: 'ok',
    redis,
    uptime: process.uptime(),
  });
});

app.get('/ready', (req, res) => {
  res.json({ ready: true });
});

// static
const frontendDist = path.join(__dirname, 'frontend', 'dist');

app.use(express.static(frontendDist));

app.get('*', (req, res) => {
  const file = path.join(frontendDist, 'index.html');

  if (fs.existsSync(file)) {
    return res.sendFile(file);
  }

  res.json({ message: 'API running only' });
});

module.exports = app;