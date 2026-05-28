const { z } = require('zod');

const weatherQuerySchema = z.object({
    lat: z.string()
        .transform(v => parseFloat(v))
        .refine(v => !isNaN(v), { message: 'Latitude must be a number' })
        .refine(v => v >= -90, { message: 'Latitude must be between -90 and 90' })
        .refine(v => v <= 90, { message: 'Latitude must be between -90 and 90' }),
    lon: z.string()
        .transform(v => parseFloat(v))
        .refine(v => !isNaN(v), { message: 'Longitude must be a number' })
        .refine(v => v >= -180, { message: 'Longitude must be between -180 and 180' })
        .refine(v => v <= 180, { message: 'Longitude must be between -180 and 180' })
});

module.exports = { weatherQuerySchema };