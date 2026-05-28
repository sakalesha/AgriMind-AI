const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidators');

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/logout', authController.logout);
router.get('/me', authMiddleware.protect, authController.getMe);
router.put('/profile', authMiddleware.protect, authController.updateProfile);

module.exports = router;