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

// 2. สร้างโครงสร้างข้อมูล (Schema & Model) สำหรับเก็บข้อมูลรถและของแต่ง
const BikeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  price: Number,
  cc: String,
  desc: String,
  model: String
});

const Bike = mongoose.model('Bike', BikeSchema);

// 3. เสิร์ฟไฟล์หน้าเว็บ (HTML, CSS, JS, รูปภาพ) จากโฟลเดอร์ด้านนอก
app.use(express.static(path.join(__dirname, '../')));

// 4. หน้าแรก http://localhost:3000 ให้เปิด index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// 5. API สำหรับดึงข้อมูลสินค้าทั้งหมด (GET)
app.get('/api/bikes', async (req, res) => {
  try {
    const bikes = await Bike.find();
    res.json(bikes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. API สำหรับเพิ่มข้อมูลรถเข้า Database (POST)
app.post('/api/bikes', async (req, res) => {
  try {
    const newBike = new Bike(req.body);
    const savedBike = await newBike.save();
    res.status(201).json(savedBike);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Route สำหรับยิงข้อมูลเริ่มต้นเข้า MongoDB (Seed Data)
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

// 8. เริ่มรัน Server (ต้องอยู่ล่างสุดเสมอ)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server รันอยู่ที่ http://localhost:${PORT}`));