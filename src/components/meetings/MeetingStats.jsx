import React from 'react';

const cards = [
  { key: 'total', label: 'کل جلسات', icon: 'fas fa-calendar-days', color: 'cyan' },
  { key: 'upcoming', label: 'جلسات پیش‌رو', icon: 'fas fa-clock', color: 'purple' },
  { key: 'inProgress', label: 'در حال برگزاری', icon: 'fas fa-circle-play', color: 'green' },
  { key: 'completed', label: 'تکمیل‌شده', icon: 'fas fa-circle-check', color: 'amber' },
];

export default function MeetingStats({ stats }) {
  return (
    <section className="meeting-stats-grid" aria-label="آمار جلسات">
      {cards.map((card, index) => (
        <article key={card.key} className={`meeting-stat-card animate-in delay-${index + 1}`}>
          <div className={`meeting-stat-icon ${card.color}`}><i className={card.icon} /></div>
          <div>
            <strong className="fa-num">{stats[card.key] || 0}</strong>
            <span>{card.label}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
