import { http } from '../hooks/useHttp';

const ACCESS_PATH = '/api/admin/access';
const unwrap = (data) => data?.body ?? data;
const asArray = (data) => { const value = unwrap(data); return Array.isArray(value) ? value : (value?.content || []); };

const permissionsService = {
  async listUsers() { const response = await http.get('/api/admin/users'); return asArray(response.data); },
  async listRoles() { const response = await http.get('/api/admin/users/roles'); return asArray(response.data); },
  async createUser(payload) { const response = await http.post('/api/admin/users', payload); return unwrap(response.data); },
  async updateUser(userId, payload) { const response = await http.put(`/api/admin/users/${userId}`, payload); return unwrap(response.data); },
  async deleteUser(userId) { await http.delete(`/api/admin/users/${userId}`); },
  async listPermissions() { const response = await http.get(`${ACCESS_PATH}/permissions`); return asArray(response.data); },
  async getGrants(userId) { const response = await http.get(`${ACCESS_PATH}/users/${userId}/grants`); return asArray(response.data); },
  async upsertGrant(userId, permissionCode, effect) { const response = await http.post(`${ACCESS_PATH}/users/${userId}/grants`, { permissionCode, effect }); return unwrap(response.data); },
  async removeGrant(userId, permissionCode) { await http.delete(`${ACCESS_PATH}/users/${userId}/grants/${encodeURIComponent(permissionCode)}`); },
};

export default permissionsService;
