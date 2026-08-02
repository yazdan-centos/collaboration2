import React, {useEffect, useMemo, useState} from 'react';
import permissionsService from '../../services/permissionsService';
import './UserPermissionsPage.css';

const fallbackUsers = [
    {id: 1, username: 'sara.mohammadi', fullName: 'سارا محمدی', email: 'sara@example.com', roles: ['TEAM_MANAGER']},
    {id: 2, username: 'ali.rezaei', fullName: 'علی رضایی', email: 'ali@example.com', roles: ['TEAM_MEMBER']},
];
const fallbackPermissions = [
    {code: 'TICKET_READ', name: 'مشاهده تیکت‌ها', category: 'تیکت‌ها'},
    {code: 'TICKET_CREATE', name: 'ایجاد تیکت', category: 'تیکت‌ها'},
    {code: 'TICKET_UPDATE', name: 'ویرایش تیکت', category: 'تیکت‌ها'},
    {code: 'TICKET_DELETE', name: 'حذف تیکت', category: 'تیکت‌ها'},
    {code: 'USER_READ', name: 'مشاهده کاربران', category: 'مدیریت کاربران'},
    {code: 'USER_UPDATE', name: 'ویرایش کاربران', category: 'مدیریت کاربران'},
];

export default function UserPermissionsPage() {
    const [users, setUsers] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [grants, setGrants] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    useEffect(() => {
        Promise.all([permissionsService.listUsers(), permissionsService.listPermissions()]).then(([loadedUsers, loadedPermissions]) => {
            const nextUsers = loadedUsers.length ? loadedUsers : fallbackUsers;
            setUsers(nextUsers);
            setPermissions(loadedPermissions.length ? loadedPermissions : fallbackPermissions);
            setSelectedUserId(String(nextUsers[0]?.id || ''));
        }).catch(() => {
            setUsers(fallbackUsers);
            setPermissions(fallbackPermissions);
            setSelectedUserId('1');
        }).finally(() => setLoading(false));
    }, []);
    useEffect(() => {
        if (selectedUserId) permissionsService.getGrants(selectedUserId).then(setGrants).catch(() => setGrants([]));
    }, [selectedUserId]);
    const selectedUser = users.find((user) => String(user.id) === String(selectedUserId));
    const filteredUsers = useMemo(() => users.filter((user) => `${user.fullName} ${user.username} ${user.email}`.toLowerCase().includes(query.toLowerCase())), [users, query]);
    const grantMap = useMemo(() => Object.fromEntries(grants.map((grant) => [grant.permissionCode || grant.code, grant.effect])), [grants]);

    async function updatePermission(permissionCode, effect) {
        setSaving(true);
        setMessage('');
        try {
            if (effect === 'INHERIT') {
                await permissionsService.removeGrant(selectedUserId, permissionCode);
                setGrants((current) => current.filter((grant) => (grant.permissionCode || grant.code) !== permissionCode));
            } else {
                const grant = await permissionsService.upsertGrant(selectedUserId, permissionCode, effect);
                setGrants((current) => [...current.filter((item) => (item.permissionCode || item.code) !== permissionCode), grant]);
            }
            setMessage('تغییرات دسترسی ذخیره شد.');
        } catch {
            setMessage('ذخیره دسترسی انجام نشد. دوباره تلاش کنید.');
        } finally {
            setSaving(false);
        }
    }

    const grouped = permissions.reduce((groups, permission) => {
        const key = permission.category || 'سایر';
        (groups[key] ||= []).push(permission);
        return groups;
    }, {});
    if (loading) return <section className="permissions-page">
        <div className="permissions-loading">در حال بارگذاری...</div>
    </section>;
    return <section className="permissions-page" dir="rtl">
        <header className="permissions-hero">
            <div><span className="eyebrow">کنترل دسترسی</span><h1>مدیریت دسترسی کاربران</h1><p>مجوزهای اختصاصی هر کاربر
                را در کنار دسترسی‌های نقش او مدیریت کنید.</p></div>
            <div className="permissions-summary"><strong>{users.length}</strong><span>کاربر فعال</span></div>
        </header>
        <div className="permissions-layout">
            <aside className="users-panel">
                <div className="panel-heading"><h2>کاربران</h2><span>{filteredUsers.length}</span></div>
                <label className="search-box"><span>⌕</span><input value={query}
                                                                   onChange={(event) => setQuery(event.target.value)}
                                                                   placeholder="جستجوی کاربر"/></label>
                <div className="user-list">{filteredUsers.map((user) => <button
                    className={`user-row ${String(user.id) === String(selectedUserId) ? 'selected' : ''}`} key={user.id}
                    onClick={() => setSelectedUserId(String(user.id))}><span
                    className="user-avatar">{(user.fullName || user.username || '?').slice(0, 1)}</span><span
                    className="user-info"><strong>{user.fullName || user.username}</strong><small>{user.email || user.username}</small></span><span
                    className="user-chevron">‹</span></button>)}</div>
            </aside>
            <main className="access-panel">
                <div className="selected-user"><span
                    className="user-avatar large">{(selectedUser?.fullName || '?').slice(0, 1)}</span>
                    <div><h2>{selectedUser?.fullName || 'کاربر انتخاب‌شده'}</h2>
                        <p>{selectedUser?.email || selectedUser?.username}</p></div>
                    <div className="role-chips">{(selectedUser?.roles || []).map((role) => <span
                        key={role}>{role.replaceAll('_', ' ')}</span>)}</div>
                </div>
                <div className="access-toolbar">
                    <div><strong>مجوزها</strong><p>برای هر مجوز، اجازه، عدم اجازه یا ارث‌بری از نقش را انتخاب کنید.</p></div>
                    <span className="saving-status">{saving ? 'در حال ذخیره...' : message}</span></div>
                {Object.entries(grouped).map(([category, categoryPermissions]) => <div className="permission-group"
                                                                                       key={category}>
                    <strong>{category}</strong>{categoryPermissions.map((permission) => {
                    const effect = grantMap[permission.code] || 'INHERIT';
                    return <div className="permission-row" key={permission.code}>
                        <div><strong>{permission.name || permission.code}</strong><small>{permission.code}</small></div>
                        <div
                            className="permission-actions">{[['ALLOW', 'اجازه'], ['DENY', 'عدم اجازه'], ['INHERIT', 'نقش']].map(([value, label]) =>
                            <button key={value} className={effect === value ? `active ${value.toLowerCase()}` : ''}
                                    onClick={() => updatePermission(permission.code, value)}>{label}</button>)}</div>
                    </div>;
                })}</div>)}</main>
        </div>
    </section>;
}
