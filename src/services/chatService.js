import axios from 'axios';

/**
 * Dedicated axios instance for chat-related requests.
 * Swap `baseURL` for your real API host, or rely on a proxy/env var.
 */
const chatApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token automatically if present (adjust key to match your AuthProvider)
chatApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ------------------------------------------------------------------ */
/*  Mock data — lets the UI run/demo before the backend is connected   */
/* ------------------------------------------------------------------ */

const MOCK_LATENCY_MS = 500;

const buildMockMessages = (roomId) => [
  {
    id: 'm1',
    roomId,
    senderId: 'user-2',
    senderName: 'Sara Ahmadi',
    senderAvatar: null,
    content: 'سلام! خوش اومدی به این چت 👋',
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
  {
    id: 'm2',
    roomId,
    senderId: 'user-2',
    senderName: 'Sara Ahmadi',
    senderAvatar: null,
    content: 'هر سوالی داشتی همینجا بپرس.',
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Fetch message history for a room.
 * Falls back to mock data if the request fails (e.g. backend not wired yet)
 * so the component keeps working during local development.
 */
export async function fetchMessages(roomId, { useMockFallback = true } = {}) {
  try {
    const { data } = await chatApi.get(`/chat/rooms/${roomId}/messages`);
    return data;
  } catch (error) {
    if (useMockFallback) {
      await delay(MOCK_LATENCY_MS);
      return buildMockMessages(roomId);
    }
    throw error;
  }
}

/**
 * Send a new message. Returns the persisted message as returned by the
 * server (id, timestamps, etc). Falls back to echoing the local payload
 * back with a generated id, so optimistic UI keeps working offline.
 */
export async function postMessage(roomId, { content, senderId, senderName, senderAvatar }) {
  const payload = { content, senderId, senderName, senderAvatar };

  try {
    const { data } = await chatApi.post(`/chat/rooms/${roomId}/messages`, payload);
    return data;
  } catch (error) {
    await delay(200);
    return {
      id: `local-${Date.now()}`,
      roomId,
      ...payload,
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Placeholder for real-time typing indicators (e.g. via WebSocket/Pusher).
 * Wire this up to your realtime transport later; for now it's a no-op
 * that returns an unsubscribe function, matching the shape callers expect.
 */
export function subscribeToTyping(roomId, onTypingChange) {
  // Example real implementation:
  // const channel = socket.subscribe(`room-${roomId}-typing`);
  // channel.on('typing', onTypingChange);
  // return () => channel.unsubscribe();
  return () => {};
}

export default {
  fetchMessages,
  postMessage,
  subscribeToTyping,
};
