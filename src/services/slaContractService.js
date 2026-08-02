import { http } from '../hooks/useHttp';

const SLA_CONTRACTS_PATH = '/api/sla-contracts';

function asArray(payload) {
  const data = payload?.body ?? payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.content) ? data.content : [];
}

function customerName(contract) {
  const customer = contract?.customer || {};
  return [customer.firstName, customer.lastName].filter(Boolean).join(' ')
    || customer.fullName || customer.companyName || customer.username || '';
}

const slaContractService = {
  async getAll(options = {}) {
    const response = await http.get(SLA_CONTRACTS_PATH, options);
    return response.data;
  },

  async getPage({ page = 0, size = 5, searchKey = '' } = {}, options = {}) {
    const response = await http.get(SLA_CONTRACTS_PATH, {
      ...options,
      params: {
        page,
        size,
        ...(searchKey ? { 'search-key': searchKey } : {}),
      },
    });
    return response.data;
  },

  async searchOptions(searchKey = '') {
    const response = await http.get(`${SLA_CONTRACTS_PATH}/options`, {
      params: searchKey ? { 'search-key': searchKey } : {},
    });
    return asArray(response.data).map((contract) => ({
      value: String(contract.id),
      label: `${contract.contractName || `قرارداد #${contract.id}`}${customerName(contract) ? ` - ${customerName(contract)}` : ''}`,
      contract,
    }));
  },

  async getById(contractId, options = {}) {
    const response = await http.get(`${SLA_CONTRACTS_PATH}/${contractId}`, options);
    return response.data;
  },

  async update(contractId, contract) {
    const response = await http.put(`${SLA_CONTRACTS_PATH}/${contractId}`, contract);
    return response.data;
  },
};

export const getAllSlaContracts = slaContractService.getAll;
export const getSlaContractById = slaContractService.getById;
export const updateSlaContract = slaContractService.update;

export default slaContractService;
