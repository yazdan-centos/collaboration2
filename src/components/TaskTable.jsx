import React from 'react';
import {priorityIcons, priorityLabels, statusLabels} from '../data/dashboardData';
import {getProgressColor, toPersianNum} from '../utils/helpers';

const FILTERS = [
  { key: 'all', label: 'همه' },
  { key: 'completed', label: 'تکمیل‌شده' },
  { key: 'in-progress', label: 'در حال انجام' },
  { key: 'pending', label: 'در انتظار' },
  { key: 'failed', label: 'شکست‌خورده' },
];

const TASK_PRIORITY_LABELS = {...priorityLabels, critical: 'بحرانی'};
const TASK_PRIORITY_ICONS = {...priorityIcons, critical: 'fas fa-triangle-exclamation'};

function initials(name) {
  return String(name || '—').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('.') || '—';
}

function TaskRow({task, onView, onEdit, onDelete, isSelected, canEdit, canDelete}) {
  const progress = Math.max(0, Math.min(100, Number(task.progress) || 0));
  const priorityClass = task.priority === 'critical' ? 'high' : task.priority;

  function handleKeyDown(event) {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onView(task);
      return;
    }
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;

    event.preventDefault();
    const adjacentRow = event.key === 'ArrowUp'
        ? event.currentTarget.previousElementSibling
        : event.currentTarget.nextElementSibling;
    adjacentRow?.focus();
  }

    return (
        <tr
            className={isSelected ? 'selected' : ''}
            aria-selected={isSelected}
            onClick={() => onView(task)}
            tabIndex="0"
            onKeyDown={handleKeyDown}
        >
            <td>
                <span className="task-id fa-num">{task.id}</span>
            </td>

            <td>
                <div className="task-title-cell">
                    <span className="task-name">{task.name || 'بدون عنوان'}</span>
                    <span className="task-desc">{task.desc || '—'}</span>
                </div>
            </td>

            <td>
      <span className={`status-badge ${task.status}`}>
        <span className="dot" />
          {statusLabels[task.status] || task.status || 'نامشخص'}
      </span>
            </td>

            <td>
      <span className={`priority-badge ${priorityClass}`}>
        <i
            className={TASK_PRIORITY_ICONS[task.priority]}
            style={{ fontSize: '10px' }}
        />
          {TASK_PRIORITY_LABELS[task.priority] || task.priority || '—'}
      </span>
            </td>

            <td>
                <div className="assignee-cell">
                    <div
                        className="assignee-avatar"
                        style={{ background: task.avatarColor || 'var(--accent)' }}
                    >
                        {task.avatarInit || initials(task.assignee)}
                    </div>
                    <span className="assignee-name">{task.assignee || 'تخصیص نیافته'}</span>
                </div>
            </td>

            <td>
                <div className="progress-cell">
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${progress}%`, background: getProgressColor(progress) }}
                        />
                    </div>
                    <div className="progress-text">{toPersianNum(progress)}٪</div>
                </div>
            </td>

            <td>
                <span className="date-cell">{task.deadline || '—'}</span>
            </td>

            <td>
                <div className="action-btns" onClick={(event) => event.stopPropagation()}>
                    <button
                        type="button"
                        className="action-btn"
                        title="مشاهده"
                        aria-label="مشاهده تسک"
                        onClick={() => onView(task)}
                    >
                        <i className="fas fa-eye" />
                    </button>

                    {canEdit && <button
                        type="button"
                        className="action-btn"
                        title="ویرایش"
                        aria-label="ویرایش تسک"
                        onClick={() => onEdit(task)}
                    >
                        <i className="fas fa-pen" />
                    </button>}

                    {canDelete && <button
                        type="button"
                        className="action-btn"
                        title="حذف"
                        aria-label="حذف تسک"
                        onClick={() => onDelete(task)}
                    >
                        <i className="fas fa-trash-alt" />
                    </button>}
                </div>
            </td>
        </tr>
    );

}

export default function TaskTable({
                                    displayedTasks = [],
                                    selectedTaskId,
                                    onView,
                                    onEdit,
                                    activeFilter = null,
                                    onFilterClick,
                                    onCreate,
                                    onDelete,
                                    canCreate = false,
                                    canEdit = false,
                                    canDelete = false,
                                    isLoading = false,
                                    isMutating = false,
                                    error = '',
                                    onRetry
                                  }) {
  function openEdit(task) {
    onEdit?.(task);
  }

  async function remove(task) {
    if (!window.confirm(`تسک «${task.name || task.id}» حذف شود؟`)) return;
    try {
      await onDelete?.(task);
    } catch {
      return;
    }
  }

  return <div className="panel animate-in delay-5">
    <div className="panel-header">
      <div>
        <div className="panel-title">لیست تسک‌ها</div>
        <div className="team-results-count fa-num">{displayedTasks.length} تسک</div>
      </div>
      <div className="panel-actions">
        {canCreate && <button
            type="button"
            className="filter-btn active"
            onClick={() => onCreate?.()}
            disabled={isMutating}
        >
          <i
            className="fas fa-plus"/> ایجاد تسک
        </button>}
        {FILTERS.map((filter) =>
            <button
              type="button"
              key={filter.key}
              className={`filter-btn${activeFilter === filter.key ? ' active' : ''}`}
              onClick={() => onFilterClick?.(filter.key)}>{filter.label}
            </button>)
        }
      </div>
    </div>
    <div style={{overflowX: 'auto'}}>
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
        <tbody>{isLoading ? <tr>
          <td colSpan="8">
            <div className="team-empty"><strong>در حال دریافت تسک‌ها...</strong><span>لطفاً منتظر بمانید.</span></div>
          </td>
        </tr> : error ? <tr>
          <td colSpan="8">
            <div className="team-empty"><strong>خطا در ارتباط با سرویس تسک‌ها</strong><span>{error}</span>
              <button type="button" className="filter-btn" onClick={onRetry}>تلاش دوباره</button>
            </div>
          </td>
        </tr> : displayedTasks.length ? displayedTasks.map((task) => <TaskRow key={task.id} task={task}
                                                                              isSelected={task.id === selectedTaskId}
                                                                              onView={onView} onEdit={openEdit}
                                                                              onDelete={remove} canEdit={canEdit}
                                                                              canDelete={canDelete}/>) : <tr>
          <td colSpan="8">
            <div className="team-empty"><strong>تسکی پیدا نشد</strong><span>فیلتر یا عبارت جستجو را تغییر دهید.</span>
            </div>
          </td>
        </tr>}</tbody>
      </table>
    </div>
  </div>;
}
