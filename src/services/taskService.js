import { http } from '../hooks/useHttp';

const TASKS_PATH = '/api/tasks';

function unwrapResponse(data) {
  return data?.body ?? data;
}

const taskService = {
  async getAll(options = {}) {
    const response = await http.get(TASKS_PATH, options);
    const data = unwrapResponse(response.data);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    return [];
  },

  async getById(taskId, options = {}) {
    const response = await http.get(`${TASKS_PATH}/${taskId}`, options);
    return unwrapResponse(response.data);
  },

  async create(task) {
    const response = await http.post(TASKS_PATH, task);
    return unwrapResponse(response.data);
  },

  async update(taskId, task) {
    const response = await http.put(`${TASKS_PATH}/${taskId}`, task);
    return unwrapResponse(response.data);
  },

  async delete(taskId) {
    await http.delete(`${TASKS_PATH}/${taskId}`);
  },

  async search(criteria, params = {}, options = {}) {
    const response = await http.post(`${TASKS_PATH}/search`, criteria, { ...options, params });
    const data = unwrapResponse(response.data);
    return Array.isArray(data) ? { content: data, totalElements: data.length } : data;
  },
};

export default taskService;
