const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please provide your full name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false // Don't return password by default
    },
    phone: {
        type: String,
        default: '+91 98765 43210'
    },
    farmName: {
        type: String,
        default: 'Green Valley Farms'
    },
    farmLocation: {
        type: String,
        default: 'Punjab, India'
    },
    farmSize: {
        type: Number,
        default: 15.5
    },
    primaryCrop: {
        type: String,
        default: 'Rice'
    },
    preferences: {
        notifications: {
            type: Boolean,
            default: true
        },
        theme: {
            type: String,
            default: 'dark'
        },
        currency: {
            type: String,
            default: 'INR'
        },
        language: {
            type: String,
            default: 'en'
        }
    },
    inventory: {
        type: [{
            name: String,
            category: String,
            quantity: Number,
            unit: String,
            minThreshold: Number
        }],
        default: [
            { name: 'Basmati Seeds', category: 'Seeds', quantity: 50, unit: 'kg', minThreshold: 10 },
            { name: 'Urea Fertilizer', category: 'Fertilizers', quantity: 5, unit: 'bags', minThreshold: 10 },
            { name: 'Neem Oil', category: 'Pesticides', quantity: 12, unit: 'liters', minThreshold: 5 }
        ]
    },
    tasks: {
        type: [{
            title: String,
            date: String,
            category: String,
            priority: String,
            completed: { type: Boolean, default: false }
        }],
        default: [
            { title: 'Field Inspection', date: new Date().toISOString().split('T')[0], category: 'Other', priority: 'medium', completed: false }
        ]
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
