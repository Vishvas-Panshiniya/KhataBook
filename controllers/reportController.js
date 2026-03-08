const { Expense, Loan, EMI } = require('../models');
const { Parser } = require('json2csv');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');

// --- EXPENSE REPORTS ---
exports.downlaodExpenseReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        let whereClause = { userId: req.user.id };

        if (startDate && endDate) {
            whereClause.date = { [Op.between]: [startDate, endDate] };
        } else if (startDate) {
            whereClause.date = { [Op.gte]: startDate };
        } else if (endDate) {
            whereClause.date = { [Op.lte]: endDate };
        }

        const expenses = await Expense.findAll({
            where: whereClause,
            order: [['date', 'DESC']],
            raw: true
        });

        if (!expenses.length) return res.status(404).json({ error: 'No expenses found for given criteria' });

        const fields = ['id', 'title', 'amount', 'category', 'date', 'notes'];
        try {
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(expenses);
            res.header('Content-Type', 'text/csv');
            res.attachment(`expense-report-${req.user.id}-${Date.now()}.csv`);
            return res.send(csv);
        } catch (e) {
            let csv = fields.join(',') + '\n';
            expenses.forEach(exp => {
                csv += `${exp.id},${exp.title},${exp.amount},${exp.category},${exp.date},${exp.notes || ''}\n`;
            });
            res.header('Content-Type', 'text/csv');
            res.attachment(`expense-report-${req.user.id}-${Date.now()}.csv`);
            return res.send(csv);
        }
    } catch (err) {
        next(err);
    }
};

exports.downloadExpenseReportPDF = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        let whereClause = { userId: req.user.id };

        if (startDate && endDate) {
            whereClause.date = { [Op.between]: [startDate, endDate] };
        } else if (startDate) {
            whereClause.date = { [Op.gte]: startDate };
        } else if (endDate) {
            whereClause.date = { [Op.lte]: endDate };
        }

        const expenses = await Expense.findAll({
            where: whereClause,
            order: [['date', 'DESC']],
            raw: true
        });

        if (!expenses.length) return res.status(404).json({ error: 'No expenses found for given criteria' });

        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        res.setHeader('Content-disposition', `attachment; filename=expense-report-${req.user.id}-${Date.now()}.pdf`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);
        doc.fontSize(20).text('Expense Report', { align: 'center' });
        doc.moveDown();
        if (startDate || endDate) {
            doc.fontSize(12).text(`Filter: ${startDate || 'Any'} to ${endDate || 'Any'}`, { align: 'center' });
            doc.moveDown();
        }

        // Draw Table Header
        let y = doc.y + 10;
        doc.rect(50, y - 5, 500, 20).fillAndStroke('#f1f5f9', '#cbd5e1');
        doc.fillColor('#000');
        doc.font('Helvetica-Bold').fontSize(10);

        doc.text('Date', 55, y);
        doc.moveTo(150, y - 5).lineTo(150, y + 15).stroke('#cbd5e1');

        doc.text('Title', 155, y);
        doc.moveTo(300, y - 5).lineTo(300, y + 15).stroke('#cbd5e1');

        doc.text('Category', 305, y);
        doc.moveTo(440, y - 5).lineTo(440, y + 15).stroke('#cbd5e1');

        doc.text('Amount (Rs)', 445, y, { align: 'right', width: 100 });

        y += 20;

        let total = 0;
        doc.font('Helvetica').fontSize(10);
        expenses.forEach(exp => {
            total += parseFloat(exp.amount);

            // Check page break
            if (y > 700) {
                doc.addPage();
                y = 50;
            }

            // Row border
            doc.rect(50, y - 5, 500, 20).stroke('#cbd5e1');
            doc.fillColor('#333');

            doc.text(exp.date, 55, y);
            doc.moveTo(150, y - 5).lineTo(150, y + 15).stroke('#cbd5e1');

            doc.text(exp.title || '-', 155, y, { width: 140, lineBreak: false, ellipsis: true });
            doc.moveTo(300, y - 5).lineTo(300, y + 15).stroke('#cbd5e1');

            doc.text(exp.category || '-', 305, y, { width: 130, lineBreak: false, ellipsis: true });
            doc.moveTo(440, y - 5).lineTo(440, y + 15).stroke('#cbd5e1');

            doc.text(parseFloat(exp.amount).toFixed(2), 445, y, { align: 'right', width: 100 });
            y += 20;
        });

        y += 15;

        doc.fillColor('#000').font('Helvetica-Bold').fontSize(12).text(`Total Expenses: Rs. ${total.toFixed(2)}`, 50, y, { align: 'right', width: 490 });

        doc.end();
    } catch (err) {
        next(err);
    }
};

