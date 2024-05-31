require('dotenv').config();
const express = require('express');
const { connectToDb } = require('./db');
const app = express();
const cors = require('cors')

app.use(express.json(), cors());

const productsRouter = require('./routes/products');
const receiptsRouter = require('./routes/receipts');

// Connect to MongoDB
connectToDb()
  .then(() => {
    console.log('MongoDB connected');

    // Routes
    app.use('/api/products', productsRouter);
    app.use('/api/receipts', receiptsRouter);

    // Start server
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
