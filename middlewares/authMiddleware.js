const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    // Try getting token from cookies or Authorization header
    let token = req.cookies?.token;
    if (!token && req.header('Authorization')) {
        token = req.header('Authorization').replace('Bearer ', '');
    }

    if (!token) {
        // If it's an API request return JSON
        if (req.originalUrl.startsWith('/api')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        // Otherwise redirect to login
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, name, email }
        next();
    } catch (error) {
        if (req.originalUrl.startsWith('/api')) {
            return res.status(400).json({ error: 'Invalid token.' });
        }
        res.clearCookie('token');
        return res.redirect('/login');
    }
};

const optionalAuth = (req, res, next) => {
    let token = req.cookies?.token;
    if (token) {
        try {
            req.user = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            // invalid token, just ignore
        }
    }
    next();
};

module.exports = { authMiddleware, optionalAuth };
