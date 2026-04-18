const mongoose = require('mongoose');
require('dotenv').config();

// Models
const User = require('./src/models/User');
const MenuItem = require('./src/models/MenuItem');
const Inventory = require('./src/models/Inventory');

const MENU_ITEMS = [

];

async function seed() {
  try {
    const uri = process.env.CLOUD_MONGO_URI || process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is missing in .env');

    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected.');

    // 0. Wipe existing data (COMMENTED OUT FOR PRODUCTION SAFETY)
    /*
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      MenuItem.deleteMany({}),
      Inventory.deleteMany({})
    ]);
    */

    // 1. Seed Users
    console.log('👤 Seeding Users...');
    const users = [
      { name: 'Owner (Admin)', username: 'admin', passwordHash: 'admin123', role: 'admin', email: process.env.ADMIN_EMAIL || 'alokgupta1605@gmail.com' },
      { name: 'Manager (Demo)', username: 'manager', passwordHash: 'manager123', role: 'manager' },
      { name: 'Staff (Waiter)', username: 'staff', passwordHash: 'staff123', role: 'staff' },
    ];

    for (const u of users) {
      await User.create(u);
      console.log(`- Created user: ${u.username}`);
    }

    // 2. Seed Menu Items & Inventory
    console.log('🍽️ Seeding Menu & Tracking Inventory...');
    const STOCK_CATEGORIES = ['Alcohol', 'Beverages', 'Cans', 'Packed Items', 'Cold Drinks', 'Starter']; // User said Starter too? No, "alcool and packed only"
    
    // Adjusted categories based on user request "alcool and packed items only"
    const TRACKED = ['Alcohol', 'Beverages', 'Cans', 'Packed Items', 'Soft Drinks'];

    for (const item of MENU_ITEMS) {
      const menuItem = await MenuItem.create(item);
      console.log(`- Added menu item: ${item.name}`);

      // ONLY create Inventory for specific categories
      if (TRACKED.includes(item.category)) {
        await Inventory.create({
          name: menuItem.name,
          category: menuItem.category,
          stock: 50,
          minStock: 5,
          unit: 'portion',
          price: menuItem.price,
          imageUrl: menuItem.imageUrl || ''
        });
        console.log(`- Tracking Inventory for: ${item.name}`);
      }
    }

    console.log('\n✨ Database Seeded Successfully!');
    console.log('You can now log in using:');
    console.log('Admin: admin / admin123');
    console.log('Manager: manager / manager123');
    console.log('Staff: staff / staff123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
