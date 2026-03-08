const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Collect errors
        const extractedErrors = [];
        errors.array().map(err => extractedErrors.push({ [err.path || err.param]: err.msg }));

        return res.status(400).json({
            errors: extractedErrors
        });
    }
    next();
};

module.exports = {
    validate,
};
