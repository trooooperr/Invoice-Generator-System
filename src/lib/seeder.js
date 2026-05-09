const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const User = require('../models/User');

const SEED_MENU = [

];

const SEED_INVENTORY = [

];

async function seedIMSData() {
  try {


    // 1. Clear existing data in ims_db
    await Promise.all([
      MenuItem.deleteMany({}),
      Inventory.deleteMany({}),
      Order.deleteMany({}),
    ]);


    // 2. Seed Menu
    await MenuItem.insertMany(SEED_MENU);


    // 3. Seed Inventory
    await Inventory.insertMany(SEED_INVENTORY);


    // 4. Seed 12 Orders
    const orders = [];
    for (let i = 1; i <= 12; i++) {
        const item = SEED_MENU[Math.floor(Math.random() * SEED_MENU.length)];
        const qty = Math.floor(Math.random() * 3) + 1;
        const subtotal = item.price * qty;
        const tax = Math.round(subtotal * 0.025); // 2.5% SGST + 2.5% CGST (approx)
        
        orders.push({
            billNo: `IMS-${1000 + i}`,
            date: new Date(Date.now() - (13 - i) * 60 * 60 * 1000 * 5), // Spread over last few days
            grandTotal: subtotal + (tax * 2),
            paidAmount: subtotal + (tax * 2),
            dueAmount: 0,
            paymentMode: ['cash', 'upi', 'card'][Math.floor(Math.random() * 3)],
            tableNo: Math.floor(Math.random() * 12) + 1,
            items: [{ name: item.name, quantity: qty, price: item.price }],
            subtotal: subtotal,
            sgst: tax,
            cgst: tax,
            discount: 0,
            roundOff: 0,
            customerName: `Customer ${i}`,
            customerPhone: `98765432${i}0`
        });
    }
    await Order.insertMany(orders);
  

    // 5. Clear Redis Cache
    const { deleteCache } = require('./redis');
    await deleteCache(['menu:all', 'inventory:all', 'reports:daily-summary', 'workers:all']);
    console.log('🧹 Redis cache cleared for IMS.');

    console.log('✅ IMS Data Seeding Completed Successfully.');
  } catch (err) {
    console.error('❌ IMS Seeding Error:', err.message);
  }
}

module.exports = { seedIMSData };
