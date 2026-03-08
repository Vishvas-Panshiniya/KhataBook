const { Expense } = require('../models');
const { Op } = require('sequelize');

exports.addExpense = async (req, res, next) => {
    try {
        const { title, amount, category, date, notes } = req.body;

        const expense = await Expense.create({
            userId: req.user.id,
            title,
            amount,
            category,
            date: date || new Date(),
            notes
        });

        res.status(201).json({ message: 'Expense added', expense });
    } catch (err) {
        next(err);
    }
};

exports.getExpenses = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const { count, rows } = await Expense.findAndCountAll({
            where: { userId: req.user.id },
            order: [['date', 'DESC']],
            limit,
            offset
        });

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            expenses: rows
        });
    } catch (err) {
        next(err);
    }
};

exports.getExpenseSummary = async (req, res, next) => {
    try {
        const total = await Expense.sum('amount', {
            where: { userId: req.user.id }
        });

        res.json({ totalExpense: total || 0 });
    } catch (err) {
        next(err);
    }
};

exports.updateExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!expense) return res.status(404).json({ error: 'Expense not found' });

        const { title, amount, category, date, notes } = req.body;

        await expense.update({ title, amount, category, date, notes });

        res.json({ message: 'Expense updated', expense });
    } catch (err) {
        next(err);
    }
};

exports.deleteExpense = async (req, res, next) => {
    try {
        const expense = await Expense.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!expense) return res.status(404).json({ error: 'Expense not found' });

        await expense.destroy();

        res.json({ message: 'Expense deleted' });
    } catch (err) {
        next(err);
    }
};