// --- LOAN REPORTS ---
exports.downloadLoanReport = async (req, res, next) => {
    try {
        const { loanId } = req.query;
        let whereClause = { userId: req.user.id };
        if (loanId) {
            whereClause.id = loanId;
        }

        const loans = await Loan.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            include: [{ model: EMI, as: 'emis' }]
        });

        if (!loans.length) return res.status(404).json({ error: 'No loans found' });

        // We will do a generic CSV that mixes basic loan info and EMI lines, or simply loan list if no EMI
        let csv = 'Loan ID,Loan Name,Type,Principal,Interest,Total,Remaining,Status,EMI Payment Date, EMI Amount, EMI Interest, EMI Notes\n';

        loans.forEach(loan => {
            if (loan.emis && loan.emis.length > 0) {
                loan.emis.forEach(emi => {
                    csv += `${loan.id},${loan.loanName},${loan.loanType},${loan.principalAmount},${loan.interestAmount || 0},${loan.totalAmount},${loan.remainingAmount},${loan.status},${emi.paymentDate},${emi.emiAmount},${emi.interestAmount || 0},${emi.notes || ''}\n`;
                });
            } else {
                csv += `${loan.id},${loan.loanName},${loan.loanType},${loan.principalAmount},${loan.interestAmount || 0},${loan.totalAmount},${loan.remainingAmount},${loan.status},No EMI,-,-,-\n`;
            }
        });

        res.header('Content-Type', 'text/csv');
        res.attachment(`loan-report-${req.user.id}-${Date.now()}.csv`);
        return res.send(csv);
    } catch (err) {
        next(err);
    }
};

exports.downloadLoanReportPDF = async (req, res, next) => {
    try {
        const { loanId } = req.query;
        let whereClause = { userId: req.user.id };
        if (loanId) {
            whereClause.id = loanId;
        }

        const loans = await Loan.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            include: [{ model: EMI, as: 'emis' }]
        });

        if (!loans.length) return res.status(404).json({ error: 'No loans found' });

        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        res.setHeader('Content-disposition', `attachment; filename=loan-report-${req.user.id}-${Date.now()}.pdf`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);
        doc.fontSize(20).text(loanId ? 'Specific Loan Report' : 'All Loans Report', { align: 'center' });
        doc.moveDown(2);

        let y = doc.y;

        loans.forEach(loan => {
            if (y > 700) { doc.addPage(); y = 50; }

            // Loan Header Box
            doc.rect(50, y, 500, 30).fill('#f1f5f9').stroke('#e2e8f0');
            doc.fillColor('#000').font('Helvetica-Bold').fontSize(12).text(`Loan: ${loan.loanName} (${loan.loanType.toUpperCase()}) - ${loan.status.toUpperCase()}`, 60, y + 10);
            y += 40;

            doc.font('Helvetica').fontSize(10).text(`Principal: Rs. ${loan.principalAmount} | Total: Rs. ${loan.totalAmount} | Remaining: Rs. ${loan.remainingAmount}`, 60, y);
            y += 20;

            if (loan.emis && loan.emis.length > 0) {
                // EMI Table Header
                doc.rect(60, y - 5, 480, 20).fillAndStroke('#f8fafc', '#e2e8f0');
                doc.fillColor('#000');
                doc.font('Helvetica-Bold').fontSize(9);
                doc.text('Date', 65, y);
                doc.moveTo(150, y - 5).lineTo(150, y + 15).stroke('#e2e8f0');

                doc.text('Paid Amount', 155, y);
                doc.moveTo(270, y - 5).lineTo(270, y + 15).stroke('#e2e8f0');

                doc.text('Interest Added', 275, y);
                doc.moveTo(390, y - 5).lineTo(390, y + 15).stroke('#e2e8f0');

                doc.text('Notes', 395, y);

                y += 20;

                doc.font('Helvetica').fontSize(9);
                loan.emis.forEach(emi => {
                    if (y > 750) { doc.addPage(); y = 50; }

                    doc.rect(60, y - 5, 480, 20).stroke('#e2e8f0');
                    doc.fillColor('#333');

                    doc.text(emi.paymentDate, 65, y);
                    doc.moveTo(150, y - 5).lineTo(150, y + 15).stroke('#e2e8f0');

                    doc.text(`Rs. ${emi.emiAmount}`, 155, y);
                    doc.moveTo(270, y - 5).lineTo(270, y + 15).stroke('#e2e8f0');

                    doc.text(`Rs. ${emi.interestAmount || 0}`, 275, y);
                    doc.moveTo(390, y - 5).lineTo(390, y + 15).stroke('#e2e8f0');

                    doc.text(emi.notes || '-', 395, y, { width: 140, lineBreak: false, ellipsis: true });
                    y += 20;
                });
            } else {
                doc.fillColor('#666').font('Helvetica-Oblique').fontSize(9).text('No EMIs recorded for this loan.', 60, y);
                y += 15;
            }
            y += 20;
        });

        doc.end();
    } catch (err) {
        next(err);
    }
};
