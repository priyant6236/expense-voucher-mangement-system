import API from './api';

export const authService = {
  /**
   * Login user with email & password
   */
  async login(credentials) {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new account
   */
  async register(userData) {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Fetch currently logged in user profile
   */
  async getCurrentUser() {
    const response = await API.get('/auth/me');
    return response.data;
  }
};
