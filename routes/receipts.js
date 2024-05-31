const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('../db');
const router = express.Router();

// Get all receipts
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const receipts = await db.collection('receipts').find().toArray();
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get receipt by ID
router.get('/:id', getReceipt, (req, res) => {
  res.json(res.receipt);
});

// Get receipt by reference
router.get('/reference/:reference', async (req, res) => {
  try {
    const db = getDb();
    const receipt = await db.collection('receipts').findOne({ reference: req.params.reference });
    if (receipt == null) {
      return res.status(404).json({ message: 'Cannot find receipt' });
    }
    res.json(receipt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create one receipt
router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const receipt = {
      reference: req.body.reference,
      date: new Date(),
      totalAmount: Number(req.body.totalAmount),
      products: req.body.products.map(product => ({ ...product, productId: new ObjectId(product.product) })),
      customer: req.body.customer,
    };
    console.log('Creating receipt:', receipt);

    // Trigger for product quantity update
    await receipt.products.forEach(async (product) => {
      try {
        const db = getDb();
        const productToUpdate = await db.collection('products').findOne({ _id: new ObjectId(product.product) });
        console.log('Product to update:', productToUpdate);
        productToUpdate.sizeChart.forEach(sizeItem => {
          if (sizeItem.size === product.size) {
            sizeItem.quantity -= product.quantity;
          }
        });
        await db.collection('products').updateOne({ _id: new ObjectId(product.product) }, { $set: { sizeChart: productToUpdate.sizeChart } });
        console.log('Product updated:', productToUpdate);
      } catch (err) {
        console.error('Error updating product:', err);
      }
    });
  
    const newReceipt = await db.collection('receipts').insertOne(receipt);
    res.status(201).json(newReceipt);
    console.log('Receipt created:', newReceipt);
  } catch (err) {
    res.status(400).json({ message: err });
    console.error('Error creating receipt:', err);
  }
});

// Update one receipt
router.put('/:id', getReceipt, async (req, res) => {
  if (req.body.reference != null) {
      res.receipt.reference = req.body.reference;
  }
  if (req.body.date != null) {
      res.receipt.date = req.body.date;
  }
  if (req.body.totalAmount != null) {
      res.receipt.totalAmount = req.body.totalAmount;
  }
  if (req.body.products != null) {
      res.receipt.products = req.body.products;
  }
  if (req.body.customer != null) {
      res.receipt.customer = req.body.customer;
  }

  // Trigger for product quantity update
  res.receipt.products.forEach(async (product) => {
    try {
      const db = getDb();
      const productToUpdate = await db.collection('products').findOne({ _id: product.product });
      productToUpdate.sizeChart.forEach(sizeItem => {
        if (sizeItem.size === product.size) {
          sizeItem.quantity -= product.quantity;
        }
      });
      await db.collection('products').updateOne({ _id: product.product }, { $set: { sizeChart: productToUpdate.sizeChart } });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  try {
    const updatedReceipt = await res.receipt.save();
    res.json(updatedReceipt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete one receipt
router.delete('/:id', getReceipt, async (req, res) => {
  try {
    await res.receipt.remove();
    res.json({ message: 'Deleted Receipt' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Function to get receipt by ID
async function getReceipt(req, res, next) {
  let receipt;
  try {
    const db = getDb();
    receipt = await db.collection('receipts').findOne({ _id: ObjectId(req.params.id) });
    if (receipt == null) {
      return res.status(404).json({ message: 'Cannot find receipt' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.receipt = receipt;
  next();
}

module.exports = router;