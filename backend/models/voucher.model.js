const { query } = require('../config/db');
const { generateVoucherNumber } = require('../utils/voucherNumber.util');

// In-memory store fallback preloaded with realistic sample vouchers
const memoryVouchers = [
  {
    id: 1,
    voucher_number: 'VOU-2026-0001',
    voucher_date: '2026-07-25',
    expense_date: '2026-07-24',
    department: 'Engineering',
    expense_title: 'AWS Cloud Server Hosting Fees',
    expense_category: 'IT Infrastructure',
    expense_description: 'Monthly production AWS infrastructure hosting and database backups',
    amount: 450.00,
    user_id: 1,
    employee_name: 'John Doe (Employee)',
    employee_id: 'EMP-1001',
    employee_signature_path: '/uploads/demo-signature.png',
    status: 'Approved',
    director_signature_path: '/uploads/director-signature.png',
    approval_date: '2026-07-26 10:30:00',
    rejection_reason: null,
    created_at: new Date('2026-07-25T09:00:00Z'),
    updated_at: new Date('2026-07-26T10:30:00Z')
  },
  {
    id: 2,
    voucher_number: 'VOU-2026-0002',
    voucher_date: '2026-07-28',
    expense_date: '2026-07-27',
    department: 'Engineering',
    expense_title: 'Client Lunch & Technical Review',
    expense_category: 'Meals & Entertainment',
    expense_description: 'Lunch meeting with Enterprise client team to finalize system deployment schedule',
    amount: 125.50,
    user_id: 1,
    employee_name: 'John Doe (Employee)',
    employee_id: 'EMP-1001',
    employee_signature_path: '/uploads/demo-signature.png',
    status: 'Pending Approval',
    director_signature_path: null,
    approval_date: null,
    rejection_reason: null,
    created_at: new Date('2026-07-28T14:15:00Z'),
    updated_at: new Date('2026-07-28T14:15:00Z')
  },
  {
    id: 3,
    voucher_number: 'VOU-2026-0003',
    voucher_date: '2026-07-29',
    expense_date: '2026-07-28',
    department: 'Engineering',
    expense_title: 'Office Ergonomic Chair',
    expense_category: 'Office Supplies',
    expense_description: 'Ergonomic lumbar support desk chair purchase',
    amount: 220.00,
    user_id: 1,
    employee_name: 'John Doe (Employee)',
    employee_id: 'EMP-1001',
    employee_signature_path: null,
    status: 'Draft',
    director_signature_path: null,
    approval_date: null,
    rejection_reason: null,
    created_at: new Date('2026-07-29T11:00:00Z'),
    updated_at: new Date('2026-07-29T11:00:00Z')
  },
  {
    id: 4,
    voucher_number: 'VOU-2026-0004',
    voucher_date: '2026-07-20',
    expense_date: '2026-07-19',
    department: 'Engineering',
    expense_title: 'Taxi Fares for Client Visit',
    expense_category: 'Travel & Transport',
    expense_description: 'Uber rides to downtown client headquarters',
    amount: 65.00,
    user_id: 1,
    employee_name: 'John Doe (Employee)',
    employee_id: 'EMP-1001',
    employee_signature_path: '/uploads/demo-signature.png',
    status: 'Rejected',
    director_signature_path: null,
    approval_date: null,
    rejection_reason: 'Missing itemized receipt. Please attach original digital receipt and resubmit.',
    created_at: new Date('2026-07-20T16:20:00Z'),
    updated_at: new Date('2026-07-21T09:45:00Z')
  }
];

const memoryLogs = [];

class VoucherModel {
  /**
   * Get Next Sequence Voucher Number
   */
  static async getNextVoucherNumber() {
    try {
      const sql = 'SELECT COUNT(*) as count FROM vouchers';
      const rows = await query(sql);
      const count = rows[0]?.count || 0;
      return generateVoucherNumber(count + 1);
    } catch (error) {
      return generateVoucherNumber(memoryVouchers.length + 1);
    }
  }

