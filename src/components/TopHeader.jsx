import React from 'react';
import { useTheme } from '../context/ThemeContext';

// هدر بالا
export default function TopHeader({
  pageTitle,
  breadcrumbLabel,
  searchQuery,
  onSearchChange,
  isMobile,
  onMenuToggleClick,
}) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="top-header">
      <div className="header-right">
        <div>
          <div className="page-title">{pageTitle}</div>
          <div className="breadcrumb">
            داشبورد <i className="fas fa-chevron-left" style={{ fontSize: '9px' }}></i>{' '}
            <span>{breadcrumbLabel}</span>
          </div>
        </div>
      </div>
      <div className="header-left">
        <button
          type="button"
          className={`theme-toggle${isDark ? ' dark' : ''}`}
          onClick={toggleTheme}
          role="switch"
          aria-checked={!isDark}
          aria-label={isDark ? 'فعال کردن حالت روشن' : 'فعال کردن حالت تاریک'}
          title={isDark ? 'حالت روشن' : 'حالت تاریک'}
        >
          <i className="fas fa-sun" aria-hidden="true" />
          <i className="fas fa-moon" aria-hidden="true" />
          <span className="theme-toggle-thumb" />
        </button>
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="جستجو در تسک‌ها..."
            id="searchInput"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <button className="header-btn" title="اعلان‌ها">
          <i className="fas fa-bell"></i>
          <span className="notif-dot"></span>
        </button>
        <button className="header-btn" title="پیام‌ها">
          <i className="fas fa-envelope"></i>
        </button>
        <button
          className="header-btn"
          id="menuToggle"
          title="منو"
          style={{ display: isMobile ? 'flex' : 'none' }}
          onClick={onMenuToggleClick}
        >
          <i className="fas fa-bars"></i>
        </button>
      </div>
    </header>
  );
}
