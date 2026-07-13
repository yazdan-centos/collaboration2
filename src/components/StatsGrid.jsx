import React from 'react';
import { statCards } from '../data/dashboardData';

function StatCard({ color, icon, trend, trendValue, value, label, delay }) {
  return (
    <div className={`stat-card ${color} animate-in ${delay}`}>
      <div className="stat-header">
        <div className={`stat-icon ${color}`}>
          <i className={icon}></i>
        </div>
        <div className={`stat-trend ${trend}`}>
          <i className={`fas fa-arrow-${trend}`} style={{ fontSize: '9px' }}></i>
          {trendValue}
        </div>
      </div>
      <div className="stat-value fa-num">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// کارت‌های آماری
export default function StatsGrid() {
  return (
    <section className="stats-grid">
      {statCards.map((card) => (
        <StatCard key={card.key} {...card} />
      ))}
    </section>
  );
}
