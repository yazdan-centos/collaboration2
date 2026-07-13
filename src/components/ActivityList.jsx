import React from 'react';
import { activities } from '../data/dashboardData';

// فعالیت‌های اخیر
export default function ActivityList() {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-title">فعالیت‌های اخیر</div>
        <button className="filter-btn" style={{ fontSize: '11px' }}>
          مشاهده همه
          <i className="fas fa-chevron-left" style={{ fontSize: '9px' }}></i>
        </button>
      </div>
      <div className="activity-list" id="activityList">
        {activities.map((act, idx) => (
          <div className="activity-item" key={idx}>
            <div className="activity-icon-wrap">
              <div className={`activity-icon ${act.color}`}>
                <i className={act.icon}></i>
              </div>
            </div>
            <div className="activity-content">
              {/* متن شامل تگ <strong> برای نام‌ها است */}
              <div className="activity-text" dangerouslySetInnerHTML={{ __html: act.html }}></div>
              <div className="activity-time">{act.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
