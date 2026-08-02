import React, { useEffect, useMemo, useState } from 'react';
import { toDateTimeInputValue } from './meetingUtils';

function initialForm(meeting, selectedTeam, currentUserId) {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  tomorrow.setHours(9, 0, 0, 0);
  const end = new Date(tomorrow.getTime() + 60 * 60 * 1000);
  const memberIds = (selectedTeam?.members || []).map((member) => Number(member.userId));
  const preferredOrganizer = memberIds.includes(Number(currentUserId))
    ? Number(currentUserId)
    : selectedTeam?.members?.find((member) => member.role === 'LEAD')?.userId || memberIds[0] || '';

  return {
    title: meeting?.title || '',
    description: meeting?.description || '',
    teamId: meeting?.teamId || selectedTeam?.id || '',
    organizerId: meeting?.organizerId || preferredOrganizer,
    startTime: toDateTimeInputValue(meeting?.startTime || tomorrow),
    endTime: toDateTimeInputValue(meeting?.endTime || end),
    location: meeting?.location || '',
    status: meeting?.status || 'SCHEDULED',
    participantUserIds: meeting?.participants?.map((participant) => Number(participant.userId)) || [],
  };
}

export default function MeetingFormModal({ open, meeting, teams, currentUserId, canChooseOrganizer = false, onClose, onSubmit, isSaving }) {
  const [form, setForm] = useState(() => initialForm(meeting, teams[0], currentUserId));
  const [error, setError] = useState('');
  const isEditing = Boolean(meeting?.id);
  const selectedTeam = useMemo(
    () => teams.find((team) => String(team.id) === String(form.teamId)) || teams[0],
    [form.teamId, teams],
  );

  useEffect(() => {
    if (open) setForm(initialForm(meeting, teams.find((team) => team.id === meeting?.teamId) || teams[0], currentUserId));
    setError('');
  }, [open, meeting, teams, currentUserId]);

  if (!open) return null;

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => {
      if (name !== 'teamId') return { ...current, [name]: value };
      const team = teams.find((item) => String(item.id) === value);
      const members = team?.members || [];
      const organizerId = members.some((member) => String(member.userId) === String(currentUserId))
        ? currentUserId
        : members.find((member) => member.role === 'LEAD')?.userId || members[0]?.userId || '';
      return { ...current, teamId: value, organizerId, participantUserIds: [] };
    });
  }

  function toggleParticipant(userId) {
    setForm((current) => ({
      ...current,
      participantUserIds: current.participantUserIds.includes(Number(userId))
        ? current.participantUserIds.filter((id) => id !== Number(userId))
        : [...current.participantUserIds, Number(userId)],
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      setError('زمان پایان باید بعد از زمان شروع باشد.');
      return;
    }
    try {
      await onSubmit(isEditing ? {
        title: form.title.trim(),
        description: form.description,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location,
        status: form.status,
      } : {
        title: form.title.trim(),
        description: form.description,
        teamId: Number(form.teamId),
        organizerId: Number(form.organizerId),
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location,
        participantUserIds: form.participantUserIds,
      });
    } catch (submitError) {
      setError(submitError?.message || 'ذخیره جلسه انجام نشد.');
    }
  }

  return (
    <div className="meeting-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="meeting-modal" role="dialog" aria-modal="true" aria-labelledby="meeting-form-title">
        <header className="meeting-modal-header">
          <div>
            <span>{isEditing ? 'ویرایش برنامه جلسه' : 'زمان‌بندی جلسه جدید'}</span>
            <h2 id="meeting-form-title">{isEditing ? meeting.title : 'جلسه تیمی جدید'}</h2>
          </div>
          <button type="button" className="meeting-icon-btn" onClick={onClose} aria-label="بستن"><i className="fas fa-xmark" /></button>
        </header>

        <form className="meeting-form" onSubmit={submit}>
          <label className="meeting-field meeting-field-wide">
            <span>عنوان جلسه</span>
            <input name="title" value={form.title} onChange={updateField} required maxLength={255} placeholder="برای مثال: برنامه‌ریزی اسپرینت" />
          </label>
          <label className="meeting-field meeting-field-wide">
            <span>توضیحات</span>
            <textarea name="description" value={form.description} onChange={updateField} rows="3" placeholder="هدف و خروجی مورد انتظار جلسه" />
          </label>

          {!isEditing && (
            <>
              <label className="meeting-field">
                <span>تیم</span>
                <select name="teamId" value={form.teamId} onChange={updateField} required>
                  {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
              </label>
              <label className="meeting-field">
                <span>برگزارکننده</span>
                <select name="organizerId" value={form.organizerId} onChange={updateField} required disabled={!canChooseOrganizer}>
                  {(selectedTeam?.members || []).map((member) => (
                    <option key={member.userId} value={member.userId}>{member.fullName || member.username}</option>
                  ))}
                </select>
              </label>
            </>
          )}

          <label className="meeting-field">
            <span>شروع</span>
            <input type="datetime-local" name="startTime" value={form.startTime} onChange={updateField} required />
          </label>
          <label className="meeting-field">
            <span>پایان</span>
            <input type="datetime-local" name="endTime" value={form.endTime} onChange={updateField} required />
          </label>
          <label className="meeting-field meeting-field-wide">
            <span>محل یا لینک جلسه</span>
            <input name="location" value={form.location} onChange={updateField} maxLength={1000} placeholder="اتاق جلسات یا لینک ویدئو" />
          </label>

          {isEditing && (
            <label className="meeting-field meeting-field-wide">
              <span>وضعیت جلسه</span>
              <select name="status" value={form.status} onChange={updateField}>
                <option value="SCHEDULED">برنامه‌ریزی‌شده</option>
                <option value="IN_PROGRESS">در حال برگزاری</option>
                <option value="COMPLETED">تکمیل‌شده</option>
                <option value="CANCELLED">لغوشده</option>
              </select>
            </label>
          )}

          {!isEditing && (
            <fieldset className="meeting-participant-picker meeting-field-wide">
              <legend>دعوت از اعضا</legend>
              <div>
                {(selectedTeam?.members || []).filter((member) => String(member.userId) !== String(form.organizerId)).map((member) => (
                  <label key={member.userId} className={form.participantUserIds.includes(Number(member.userId)) ? 'selected' : ''}>
                    <input
                      type="checkbox"
                      checked={form.participantUserIds.includes(Number(member.userId))}
                      onChange={() => toggleParticipant(member.userId)}
                    />
                    <span>{member.fullName || member.username}</span>
                    <small>{member.role === 'LEAD' ? 'سرپرست' : 'عضو'}</small>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {error && <div className="meeting-form-error meeting-field-wide"><i className="fas fa-circle-exclamation" /> {error}</div>}
          <footer className="meeting-modal-actions meeting-field-wide">
            <button type="button" className="filter-btn" onClick={onClose} disabled={isSaving}>انصراف</button>
            <button type="submit" className="primary-action-btn" disabled={isSaving || !teams.length}>
              {isSaving ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-check" />}
              {isEditing ? 'ذخیره تغییرات' : 'ایجاد جلسه'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
