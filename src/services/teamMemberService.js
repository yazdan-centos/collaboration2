import { http } from '../hooks/useHttp';

const TEAM_MEMBERS_PATH = '/api/team-members';

const teamMemberService = {
  async login(identifier, password) {
    const response = await http.post('/api/auth/authenticate', {
      username: identifier,
      password,
    });
    return response.data;
  },

  async getAllMembers() {
    const response = await http.get(TEAM_MEMBERS_PATH);
    return response.data;
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
