import React from 'react';
import { statusLabels, priorityLabels, priorityIcons } from '../data/dashboardData';
import { toPersianNum, getProgressColor } from '../utils/helpers';

const FILTERS = [
  { key: 'all', label: 'همه' },
  { key: 'completed', label: 'تکمیل‌شده' },
  { key: 'in-progress', label: 'در حال انجام' },
  { key: 'pending', label: 'در انتظار' },
  { key: 'failed', label: 'شکست‌خورده' },
];

function TaskRow({ task }) {
  return (
    <tr>
      <td>
        <span className="task-id">{task.id}</span>
      </td>
      <td>
        <div className="task-title-cell">
          <span className="task-name">{task.name}</span>
          <span className="task-desc">{task.desc}</span>
        </div>
      </td>
      <td>
        <span className={`status-badge ${task.status}`}>
          <span className="dot"></span>
          {statusLabels[task.status]}
        </span>
      </td>
      <td>
        <span className={`priority-badge ${task.priority}`}>
          <i className={priorityIcons[task.priority]} style={{ fontSize: '10px' }}></i>
          {priorityLabels[task.priority]}
        </span>
      </td>
      <td>
        <div className="assignee-cell">
          <div className="assignee-avatar" style={{ background: task.avatarColor }}>
            {task.avatarInit}
          </div>
          <span className="assignee-name">{task.assignee}</span>
        </div>
      </td>
      <td>
        <div className="progress-cell">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${task.progress}%`, background: getProgressColor(task.progress) }}
            ></div>
          </div>
          <div className="progress-text">{toPersianNum(task.progress)}٪</div>
        </div>
      </td>
      <td>
        <span className="date-cell">{task.deadline}</span>
      </td>
      <td>
        <div className="action-btns">
          <button className="action-btn" title="مشاهده">
            <i className="fas fa-eye"></i>
          </button>
          <button className="action-btn" title="ویرایش">
            <i className="fas fa-pen"></i>
          </button>
          <button className="action-btn" title="حذف">
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </td>
    </tr>
  );
}

// جدول تسک‌ها همراه با فیلترها
export default function TaskTable({ displayedTasks, activeFilter, onFilterClick }) {
  return (
    <div className="panel animate-in delay-5">
      <div className="panel-header">
        <div className="panel-title">لیست تسک‌ها</div>
        <div className="panel-actions">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`filter-btn${activeFilter === f.key ? ' active' : ''}`}
              data-filter={f.key}
              onClick={() => onFilterClick(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="task-table">
          <thead>
            <tr>
              <th>شناسه</th>
              <th>عنوان تسک</th>
              <th>وضعیت</th>
              <th>اولویت</th>
              <th>مسئول</th>
              <th>پیشرفت</th>
              <th>مهلت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody id="taskTableBody">
            {displayedTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
