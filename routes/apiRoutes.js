const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Controllers
const authController = require('../controllers/authController');
const expenseController = require('../controllers/expenseController');
const loanController = require('../controllers/loanController');
const emiController = require('../controllers/emiController');
const reportController = require('../controllers/reportController');
const incomeController = require('../controllers/incomeController');

// Middlewares
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

// --- Auth Routes ---
router.post('/auth/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, authController.register);

router.post('/auth/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], validate, authController.login);

router.post('/auth/logout', authController.logout);

// --- Expense Routes ---
router.use('/expenses', authMiddleware);
router.post('/expenses', [
    body('title').notEmpty().withMessage('Title is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
], validate, expenseController.addExpense);
router.get('/expenses', expenseController.getExpenses);
router.get('/expenses/summary', expenseController.getExpenseSummary);
router.put('/expenses/:id', [
    body('title').notEmpty().withMessage('Title is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
], validate, expenseController.updateExpense);
router.delete('/expenses/:id', expenseController.deleteExpense);

// --- Income Routes ---
router.use('/incomes', authMiddleware);
router.post('/incomes', [
    body('title').notEmpty().withMessage('Title is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
], validate, incomeController.addIncome);
router.get('/incomes', incomeController.getIncomes);
router.get('/incomes/summary', incomeController.getIncomeSummary);
router.put('/incomes/:id', [
    body('title').notEmpty().withMessage('Title is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
], validate, incomeController.updateIncome);
router.delete('/incomes/:id', incomeController.deleteIncome);

// --- Loan Routes ---
router.use('/loans', authMiddleware);
router.post('/loans', [
    body('loanName').notEmpty().withMessage('Loan name is required'),
    body('loanType').isIn(['normal', 'interest']).withMessage('Invalid loan type'),
    body('principalAmount').isFloat({ min: 0 }).withMessage('Principal amount must be a positive number')
], validate, loanController.addLoan);
router.get('/loans', loanController.getLoans);
router.put('/loans/:id', [
    body('loanName').notEmpty().withMessage('Loan name is required'),
    body('loanType').isIn(['normal', 'interest']).withMessage('Invalid loan type'),
    body('principalAmount').isFloat({ min: 0 }).withMessage('Principal amount must be a positive number')
], validate, loanController.updateLoan);
router.delete('/loans/:id', loanController.deleteLoan);

// --- EMI Routes ---
router.use('/emis', authMiddleware);
router.post('/emis', [
    body('loanId').notEmpty().withMessage('Loan ID is required'),
    body('emiAmount').isFloat({ min: 0 }).withMessage('EMI amount must be a positive number')
], validate, emiController.addEMI);
router.get('/emis', emiController.getEMIs);
router.put('/emis/:id', [
    body('emiAmount').isFloat({ min: 0 }).withMessage('EMI amount must be a positive number')
], validate, emiController.updateEMI);
router.delete('/emis/:id', emiController.deleteEMI);

// --- Report Routes ---
router.use('/reports', authMiddleware);
router.get('/reports/expense/csv', reportController.downlaodExpenseReport);
router.get('/reports/expense/pdf', reportController.downloadExpenseReportPDF);
router.get('/reports/loan/csv', reportController.downloadLoanReport);
router.get('/reports/loan/pdf', reportController.downloadLoanReportPDF);

module.exports = router;
