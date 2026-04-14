const express = require('express');
const Order = require('../models/Order');
const { getCache, setCache, deleteCache } = require('../lib/redis');
const router = express.Router();
const ORDERS_CACHE_KEY = 'orders:all';
const REPORT_SUMMARY_CACHE_KEY = 'reports:daily-summary';

router.get('/', async (req, res) => {
  try {
    const cached = await getCache(ORDERS_CACHE_KEY);
    if (cached) return res.json(cached);

    const orders = await Order.find().sort({ date: -1 });
    await setCache(ORDERS_CACHE_KEY, orders, 180);
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
const Inventory = require('../models/Inventory');

router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    const saved = await order.save();

    // Reduce inventory stock for each item in the order
    if (Array.isArray(order.items)) {
      for (const item of order.items) {
        if (item.name && item.quantity > 0) {
          await Inventory.findOneAndUpdate(
            { name: item.name },
            { $inc: { stock: -Math.abs(item.quantity) } },
            { new: true }
          );
        }
      }
    }

    res.status(201).json(saved);
    await deleteCache([ORDERS_CACHE_KEY, REPORT_SUMMARY_CACHE_KEY]);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const result = await Order.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Order not found' });
    await deleteCache([ORDERS_CACHE_KEY, REPORT_SUMMARY_CACHE_KEY]);
    res.json({ message: 'Order deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
