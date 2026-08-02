import { http } from '../hooks/useHttp';

const TICKETS_PATH = '/api/tickets';

function asArray(payload) {
  const data = payload?.body ?? payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.content) ? data.content : [];
}

function customerFullName(ticket) {
  const customer = ticket?.customer || {};
  const composedName = [customer.firstName, customer.lastName].filter(Boolean).join(' ');
  return customer.fullName || composedName || ticket?.customerName || `مشتری #${ticket?.customerId ?? customer.id}`;
}

function toTicketOption(ticket) {
  const customerId = ticket?.customerId ?? ticket?.customer?.id;
  return {
    value: customerId === undefined || customerId === null ? '' : String(customerId),
    label: `${ticket?.title || 'بدون عنوان'} ${customerFullName(ticket)}`.trim(),
    ticketId: String(ticket?.id),
    ticket,
  };
}

const ticketService = {
  async getAllTickets() {
    const response = await http.get(TICKETS_PATH);
    return response.data;
  },

  async searchOptions(query = '') {
    const response = await http.get(TICKETS_PATH);
    const normalizedQuery = query.trim().toLocaleLowerCase('fa-IR');

    return asArray(response.data)
      .map(toTicketOption)
      .filter((option) => !normalizedQuery || [option.label, option.ticketId, option.value]
        .some((value) => String(value).toLocaleLowerCase('fa-IR').includes(normalizedQuery)))
      .slice(0, 50);
  },

  async getOptionById(ticketId) {
    const ticket = await this.getTicketById(ticketId);
    return toTicketOption(ticket);
  },

  async getTicketById(ticketId, options = {}) {
    const response = await http.get(`${TICKETS_PATH}/${ticketId}`, options);
    return response.data;
  },

  async getCustomerById(customerId, options = {}) {
    const response = await http.get(`/api/customers/${customerId}`, options);
    return response.data;
  },

  async getSlaContractById(slaContractId, options = {}) {
    const response = await http.get(`/api/sla-contracts/${slaContractId}`, options);
    return response.data;
  },

  async searchTickets(filters = {}, options = {}) {
    const {
      page = 0,
      size = 10,
      sortBy = 'createdAt',
      order = 'DESC',
      signal,
    } = options;
    const response = await http.post(`${TICKETS_PATH}/search`, filters, {
      params: { page, size, sortBy, order },
      signal,
    });
    return response.data;
  },

  async create(ticket) {
    const response = await http.post(TICKETS_PATH, ticket);
    return response.data;
  },

  async update(ticketId, ticket) {
    const response = await http.put(`${TICKETS_PATH}/${ticketId}`, ticket);
    return response.data;
  },

  async delete(ticketId) {
    await http.delete(`${TICKETS_PATH}/${ticketId}`);
  },

  async getMessages(ticketId) {
    const response = await http.get(`${TICKETS_PATH}/${ticketId}/messages`);
    return response.data;
  },

  async addMessage(ticketId, message) {
    const response = await http.post(`${TICKETS_PATH}/${ticketId}/messages`, { message });
    return response.data;
  },

  async addTeamMemberMessage(ticketId, message) {
    const response = await http.post(`/api/team-members/tickets/${ticketId}/messages`, { message });
    return response.data;
  },

  async uploadAttachment(ticketId, file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await http.post(`${TICKETS_PATH}/${ticketId}/attachments`, formData, options);
    return response.data;
  },

  async uploadCustomerAttachment(ticketId, file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await http.post(`/api/customers/tickets/${ticketId}/attachments`, formData, options);
    return response.data;
  },

  async deleteAttachment(attachmentId) {
    await http.delete(`${TICKETS_PATH}/attachments/${attachmentId}`);
  },
};

export const getAllTickets = ticketService.getAllTickets;
export const getTicketById = ticketService.getTicketById;
export const searchTickets = ticketService.searchTickets;
export const create = ticketService.create;
export const update = ticketService.update;

export default ticketService;
