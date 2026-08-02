import React from 'react';
import { formatDay, formatTime, meetingStatusMeta } from './meetingUtils';

function MeetingCard({ meeting, selected, onSelect }) {
  const status = meetingStatusMeta[meeting.status] || meetingStatusMeta.SCHEDULED;
  const day = formatDay(meeting.startTime);

  return (
    <button
      type="button"
      className={`meeting-card${selected ? ' selected' : ''}`}
      onClick={() => onSelect(meeting)}
    >
      <div className="meeting-date-tile">
        <span>{day.weekday}</span>
        <strong className="fa-num">{day.day}</strong>
        <small>{day.month}</small>
      </div>
      <div className="meeting-card-main">
        <div className="meeting-card-heading">
          <div>
            <span className={`meeting-status ${status.tone}`}>
              <i className={status.icon} /> {status.label}
            </span>
            <h3>{meeting.title}</h3>
          </div>
          <i className="fas fa-chevron-left meeting-card-arrow" />
        </div>
        <p>{meeting.description || 'برای این جلسه توضیحی ثبت نشده است.'}</p>
        <div className="meeting-card-meta">
          <span><i className="far fa-clock" /> {formatTime(meeting.startTime)} تا {formatTime(meeting.endTime)}</span>
          <span><i className="fas fa-location-dot" /> {meeting.location || 'بدون محل'}</span>
          <span><i className="fas fa-users" /> <b className="fa-num">{meeting.participantCount || 0}</b> نفر</span>
        </div>
      </div>
    </button>
  );
}

export default function MeetingList({ meetings, selectedId, onSelect, isLoading, error, onRetry }) {
  if (isLoading) {
    return <div className="meeting-empty"><i className="fas fa-spinner fa-spin" /><span>در حال دریافت جلسات...</span></div>;
  }
  if (error) {
    return (
      <div className="meeting-empty error">
        <i className="fas fa-triangle-exclamation" />
        <span>{error}</span>
        <button type="button" className="filter-btn" onClick={onRetry}>تلاش دوباره</button>
      </div>
    );
  }
  if (!meetings.length) {
    return <div className="meeting-empty"><i className="fas fa-calendar-xmark" /><span>جلسه‌ای با این فیلتر پیدا نشد.</span></div>;
  }
  return (
    <div className="meeting-list">
      {meetings.map((meeting) => (
        <MeetingCard key={meeting.id} meeting={meeting} selected={meeting.id === selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}
