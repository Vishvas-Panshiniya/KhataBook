const { EMI, Loan } = require('../models');
const sequelize = require('../config/database');

exports.addEMI = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { loanId, emiAmount, interestAmount, paymentDate, notes } = req.body;

        const loan = await Loan.findOne({ where: { id: loanId, userId: req.user.id }, transaction });
        if (!loan) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Loan not found' });
        }

        if (loan.status === 'completed') {
            await transaction.rollback();
            return res.status(400).json({ error: 'Loan is already completed' });
        }

        const emiValue = parseFloat(emiAmount || 0);
        const intValue = parseFloat(interestAmount || 0);

        // Create EMI
        const emi = await EMI.create({
            loanId,
            emiAmount: emiValue,
            interestAmount: intValue,
            paymentDate: paymentDate || new Date(),
            notes
        }, { transaction });

        // New logic: 
        // EmI paid = 1000, Interest = 100
        // Principal reduced by EmI paid - Interest = 900
        const principalReduction = emiValue - intValue;

        // remaining amount decreases by the principal reduction
        let newRemainingAmount = parseFloat(loan.remainingAmount) - principalReduction;
        let status = loan.status;

        if (newRemainingAmount <= 0) {
            newRemainingAmount = 0;
            status = 'completed';
        }

        // We technically don't need to increase totalAmount if TotalAmount = initial principal + initial interest (if any).
        // But if they want to track lifetime total loan size including dynamic interest, we can add it. 
        // For now, let's keep totalAmount as initially set, but track accumulated interest.
        let newInterestTotal = parseFloat(loan.interestAmount || 0) + intValue;

        await loan.update({
            interestAmount: newInterestTotal,
            remainingAmount: newRemainingAmount,
            status
        }, { transaction });

        await transaction.commit();
        res.status(201).json({ message: 'EMI added successfully', emi, loanStatus: status, remainingAmount: newRemainingAmount });
    } catch (err) {
        if (!transaction.finished) {
            await transaction.rollback();
        }
        next(err);
    }
};

exports.getEMIs = async (req, res, next) => {
    try {
        const { loanId } = req.query;
        if (!loanId) return res.status(400).json({ error: 'loanId is required' });

        // Verify loan belongs to user
        const loan = await Loan.findOne({ where: { id: loanId, userId: req.user.id } });
        if (!loan) return res.status(404).json({ error: 'Loan not found' });

        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const { count, rows } = await EMI.findAndCountAll({
            where: { loanId },
            order: [['paymentDate', 'DESC']],
            limit,
            offset
        });

        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            emis: rows
        });
    } catch (err) {
        next(err);
    }
};

exports.updateEMI = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { emiAmount, interestAmount, paymentDate, notes } = req.body;

        const emi = await EMI.findOne({ where: { id: req.params.id }, transaction });
        if (!emi) {
            await transaction.rollback();
            return res.status(404).json({ error: 'EMI not found' });
        }

        const loan = await Loan.findOne({ where: { id: emi.loanId, userId: req.user.id }, transaction });
        if (!loan) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Loan not found or unauthorized' });
        }

        // Revert old EMI effect
        const oldEmiValue = parseFloat(emi.emiAmount || 0);
        const oldIntValue = parseFloat(emi.interestAmount || 0);
        const oldPrincipalReduction = oldEmiValue - oldIntValue;

        let tempRemaining = parseFloat(loan.remainingAmount) + oldPrincipalReduction;
        let tempInterest = parseFloat(loan.interestAmount || 0) - oldIntValue;

        // Apply new EMI effect
        const newEmiValue = parseFloat(emiAmount || 0);
        const newIntValue = parseFloat(interestAmount || 0);
        const newPrincipalReduction = newEmiValue - newIntValue;

        let finalRemaining = tempRemaining - newPrincipalReduction;
        let finalInterest = tempInterest + newIntValue;
        let status = finalRemaining <= 0 ? 'completed' : 'active';
        if (finalRemaining < 0) finalRemaining = 0;

        await emi.update({
            emiAmount: newEmiValue,
            interestAmount: newIntValue,
            paymentDate,
            notes
        }, { transaction });

        await loan.update({
            interestAmount: finalInterest,
            remainingAmount: finalRemaining,
            status
        }, { transaction });

        await transaction.commit();
        res.json({ message: 'EMI updated', emi });
    } catch (err) {
        if (!transaction.finished) await transaction.rollback();
        next(err);
    }
};

exports.deleteEMI = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const emi = await EMI.findOne({ where: { id: req.params.id }, transaction });
        if (!emi) {
            await transaction.rollback();
            return res.status(404).json({ error: 'EMI not found' });
        }

        const loan = await Loan.findOne({ where: { id: emi.loanId, userId: req.user.id }, transaction });
        if (!loan) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Loan not found or unauthorized' });
        }

        // Revert old EMI effect
        const oldEmiValue = parseFloat(emi.emiAmount || 0);
        const oldIntValue = parseFloat(emi.interestAmount || 0);
        const oldPrincipalReduction = oldEmiValue - oldIntValue;

        let finalRemaining = parseFloat(loan.remainingAmount) + oldPrincipalReduction;
        let finalInterest = parseFloat(loan.interestAmount || 0) - oldIntValue;

        let status = finalRemaining <= 0 ? 'completed' : 'active';

        await emi.destroy({ transaction });

        await loan.update({
            interestAmount: finalInterest,
            remainingAmount: finalRemaining,
            status
        }, { transaction });

        await transaction.commit();
        res.json({ message: 'EMI deleted' });
    } catch (err) {
        if (!transaction.finished) await transaction.rollback();
        next(err);
    }
};
