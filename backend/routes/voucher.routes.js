const express = require('express');
const { body } = require('express-validator');
const authenticateToken = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createVoucher,
  getMyVouchers,
  getEmployeeStats,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  submitVoucher
} = require('../controllers/voucher.controller');

const {
  getPendingVouchers,
  getAllVouchers,
  getDirectorStats,
  approveVoucher,
  rejectVoucher
} = require('../controllers/director.controller');

const {
  getApprovedVouchers,
  getAccountsStats
} = require('../controllers/accounts.controller');

const router = express.Router();

// Validation Rules for Voucher Creation/Edit
const voucherValidationRules = [
  body('expense_title')
    .trim()
    .notEmpty().withMessage('Expense Title is required.'),
  body('expense_date')
    .notEmpty().withMessage('Expense Date is required.')
    .isISO8601().withMessage('Expense Date must be a valid date format (YYYY-MM-DD).'),
  body('amount')
    .notEmpty().withMessage('Amount is required.')
    .isFloat({ gt: 0 }).withMessage('Amount must be greater than zero.'),
  body('expense_category')
    .trim()
    .notEmpty().withMessage('Expense Category is required.')
];

// All routes require authenticated JWT token
router.use(authenticateToken);

// Director Routes
router.get('/pending', authorize('Director'), getPendingVouchers);
router.get('/all', authorize('Director', 'Accounts'), getAllVouchers);
router.get('/stats/director', authorize('Director'), getDirectorStats);
router.put('/approve/:id', authorize('Director'), approveVoucher);
router.put('/reject/:id', authorize('Director'), rejectVoucher);

// Accounts Routes
router.get('/approved', authorize('Accounts', 'Director'), getApprovedVouchers);
router.get('/stats/accounts', authorize('Accounts'), getAccountsStats);

// Employee Specific Routes
router.post('/', authorize('Employee'), voucherValidationRules, validate, createVoucher);
router.get('/my', authorize('Employee'), getMyVouchers);
router.get('/stats/my', authorize('Employee'), getEmployeeStats);
router.put('/:id', authorize('Employee'), voucherValidationRules, validate, updateVoucher);
router.delete('/:id', authorize('Employee'), deleteVoucher);
router.post('/submit/:id', authorize('Employee'), submitVoucher);

// Shared Route (Employee, Director, Accounts)
router.get('/:id', getVoucherById);

module.exports = router;
