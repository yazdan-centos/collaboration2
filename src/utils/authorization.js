export const USER_ROLES = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  TEAM_MEMBER: 'TEAM_MEMBER',
  TEAM_MANAGER: 'TEAM_MANAGER',
});

export const TICKET_STATUS = Object.freeze({
  UNALLOCATED: 'UNALLOCATED',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
});

export const NEXT_TICKET_STATUSES = Object.freeze({
  UNALLOCATED: ['ASSIGNED', 'CLOSED'],
  ASSIGNED: ['IN_PROGRESS', 'UNALLOCATED', 'CLOSED'],
  IN_PROGRESS: ['RESOLVED', 'CLOSED', 'ASSIGNED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
});

export const navigationItems = Object.freeze([
  {
    key: 'tickets', label: 'تیکت‌ها', path: '/tickets', icon: 'fas fa-ticket',
    roles: Object.values(USER_ROLES), permission: 'TICKET_READ', badge: '۱۲',
  },
  {
    key: 'new-ticket', label: 'ایجاد تیکت', path: '/tickets/new', icon: 'fas fa-plus',
    roles: Object.values(USER_ROLES), permission: 'TICKET_CREATE',
  },
  {
    key: 'tasks', label: 'تسک‌ها', path: '/tasks', icon: 'fas fa-list-check',
    roles: [USER_ROLES.TEAM_MEMBER, USER_ROLES.TEAM_MANAGER], permission: 'TASK_READ', badge: '۱۲',
  },
  {
    key: 'dashboard', label: 'داشبورد', path: '/dashboard', icon: 'fas fa-gauge-high',
    roles: [USER_ROLES.TEAM_MANAGER],
  },
  {
    key: 'sla-contracts', label: 'قراردادهای SLA', path: '/sla-contracts', icon: 'fas fa-file-contract',
    roles: [USER_ROLES.TEAM_MANAGER],
  },
  {
    key: 'team', label: 'اعضای تیم', path: '/team', icon: 'fas fa-users',
    roles: [USER_ROLES.TEAM_MANAGER],
  },
  {
    key: 'users', label: 'کاربران', path: '/users', icon: 'fas fa-user-shield',
    roles: [USER_ROLES.TEAM_MANAGER], permission: 'USER_READ',
  },
  {
    key: 'clients', label: 'مشتریان', path: '/clients', icon: 'fas fa-building',
    roles: [USER_ROLES.TEAM_MANAGER],
  },
  {
    key: 'calendar', label: 'تقویم', path: '/calendar', icon: 'fas fa-calendar-days',
    roles: [USER_ROLES.TEAM_MANAGER],
  },
  {
    key: 'meetings', label: 'جلسات تیمی', path: '/meetings', icon: 'fas fa-handshake',
    roles: [USER_ROLES.TEAM_MANAGER, USER_ROLES.TEAM_MEMBER], permission: 'MEETING_READ',
  },
  {
    key: 'reports', label: 'چت‌روم تیکت', path: '/reports', icon: 'fas fa-chart-column',
    roles: [USER_ROLES.TEAM_MANAGER, USER_ROLES.TEAM_MEMBER],
  },
  {
    key: 'applicationGuide', label: 'راهنمای برنامه', path: '/applicationGuide', icon: 'fas fa-file-alt',
    roles: [USER_ROLES.TEAM_MANAGER], badge: '۳', badgeColor: 'var(--warning)',
  },
  {
    key: 'icons', label: 'گالری آیکون‌ها', path: '/icons', icon: 'fas fa-icons',
    roles: Object.values(USER_ROLES),
  },
  {
    key: 'settings', label: 'تنظیمات', path: '/settings', icon: 'fas fa-cog',
    roles: [USER_ROLES.TEAM_MANAGER],
  },
]);

export function normalizeRole(role) {
  return String(role || '').replace(/^ROLE_/, '').toUpperCase();
}

export function getRoles(session) {
  const roles = Array.isArray(session?.roles) ? session.roles : [session?.role];
  return roles.map(normalizeRole).filter(Boolean);
}

export function hasRole(session, role) {
  return getRoles(session).includes(normalizeRole(role));
}

export function isManager(session) {
  return hasRole(session, USER_ROLES.TEAM_MANAGER);
}

export function hasPermission(session, permission) {
  const expected = String(permission || '').toUpperCase();
  return Array.isArray(session?.permissions)
    && session.permissions.some((item) => String(item || '').toUpperCase() === expected);
}

export function getVisibleNavigation(session) {
  const roles = getRoles(session);
  return navigationItems.filter((item) => item.roles.some((role) => roles.includes(role))
    && (!item.permission || hasPermission(session, item.permission)));
}

export function isAssignedExpert(session, ticket) {
  return hasRole(session, USER_ROLES.TEAM_MEMBER)
    && String(ticket?.assignedMemberId ?? ticket?.assignedToId ?? '') === String(session?.userId ?? '');
}