  /**
   * Create a new Voucher (Draft or Submitted)
   */
  static async createVoucher(data, user) {
    const voucher_number = await this.getNextVoucherNumber();
    const today = new Date().toISOString().split('T')[0];

    const voucherData = {
      voucher_number,
      voucher_date: data.voucher_date || today,
      expense_date: data.expense_date,
      department: user.department,
      expense_title: data.expense_title,
      expense_category: data.expense_category,
      expense_description: data.expense_description || '',
      amount: parseFloat(data.amount),
      user_id: user.id,
      employee_name: user.full_name,
      employee_id: user.employee_id,
      employee_signature_path: data.employee_signature_path || user.signature_path || null,
      status: data.status || 'Draft',
      director_signature_path: null,
      approval_date: null,
      rejection_reason: null
    };

    try {
      const sql = `
        INSERT INTO vouchers 
        (voucher_number, voucher_date, expense_date, department, expense_title, expense_category, expense_description, amount, user_id, employee_name, employee_id, employee_signature_path, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        voucherData.voucher_number, voucherData.voucher_date, voucherData.expense_date,
        voucherData.department, voucherData.expense_title, voucherData.expense_category,
        voucherData.expense_description, voucherData.amount, voucherData.user_id,
        voucherData.employee_name, voucherData.employee_id, voucherData.employee_signature_path,
        voucherData.status
      ];
      const result = await query(sql, params);
      voucherData.id = result.insertId;
      voucherData.created_at = new Date();
      voucherData.updated_at = new Date();
    } catch (error) {
      voucherData.id = memoryVouchers.length + 1;
      voucherData.created_at = new Date();
      voucherData.updated_at = new Date();
      memoryVouchers.unshift(voucherData);
    }

    // Log action
    await this.logAction(voucherData.id, voucherData.status === 'Submitted' ? 'Submitted' : 'Created Draft', user);

    return voucherData;
  }

  /**
   * Get Vouchers for a specific Employee
   */
  static async getVouchersByUserId(userId, filters = {}) {
    const { status, search, category, startDate, endDate } = filters;

    try {
      let sql = 'SELECT * FROM vouchers WHERE user_id = ?';
      const params = [userId];

      if (status && status !== 'All') {
        sql += ' AND status = ?';
        params.push(status);
      }
      if (category && category !== 'All') {
        sql += ' AND expense_category = ?';
        params.push(category);
      }
      if (search) {
        sql += ' AND (voucher_number LIKE ? OR expense_title LIKE ? OR expense_category LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      if (startDate) {
        sql += ' AND expense_date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        sql += ' AND expense_date <= ?';
        params.push(endDate);
      }

      sql += ' ORDER BY created_at DESC';
      return await query(sql, params);
    } catch (error) {
      // Memory Store Filter Fallback
      return memoryVouchers.filter(v => {
        if (v.user_id !== parseInt(userId)) return false;
        if (status && status !== 'All' && v.status !== status) return false;
        if (category && category !== 'All' && v.expense_category !== category) return false;
        if (search) {
          const s = search.toLowerCase();
          const matchNum = v.voucher_number.toLowerCase().includes(s);
          const matchTitle = v.expense_title.toLowerCase().includes(s);
          const matchCat = v.expense_category.toLowerCase().includes(s);
          if (!matchNum && !matchTitle && !matchCat) return false;
        }
        return true;
      });
    }
  }

  /**
   * Get single Voucher by ID
   */
  static async getVoucherById(id) {
    try {
      const sql = 'SELECT * FROM vouchers WHERE id = ? LIMIT 1';
      const rows = await query(sql, [id]);
      if (rows && rows.length > 0) return rows[0];
    } catch (error) {
      console.warn('Falling back to memory store for getVoucherById:', id);
    }
    return memoryVouchers.find(v => v.id === parseInt(id)) || null;
  }

  /**
   * Update Draft Voucher
   */
  static async updateVoucher(id, userId, data, user) {
    const voucher = await this.getVoucherById(id);
    if (!voucher) throw new Error('Voucher not found');
    if (voucher.user_id !== parseInt(userId)) throw new Error('Unauthorized to modify this voucher');
    if (voucher.status !== 'Draft') throw new Error('Only Draft vouchers can be edited');

    const updated = {
      expense_date: data.expense_date || voucher.expense_date,
      expense_title: data.expense_title || voucher.expense_title,
      expense_category: data.expense_category || voucher.expense_category,
      expense_description: data.expense_description !== undefined ? data.expense_description : voucher.expense_description,
      amount: data.amount ? parseFloat(data.amount) : voucher.amount,
      employee_signature_path: data.employee_signature_path || voucher.employee_signature_path,
      status: data.status || voucher.status,
      updated_at: new Date()
    };

    try {
      const sql = `
        UPDATE vouchers 
        SET expense_date = ?, expense_title = ?, expense_category = ?, expense_description = ?, amount = ?, employee_signature_path = ?, status = ?
        WHERE id = ? AND user_id = ? AND status = 'Draft'
      `;
      await query(sql, [
        updated.expense_date, updated.expense_title, updated.expense_category,
        updated.expense_description, updated.amount, updated.employee_signature_path,
        updated.status, id, userId
      ]);
    } catch (error) {
      const index = memoryVouchers.findIndex(v => v.id === parseInt(id));
      if (index !== -1) {
        memoryVouchers[index] = { ...memoryVouchers[index], ...updated };
      }
    }

    await this.logAction(id, updated.status === 'Submitted' ? 'Submitted' : 'Updated Draft', user);
    return { ...voucher, ...updated };
  }

  /**
   * Delete Draft Voucher
   */
  static async deleteVoucher(id, userId) {
    const voucher = await this.getVoucherById(id);
    if (!voucher) throw new Error('Voucher not found');
    if (voucher.user_id !== parseInt(userId)) throw new Error('Unauthorized to delete this voucher');
    if (voucher.status !== 'Draft') throw new Error('Only Draft vouchers can be deleted');

    try {
      const sql = "DELETE FROM vouchers WHERE id = ? AND user_id = ? AND status = 'Draft'";
      await query(sql, [id, userId]);
    } catch (error) {
      const index = memoryVouchers.findIndex(v => v.id === parseInt(id));
      if (index !== -1) memoryVouchers.splice(index, 1);
    }
    return true;
  }

  /**
   * Submit Draft Voucher for Approval
   */
  static async submitVoucher(id, userId, signaturePath, user) {
    const voucher = await this.getVoucherById(id);
    if (!voucher) throw new Error('Voucher not found');
    if (voucher.user_id !== parseInt(userId)) throw new Error('Unauthorized to submit this voucher');
    if (voucher.status !== 'Draft' && voucher.status !== 'Rejected') {
      throw new Error('Only Draft or Rejected vouchers can be submitted');
    }

    const finalSignature = signaturePath || voucher.employee_signature_path || user.signature_path;
    if (!finalSignature) {
      throw new Error('Employee signature is required before submitting a voucher');
    }

    try {
      const sql = `
        UPDATE vouchers 
        SET status = 'Pending Approval', employee_signature_path = ?, rejection_reason = NULL, updated_at = NOW()
        WHERE id = ? AND user_id = ?
      `;
      await query(sql, [finalSignature, id, userId]);
    } catch (error) {
      const v = memoryVouchers.find(item => item.id === parseInt(id));
      if (v) {
        v.status = 'Pending Approval';
        v.employee_signature_path = finalSignature;
        v.rejection_reason = null;
        v.updated_at = new Date();
      }
    }

    await this.logAction(id, 'Submitted for Approval', user);
    return await this.getVoucherById(id);
  }

  /**
   * Get Employee Dashboard Statistics
   */
  static async getEmployeeDashboardStats(userId) {
    const vouchers = await this.getVouchersByUserId(userId);
    const total = vouchers.length;
    const draft = vouchers.filter(v => v.status === 'Draft').length;
    const pending = vouchers.filter(v => v.status === 'Submitted' || v.status === 'Pending Approval').length;
    const approved = vouchers.filter(v => v.status === 'Approved').length;
    const rejected = vouchers.filter(v => v.status === 'Rejected').length;
    const totalAmount = vouchers.reduce((sum, v) => sum + parseFloat(v.amount || 0), 0);

    return {
      total,
      draft,
      pending,
      approved,
      rejected,
      totalAmount
    };
  }

  /**
   * Get Pending Vouchers for Director Review
   */
  static async getPendingVouchers(filters = {}) {
    const { search, department, category } = filters;
    try {
      let sql = "SELECT * FROM vouchers WHERE status IN ('Pending Approval', 'Submitted')";
      const params = [];

      if (department && department !== 'All') {
        sql += ' AND department = ?';
        params.push(department);
      }
      if (category && category !== 'All') {
        sql += ' AND expense_category = ?';
        params.push(category);
      }
      if (search) {
        sql += ' AND (voucher_number LIKE ? OR expense_title LIKE ? OR employee_name LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      sql += ' ORDER BY created_at ASC';
      return await query(sql, params);
    } catch (error) {
      return memoryVouchers.filter(v => {
        if (v.status !== 'Pending Approval' && v.status !== 'Submitted') return false;
        if (department && department !== 'All' && v.department !== department) return false;
        if (category && category !== 'All' && v.expense_category !== category) return false;
        if (search) {
          const s = search.toLowerCase();
          const matchNum = v.voucher_number.toLowerCase().includes(s);
          const matchTitle = v.expense_title.toLowerCase().includes(s);
          const matchEmp = v.employee_name.toLowerCase().includes(s);
          if (!matchNum && !matchTitle && !matchEmp) return false;
        }
        return true;
      });
    }
  }

  /**
   * Get All Vouchers (for Director / Accounts)
   */
  static async getAllVouchers(filters = {}) {
    const { status, search, department, category } = filters;
    try {
      let sql = 'SELECT * FROM vouchers WHERE 1=1';
      const params = [];

      if (status && status !== 'All') {
        sql += ' AND status = ?';
        params.push(status);
      }
      if (department && department !== 'All') {
        sql += ' AND department = ?';
        params.push(department);
      }
      if (category && category !== 'All') {
        sql += ' AND expense_category = ?';
        params.push(category);
      }
      if (search) {
        sql += ' AND (voucher_number LIKE ? OR expense_title LIKE ? OR employee_name LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      sql += ' ORDER BY created_at DESC';
      return await query(sql, params);
    } catch (error) {
      return memoryVouchers.filter(v => {
        if (status && status !== 'All' && v.status !== status) return false;
        if (department && department !== 'All' && v.department !== department) return false;
        if (category && category !== 'All' && v.expense_category !== category) return false;
        if (search) {
          const s = search.toLowerCase();
          const matchNum = v.voucher_number.toLowerCase().includes(s);
          const matchTitle = v.expense_title.toLowerCase().includes(s);
          const matchEmp = v.employee_name.toLowerCase().includes(s);
          if (!matchNum && !matchTitle && !matchEmp) return false;
        }
        return true;
      });
    }
  }

  /**
   * Approve Voucher with Director Signature
   */
  static async approveVoucher(id, directorId, signaturePath, user) {
    const voucher = await this.getVoucherById(id);
    if (!voucher) throw new Error('Voucher not found');
    if (voucher.status !== 'Pending Approval' && voucher.status !== 'Submitted') {
      throw new Error('Only Pending Vouchers can be approved');
    }

    const finalSignature = signaturePath || user.signature_path || '/uploads/director-signature.png';

    try {
      const sql = `
        UPDATE vouchers 
        SET status = 'Approved', director_signature_path = ?, approval_date = NOW(), updated_at = NOW()
        WHERE id = ?
      `;
      await query(sql, [finalSignature, id]);
    } catch (error) {
      const v = memoryVouchers.find(item => item.id === parseInt(id));
      if (v) {
        v.status = 'Approved';
        v.director_signature_path = finalSignature;
        v.approval_date = new Date();
        v.updated_at = new Date();
      }
    }

    await this.logAction(id, 'Approved', user, 'Approved by Director');
    return await this.getVoucherById(id);
  }

  /**
   * Reject Voucher with Mandatory Rejection Remarks
   */
  static async rejectVoucher(id, directorId, rejectionReason, user) {
    const voucher = await this.getVoucherById(id);
    if (!voucher) throw new Error('Voucher not found');
    if (voucher.status !== 'Pending Approval' && voucher.status !== 'Submitted') {
      throw new Error('Only Pending Vouchers can be rejected');
    }

    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error('Rejection reason is mandatory when rejecting a voucher');
    }

    try {
      const sql = `
        UPDATE vouchers 
        SET status = 'Rejected', rejection_reason = ?, updated_at = NOW()
        WHERE id = ?
      `;
      await query(sql, [rejectionReason.trim(), id]);
    } catch (error) {
      const v = memoryVouchers.find(item => item.id === parseInt(id));
      if (v) {
        v.status = 'Rejected';
        v.rejection_reason = rejectionReason.trim();
        v.updated_at = new Date();
      }
    }

    await this.logAction(id, 'Rejected', user, `Rejection reason: ${rejectionReason.trim()}`);
    return await this.getVoucherById(id);
  }

  /**
   * Get Director Dashboard Statistics
   */
  static async getDirectorDashboardStats() {
    const allVouchers = await this.getAllVouchers();
    const todayStr = new Date().toISOString().split('T')[0];

    const pending = allVouchers.filter(v => v.status === 'Pending Approval' || v.status === 'Submitted');
    const approvedToday = allVouchers.filter(v => v.status === 'Approved' && (v.approval_date?.toString().startsWith(todayStr) || v.updated_at?.toString().startsWith(todayStr)));
    const rejectedToday = allVouchers.filter(v => v.status === 'Rejected' && v.updated_at?.toString().startsWith(todayStr));
    const totalPendingAmount = pending.reduce((sum, v) => sum + parseFloat(v.amount || 0), 0);

    return {
      pendingApprovals: pending.length,
      approvedToday: approvedToday.length,
      rejectedToday: rejectedToday.length,
      totalPendingAmount,
      totalVouchers: allVouchers.length
    };
  }

  /**
   * Get Approved Vouchers for Accounts Team Audit
   */
  static async getApprovedVouchers(filters = {}) {
    const { search, department, category, startDate, endDate } = filters;
    try {
      let sql = "SELECT * FROM vouchers WHERE status = 'Approved'";
      const params = [];

      if (department && department !== 'All') {
        sql += ' AND department = ?';
        params.push(department);
      }
      if (category && category !== 'All') {
        sql += ' AND expense_category = ?';
        params.push(category);
      }
      if (search) {
        sql += ' AND (voucher_number LIKE ? OR expense_title LIKE ? OR employee_name LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      if (startDate) {
        sql += ' AND expense_date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        sql += ' AND expense_date <= ?';
        params.push(endDate);
      }

      sql += ' ORDER BY approval_date DESC, updated_at DESC';
      return await query(sql, params);
    } catch (error) {
      return memoryVouchers.filter(v => {
        if (v.status !== 'Approved') return false;
        if (department && department !== 'All' && v.department !== department) return false;
        if (category && category !== 'All' && v.expense_category !== category) return false;
        if (search) {
          const s = search.toLowerCase();
          const matchNum = v.voucher_number.toLowerCase().includes(s);
          const matchTitle = v.expense_title.toLowerCase().includes(s);
          const matchEmp = v.employee_name.toLowerCase().includes(s);
          if (!matchNum && !matchTitle && !matchEmp) return false;
        }
        return true;
      });
    }
  }

  /**
   * Get Accounts Dashboard Statistics
   */
  static async getAccountsDashboardStats() {
    const allVouchers = await this.getAllVouchers();
    const approved = allVouchers.filter(v => v.status === 'Approved');
    const pending = allVouchers.filter(v => v.status === 'Pending Approval' || v.status === 'Submitted');
    const rejected = allVouchers.filter(v => v.status === 'Rejected');
    const totalApprovedAmount = approved.reduce((sum, v) => sum + parseFloat(v.amount || 0), 0);

    return {
      totalVouchers: allVouchers.length,
      approvedCount: approved.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length,
      totalApprovedAmount
    };
  }

  /**
   * Log action in voucher_logs audit table
   */
  static async logAction(voucherId, action, user, remarks = null) {
    try {
      const sql = `
        INSERT INTO voucher_logs (voucher_id, action, performed_by_id, performed_by_name, performed_by_role, remarks)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await query(sql, [voucherId, action, user.id, user.full_name, user.role, remarks]);
    } catch (error) {
      memoryLogs.push({
        id: memoryLogs.length + 1,
        voucher_id: voucherId,
        action,
        performed_by_id: user.id,
        performed_by_name: user.full_name,
        performed_by_role: user.role,
        remarks,
        created_at: new Date()
      });
    }
  }
}

module.exports = VoucherModel;
