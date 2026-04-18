const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const User = require('../models/User');

const SEED_MENU = [
  { name: 'Classic Burger', category: 'Snacks', price: 120, available: true },
  { name: 'Veg Pizza', category: 'Snacks', price: 250, available: true },
  { name: 'French Fries', category: 'Snacks', price: 80, available: true },
  { name: 'Masala Tea', category: 'Drinks', price: 30, available: true },
  { name: 'Cold Coffee', category: 'Drinks', price: 90, available: true },
  { name: 'Coca Cola', category: 'Drinks', price: 40, available: true },
  { name: 'White Pasta', category: 'Main Course', price: 180, available: true },
  { name: 'Veg Noodles', category: 'Main Course', price: 150, available: true },
  { name: 'Club Sandwich', category: 'Snacks', price: 110, available: true },
  { name: 'Chocolate Ice Cream', category: 'Dessert', price: 70, available: true },
];

const SEED_INVENTORY = [
  { name: 'Classic Burger', category: 'Kitchen', unit: 'pcs', stock: 50, minStock: 10, price: 60 },
  { name: 'Veg Pizza', category: 'Kitchen', unit: 'pcs', stock: 30, minStock: 5, price: 120 },
  { name: 'French Fries', category: 'Kitchen', unit: 'kg', stock: 20, minStock: 5, price: 40 },
  { name: 'Milk', category: 'Dairy', unit: 'litres', stock: 40, minStock: 10, price: 55 },
  { name: 'Masala Tea', category: 'Drinks', unit: 'pcs', stock: 100, minStock: 20, price: 5 },
  { name: 'Coca Cola', category: 'Drinks', unit: 'bottles', stock: 60, minStock: 12, price: 25 },
  { name: 'Pasta Base', category: 'Kitchen', unit: 'kg', stock: 15, minStock: 3, price: 90 },
  { name: 'Noodles Pack', category: 'Kitchen', unit: 'pcs', stock: 40, minStock: 8, price: 35 },
  { name: 'Ice Cream Tub', category: 'Dairy', unit: 'pcs', stock: 25, minStock: 5, price: 45 },
  { name: 'Sandwich Bread', category: 'Bakery', unit: 'pkts', stock: 30, minStock: 6, price: 40 },
];

async function seedIMSData() {
  try {
    console.log('🌱 Starting IMS Data Seeding...');

    // 1. Clear existing data in ims_db
    await Promise.all([
      MenuItem.deleteMany({}),
      Inventory.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log('🗑️ Existing IMS data cleared.');

    // 2. Seed Menu
    await MenuItem.insertMany(SEED_MENU);
    console.log('📋 10 Menu Items seeded.');

    // 3. Seed Inventory
    await Inventory.insertMany(SEED_INVENTORY);
    console.log('📦 10 Inventory Items seeded.');

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
    console.log('🧾 12 Orders seeded.');

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
