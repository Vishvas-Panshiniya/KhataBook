const { Income } = require('../models');

exports.addIncome = async (req, res, next) => {
    try {
        const { title, amount, date, notes } = req.body;

        const income = await Income.create({
            userId: req.user.id,
            title,
            amount,
            date: date || new Date(),
            notes
        });

        res.status(201).json({ message: 'Income added', income });
    } catch (err) {
        next(err);
    }
};

exports.getIncomes = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const { count, rows } = await Income.findAndCountAll({
            where: { userId: req.user.id },
            order: [['date', 'DESC']],
            limit,
            offset
        });

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            incomes: rows
        });
    } catch (err) {
        next(err);
    }
};

exports.getIncomeSummary = async (req, res, next) => {
    try {
        const total = await Income.sum('amount', {
            where: { userId: req.user.id }
        });

        res.json({ totalIncome: total || 0 });
    } catch (err) {
        next(err);
    }
};

exports.updateIncome = async (req, res, next) => {
    try {
        const income = await Income.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!income) return res.status(404).json({ error: 'Income not found' });

        const { title, amount, date, notes } = req.body;

        await income.update({
            title,
            amount,
            date,
            notes
        });

        res.json({ message: 'Income updated', income });
    } catch (err) {
        next(err);
    }
};

exports.deleteIncome = async (req, res, next) => {
    try {
        const income = await Income.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!income) return res.status(404).json({ error: 'Income not found' });

        await income.destroy();

        res.json({ message: 'Income deleted' });
    } catch (err) {
        next(err);
    }
};
