const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ID format');

const createPostSchema = z.object({
    content: z.string()
        .min(1, 'Content is required')
        .max(2000, 'Content cannot exceed 2000 characters'),
    recommendation: objectIdSchema.optional()
});

const likeParamSchema = z.object({
    id: objectIdSchema
});

module.exports = { createPostSchema, likeParamSchema };