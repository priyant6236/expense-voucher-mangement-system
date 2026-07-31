import API from './api';

export const accountsService = {
  /**
   * Get all approved vouchers with optional filters
   */
  async getApprovedVouchers(filters = {}) {
    const response = await API.get('/voucher/approved', { params: filters });
    return response.data;
  },

  /**
   * Get Accounts team dashboard statistics
   */
  async getAccountsStats() {
    const response = await API.get('/voucher/stats/accounts');
    return response.data;
  },

  /**
   * Get single voucher details
   */
  async getVoucherById(id) {
    const response = await API.get(`/voucher/${id}`);
    return response.data;
  }
};
