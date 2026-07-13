import { http } from '../hooks/useHttp';

const SLA_CONTRACTS_PATH = '/api/sla-contracts';

const slaContractService = {
  async getAll(options = {}) {
    const response = await http.get(SLA_CONTRACTS_PATH, options);
    return response.data;
  },

  async getById(contractId, options = {}) {
    const response = await http.get(`${SLA_CONTRACTS_PATH}/${contractId}`, options);
    return response.data;
  },
};

export const getAllSlaContracts = slaContractService.getAll;
export const getSlaContractById = slaContractService.getById;

export default slaContractService;
