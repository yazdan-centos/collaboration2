import React, { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import persian from 'react-date-object/calendars/persian';
import persianFa from 'react-date-object/locales/persian_fa';
import { getProgressColor, toPersianNum } from '../../utils/helpers';
import ServerAsyncSelect from '../../components/form/ServerAsyncSelect';
import teamMemberService from '../../services/teamMemberService';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'در انتظار' },
  { value: 'in-progress', label: 'در حال انجام' },
  { value: 'completed', label: 'تکمیل‌شده' },
  { value: 'failed', label: 'شکست‌خورده' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'پایین' },
  { value: 'medium', label: 'متوسط' },
  { value: 'high', label: 'بالا' },
  { value: 'critical', label: 'بحرانی' },
];

function toLocalDateTimeValue(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

export default function TaskEditForm({ task, mode = 'edit', submitting = false, error = '', onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({ ...task }));
  const isCreating = mode === 'create';

  useEffect(() => {
    setForm({ ...task });
  }, [task]);

  const pickerValue = useMemo(() => {
    if (!form.deadlineInput) return null;
    const date = new Date(form.deadlineInput);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [form.deadlineInput]);

  const progress = Math.max(0, Math.min(100, Number(form.progress) || 0));
  const update = (change) => setForm((current) => ({ ...current, ...change }));

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await onSubmit?.({ ...form, progress });
    } catch {
      // The page keeps the form open and supplies the API error through `error`.
    }
  }

  return (
    <aside className={`task-edit-panel task-detail-panel panel animate-in${isCreating ? ' task-create-panel' : ''}`} aria-label={isCreating ? 'فرم ایجاد تسک' : 'فرم ویرایش تسک'}>
      <div className="task-detail-accent" />
      <form onSubmit={handleSubmit}>
        <div className="task-detail-header">
          <div className="task-detail-heading">
            <span className="task-detail-kicker"><i className={isCreating ? 'fas fa-sparkles' : 'fas fa-wand-magic-sparkles'} /> {isCreating ? 'تسک تازه' : 'ویرایش تسک'}</span>
            <h2>{isCreating ? 'ساخت یک تسک جدید' : 'به‌روزرسانی اطلاعات'}</h2>
            <span className="task-detail-id fa-num">{isCreating ? 'NEW TASK' : `TASK #${toPersianNum(task.id)}`}</span>
          </div>
          <button type="button" className="task-detail-close" onClick={onCancel} disabled={submitting} aria-label="انصراف"><i className="fas fa-times" /></button>
        </div>

        <div className="task-edit-body">
          {isCreating && <div className="task-create-intro full"><span className="task-create-intro-icon"><i className="fas fa-rocket" /></span><div><strong>کار را شفاف و قابل پیگیری تعریف کنید</strong><p>عنوان، مسئول، اولویت و زمان‌بندی را مشخص کنید؛ همه موارد بعداً قابل ویرایش هستند.</p></div></div>}

          <label className="task-edit-field full">
            <span><i className="fas fa-heading" /> عنوان تسک</span>
            <input required autoFocus value={form.name} onChange={(event) => update({ name: event.target.value })} placeholder="عنوان تسک را وارد کنید" />
          </label>

          <label className="task-edit-field full">
            <span><i className="fas fa-align-right" /> توضیحات</span>
            <textarea rows="4" value={form.desc} onChange={(event) => update({ desc: event.target.value })} placeholder="جزئیات و خروجی مورد انتظار تسک" />
          </label>

          <label className="task-edit-field">
            <span><i className="fas fa-circle-check" /> وضعیت</span>
            <select value={form.status} onChange={(event) => update({ status: event.target.value })}>
              {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label className="task-edit-field">
            <span><i className="fas fa-flag" /> اولویت</span>
            <select value={form.priority} onChange={(event) => update({ priority: event.target.value })}>
              {PRIORITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label className="task-edit-field">
            <span><i className="fas fa-user-check" /> شناسه مسئول</span>
            <ServerAsyncSelect
              value={form.assignedMemberId === '' || form.assignedMemberId === null ? null : {
                value: String(form.assignedMemberId),
                label: form.assignee || `عضو #${form.assignedMemberId}`,
              }}
              onChange={(option) => update({
                assignedMemberId: option?.value || '',
                assignee: option?.label || '',
              })}
              loadOptions={teamMemberService.searchOptions}
              placeholder="نام عضو را جستجو کنید"
              noOptionsMessage="عضوی پیدا نشد"
              aria-label="انتخاب مسئول تسک"
            />
          </label>

          <label className="task-edit-field task-jalali-field">
            <span><i className="fas fa-calendar-day" /> مهلت انجام (شمسی)</span>
            <DatePicker
              value={pickerValue}
              onChange={(value) => update({ deadlineInput: value ? toLocalDateTimeValue(value.toDate()) : '' })}
              calendar={persian}
              locale={persianFa}
              format="YYYY/MM/DD HH:mm"
              calendarPosition="bottom-right"
              className="task-jalali-calendar"
              arrowClassName="task-jalali-arrow"
              plugins={[<TimePicker key="task-time" position="bottom" hideSeconds />]}
              inputClass="task-jalali-input"
              containerClassName="task-jalali-container"
              placeholder="انتخاب تاریخ و ساعت"
              editable={false}
              portal
              fixMainPosition
              offsetY={6}
              zIndex={10000}
            />
          </label>

          <div className="task-edit-field task-progress-control full">
            <div className="task-progress-control-title"><span><i className="fas fa-chart-line" /> میزان پیشرفت</span><strong>{toPersianNum(progress)}٪</strong></div>
            <input type="range" min="0" max="100" step="5" value={progress} onChange={(event) => update({ progress: Number(event.target.value) })} style={{ '--range-progress': `${progress}%`, '--range-color': getProgressColor(progress) }} />
          </div>

          {error && <div className="task-edit-error full" role="alert"><i className="fas fa-circle-exclamation" /><span>{error}</span></div>}
        </div>

        <div className="task-edit-actions">
          <button type="submit" className="task-edit-save" disabled={submitting}><i className={submitting ? 'fas fa-spinner fa-spin' : isCreating ? 'fas fa-plus' : 'fas fa-check'} />{submitting ? 'در حال ذخیره...' : isCreating ? 'ایجاد تسک' : 'ذخیره تغییرات'}</button>
          <button type="button" className="task-edit-cancel" onClick={onCancel} disabled={submitting}>انصراف</button>
        </div>
      </form>
    </aside>
  );
}
