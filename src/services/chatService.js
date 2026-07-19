import { http } from '../hooks/useHttp';

const TICKETS_PATH = '/api/tickets';

function requireTicketId(ticketId) {
  if (ticketId === undefined || ticketId === null || ticketId === '') {
    throw new Error('A ticket ID is required to load or send ticket messages.');
  }
  return encodeURIComponent(String(ticketId));
}

function normalizeRole(role) {
  return String(role || '').replace(/^ROLE_/, '');
}

function hasRole(role, expectedRole) {
  const roles = Array.isArray(role) ? role : [role];
  return roles.some((candidate) => normalizeRole(candidate) === expectedRole);
}

function normalizeMessage(message) {
  return {
    ...message,
    content: message?.message ?? message?.content ?? '',
    createdAt: message?.sentAt ?? message?.createdAt ?? null,
  };
}

export async function fetchMessages(ticketId, options = {}) {
  const id = requireTicketId(ticketId);
  const response = await http.get(`${TICKETS_PATH}/${id}/messages`, options);
  const messages = Array.isArray(response.data) ? response.data : [];
  return messages.map(normalizeMessage);
}

export async function postMessage(ticketId, { content }, { role, ...options } = {}) {
  const id = requireTicketId(ticketId);
  const message = content?.trim();
  if (!message) {
    throw new Error('A non-empty message is required.');
  }

  const path = hasRole(role, 'TEAM_MEMBER')
    ? `/api/team-members/tickets/${id}/messages`
    : `${TICKETS_PATH}/${id}/messages`;
  const response = await http.post(path, { message }, options);
  return normalizeMessage(response.data);
}

export default {
  fetchMessages,
  postMessage,
};
