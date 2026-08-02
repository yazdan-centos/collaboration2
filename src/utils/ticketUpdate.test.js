import { hasAssignedMember, prepareTicketUpdate } from './ticketUpdate';

describe('prepareTicketUpdate', () => {
  test('clears an existing assignee when a ticket returns to unallocated', () => {
    expect(prepareTicketUpdate(
      { assignedMemberId: 42 },
      { status: 'UNALLOCATED', statusNote: 'Returned to queue' },
    )).toEqual({
      status: 'UNALLOCATED',
      statusNote: 'Returned to queue',
      assignedMemberId: null,
    });
  });

  test('recognizes alternate assignee shapes', () => {
    expect(hasAssignedMember({ assignedToId: 7 })).toBe(true);
    expect(hasAssignedMember({ assignedMember: { id: 8 } })).toBe(true);
  });

  test('does not add assignment data when no assignee is set', () => {
    const changes = { status: 'unallocated' };
    expect(prepareTicketUpdate({ assignedMemberId: null }, changes)).toBe(changes);
  });

  test('does not alter updates to another status', () => {
    const changes = { status: 'IN_PROGRESS' };
    expect(prepareTicketUpdate({ assignedMemberId: 42 }, changes)).toBe(changes);
  });
});
