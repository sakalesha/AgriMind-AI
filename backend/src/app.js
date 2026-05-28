const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const recommendRoutes = require('./routes/recommendRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const historyRoutes = require('./routes/historyRoutes');
const marketRoutes = require('./routes/marketRoutes');
const machineryRoutes = require('./routes/machineryRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../dist')));

// MongoDB Connection (Cached for Serverless)
let cachedDb = null;

const seedMachinery = async () => {
    try {
        const Machinery = require('./models/Machinery');
        const count = await Machinery.countDocuments();
        if (count === 0) {
            console.log('🌱 Seeding initial machinery database...');
            await Machinery.insertMany([
                { name: 'John Deere 5310', owner: 'Harpreet Singh', pricePerDay: 2500, location: 'Amritsar, Punjab', available: true, image: 'https://picsum.photos/seed/tractor1/800/600' },
                { name: 'Mahindra Arjun 555', owner: 'Rajesh Kumar', pricePerDay: 2200, location: 'Ludhiana, Punjab', available: false, image: 'https://picsum.photos/seed/tractor2/800/600' },
                { name: 'Sonalika Worldtrac', owner: 'Gurmeet Singh', pricePerDay: 2800, location: 'Jalandhar, Punjab', available: true, image: 'https://picsum.photos/seed/tractor3/800/600' }
            ]);
            console.log('✅ Machinery database seeded successfully!');
        }
    } catch (err) {
        console.error('❌ Machinery database seeding failed:', err.message);
    }
};

const connectToDatabase = async () => {
    if (cachedDb) return cachedDb;
    const db = await mongoose.connect(process.env.MONGODB_URI);
    cachedDb = db;
    await seedMachinery();
    return db;
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
    // Skip DB check for health/diag/market routes
    if (req.path === '/api/health' || req.path === '/api/diag' || req.path.startsWith('/api/market')) {
        return next();
    }
    try {
        await connectToDatabase();
        next();
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        res.status(500).json({ error: 'Database connection failed', details: err.message });
    }
});

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Render Unified Server is running',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Diagnostic route
app.get('/api/diag', (req, res) => {
    const fs = require('fs');
    const distPath = path.join(__dirname, '../dist');
    try {
        const files = fs.readdirSync(distPath);
        res.json({
            status: 'ok',
            distPath,
            files
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message, distPath });
    }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/machinery', machineryRoutes);

// Fallback for SPA routing
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Standalone server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Unified Node server running on port ${PORT}`);
    console.log(`📂 Serving static files from: ${path.join(__dirname, '../dist')}`);
    console.log(`🔗 Health check available at: /api/health`);
});

module.exports = app;
