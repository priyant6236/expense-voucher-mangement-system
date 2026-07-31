const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/auth.controller');
const authenticateToken = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

// Validation Rules for Registration
const registerValidationRules = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full Name is required.')
    .isLength({ min: 2 }).withMessage('Full Name must be at least 2 characters long.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.'),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('department')
    .trim()
    .notEmpty().withMessage('Department is required.'),
  body('employee_id')
    .trim()
    .notEmpty().withMessage('Employee ID is required.'),
  body('role')
    .optional()
    .isIn(['Employee', 'Director', 'Accounts']).withMessage('Role must be Employee, Director, or Accounts.')
];

// Validation Rules for Login
const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.'),
  body('password')
    .notEmpty().withMessage('Password is required.')
];

/**
 * @route POST /api/auth/register
 */
router.post('/register', registerValidationRules, validate, register);

/**
 * @route POST /api/auth/login
 */
router.post('/login', loginValidationRules, validate, login);

/**
 * @route GET /api/auth/me
 */
router.get('/me', authenticateToken, getMe);

module.exports = router;
