const express = require('express');
const router  = express.Router();
const mongodb = require('mongodb');

async function loadExpensesCollection() {
  const client = await mongodb.MongoClient.connect(process.env.MONGODB_URI);
  return client.db('expense_tracker').collection('expenses');
}

router.get('/', async (req, res) => {
  try {
    const col = await loadExpensesCollection();
    const all = await col.find({}).sort({ date: -1 }).toArray();
    res.send(all);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const col = await loadExpensesCollection();
    await col.insertOne({
      description: req.body.description,
      amount:      parseFloat(req.body.amount),
      category:    req.body.category,
      date:        req.body.date,
      createdAt:   new Date(),
    });
    res.status(201).send();
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const col = await loadExpensesCollection();
    await col.updateOne(
      { _id: new mongodb.ObjectId(req.params.id) },
      {
        $set: {
          description: req.body.description,
          amount:      parseFloat(req.body.amount),
          category:    req.body.category,
          date:        req.body.date,
        },
      }
    );
    res.status(200).send();
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const col = await loadExpensesCollection();
    await col.deleteOne({ _id: new mongodb.ObjectId(req.params.id) });
    res.status(200).send();
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

module.exports = router;