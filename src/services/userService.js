import api from './api';

const userService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  }
};

export default userService;