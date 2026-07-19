import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getVisibleNavigation } from '../utils/authorization';

// سایدبار
export default function Sidebar({ isOpen, onNavigate }) {
  const { auth, currentUser, role, logout } = useAuth();
  const displayName = typeof currentUser === 'string'
    ? currentUser
    : currentUser?.name || currentUser?.username || 'کاربر';
  const initials = displayName.slice(0, 2).toUpperCase();
  const visibleItems = getVisibleNavigation(auth);

  return (
    <aside className={`sidebar${isOpen ? ' open' : ''}`} id="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <i className="fas fa-bolt"></i>
        </div>
        <div>
          <div className="logo-text">
           مدیریت تیکت‌های پشتیبانی
            </div>
          <div className="logo-sub">پنل مدیریت پروژه</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">منوی اصلی</div>
        {visibleItems.map((item) => (
              <NavLink
                key={item.key}
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <i className={item.icon}></i>
                {item.label}
                {item.badge && (
                  <span
                    className="nav-badge"
                    style={item.badgeColor ? { background: item.badgeColor } : undefined}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card" role="group" aria-label="حساب کاربری">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{displayName}</div>
            <div className="user-role">
              <span className="online-dot"></span>{String(role || '').includes('MANAGER') ? 'مدیر تیم' : String(role || '').includes('CUSTOMER') ? 'مشتری' : 'کارشناس'}
            </div>
          </div>
          <button type="button" className="action-btn" onClick={logout} aria-label="خروج از حساب">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
