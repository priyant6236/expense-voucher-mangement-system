const VoucherModel = require('../models/voucher.model');

/**
 * @route GET /api/voucher/pending
 * @desc Get all pending vouchers for Director review
 * @access Private (Director)
 */
const getPendingVouchers = async (req, res, next) => {
  try {
    const filters = {
      search: req.query.search,
      department: req.query.department,
      category: req.query.category
    };
    const vouchers = await VoucherModel.getPendingVouchers(filters);
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
 * @route GET /api/voucher/all
 * @desc Get organization-wide vouchers with filters
 * @access Private (Director, Accounts)
 */
const getAllVouchers = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search,
      department: req.query.department,
      category: req.query.category
    };
    const vouchers = await VoucherModel.getAllVouchers(filters);
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
 * @route GET /api/voucher/stats/director
 * @desc Get summary KPI counters for Director Dashboard
 * @access Private (Director)
 */
const getDirectorStats = async (req, res, next) => {
  try {
    const stats = await VoucherModel.getDirectorDashboardStats();
    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route PUT /api/voucher/approve/:id
 * @desc Approve voucher with Director signature
 * @access Private (Director)
 */
const approveVoucher = async (req, res, next) => {
  try {
    const signaturePath = req.body.director_signature_path || req.user.signature_path || '/uploads/director-signature.png';
    const approved = await VoucherModel.approveVoucher(req.params.id, req.user.id, signaturePath, req.user);
    res.status(200).json({
      status: 'success',
      message: 'Voucher approved successfully!',
      data: { voucher: approved }
    });
  } catch (error) {
    if (error.message.includes('Only Pending')) {
      return res.status(400).json({ status: 'fail', message: error.message });
    }
    next(error);
  }
};

/**
 * @route PUT /api/voucher/reject/:id
 * @desc Reject voucher with mandatory rejection reason
 * @access Private (Director)
 */
const rejectVoucher = async (req, res, next) => {
  try {
    const { rejection_reason } = req.body;
    if (!rejection_reason || !rejection_reason.trim()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Rejection reason is mandatory when rejecting a voucher.'
      });
    }

    const rejected = await VoucherModel.rejectVoucher(req.params.id, req.user.id, rejection_reason, req.user);
    res.status(200).json({
      status: 'success',
      message: 'Voucher rejected. Remarks sent to employee.',
      data: { voucher: rejected }
    });
  } catch (error) {
    if (error.message.includes('mandatory') || error.message.includes('Only Pending')) {
      return res.status(400).json({ status: 'fail', message: error.message });
    }
    next(error);
  }
};

module.exports = {
  getPendingVouchers,
  getAllVouchers,
  getDirectorStats,
  approveVoucher,
  rejectVoucher
};
