const express = require('express');
const router = express.Router();
const { authMiddleware, optionalAuth } = require('../middlewares/authMiddleware');

router.get('/', optionalAuth, (req, res) => {
    if (req.user) {
        return res.redirect('/dashboard');
    }
    res.redirect('/login');
});

router.get('/login', optionalAuth, (req, res) => {
    if (req.user) return res.redirect('/dashboard');
    res.render('login', { user: null });
});

router.get('/forgot-password', optionalAuth, (req, res) => {
    if (req.user) return res.redirect('/dashboard');
    res.render('forgot-password', { user: null });
});

router.get('/register', optionalAuth, (req, res) => {
    if (req.user) return res.redirect('/dashboard');
    res.render('register', { user: null });
});

router.get('/dashboard', authMiddleware, (req, res) => {
    res.render('dashboard', { user: req.user });
});

router.get('/profile', authMiddleware, (req, res) => {
    res.render('profile', { user: req.user });
});

router.get('/incomes', authMiddleware, (req, res) => {
    res.render('incomes', { user: req.user });
});

router.get('/expenses', authMiddleware, (req, res) => {
    res.render('expenses', { user: req.user });
});

router.get('/loans', authMiddleware, (req, res) => {
    res.render('loans', { user: req.user });
});

router.get('/emis', authMiddleware, (req, res) => {
    res.render('emis', { user: req.user, loanId: req.query.loanId });
});

router.get('/reports', authMiddleware, (req, res) => {
    res.render('reports', { user: req.user });
});

module.exports = router;
