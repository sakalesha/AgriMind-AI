const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { weatherQuerySchema } = require('../validators/weatherValidators');

router.get('/', protect, validate(weatherQuerySchema, 'query'), weatherController.getWeather);

module.exports = router;