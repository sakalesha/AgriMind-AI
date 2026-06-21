const User = require('../models/User');
const Recommendation = require('../models/Recommendation');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting production-quality database seeding...');

        // Clean out existing demo users to prevent double-hashing conflicts
        await User.deleteMany({ email: { $in: ['demo@agrimind.ai', 'harpreet@agrimind.ai', 'rajesh@agrimind.ai'] } });

        // 1. Seed Core Users (Demo User + Peer Farmers)
        const usersToSeed = [
            {
                fullName: 'Demo User',
                email: 'demo@agrimind.ai',
                password: 'password123', // Let Mongoose pre-save hooks hash this exactly once!
                phone: '+91 98765 43210',
                farmName: 'Green Valley Farms',
                farmLocation: 'Punjab, India',
                farmSize: 15.5,
                primaryCrop: 'Rice',
                preferences: {
                    notifications: true,
                    theme: 'dark',
                    currency: 'INR',
                    language: 'en'
                },
                // Complex and varied inventory list showing healthy vs threshold warning states
                inventory: [
                    { name: 'Basmati Rice Seeds (Direct Seeded)', category: 'Seeds', quantity: 120, unit: 'kg', minThreshold: 40 },
                    { name: 'Urea (Nitrogen Corrective)', category: 'Fertilizers', quantity: 2, unit: 'bags', minThreshold: 10 }, // ALERT STATE (Quantity under threshold)
                    { name: 'SSP (Single Super Phosphate)', category: 'Fertilizers', quantity: 15, unit: 'bags', minThreshold: 5 },
                    { name: 'MOP (Muriate of Potash)', category: 'Fertilizers', quantity: 8, unit: 'bags', minThreshold: 5 },
                    { name: 'Cold-Pressed Neem Oil Spray', category: 'Pesticides', quantity: 18, unit: 'liters', minThreshold: 5 },
                    { name: 'Handheld Soil NPK Probe V2', category: 'Tools', quantity: 1, unit: 'pcs', minThreshold: 1 }
                ],
                // Realistic task list containing completed, pending, and overdue tasks with high/medium/low priority
                tasks: [
                    // Completed Tasks (Historical success)
                    { title: 'Monsoon Clay Plot deep plowing', date: '2026-05-15', category: 'Other', priority: 'medium', completed: true },
                    { title: 'Apply Basmati nursery nitrogen booster', date: '2026-05-20', category: 'Fertilizer', priority: 'high', completed: true },
                    // Overdue / Active Tasks (Incomplete workflows teaching usage)
                    { title: 'Calibrate pH sensor on Main Paddy', date: '2026-05-27', category: 'Other', priority: 'low', completed: false },
                    { title: 'Manual check for early Rice Blast lesions', date: '2026-05-30', category: 'Weeding', priority: 'medium', completed: false }
                ],
            },
            {
                fullName: 'Harpreet Singh',
                email: 'harpreet@agrimind.ai',
                password: 'password123',
                phone: '+91 99887 76655',
                farmName: 'Harpreet Grainlands',
                farmLocation: 'Amritsar, Punjab',
                farmSize: 45.0,
                primaryCrop: 'Wheat'
            },
            {
                fullName: 'Rajesh Kumar',
                email: 'rajesh@agrimind.ai',
                password: 'password123',
                phone: '+91 88776 65544',
                farmName: 'Rajesh Agro Fields',
                farmLocation: 'Ludhiana, Punjab',
                farmSize: 22.8,
                primaryCrop: 'Cotton'
            }
        ];

        const seededUsers = {};
        for (const u of usersToSeed) {
            let existing = await User.findOne({ email: u.email });
            if (!existing) {
                existing = await User.create(u);
                console.log(`👤 Seeded User: ${u.fullName} (${u.email})`);
            } else {
                // If exists, make sure to update their profile defaults to clean up any old schema models
                existing.inventory = u.inventory || existing.inventory;
                existing.tasks = u.tasks || existing.tasks;
                await existing.save();
            }
            seededUsers[u.fullName] = existing;
        }

        const demoUser = seededUsers['Demo User'];



        // 3. Seed Organic Recommendations spanning 6 months (Teaches progress, success & edge-case alert states)
        const recommendationCount = await Recommendation.countDocuments({ user: demoUser._id });
        if (recommendationCount === 0) {
            console.log('🌱 Seeding historical crop advisories & soil tests (last 6 months)...');
            
            const baseTime = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            const oneMonth = 30 * oneDay;

            const historicalAdvisories = [
                // December 2025 - Successful winter sowing (Wheat)
                {
                    fieldName: 'Main Paddy Field',
                    user: demoUser._id,
                    inputs: { N: 40, P: 30, K: 25, temperature: 16.5, humidity: 65, ph: 6.6, rainfall: 42 },
                    prediction: {
                        crop: 'wheat',
                        yield: '4.50',
                        yieldInterval: [4.2, 4.8],
                        marketPrice: 2250,
                        estimatedRevenue: 101250,
                        marketTrend: 'Stable'
                    },
                    fertilizer: {
                        N: 'Optimal',
                        P: 'Optimal',
                        K: 'Optimal',
                        summary: ['Soil nutrient composition is optimal for Wheat cultivation.']
                    },
                    createdAt: new Date(baseTime - 5.5 * oneMonth)
                },
                // January 2026 - Nitrogen leaching detection after heavy rain anomaly (Deficiency Alert)
                {
                    fieldName: 'Main Paddy Field',
                    user: demoUser._id,
                    inputs: { N: 18, P: 28, K: 24, temperature: 15.0, humidity: 75, ph: 6.4, rainfall: 110 },
                    prediction: {
                        crop: 'wheat',
                        yield: '3.60',
                        yieldInterval: [3.2, 4.0],
                        marketPrice: 2280,
                        estimatedRevenue: 82080,
                        marketTrend: 'Up'
                    },
                    fertilizer: {
                        N: 'Deficient (Add 22 units)',
                        P: 'Optimal',
                        K: 'Optimal',
                        summary: ['Severe Nitrogen leaching detected due to recent high precipitation. Apply immediate top-dressing of Urea.']
                    },
                    createdAt: new Date(baseTime - 4.5 * oneMonth)
                },
                // February 2026 - Dry spell check
                {
                    fieldName: 'Main Paddy Field',
                    user: demoUser._id,
                    inputs: { N: 48, P: 32, K: 26, temperature: 21.2, humidity: 55, ph: 6.5, rainfall: 8 },
                    prediction: {
                        crop: 'wheat',
                        yield: '4.70',
                        yieldInterval: [4.4, 5.0],
                        marketPrice: 2320,
                        estimatedRevenue: 109040,
                        marketTrend: 'Up'
                    },
                    fertilizer: {
                        N: 'Optimal',
                        P: 'Optimal',
                        K: 'Optimal',
                        summary: ['Soil nutrient levels are perfect. High moisture depletion detected; initiate smart scheduling.']
                    },
                    createdAt: new Date(baseTime - 3.5 * oneMonth)
                },
                // March 2026 - Orchard pre-soil test
                {
                    fieldName: 'North Fruit Orchard',
                    user: demoUser._id,
                    inputs: { N: 35, P: 45, K: 50, temperature: 24.5, humidity: 60, ph: 6.1, rainfall: 25 },
                    prediction: {
                        crop: 'cotton',
                        yield: '2.10',
                        yieldInterval: [1.9, 2.3],
                        marketPrice: 6200,
                        estimatedRevenue: 130200,
                        marketTrend: 'Stable'
                    },
                    fertilizer: {
                        N: 'Deficient (Add 15 units)',
                        P: 'Optimal',
                        K: 'Optimal',
                        summary: ['Excellent organic potassium content found. Minor nitrogen deficit can be supplemented using biological sprays.']
                    },
                    createdAt: new Date(baseTime - 2.5 * oneMonth)
                },
                // April 2026 - Pre-Monsoon Rice Advisory (Ultimate success case showcasing 100% optimization)
                {
                    fieldName: 'Main Paddy Field',
                    user: demoUser._id,
                    inputs: { N: 52, P: 38, K: 32, temperature: 29.8, humidity: 82, ph: 6.7, rainfall: 240 },
                    prediction: {
                        crop: 'rice',
                        yield: '5.20',
                        yieldInterval: [4.9, 5.5],
                        marketPrice: 4500,
                        estimatedRevenue: 234000,
                        marketTrend: 'Up'
                    },
                    fertilizer: {
                        N: 'Optimal',
                        P: 'Optimal',
                        K: 'Optimal',
                        summary: ['NPK balance is absolutely perfect for Basmati cultivation this monsoon. High confidence yield forecasted.']
                    },
                    createdAt: new Date(baseTime - 1.2 * oneMonth)
                },
                // May 2026 - Clay Plot soil test anomaly (Extreme pH Acidic alert teaching corrective workflows)
                {
                    fieldName: 'Lowland Clay Plot',
                    user: demoUser._id,
                    inputs: { N: 42, P: 35, K: 28, temperature: 31.0, humidity: 85, ph: 4.8, rainfall: 180 }, // CRITICAL ACIDIC PH
                    prediction: {
                        crop: 'rice',
                        yield: '3.10',
                        yieldInterval: [2.7, 3.5],
                        marketPrice: 4400,
                        estimatedRevenue: 136400,
                        marketTrend: 'Stable'
                    },
                    fertilizer: {
                        N: 'Optimal',
                        P: 'Optimal',
                        K: 'Optimal',
                        summary: ['CRITICAL: Soil pH is highly acidic (4.8). This will bind micro-nutrients. Apply 1.2 tons of Agricultural Lime (CaCO3) before puddling.']
                    },
                    createdAt: new Date(baseTime - 5 * oneDay)
                }
            ];

            await Recommendation.insertMany(historicalAdvisories);
            console.log('✅ Historical soil tests and predictions seeded successfully.');
        }

        console.log('🎉 Production database seeding completed successfully!');
    } catch (err) {
        console.error('❌ Database seeding halted due to error:', err.message);
    }
};

module.exports = { seedDatabase };
