const mongoose = require('mongoose');

const machinerySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Machinery name is required'],
        trim: true
    },
    owner: {
        type: String,
        required: [true, 'Owner name is required'],
        trim: true
    },
    pricePerDay: {
        type: Number,
        required: [true, 'Price per day is required']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    available: {
        type: Boolean,
        default: true
    },
    image: {
        type: String,
        default: 'https://picsum.photos/seed/tractor/800/600'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Machinery = mongoose.model('Machinery', machinerySchema);

module.exports = Machinery;
