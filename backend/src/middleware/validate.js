const { ZodError } = require('zod');

const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const data = source === 'query' ? req.query : source === 'params' ? req.params : req.body;
            const parsed = schema.parse(data);

            if (source === 'query') {
                req.query = parsed;
            } else if (source === 'params') {
                req.params = { ...req.params, ...parsed };
            } else {
                req.body = parsed;
            }
            next();
        } catch (err) {
            if (err instanceof ZodError) {
                const errors = err.errors.map(e => ({
                    field: e.path.join('.'),
                    message: e.message
                }));
                return res.status(400).json({
                    status: 'fail',
                    message: 'Validation error',
                    errors
                });
            }
            return res.status(500).json({
                status: 'error',
                message: 'Internal validation error'
            });
        }
    };
};

module.exports = { validate };