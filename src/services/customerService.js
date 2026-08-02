import { http } from '../hooks/useHttp';

const CUSTOMERS_PATH = '/api/customers';

function asArray(payload) {
  const data = payload?.body ?? payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.content) ? data.content : [];
}

function customerLabel(customer) {
  const fullName = [customer?.firstName, customer?.lastName].filter(Boolean).join(' ');
  return fullName || customer?.fullName || customer?.companyName || customer?.username || customer?.email || `مشتری #${customer?.id}`;
}

const customerService = {
  async getAll(options = {}) {
    const response = await http.get(CUSTOMERS_PATH, options);
    return response.data;
  },
  async getById(customerId) {
    const response = await http.get(`${CUSTOMERS_PATH}/${customerId}`);
    return response.data;
  },
  async searchOptionsBySlaContract(slaContractId, searchKey = '') {
    if (!slaContractId) return [];
    const response = await http.get(`${CUSTOMERS_PATH}/options`, {
      params: {
        slaContractId,
        ...(searchKey ? { 'search-key': searchKey } : {}),
      },
    });
    return asArray(response.data).map((customer) => ({
      value: String(customer.id),
      label: customerLabel(customer),
      customer,
    }));
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
