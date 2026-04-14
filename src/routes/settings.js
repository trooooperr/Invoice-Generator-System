const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { getCache, setCache, deleteCache } = require('../lib/redis');

const SETTINGS_CACHE_KEY = 'settings:current';
const FIXED_SENDER_EMAIL = '2k23.cs2312451@gmail.com';

const DEFAULTS = {
  senderEmail: FIXED_SENDER_EMAIL,
  senderPassword: process.env.GMAIL_APP_PASSWORD || '',
  adminEmail: process.env.ADMIN_EMAIL || '',
};

function normalizeSettings(data) {
  return {
    ...data.toObject(),
    inventoryCategories: data.inventoryCategories || [],
    menuCategories: data.menuCategories || [],
    senderEmail: FIXED_SENDER_EMAIL,
    adminEmail: data.adminEmail || DEFAULTS.adminEmail,
  };
}

async function getOrCreateSettings() {
  const existing = await Settings.findOne();
  if (existing) {
    if (existing.senderEmail !== FIXED_SENDER_EMAIL) {
      existing.senderEmail = FIXED_SENDER_EMAIL;
      await existing.save();
    }
    return existing;
  }

  return Settings.create({ senderEmail: FIXED_SENDER_EMAIL });
}

// Add Inventory Category
router.post('/inventory-category', async (req, res) => {
  const { category } = req.body;
  if (!category || typeof category !== 'string') return res.status(400).json({ message: 'Category required' });
  const settings = await getOrCreateSettings();
  settings.senderEmail = FIXED_SENDER_EMAIL;
  if (!settings.inventoryCategories.includes(category)) {
    settings.inventoryCategories.push(category);
    await settings.save();
  }
  await deleteCache(SETTINGS_CACHE_KEY);
  res.json(settings.inventoryCategories);
});

// Remove Inventory Category
router.delete('/inventory-category', async (req, res) => {
  const { category } = req.body;
  if (!category || typeof category !== 'string') return res.status(400).json({ message: 'Category required' });
  const settings = await getOrCreateSettings();
  settings.senderEmail = FIXED_SENDER_EMAIL;
  settings.inventoryCategories = settings.inventoryCategories.filter(c => c !== category);
  await settings.save();
  await deleteCache(SETTINGS_CACHE_KEY);
  res.json(settings.inventoryCategories);
});


// Add Menu Category
router.post('/menu-category', async (req, res) => {
  const { category } = req.body;
  if (!category || typeof category !== 'string') return res.status(400).json({ message: 'Category required' });
  const settings = await getOrCreateSettings();
  settings.senderEmail = FIXED_SENDER_EMAIL;
  if (!settings.menuCategories.includes(category)) {
    settings.menuCategories.push(category);
    await settings.save();
  }
  await deleteCache(SETTINGS_CACHE_KEY);
  res.json(settings.menuCategories);
});

// Remove Menu Category
router.delete('/menu-category', async (req, res) => {
  const { category } = req.body;
  if (!category || typeof category !== 'string') return res.status(400).json({ message: 'Category required' });
  const settings = await getOrCreateSettings();
  settings.senderEmail = FIXED_SENDER_EMAIL;
  settings.menuCategories = settings.menuCategories.filter(c => c !== category);
  await settings.save();
  await deleteCache(SETTINGS_CACHE_KEY);
  res.json(settings.menuCategories);
});


// GET

// GET settings
router.get('/', async (req, res) => {
  const cached = await getCache(SETTINGS_CACHE_KEY);
  if (cached) return res.json(cached);

  const data = await getOrCreateSettings();
  const normalized = normalizeSettings(data);
  await setCache(SETTINGS_CACHE_KEY, normalized, 300);
  res.json(normalized);
});

router.put('/', async (req, res) => {
  const settings = await getOrCreateSettings();
  const updatable = [
    'restaurantName', 'address', 'gstin', 'phone', 'sgstRate', 'cgstRate', 'currency', 'thankYouMsg', 'darkMode',
    'inventoryCategories', 'menuCategories', 'adminEmail',
  ];

  updatable.forEach((key) => {
    if (req.body[key] !== undefined) settings[key] = req.body[key];
  });

  settings.senderEmail = FIXED_SENDER_EMAIL;
  await settings.save();
  const normalized = normalizeSettings(settings);
  await deleteCache(SETTINGS_CACHE_KEY);
  res.json(normalized);
});

module.exports = router;
