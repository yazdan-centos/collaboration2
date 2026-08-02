import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import permissionsService from '../../services/permissionsService';
import { getApiErrorMessage, getValidationMessage } from '../../utils/apiError';
import { hasPermission } from '../../utils/authorization';
import './UserPermissionsPage.css';
import './UserManagementPage.css';

const ROLE_LABELS = {
  CUSTOMER: 'مشتری',
  TEAM_MEMBER: 'عضو تیم',
  TEAM_MANAGER: 'مدیر تیم',
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const EMPTY_FORM = { firstName: '', lastName: '', username: '', email: '', password: '', roles: ['CUSTOMER'] };

function userDisplayName(user) {
  return [user?.firstName, user?.lastName].map((value) => String(value || '').trim()).filter(Boolean).join(' ') || 'بدون نام';
}

function userInitials(user) {
  const firstInitial = String(user?.firstName || '').trim().charAt(0);
  const lastInitial = String(user?.lastName || '').trim().charAt(0);
  return `${firstInitial}${lastInitial}`.toLocaleUpperCase();
}

function resolveAvatarUrl(avatarUrl) {
  if (!avatarUrl) return '';
  if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;
  return `${API_BASE_URL}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
}

function UserAvatar({ user }) {
  const [imageFailed, setImageFailed] = useState(false);
  const avatarUrl = resolveAvatarUrl(user?.avatarUrl);
  const initials = userInitials(user);

  useEffect(() => setImageFailed(false), [avatarUrl]);

  return (
    <span className="user-avatar users-admin-avatar" aria-label={`تصویر ${userDisplayName(user)}`}>
      {avatarUrl && !imageFailed
        ? <img src={avatarUrl} alt="" onError={() => setImageFailed(true)} />
        : (initials || <i className="fas fa-user" aria-hidden="true" />)}
    </span>
  );
}

function permissionCategory(code) {
  const prefix = String(code || '').split('_')[0];
  return ({ USER: 'کاربران', TICKET: 'تیکت‌ها', TASK: 'تسک‌ها', MEETING: 'جلسات', TEAM: 'تیم‌ها', CUSTOMER: 'مشتریان', SLA: 'قراردادهای SLA', ACCESS: 'مدیریت دسترسی' })[prefix] || 'سایر';
}

function UserFormModal({ user, roles, saving, onClose, onSave }) {
  const [form, setForm] = useState(() => user ? {
    firstName: user.firstName || '', lastName: user.lastName || '', username: user.username || '',
    email: user.email || '', password: '', roles: user.roles || [],
  } : EMPTY_FORM);
  const [error, setError] = useState('');

  function update(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleRole(role) {
    setForm((current) => ({
      ...current,
      roles: current.roles.includes(role) ? current.roles.filter((item) => item !== role) : [...current.roles, role],
    }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.roles.length) return setError('حداقل یک نقش را انتخاب کنید.');
    setError('');
    try { await onSave(form); } catch (requestError) { setError(getValidationMessage(requestError, 'ذخیره کاربر انجام نشد.')); }
  }

  return <div className="meeting-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="meeting-modal users-admin-modal" role="dialog" aria-modal="true">
      <header className="meeting-modal-header"><div><span>مدیریت کاربران</span><h2>{user ? 'ویرایش کاربر' : 'ایجاد کاربر جدید'}</h2></div><button type="button" className="meeting-icon-btn" onClick={onClose} aria-label="بستن"><i className="fas fa-xmark" /></button></header>
      <form className="users-admin-form" onSubmit={submit}>
        {error && <div className="users-admin-alert error"><i className="fas fa-circle-exclamation" />{error}</div>}
        <div className="users-admin-form-grid">
          <label><span>نام</span><input name="firstName" value={form.firstName} onChange={update} required maxLength="100" /></label>
          <label><span>نام خانوادگی</span><input name="lastName" value={form.lastName} onChange={update} required maxLength="100" /></label>
          <label><span>نام کاربری</span><input name="username" value={form.username} onChange={update} required maxLength="50" dir="ltr" /></label>
          <label><span>ایمیل</span><input type="email" name="email" value={form.email} onChange={update} required dir="ltr" /></label>
          <label className="wide"><span>{user ? 'رمز عبور جدید (اختیاری)' : 'رمز عبور'}</span><input type="password" name="password" value={form.password} onChange={update} required={!user} minLength="8" autoComplete="new-password" dir="ltr" /></label>
        </div>
        <fieldset className="users-admin-roles"><legend>نقش‌ها</legend>{roles.map((role) => <label key={role} className={form.roles.includes(role) ? 'selected' : ''}><input type="checkbox" checked={form.roles.includes(role)} onChange={() => toggleRole(role)} /><i className="fas fa-shield-halved" /><span>{ROLE_LABELS[role] || role}</span></label>)}</fieldset>
        <div className="meeting-modal-actions"><button type="button" className="filter-btn" onClick={onClose}>انصراف</button><button className="primary-action-btn" disabled={saving}><i className={saving ? 'fas fa-spinner fa-spin' : 'fas fa-check'} /> ذخیره کاربر</button></div>
      </form>
    </section>
  </div>;
}

function UserAccessPanel({ user, permissions, grants, saving, onClose, onChange }) {
  const grantMap = useMemo(() => Object.fromEntries(grants.map((grant) => [grant.permissionCode || grant.code, grant.effect])), [grants]);
  const grouped = useMemo(() => permissions.reduce((result, permission) => {
    const category = permissionCategory(permission.code);
    (result[category] ||= []).push(permission);
    return result;
  }, {}), [permissions]);

  return (
    <aside className="users-access-panel" aria-label={`مجوزهای اختصاصی ${user.fullName || user.username}`}>
      <header className="meeting-modal-header"><div><span>مجوزهای اختصاصی</span><h2>{user.fullName || user.username}</h2></div><button type="button" className="meeting-icon-btn" onClick={onClose} aria-label="بستن"><i className="fas fa-xmark" /></button></header>
      <div className="users-access-content">
        <p className="users-access-help">«نقش» یعنی مجوز از نقش‌های کاربر ارث‌بری شود؛ اجازه و عدم اجازه، دسترسی اختصاصی کاربر هستند.</p>
        {Object.entries(grouped).map(([category, items]) => <div className="permission-group" key={category}><h4>{category}</h4>{items.map((permission) => {
          const effect = grantMap[permission.code] || 'INHERIT';
          return <div className="permission-row" key={permission.code}><div><strong>{permission.description || permission.code}</strong><small>{permission.code}</small></div><div className="permission-actions">{[['ALLOW', 'اجازه'], ['DENY', 'عدم اجازه'], ['INHERIT', 'نقش']].map(([value, label]) => <button type="button" disabled={saving} key={value} className={effect === value ? `active ${value.toLowerCase()}` : ''} onClick={() => onChange(permission.code, value)}>{label}</button>)}</div></div>;
        })}</div>)}
      </div>
    </aside>
  );
}

export default function UserManagementPage() {
  const { auth, userId } = useAuth();
  const canCreate = hasPermission(auth, 'USER_CREATE');
  const canUpdate = hasPermission(auth, 'USER_UPDATE');
  const canDelete = hasPermission(auth, 'USER_DELETE');
  const canManageAccess = hasPermission(auth, 'ACCESS_ADMIN');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formUser, setFormUser] = useState(undefined);
  const [accessUser, setAccessUser] = useState(null);
  const [grants, setGrants] = useState([]);

  async function load() {
    setLoading(true); setMessage('');
    try {
      const requests = [permissionsService.listUsers(), permissionsService.listRoles()];
      if (canManageAccess) requests.push(permissionsService.listPermissions());
      const [loadedUsers, loadedRoles, loadedPermissions = []] = await Promise.all(requests);
      setUsers(loadedUsers); setRoles(loadedRoles); setPermissions(loadedPermissions);
    } catch (error) { setMessage(getApiErrorMessage(error, 'دریافت کاربران انجام نشد.')); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const filteredUsers = useMemo(() => {
    const value = query.trim().toLocaleLowerCase('fa');
    return users.filter((user) => !value || [user.fullName, user.username, user.email, ...(user.roles || [])].some((item) => String(item || '').toLocaleLowerCase('fa').includes(value)));
  }, [query, users]);

  async function saveUser(payload) {
    setSaving(true);
    try {
      if (formUser) await permissionsService.updateUser(formUser.id, payload);
      else await permissionsService.createUser(payload);
      setFormUser(undefined); await load(); setMessage('اطلاعات کاربر ذخیره شد.');
    } finally { setSaving(false); }
  }

  async function removeUser(user) {
    if (!user.deletable || String(user.id) === String(userId) || !window.confirm(`کاربر «${user.fullName || user.username}» حذف شود؟`)) return;
    setSaving(true); setMessage('');
    try { await permissionsService.deleteUser(user.id); await load(); setMessage('کاربر حذف شد.'); }
    catch (error) { setMessage(getApiErrorMessage(error, 'حذف کاربر انجام نشد.', { 409: 'این کاربر دارای اطلاعات وابسته است و قابل حذف نیست.' })); }
    finally { setSaving(false); }
  }

  async function openAccess(user) {
    setAccessUser(user); setSaving(true);
    try { setGrants(await permissionsService.getGrants(user.id)); }
    catch (error) { setMessage(getApiErrorMessage(error, 'دریافت مجوزهای کاربر انجام نشد.')); setAccessUser(null); }
    finally { setSaving(false); }
  }

  async function changePermission(code, effect) {
    setSaving(true);
    try {
      if (effect === 'INHERIT') { await permissionsService.removeGrant(accessUser.id, code); setGrants((current) => current.filter((grant) => (grant.permissionCode || grant.code) !== code)); }
      else { const grant = await permissionsService.upsertGrant(accessUser.id, code, effect); setGrants((current) => [...current.filter((item) => (item.permissionCode || item.code) !== code), grant]); }
    } catch (error) { setMessage(getApiErrorMessage(error, 'ذخیره مجوز انجام نشد.')); }
    finally { setSaving(false); }
  }

  return <section className="users-admin-page" dir="rtl">
    <div className={`users-admin-workspace${accessUser ? ' has-access' : ''}`}>
      <div className="users-admin-main">
        <header className="users-admin-header"><div><span>مدیریت هویت و دسترسی</span><h1>کاربران</h1><p>حساب‌های کاربری، نقش‌ها و مجوزهای اختصاصی را از یک محل مدیریت کنید.</p></div>{canCreate && <button type="button" className="primary-action-btn" onClick={() => setFormUser(null)}><i className="fas fa-user-plus" /> کاربر جدید</button>}</header>
        <div className="users-admin-toolbar"><label className="search-box"><i className="fas fa-magnifying-glass" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجو با نام، نام کاربری، ایمیل یا نقش" /></label><span><strong>{filteredUsers.length}</strong> کاربر</span></div>
        {message && <div className="users-admin-alert"><i className="fas fa-circle-info" />{message}</div>}
        <div className={`users-admin-table-wrap${loading ? ' loading' : ''}`}>
          <table className="task-table users-admin-table"><thead><tr><th>کاربر</th><th>نام کاربری</th><th>نقش‌ها</th><th>وضعیت حذف</th><th>عملیات</th></tr></thead><tbody>
            {filteredUsers.map((user) => <tr key={user.id} className={String(accessUser?.id) === String(user.id) ? 'selected' : ''}><td><div className="users-admin-identity"><UserAvatar user={user} /><div><strong>{userDisplayName(user)}</strong><small dir="ltr">{user.email}</small></div></div></td><td dir="ltr">@{user.username}</td><td><div className="role-chips">{(user.roles || []).map((role) => <span key={role}>{ROLE_LABELS[role] || role}</span>)}</div></td><td><span className={`users-delete-status ${user.deletable ? 'available' : 'blocked'}`}><i className={`fas ${user.deletable ? 'fa-check' : 'fa-link'}`} />{user.deletable ? 'بدون وابستگی' : 'دارای داده وابسته'}</span></td><td><div className="client-row-actions">{canUpdate && <button type="button" className="filter-btn" onClick={() => setFormUser(user)}><i className="fas fa-pen" /> ویرایش</button>}{canManageAccess && <button type="button" className={`filter-btn${String(accessUser?.id) === String(user.id) ? ' active' : ''}`} onClick={() => openAccess(user)}><i className="fas fa-key" /> مجوزها</button>}{canDelete && <button type="button" className="client-delete-btn" disabled={!user.deletable || String(user.id) === String(userId) || saving} onClick={() => removeUser(user)} title={!user.deletable ? 'کاربر دارای داده وابسته است' : 'حذف کاربر'}><i className="fas fa-trash" /></button>}</div></td></tr>)}
            {!loading && !filteredUsers.length && <tr><td colSpan="5"><div className="users-admin-empty"><i className="fas fa-users-slash" /><span>کاربری پیدا نشد.</span></div></td></tr>}
          </tbody></table>
        </div>
      </div>
      {accessUser && <UserAccessPanel user={accessUser} permissions={permissions} grants={grants} saving={saving} onClose={() => setAccessUser(null)} onChange={changePermission} />}
    </div>
    {formUser !== undefined && <UserFormModal user={formUser} roles={roles} saving={saving} onClose={() => setFormUser(undefined)} onSave={saveUser} />}
  </section>;
}
