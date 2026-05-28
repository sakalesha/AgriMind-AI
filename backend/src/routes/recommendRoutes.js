const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const recommendController = require('../controllers/recommendController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { recommendSchema } = require('../validators/recommendValidators');

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { status: 'fail', message: 'Too many requests from this IP, please try again after a minute' }
});

router.post('/', protect, apiLimiter, validate(recommendSchema), recommendController.getRecommendation);

module.exports = router;