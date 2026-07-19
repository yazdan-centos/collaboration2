import { http } from '../hooks/useHttp';
import { fetchMessages, postMessage } from './chatService';

jest.mock('../hooks/useHttp', () => ({
  http: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test('loads and normalizes ticket messages from the documented endpoint', async () => {
  http.get.mockResolvedValue({
    data: [{ id: 7, senderId: 2, senderName: 'Sara', message: 'Hello', sentAt: '2026-07-13T08:00:00Z' }],
  });

  await expect(fetchMessages(42)).resolves.toEqual([
    expect.objectContaining({ id: 7, content: 'Hello', createdAt: '2026-07-13T08:00:00Z' }),
  ]);
  expect(http.get).toHaveBeenCalledWith('/api/tickets/42/messages', {});
});

test('uses the team-member endpoint and documented request body for team-member replies', async () => {
  http.post.mockResolvedValue({
    data: { id: 8, senderId: 3, senderName: 'Agent', message: 'Resolved', sentAt: '2026-07-13T09:00:00Z' },
  });

  await expect(postMessage(42, { content: '  Resolved  ' }, { role: 'ROLE_TEAM_MEMBER' }))
    .resolves.toEqual(expect.objectContaining({ content: 'Resolved', createdAt: '2026-07-13T09:00:00Z' }));
  expect(http.post).toHaveBeenCalledWith(
    '/api/team-members/tickets/42/messages',
    { message: 'Resolved' },
    {},
  );
});

test('uses the backward-compatible generic endpoint for other authenticated roles', async () => {
  http.post.mockResolvedValue({ data: { id: 9, message: 'Customer reply' } });

  await postMessage(42, { content: 'Customer reply' }, { role: 'CUSTOMER' });
  expect(http.post).toHaveBeenCalledWith('/api/tickets/42/messages', { message: 'Customer reply' }, {});
});

test('blocks empty messages before calling the backend', async () => {
  await expect(postMessage(42, { content: '   ' }, { role: 'TEAM_MEMBER' }))
    .rejects.toThrow('A non-empty message is required.');
  expect(http.post).not.toHaveBeenCalled();
});
