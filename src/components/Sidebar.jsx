import React from 'react';
import { NavLink } from 'react-router-dom';
import { navSections } from '../data/dashboardData';
import { useAuth } from '../context/AuthContext';

// سایدبار
export default function Sidebar({ isOpen, onNavigate }) {
  const { currentUser, role, logout } = useAuth();
  const displayName = currentUser || 'کاربر';
  const initials = displayName.slice(0, 2).toUpperCase();

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
        {navSections.map((section) => (
          <React.Fragment key={section.title}>
            <div className="nav-section-title">{section.title}</div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
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
          </React.Fragment>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card" role="group" aria-label="حساب کاربری">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{displayName}</div>
            <div className="user-role">
              <span className="online-dot"></span>{role === 'ROLE_TEAM_MANAGER' ? 'مدیر تیم' : 'آنلاین'}
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
