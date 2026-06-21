const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    fieldName: {
        type: String,
        default: 'Unnamed Field'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    inputs: {
        N: Number,
        P: Number,
        K: Number,
        temperature: Number,
        humidity: Number,
        ph: Number,
        rainfall: Number
    },
    prediction: {
        crop: String,
        yield: String,
        yieldInterval: [Number],
        marketPrice: Number,
        estimatedRevenue: Number,
        marketTrend: String
    },
    fertilizer: {
        N: String,
        P: String,
        K: String,
        summary: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;
