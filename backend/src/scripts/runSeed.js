const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { seedDatabase } = require('../utils/dbSeeder');

dotenv.config();

const runSeeder = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('❌ MONGODB_URI is not set in environmental variables!');
            process.exit(1);
        }

        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('🔌 Connected to MongoDB.');

        console.log('🌱 Starting database seeding...');
        await seedDatabase();

        console.log('🎉 Seeding successfully executed!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Database seeding failed:', err.message);
        process.exit(1);
    }
};

runSeeder();
