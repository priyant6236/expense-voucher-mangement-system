const VoucherModel = require('../models/voucher.model');

/**
 * @route POST /api/voucher
 * @desc Create new voucher (Draft or Submitted)
 * @access Private (Employee)
 */
const createVoucher = async (req, res, next) => {
  try {
    const newVoucher = await VoucherModel.createVoucher(req.body, req.user);
    res.status(201).json({
      status: 'success',
      message: newVoucher.status === 'Submitted' || newVoucher.status === 'Pending Approval'
        ? 'Voucher created and submitted successfully!'
        : 'Voucher saved as draft successfully!',
      data: { voucher: newVoucher }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/voucher/my
 * @desc View only logged-in employee's own vouchers
 * @access Private (Employee)
 */
const getMyVouchers = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search,
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const vouchers = await VoucherModel.getVouchersByUserId(req.user.id, filters);
    res.status(200).json({
      status: 'success',
      results: vouchers.length,
      data: { vouchers }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/voucher/stats/my
 * @desc Get summary stats for Employee Dashboard
 * @access Private (Employee)
 */
const getEmployeeStats = async (req, res, next) => {
  try {
    const stats = await VoucherModel.getEmployeeDashboardStats(req.user.id);
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/voucher/:id
 * @desc Get single voucher by ID
 * @access Private (Authenticated User)
 */
const getVoucherById = async (req, res, next) => {
  try {
    const voucher = await VoucherModel.getVoucherById(req.params.id);
    if (!voucher) {
      return res.status(404).json({
        status: 'fail',
        message: `Voucher with ID ${req.params.id} not found.`
      });
    }

    // Role-based access restriction check for Employees
    if (req.user.role === 'Employee' && voucher.user_id !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Access Denied: You can only view your own vouchers.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { voucher }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/voucher/:id
 * @desc Update draft voucher details
 * @access Private (Employee)
 */
const updateVoucher = async (req, res, next) => {
  try {
    const updated = await VoucherModel.updateVoucher(req.params.id, req.user.id, req.body, req.user);
    res.status(200).json({
      status: 'success',
      message: 'Draft voucher updated successfully!',
      data: { voucher: updated }
    });
  } catch (error) {
    if (error.message.includes('Unauthorized') || error.message.includes('Only Draft')) {
      return res.status(400).json({ status: 'fail', message: error.message });
    }
    next(error);
  }
};

/**
 * @route DELETE /api/voucher/:id
 * @desc Delete draft voucher
 * @access Private (Employee)
 */
const deleteVoucher = async (req, res, next) => {
  try {
    await VoucherModel.deleteVoucher(req.params.id, req.user.id);
    res.status(200).json({
      status: 'success',
      message: 'Draft voucher deleted successfully.'
    });
  } catch (error) {
    if (error.message.includes('Unauthorized') || error.message.includes('Only Draft')) {
      return res.status(400).json({ status: 'fail', message: error.message });
    }
    next(error);
  }
};

/**
 * @route POST /api/voucher/submit/:id
 * @desc Submit draft voucher for Director approval
 * @access Private (Employee)
 */
const submitVoucher = async (req, res, next) => {
  try {
    const signaturePath = req.body.employee_signature_path;
    const submittedVoucher = await VoucherModel.submitVoucher(req.params.id, req.user.id, signaturePath, req.user);
    res.status(200).json({
      status: 'success',
      message: 'Voucher submitted successfully for Director approval!',
      data: { voucher: submittedVoucher }
    });
  } catch (error) {
    if (error.message.includes('signature is required') || error.message.includes('Only Draft')) {
      return res.status(400).json({ status: 'fail', message: error.message });
    }
    next(error);
  }
};

module.exports = {
  createVoucher,
  getMyVouchers,
  getEmployeeStats,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  submitVoucher
};
