require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = process.env.MONGODB_URI;

// Load JSON schemas
const productSchema = JSON.parse(fs.readFileSync('schemas/products.json', 'utf-8'));
const receiptSchema = JSON.parse(fs.readFileSync('schemas/receipts.json', 'utf-8'));

async function resetCollections() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('gameon');

    // Drop collections if they exist
    const collections = await db.collections();
    for (let collection of collections) {
      await collection.drop();
      console.log(`Dropped collection ${collection.collectionName}`);
    }

    // Recreate collections with schema validation
    await db.createCollection("receipts", {
        validator: receiptSchema
      });
    console.log("Collection 'receipts' created with schema validation");

    await db.createCollection("products", {
        validator: productSchema
    });
    console.log("Collection 'products' created with schema validation");

  } catch (err) {
    console.error("Error resetting collections", err);
  } finally {
    await client.close();
  }
}

resetCollections();
