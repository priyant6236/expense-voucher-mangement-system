const UserModel = require('../models/user.model');
const { generateToken } = require('../utils/jwt.util');

/**
 * @route POST /api/auth/register
 * @desc Register a new Employee, Director, or Accounts user
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { full_name, email, password, role, department, employee_id } = req.body;

    // Check if email already registered
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        status: 'fail',
        message: `An account with email '${email}' already exists.`
      });
    }

    // Check if employee_id already registered
    const existingEmployeeId = await UserModel.findByEmployeeId(employee_id);
    if (existingEmployeeId) {
      return res.status(400).json({
        status: 'fail',
        message: `Employee ID '${employee_id}' is already registered in the system.`
      });
    }

    // Create user
    const newUser = await UserModel.createUser({
      full_name,
      email,
      password,
      role: role || 'Employee',
      department,
      employee_id
    });

    // Generate JWT token
    const token = generateToken(newUser);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful! Welcome to the Expense Voucher System.',
      data: {
        user: newUser,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & get JWT token
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email address or password. Please check your credentials.'
      });
    }

    // Verify password with bcrypt
    const isPasswordValid = await UserModel.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email address or password. Please check your credentials.'
      });
    }

    // Generate token
    const token = generateToken(user);

    // Prepare response without password hash
    const userResponse = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department: user.department,
      employee_id: user.employee_id,
      signature_path: user.signature_path
    };

    res.status(200).json({
      status: 'success',
      message: `Login successful. Welcome back, ${user.full_name}!`,
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/auth/me
 * @desc Get current authenticated user profile
 * @access Private (Authenticated User)
 */
const getMe = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User profile not found.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
