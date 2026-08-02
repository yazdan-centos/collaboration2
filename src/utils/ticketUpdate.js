import { TICKET_STATUS } from './authorization';

function normalizeStatus(status) {
  return String(status || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
}

export function hasAssignedMember(ticket) {
  const assignedMemberId = ticket?.assignedMemberId
    ?? ticket?.assignedToId
    ?? ticket?.assignedMember?.id;

  return assignedMemberId !== undefined
    && assignedMemberId !== null
    && String(assignedMemberId).trim() !== '';
}

export function prepareTicketUpdate(ticket, changes) {
  if (normalizeStatus(changes?.status) !== TICKET_STATUS.UNALLOCATED
      || !hasAssignedMember(ticket)) {
    return changes;
  }

  return { ...changes, assignedMemberId: null };
}
