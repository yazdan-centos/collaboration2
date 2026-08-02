import React from 'react';
import { statusLabels, priorityLabels, priorityIcons } from '../../data/dashboardData';
import { getProgressColor, toPersianNum } from '../../utils/helpers';

const PRIORITY_LABELS = { ...priorityLabels, critical: 'بحرانی' };
const PRIORITY_ICONS = { ...priorityIcons, critical: 'fas fa-triangle-exclamation' };

export default function TaskDetails({ task, onClose, onEdit, canEdit = false }) {
  const progress = Math.max(0, Math.min(100, Number(task.progress) || 0));
  const priorityClass = task.priority === 'critical' ? 'high' : task.priority;

  return (
    <aside className="task-detail-panel panel animate-in" aria-label="جزئیات تسک">
      <div className="task-detail-accent" />
      <div className="task-detail-header">
        <div className="task-detail-heading">
          <span className="task-detail-kicker"><i className="fas fa-sparkles" /> نمای کامل تسک</span>
          <h2>{task.name || 'بدون عنوان'}</h2>
          <span className="task-detail-id fa-num">TASK #{toPersianNum(task.id)}</span>
        </div>
        <div className="task-detail-header-actions">
          {canEdit && <button type="button" className="task-detail-edit" onClick={onEdit} aria-label="ویرایش تسک"><i className="fas fa-pen" /></button>}
          <button type="button" className="task-detail-close" onClick={onClose} aria-label="بستن جزئیات"><i className="fas fa-times" /></button>
        </div>
      </div>

      <div className="task-detail-badges">
        <span className={`status-badge ${task.status}`}><span className="dot" />{statusLabels[task.status] || 'نامشخص'}</span>
        <span className={`priority-badge ${priorityClass}`}><i className={PRIORITY_ICONS[task.priority] || 'fas fa-minus'} />اولویت {PRIORITY_LABELS[task.priority] || 'نامشخص'}</span>
      </div>

      <div className="task-detail-progress">
        <div className="task-progress-ring" style={{ '--task-progress': `${progress * 3.6}deg`, '--task-progress-color': getProgressColor(progress) }}>
          <div><strong>{toPersianNum(progress)}٪</strong><span>پیشرفت</span></div>
        </div>
        <div className="task-progress-copy">
          <span>وضعیت اجرای تسک</span>
          <strong>{progress === 100 ? 'ماموریت انجام شد!' : progress >= 60 ? 'در مسیر تکمیل' : progress > 0 ? 'کار در جریان است' : 'آماده شروع'}</strong>
          <div className="task-detail-progress-track"><i style={{ width: `${progress}%`, background: getProgressColor(progress) }} /></div>
        </div>
      </div>

      <div className="task-detail-section">
        <span className="task-detail-label"><i className="fas fa-align-right" /> توضیحات</span>
        <p>{task.desc || 'برای این تسک هنوز توضیحاتی ثبت نشده است.'}</p>
      </div>

      <div className="task-detail-facts">
        <div><span className="task-fact-icon owner"><i className="fas fa-user-check" /></span><small>مسئول اجرا</small><strong>{task.assignee || 'تخصیص نیافته'}</strong></div>
        <div><span className="task-fact-icon deadline"><i className="fas fa-calendar-day" /></span><small>مهلت انجام</small><strong className="fa-num">{task.deadline || 'تعیین نشده'}</strong></div>
      </div>

      <div className="task-detail-footer">
        <span><i className="fas fa-circle-info" /> اطلاعات این تسک با سرویس مدیریت تسک‌ها همگام است.</span>
      </div>
    </aside>
  );
}
