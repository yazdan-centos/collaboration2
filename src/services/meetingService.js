import { http } from '../hooks/useHttp';

const MEETINGS_PATH = '/api/v1/meetings';
const TEAMS_PATH = '/api/v1/teams';

function unwrapResponse(payload) {
  return payload?.data ?? payload?.body ?? payload;
}

function normalizePage(payload) {
  const data = unwrapResponse(payload);
  if (Array.isArray(data)) {
    return { content: data, totalElements: data.length, totalPages: 1, number: 0, size: data.length };
  }
  return {
    content: Array.isArray(data?.content) ? data.content : [],
    totalElements: Number(data?.totalElements || 0),
    totalPages: Number(data?.totalPages || 0),
    number: Number(data?.number || 0),
    size: Number(data?.size || 0),
  };
}

const meetingService = {
  async getTeams(params = {}, options = {}) {
    const response = await http.get(TEAMS_PATH, { ...options, params });
    return normalizePage(response.data);
  },

  async getTeam(teamId, options = {}) {
    const response = await http.get(`${TEAMS_PATH}/${teamId}`, options);
    return unwrapResponse(response.data);
  },

  async getTeamMeetings(teamId, params = {}, options = {}) {
    const response = await http.get(`${MEETINGS_PATH}/team/${teamId}`, { ...options, params });
    return normalizePage(response.data);
  },

  async getUpcomingForUser(userId, from, to, options = {}) {
    const response = await http.get(`${MEETINGS_PATH}/user/${userId}/upcoming`, {
      ...options,
      params: { from, to },
    });
    const data = unwrapResponse(response.data);
    return Array.isArray(data) ? data : [];
  },

  async getById(meetingId, options = {}) {
    const response = await http.get(`${MEETINGS_PATH}/${meetingId}`, options);
    return unwrapResponse(response.data);
  },

  async create(payload) {
    const response = await http.post(MEETINGS_PATH, payload);
    return unwrapResponse(response.data);
  },

  async update(meetingId, payload) {
    const response = await http.put(`${MEETINGS_PATH}/${meetingId}`, payload);
    return unwrapResponse(response.data);
  },

  async cancel(meetingId) {
    await http.post(`${MEETINGS_PATH}/${meetingId}/cancel`);
  },

  async delete(meetingId) {
    await http.delete(`${MEETINGS_PATH}/${meetingId}`);
  },

  async addParticipants(meetingId, userIds) {
    await http.post(`${MEETINGS_PATH}/${meetingId}/participants`, userIds);
  },

  async respondToInvite(meetingId, userId, response) {
    await http.post(`${MEETINGS_PATH}/${meetingId}/participants/${userId}/rsvp`, null, {
      params: { response },
    });
  },

  async markAttendance(meetingId, userId, attended) {
    await http.put(`${MEETINGS_PATH}/${meetingId}/participants/${userId}/attendance`, null, {
      params: { attended },
    });
  },

  async addAgendaItem(meetingId, payload) {
    const response = await http.post(`${MEETINGS_PATH}/${meetingId}/agenda`, payload);
    return unwrapResponse(response.data);
  },

  async reorderAgenda(meetingId, orderedIds) {
    await http.put(`${MEETINGS_PATH}/${meetingId}/agenda/reorder`, orderedIds);
  },

  async getNotes(meetingId, options = {}) {
    const response = await http.get(`${MEETINGS_PATH}/${meetingId}/notes`, options);
    const data = unwrapResponse(response.data);
    return Array.isArray(data) ? data : [];
  },

  async addNote(meetingId, payload) {
    const response = await http.post(`${MEETINGS_PATH}/${meetingId}/notes`, payload);
    return unwrapResponse(response.data);
  },

  async getTasks(meetingId, options = {}) {
    const response = await http.get(`/api/tasks/meeting/${meetingId}`, options);
    const data = unwrapResponse(response.data);
    return Array.isArray(data) ? data : [];
  },
};

export default meetingService;
