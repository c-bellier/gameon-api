const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('../db');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const products = await db.collection('products').find().toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one product by ID
router.get('/:id', getProduct, (req, res) => {
  res.json(res.product);
});

// Get product by reference
router.get('/reference/:reference', async (req, res) => {
  try {
    const db = getDb();
    const product = await db.collection('products').findOne({ reference: req.params.reference });
    if (product == null) {
      return res.status(404).json({ message: 'Cannot find product' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const db = getDb();
    const products = await db.collection('products').find({ category: req.params.category }).toArray();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create one product
router.post('/', async (req, res) => {
  const db = getDb();
  const product = {
    brand: req.body.brand,
    price: req.body.price,
    name: req.body.name,
    reference: req.body.reference,
    category: req.body.category,
    sizeChart: req.body.sizeChart,
    supplier: req.body.supplier,
    sectionId: req.body.sectionId,
    quantity: req.body.quantity,
  };

  try {
    const newProduct = await db.collection('products').insertOne(product);
    res.status(201).json(newProduct.ops[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update one product
router.put('/:id', getProduct, async (req, res) => {
    if (req.body.brand != null) {
      res.product.brand = req.body.brand;
    }
    if (req.body.price != null) {
      res.product.price = req.body.price;
    }
    if (req.body.name != null) {
      res.product.name = req.body.name;
    }
    if (req.body.reference != null) {
      res.product.reference = req.body.reference;
    }
    if (req.body.category != null) {
      res.product.category = req.body.category;
    }
    if (req.body.sizeChart != null) {
      res.product.sizeChart = req.body.sizeChart;
    }
    if (req.body.supplier != null) {
      res.product.supplier = req.body.supplier;
    }
    if (req.body.sectionId != null) {
      res.product.sectionId = req.body.sectionId;
    }
    if (req.body.quantity != null) {
      res.product.quantity = req.body.quantity;
    }
  
    try {
      const updatedProduct = await res.product.save();
      res.json(updatedProduct);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
});

// Delete one product
router.delete('/:id', getProduct, async (req, res) => {
    try {
      await res.product.remove();
      res.json({ message: 'Deleted Product' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

// Function to get product by ID
async function getProduct(req, res, next) {
  let product;
  try {
    const db = getDb();
    product = await db.collection('products').findOne({ _id: ObjectId(req.params.id) });
    if (product == null) {
      return res.status(404).json({ message: 'Cannot find product' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.product = product;
  next();
}

module.exports = router;