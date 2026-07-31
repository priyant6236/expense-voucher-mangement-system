const VoucherModel = require('../models/voucher.model');

/**
 * @route GET /api/voucher/approved
 * @desc Get all approved vouchers for Accounts audit & disbursement
 * @access Private (Accounts, Director)
 */
const getApprovedVouchers = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
      department: req.query.department,
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    const vouchers = await VoucherModel.getApprovedVouchers(filters);
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
 * @route GET /api/voucher/stats/accounts
 * @desc Get Accounts team KPI metrics
 * @access Private (Accounts)
 */
const getAccountsStats = async (req, res, next) => {
  try {
    const stats = await VoucherModel.getAccountsDashboardStats();
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApprovedVouchers,
  getAccountsStats
};
