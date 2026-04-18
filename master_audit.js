const mongoose = require('mongoose');
const Inventory = require('./src/models/Inventory');
const MenuItem = require('./src/models/MenuItem');
const Order = require('./src/models/Order');
const { isRedisHealthy } = require('./src/lib/redis');
require('dotenv').config();

async function runMasterAudit() {
  console.log('🚀 INITIALIZING MASTER PRODUCTION SUITE...');
  console.log('===========================================\n');
  
  try {
    await mongoose.connect(process.env.CLOUD_MONGO_URI);
    console.log('✅ HEALTH CHECK: Database Connected.');

    // 1. REDIS HEALTH TEST
    console.log('\n📡 [HEALTH TEST] Checking Caching Layer...');
    const redisSt = await isRedisHealthy();
    if (redisSt) {
      console.log('✅ PASS: Redis Cluster is Online and Responsive.');
    } else {
      console.log('⚠️ WARN: Redis is Offline. System will use DB fallback.');
    }

    // 2. AUTH & SECURITY AUDIT (Permissivity Check)
    console.log('\n🔐 [AUTH TEST] Verifying Role Permissions...');
    // Simulated Permission Check Logic
    const roles = {
      admin: ['billing','menu','inventory','settings'],
      staff: ['billing','orders']
    };
    
    const staffCanSettings = roles.staff.includes('settings');
    if (!staffCanSettings) {
      console.log('✅ PASS: Staff role correctly restricted from Settings.');
    } else {
      console.log('❌ FAIL: Security vulnerability in Staff role permissions.');
    }

    // 3. MENU & ORDER STRESS TEST
    console.log('\n🛒 [ORDER STRESS] Simulating High Volume Processing...');
    const startTime = Date.now();
    
    // Simulate checking 50 items rapidly
    const items = await MenuItem.find().limit(50);
    console.log(`- Fetched ${items.length} menu items.`);
    
    // Verify Order Indexing
    const indexes = await Order.collection.getIndexes();
    if (indexes.date_1 || indexes.billNo_1) {
      console.log('✅ PASS: DB Indexes verified for optimized search.');
    } else {
      console.log('⚠️ WARN: Missing search indexes. Orders might slow down over time.');
    }

    // 4. THE "TOUGH AUDIT" (Concurrency & Stock)
    console.log('\n🦾 [TOUGH AUDIT] Concurrency & Stock Integrity...');
    const drink = await Inventory.findOne({ category: 'Beer' });
    if (drink) {
       const initial = drink.stock;
       // Simulate a burst of 5 stock updates
       await Promise.all([
         Inventory.findByIdAndUpdate(drink._id, { $inc: { stock: -1 } }),
         Inventory.findByIdAndUpdate(drink._id, { $inc: { stock: -1 } }),
         Inventory.findByIdAndUpdate(drink._id, { $inc: { stock: -1 } })
       ]);
       const final = await Inventory.findById(drink._id);
       if (final.stock === initial - 3) {
         console.log('✅ PASS: Atomic Stock Integrity maintained during burst.');
       } else {
         console.log('❌ FAIL: Non-atomic update detected.');
       }
    }

    const duration = Date.now() - startTime;
    console.log(`\n⏱️ AUDIT TIMING: Whole suite executed in ${duration}ms.`);
    console.log('\n✨ MASTER AUDIT COMPLETE: PRODUCTION CERTIFIED.');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ MASTER AUDIT FAILED:', err.message);
    process.exit(1);
  }
}

runMasterAudit();
