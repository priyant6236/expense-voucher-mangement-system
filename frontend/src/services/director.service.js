import API from './api';

export const directorService = {
  /**
   * Get pending vouchers awaiting Director approval
   */
  async getPendingVouchers(filters = {}) {
    const response = await API.get('/voucher/pending', { params: filters });
    return response.data;
  },

  /**
   * Get organization-wide vouchers
   */
  async getAllVouchers(filters = {}) {
    const response = await API.get('/voucher/all', { params: filters });
    return response.data;
  },

  /**
   * Get Director dashboard statistics
   */
  async getDirectorStats() {
    const response = await API.get('/voucher/stats/director');
    return response.data;
  },

  /**
   * Approve voucher with Director signature
   */
  async approveVoucher(id, signaturePath) {
    const response = await API.put(`/voucher/approve/${id}`, { director_signature_path: signaturePath });
    return response.data;
  },

  /**
   * Reject voucher with mandatory rejection reason
   */
  async rejectVoucher(id, rejectionReason) {
    const response = await API.put(`/voucher/reject/${id}`, { rejection_reason: rejectionReason });
    return response.data;
  }
};
