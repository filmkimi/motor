const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. คำสั่งเชื่อมต่อ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ เชื่อมต่อ MongoDB สำเร็จเรียบร้อย!'))
  .catch(err => console.error('❌ เชื่อมต่อ MongoDB ล้มเหลว:', err.message));

// 2. โครงสร้างข้อมูลสินค้า (Bike Schema)
const BikeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  price: Number,
  cc: String,
  desc: String,
  model: String
});
const Bike = mongoose.model('Bike', BikeSchema);

// 3. โครงสร้างข้อมูลคำสั่งซื้อ (Order Schema สำหรับเก็บการสั่งซื้อ)
const OrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  items: [
    {
      id: String,
      name: String,
      price: Number,
      qty: Number
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'รอดำเนินการ' },
  createdAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);

// 4. เสิร์ฟไฟล์หน้าเว็บ (HTML, CSS, JS) จากโฟลเดอร์นอก
app.use(express.static(path.join(__dirname, '../')));

// 5. หน้าแรก http://localhost:3000
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// 6. API ดึงข้อมูลสินค้าทั้งหมด (GET)
app.get('/api/bikes', async (req, res) => {
  try {
    const bikes = await Bike.find();
    res.json(bikes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. API บันทึกคำสั่งซื้อใหม่ลง MongoDB (POST)
app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, customerPhone, items, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'ไม่มีสินค้าในตะกร้า' });
    }

    const newOrder = new Order({
      customerName,
      customerPhone,
      items,
      totalAmount
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ message: 'บันทึกคำสั่งซื้อสำเร็จ!', orderId: savedOrder._id });
  } catch (err) {
    console.error('Error saving order:', err);
    res.status(500).json({ error: err.message });
  }
});

// 8. API สำหรับดูรายการสั่งซื้อทั้งหมด (ไว้เปิดเช็กหลังบ้าน)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Route Seed Data สินค้าเริ่มต้น
app.get('/api/seed', async (req, res) => {
  try {
    await Bike.deleteMany({});
    const initialBikes = [
      {
        name: "โช้คหลัง Profender X-Series PCX 160",
        category: "suspension",
        price: 11500,
        desc: "ปรับ Rebound 16 ระดับ ซับแทงค์แท้ รับประกัน 2 ปี",
        model: "pcx"
      },
      {
        name: "ชุดชามข้างแต่งแท้ปรับองศา + เม็ด",
        category: "performance",
        price: 2490,
        desc: "ตรงรุ่น eSP+ สปริงแต่ง ต้นจัด ปลายไหล",
        model: "pcx"
      },
      {
        name: "ปั๊มบน Brembo RCS 15 Corsa Corta",
        category: "suspension",
        price: 12900,
        desc: "แท้ศูนย์ อิตาลี ก้านพับได้ ปรับระยะ 3 โหมด",
        model: "pcx"
      },
      {
        name: "ชุดครอบกรอง + ครอบแคร้ง คาร์บอนแท้",
        category: "carbon",
        price: 3800,
        desc: "คาร์บอนเคฟล่าแท้ ลายผ้า 2 เงาวับ เคลือบ 2K ทนแดด",
        model: "pcx"
      }
    ];
    await Bike.insertMany(initialBikes);
    res.json({ message: "เพิ่มข้อมูลเริ่มต้นเข้า MongoDB สำเร็จแล้ว!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server รันอยู่ที่ http://localhost:${PORT}`));