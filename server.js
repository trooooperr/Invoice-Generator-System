require('dotenv').config();

const mongoose = require('mongoose');
const cron = require('node-cron');
const fetch = require('node-fetch');

const app = require('./app');
const { connectRedis } = require('./src/lib/redis');
const Settings = require('./src/models/Settings');

const PORT = process.env.PORT || 3000;
const REPORT_TIME = process.env.REPORT_CRON || '55 23 * * *';

const mongoUri =
  process.env.USE_LOCAL_DB === 'true'
    ? process.env.LOCAL_MONGO_URI
    : process.env.CLOUD_MONGO_URI;

if (!mongoUri) {
  console.error('❌ No MongoDB URI found');
  process.exit(1);
}

function scheduleDailyReport() {
  cron.schedule(REPORT_TIME, async () => {
    try {
      const persistedSettings = await (async () => {
        const existing = await Settings.findOne();
        return existing || Settings.create({});
      })();

      const emailConfig = {
        senderEmail: persistedSettings.senderEmail || process.env.GMAIL_SENDER,
        senderPassword: persistedSettings.senderPassword || process.env.GMAIL_APP_PASSWORD,
        adminEmail: persistedSettings.adminEmail || process.env.ADMIN_EMAIL,
      };

      const settings = {
        restaurantName: persistedSettings.restaurantName || process.env.RESTAURANT_NAME || 'HumTum',
        currency: persistedSettings.currency || '₹',
        sgstRate: persistedSettings.sgstRate ?? 2.5,
        cgstRate: persistedSettings.cgstRate ?? 2.5,
        address: persistedSettings.address || '',
        gstin: persistedSettings.gstin || '',
      };

      if (!emailConfig.senderEmail || !emailConfig.senderPassword || !emailConfig.adminEmail) {
        console.log('⏭ Skipping report: missing email configuration');
        return;
      }

      const response = await fetch(`http://127.0.0.1:${PORT}/api/reports/send-daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailConfig, settings, inventory: [] }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log(`✅ Daily report sent (${result.ordersCount})`);
      } else {
        console.error('❌ Daily report failed:', result.error || 'Unknown error');
      }
    } catch (err) {
      console.error('❌ Cron error:', err.message);
    }
  }, { timezone: 'Asia/Kolkata' });

  console.log(`⏰ Cron scheduled: ${REPORT_TIME}`);
}

async function startServer() {
  try {
    console.log('🚀 Starting server...');

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');

    const redisClient = await connectRedis();
    console.log(redisClient?.isReady ? '✅ Redis ready' : '⚠️ Redis fallback');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    scheduleDailyReport();

  } catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  }
}

// only run in production/dev, not test
if (process.env.NODE_ENV !== 'test') {
  startServer();
}
