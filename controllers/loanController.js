const { Loan } = require('../models');

exports.addLoan = async (req, res, next) => {
    try {
        const { loanName, loanType, principalAmount, interestAmount } = req.body;

        let totalAmount = parseFloat(principalAmount);

        const loan = await Loan.create({
            userId: req.user.id,
            loanName,
            loanType,
            principalAmount,
            interestAmount: 0,
            totalAmount,
            remainingAmount: totalAmount,
            status: 'active'
        });

        res.status(201).json({ message: 'Loan added', loan });
    } catch (err) {
        next(err);
    }
};

exports.getLoans = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const { count, rows } = await Loan.findAndCountAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            loans: rows
        });
    } catch (err) {
        next(err);
    }
};

exports.updateLoan = async (req, res, next) => {
    try {
        const loan = await Loan.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!loan) return res.status(404).json({ error: 'Loan not found' });

        const { loanName, loanType, principalAmount, interestAmount } = req.body;

        let totalAmount = parseFloat(principalAmount);

        // Calculate paid amount = old total - old remaining
        const paidAmount = parseFloat(loan.totalAmount) - parseFloat(loan.remainingAmount);
        // new total will also include whatever interest was accumulated so far
        const accumulatedInterest = parseFloat(loan.interestAmount || 0);
        totalAmount += accumulatedInterest;

        let newRemainingAmount = totalAmount - paidAmount;
        let status = newRemainingAmount <= 0 ? 'completed' : 'active';
        if (newRemainingAmount < 0) newRemainingAmount = 0;

        await loan.update({
            loanName,
            loanType,
            principalAmount,
            totalAmount,
            remainingAmount: newRemainingAmount,
            status
        });

        res.json({ message: 'Loan updated', loan });
    } catch (err) {
        next(err);
    }
};

exports.deleteLoan = async (req, res, next) => {
    try {
        const loan = await Loan.findOne({ where: { id: req.params.id, userId: req.user.id } });
        if (!loan) return res.status(404).json({ error: 'Loan not found' });

        await loan.destroy();

        res.json({ message: 'Loan deleted' });
    } catch (err) {
        next(err);
    }
};
