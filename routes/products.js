// routes/products.js  (ESM)
import { Router } from 'express';
import { MongoClient } from 'mongodb';

const router = Router();

// ── Mongo
const client = new MongoClient(process.env.MONGO_URL);
await client.connect();
const db = client.db('oliveyoung_db');         // ← DB명
const Products = db.collection('products');    // ← 컬렉션명

// GET /api/products/all
router.get('/all', async (_req, res) => {
  const docs = await Products.find({})
    .project({ name:1, brand:1, price:1, image_url:1, ranking:1 })
    .limit(100)
    .toArray(); 
  res.json(docs);
});

// GET /api/products/search?q=키워드
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  const query = q
    ? { $or: [
        { ranking:  { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { product_no: { $regex: q, $options: 'i' } },
        { product_url: { $regex: q, $options: 'i' } },
        { image_url: { $regex: q, $options: 'i' } },
        { ingredients: { $regex: q, $options: 'i' } },
        { price: { $regex: q, $options: 'i' } }
      ] }
    : {};
  const docs = await Products.find(query)
    .project({ name:1, brand:1, price:1, image_url:1, ranking:1,  product_url:1})
    .limit(50)
    .toArray();
  res.json(docs);
});

export default router;
