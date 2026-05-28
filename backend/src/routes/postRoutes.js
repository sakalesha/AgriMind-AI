const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { createPostSchema, likeParamSchema } = require('../validators/postValidators');

router.use(authMiddleware.protect);

router.route('/')
    .get(postController.getAllPosts)
    .post(validate(createPostSchema), postController.createPost);

router.post('/:id/like', validate(likeParamSchema, 'params'), postController.toggleLike);

module.exports = router;