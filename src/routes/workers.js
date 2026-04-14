const express = require('express');
const Worker = require('../models/Worker');
const Transaction = require('../models/Transaction');
const { getCache, setCache, deleteCache } = require('../lib/redis');
const router = express.Router();

const WORKERS_CACHE_KEY = 'workers:all';

router.get('/', async (req, res) => {
  try {
    const cached = await getCache(WORKERS_CACHE_KEY);
    if (cached) return res.json(cached);

    const workers = await Worker.find().sort({ name: 1 });
    await setCache(WORKERS_CACHE_KEY, workers, 300);
    res.json(workers);
  }
  catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/:id/history', async (req, res) => {
  try {
    const history = await Transaction.find({ workerId: req.params.id }).sort({ date: -1 });
    res.json(history);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const worker = new Worker(req.body);
    const savedWorker = await worker.save();

    if (parseFloat(req.body.paidSalary) > 0) {
      await new Transaction({
        workerId: savedWorker._id,
        workerName: savedWorker.name,
        amount: parseFloat(req.body.paidSalary),
        type: 'Payment'
      }).save();
    }
    await deleteCache(WORKERS_CACHE_KEY);
    res.status(201).json(savedWorker);
  } catch (err) { res.status(400).json({ message: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const oldWorker = await Worker.findById(req.params.id);
    if (!oldWorker) return res.status(404).json({ message: 'Worker not found' });
    const newTotalPaid = parseFloat(req.body.paidSalary) || 0;
    const addedAmount = newTotalPaid - oldWorker.paidSalary;

    const updated = await Worker.findByIdAndUpdate(req.params.id, req.body, { 
      new: true, 
      runValidators: true 
    });

    if (addedAmount > 0) {
      await new Transaction({
        workerId: updated._id,
        workerName: updated.name,
        amount: addedAmount,
        type: 'Payment'
      }).save();
    }
    await deleteCache(WORKERS_CACHE_KEY);
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Transaction.deleteMany({ workerId: req.params.id });
    const result = await Worker.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Worker not found' });
    await deleteCache(WORKERS_CACHE_KEY);
    res.json({ success: true, id: req.params.id }); 
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
