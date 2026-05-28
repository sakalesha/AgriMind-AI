const express = require('express');
const router = express.Router();
const machineryController = require('../controllers/machineryController');
const { protect } = require('../middleware/authMiddleware');

// Get all machinery doesn't strictly need auth, but list and rent do
router.get('/', machineryController.getMachinery);

router.post('/', protect, machineryController.createMachinery);
router.post('/:id/rent', protect, machineryController.rentMachinery);

module.exports = router;
