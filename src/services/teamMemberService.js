import { http } from '../hooks/useHttp';

const TEAM_MEMBERS_PATH = '/api/team-members';

function asArray(payload) {
  const data = payload?.body ?? payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.content) ? data.content : [];
}

function memberLabel(member) {
  const fullName = [member?.firstName, member?.lastName].filter(Boolean).join(' ').trim();
  return member?.fullName?.trim?.() || fullName || member?.name?.trim?.() || `عضو #${member?.id}`;
}

const teamMemberService = {
  async login(identifier, password) {
    const response = await http.post('/api/auth/authenticate', {
      username: identifier,
      password,
    });
    const session = response.data;
    const profileResponse = await http.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    const profile = profileResponse.data;
    return {
      ...session,
      currentUser: profile,
      userId: profile.id,
      roles: profile.roles || [],
      permissions: profile.permissions || [],
    };
  },

  async getAllMembers() {
    const response = await http.get(TEAM_MEMBERS_PATH);
    return response.data;
  },

  async searchOptions(query = '') {
    const response = await http.get(TEAM_MEMBERS_PATH);
    const normalizedQuery = query.trim().toLocaleLowerCase('fa-IR');

    return asArray(response.data)
      .filter((member) => !normalizedQuery || [memberLabel(member), member?.firstName, member?.lastName, member?.jobTitle, member?.id]
        .some((value) => String(value || '').toLocaleLowerCase('fa-IR').includes(normalizedQuery)))
      .slice(0, 50)
      .map((member) => ({
        value: String(member.id),
        label: memberLabel(member),
        member,
      }));
  },

  async getMemberById(memberId) {
    const response = await http.get(`${TEAM_MEMBERS_PATH}/${memberId}`);
    return response.data;
  },

  async create(member) {
    const response = await http.post(TEAM_MEMBERS_PATH, member);
    return response.data;
  },

  async update(memberId, member) {
    const response = await http.put(`${TEAM_MEMBERS_PATH}/${memberId}`, member);
    return response.data;
  },

  async delete(memberId) {
    await http.delete(`${TEAM_MEMBERS_PATH}/${memberId}`);
  },

  async uploadAvatar(memberId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await http.post(`${TEAM_MEMBERS_PATH}/${memberId}/avatar`, formData);
    return response.data;
  },

  async deleteAvatar(memberId) {
    await http.delete(`${TEAM_MEMBERS_PATH}/${memberId}/avatar`);
  },
};

export const login = teamMemberService.login;
export const getAllMembers = teamMemberService.getAllMembers;
export const getMemberById = teamMemberService.getMemberById;
export const create = teamMemberService.create;
export const update = teamMemberService.update;
export const deleteMember = teamMemberService.delete;

export default teamMemberService;
