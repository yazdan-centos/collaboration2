import React from 'react';

// صفحه‌ای عمومی برای مسیرهایی که هنوز محتوای اختصاصی ندارند
export default function PlaceholderPage({ icon, title, description }) {
  return (
    <section style={{ padding: '20px 28px 28px' }}>
      <div className="panel animate-in delay-1" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div
          className="stat-icon green"
          style={{ width: 56, height: 56, borderRadius: 14, fontSize: 22, margin: '0 auto 16px' }}
        >
          <i className={icon}></i>
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 380, margin: '0 auto' }}>
          {description}
        </div>
      </div>
    </section>
  );
}
