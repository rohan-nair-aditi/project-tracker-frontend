import api from './api';

const commentService = {
  getComments: async (taskId) => {
    const response = await api.get(`/comments/task/${taskId}`);
    return response.data;
  },

  createComment: async (taskId, content) => {
    const response = await api.post(`/comments/task/${taskId}`, { content });
    return response.data;
  }
};

export default commentService;