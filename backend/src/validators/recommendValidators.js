const { z } = require('zod');

const recommendSchema = z.object({
    fieldName: z.string().default('Unnamed Field'),
    N: z.number({ required_error: 'N (Nitrogen) is required' })
        .min(0, 'N cannot be negative')
        .max(500, 'N cannot exceed 500'),
    P: z.number({ required_error: 'P (Phosphorus) is required' })
        .min(0, 'P cannot be negative')
        .max(500, 'P cannot exceed 500'),
    K: z.number({ required_error: 'K (Potassium) is required' })
        .min(0, 'K cannot be negative')
        .max(500, 'K cannot exceed 500'),
    temperature: z.number({ required_error: 'Temperature is required' })
        .min(-50, 'Temperature cannot be below -50°C')
        .max(60, 'Temperature cannot exceed 60°C'),
    humidity: z.number({ required_error: 'Humidity is required' })
        .min(0, 'Humidity cannot be below 0%')
        .max(100, 'Humidity cannot exceed 100%'),
    ph: z.number({ required_error: 'pH is required' })
        .min(0, 'pH cannot be below 0')
        .max(14, 'pH cannot exceed 14'),
    rainfall: z.number({ required_error: 'Rainfall is required' })
        .min(0, 'Rainfall cannot be negative')
        .max(500, 'Rainfall cannot exceed 500mm')
});

module.exports = { recommendSchema };