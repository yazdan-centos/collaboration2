import { http } from '../hooks/useHttp';

const CUSTOMERS_PATH = '/api/customers';

const customerService = {
  async getAll(options = {}) {
    const response = await http.get(CUSTOMERS_PATH, options);
    return response.data;
  },
  async getById(customerId) {
    const response = await http.get(`${CUSTOMERS_PATH}/${customerId}`);
    return response.data;
  },
  async create(customer) {
    const response = await http.post(CUSTOMERS_PATH, customer);
    return response.data;
  },
  async update(customerId, customer) {
    const response = await http.put(`${CUSTOMERS_PATH}/${customerId}`, customer);
    return response.data;
  },
  async delete(customerId) {
    await http.delete(`${CUSTOMERS_PATH}/${customerId}`);
  },
};

export default customerService;
