import API from './api';

export const voucherService = {
  /**
   * Get employee's own vouchers with optional query filters
   */
  async getMyVouchers(filters = {}) {
    const response = await API.get('/voucher/my', { params: filters });
    return response.data;
  },

  /**
   * Get employee dashboard statistics
   */
  async getEmployeeStats() {
    const response = await API.get('/voucher/stats/my');
    return response.data;
  },

  /**
   * Get single voucher details by ID
   */
  async getVoucherById(id) {
    const response = await API.get(`/voucher/${id}`);
    return response.data;
  },

  /**
   * Create new voucher (Draft or Submitted)
   */
  async createVoucher(data) {
    const response = await API.post('/voucher', data);
    return response.data;
  },

  /**
   * Update draft voucher
   */
  async updateVoucher(id, data) {
    const response = await API.put(`/voucher/${id}`, data);
    return response.data;
  },

  /**
   * Delete draft voucher
   */
  async deleteVoucher(id) {
    const response = await API.delete(`/voucher/${id}`);
    return response.data;
  },

  /**
   * Submit voucher for approval
   */
  async submitVoucher(id, signaturePath) {
    const response = await API.post(`/voucher/submit/${id}`, { employee_signature_path: signaturePath });
    return response.data;
  }
};
