import React, { useMemo, useState } from 'react';
import {
  formatDateTime,
  getDurationMinutes,
  getInitials,
  meetingStatusMeta,
  noteTypeMeta,
  rsvpMeta,
} from './meetingUtils';

const tabs = [
  { key: 'overview', label: 'نمای کلی', icon: 'fas fa-circle-info' },
  { key: 'agenda', label: 'دستور جلسه', icon: 'fas fa-list-ol' },
  { key: 'participants', label: 'شرکت‌کنندگان', icon: 'fas fa-users' },
  { key: 'notes', label: 'یادداشت‌ها', icon: 'fas fa-note-sticky' },
  { key: 'tasks', label: 'تسک‌ها', icon: 'fas fa-list-check' },
];

function EmptySection({ icon, children }) {
  return <div className="meeting-detail-empty"><i className={icon} /><span>{children}</span></div>;
}

function OverviewTab({ meeting }) {
  const duration = getDurationMinutes(meeting.startTime, meeting.endTime);
  return (
    <div className="meeting-overview-grid">
      <article className="meeting-overview-description">
        <span>درباره جلسه</span>
        <p>{meeting.description || 'توضیحی برای این جلسه ثبت نشده است.'}</p>
      </article>
      <div className="meeting-fact-grid">
        <div><i className="fas fa-calendar-day" /><span>شروع</span><strong>{formatDateTime(meeting.startTime)}</strong></div>
        <div><i className="fas fa-hourglass-half" /><span>مدت جلسه</span><strong className="fa-num">{duration} دقیقه</strong></div>
        <div><i className="fas fa-location-dot" /><span>محل جلسه</span><strong>{meeting.location || 'ثبت نشده'}</strong></div>
        <div><i className="fas fa-user-tie" /><span>برگزارکننده</span><strong>{meeting.organizerName}</strong></div>
        <div><i className="fas fa-people-group" /><span>تیم</span><strong>{meeting.teamName}</strong></div>
        <div><i className="fas fa-users" /><span>دعوت‌شدگان</span><strong className="fa-num">{meeting.participantCount || 0} نفر</strong></div>
      </div>
    </div>
  );
}

function AgendaTab({ meeting, canEdit, onAddAgenda, isMutating }) {
  const [topic, setTopic] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [presenterId, setPresenterId] = useState('');

  async function submit(event) {
    event.preventDefault();
    if (!topic.trim()) return;
    await onAddAgenda({
      topic: topic.trim(),
      description: '',
      durationMinutes: Number(durationMinutes),
      presenterId: presenterId ? Number(presenterId) : null,
    });
    setTopic('');
    setDurationMinutes(15);
    setPresenterId('');
  }

  return (
    <div className="meeting-agenda-layout">
      {meeting.agendaItems?.length ? (
        <ol className="meeting-agenda-list">
          {meeting.agendaItems.map((item, index) => (
            <li key={item.id}>
              <span className="meeting-agenda-order fa-num">{index + 1}</span>
              <div>
                <strong>{item.topic}</strong>
                {item.description && <p>{item.description}</p>}
                <div><span><i className="far fa-clock" /> <b className="fa-num">{item.durationMinutes || 0}</b> دقیقه</span><span><i className="far fa-user" /> {item.presenterName || 'بدون ارائه‌دهنده'}</span></div>
              </div>
            </li>
          ))}
        </ol>
      ) : <EmptySection icon="fas fa-list-ol">دستور جلسه هنوز ثبت نشده است.</EmptySection>}

      {canEdit && (
        <form className="meeting-inline-form" onSubmit={submit}>
          <div className="meeting-inline-form-title"><i className="fas fa-plus" /><span>افزودن موضوع جدید</span></div>
          <input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="عنوان موضوع" required maxLength={255} />
          <div className="meeting-inline-fields">
            <label><span>مدت</span><input type="number" min="1" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} /></label>
            <label><span>ارائه‌دهنده</span><select value={presenterId} onChange={(event) => setPresenterId(event.target.value)}><option value="">بدون ارائه‌دهنده</option>{meeting.participants?.map((participant) => <option key={participant.userId} value={participant.userId}>{participant.fullName}</option>)}</select></label>
          </div>
          <button className="primary-action-btn" type="submit" disabled={isMutating}><i className={isMutating ? 'fas fa-spinner fa-spin' : 'fas fa-plus'} /> افزودن</button>
        </form>
      )}
    </div>
  );
}

function ParticipantsTab({ meeting, canUpdate, currentUserId, onRsvp, onAttendance, isMutating }) {
  const currentParticipant = meeting.participants?.find((participant) => String(participant.userId) === String(currentUserId));
  return (
    <div>
      {canUpdate && currentParticipant && meeting.status !== 'CANCELLED' && (
        <div className="meeting-rsvp-panel">
          <div><i className="fas fa-envelope-open-text" /><span>پاسخ شما به دعوت</span></div>
          <div>
            {['ACCEPTED', 'TENTATIVE', 'DECLINED'].map((response) => (
              <button
                type="button"
                key={response}
                className={`meeting-rsvp-btn ${rsvpMeta[response].tone}${currentParticipant.rsvpStatus === response ? ' active' : ''}`}
                disabled={isMutating}
                onClick={() => onRsvp(response)}
              >{rsvpMeta[response].label}</button>
            ))}
          </div>
        </div>
      )}
      {meeting.participants?.length ? (
        <div className="meeting-participant-list">
          {meeting.participants.map((participant) => {
            const rsvp = rsvpMeta[participant.rsvpStatus] || rsvpMeta.PENDING;
            return (
              <article key={participant.userId}>
                <div className="meeting-avatar">{getInitials(participant.fullName || participant.username)}</div>
                <div className="meeting-participant-name"><strong>{participant.fullName || participant.username}</strong><span>@{participant.username}</span></div>
                <span className={`meeting-rsvp-status ${rsvp.tone}`}>{rsvp.label}</span>
                {canUpdate ? (
                  <label className="meeting-attendance-toggle">
                    <input type="checkbox" checked={Boolean(participant.attended)} disabled={isMutating} onChange={(event) => onAttendance(participant.userId, event.target.checked)} />
                    <span>{participant.attended ? 'حاضر' : 'غایب'}</span>
                  </label>
                ) : <span className={`meeting-attendance-label${participant.attended ? ' attended' : ''}`}>{participant.attended ? 'حاضر' : 'ثبت‌نشده'}</span>}
              </article>
            );
          })}
        </div>
      ) : <EmptySection icon="fas fa-user-slash">شرکت‌کننده‌ای برای جلسه ثبت نشده است.</EmptySection>}
    </div>
  );
}

function NotesTab({ notes, currentUserId, onAddNote, isMutating, canUpdate }) {
  const [content, setContent] = useState('');
  const [type, setType] = useState('GENERAL');

  async function submit(event) {
    event.preventDefault();
    if (!content.trim() || !currentUserId) return;
    await onAddNote({ authorId: Number(currentUserId), content: content.trim(), type });
    setContent('');
  }

  return (
    <div className="meeting-notes-layout">
      {notes.length ? (
        <div className="meeting-note-list">
          {notes.map((note) => {
            const meta = noteTypeMeta[note.type] || noteTypeMeta.GENERAL;
            return <article key={note.id}><div className={`meeting-note-icon ${String(note.type).toLowerCase()}`}><i className={meta.icon} /></div><div><div><strong>{meta.label}</strong><span>{note.authorName}</span><time>{formatDateTime(note.createdAt)}</time></div><p>{note.content}</p></div></article>;
          })}
        </div>
      ) : <EmptySection icon="fas fa-note-sticky">هنوز یادداشتی ثبت نشده است.</EmptySection>}
      {canUpdate && <form className="meeting-note-form" onSubmit={submit}>
        <textarea value={content} onChange={(event) => setContent(event.target.value)} rows="3" maxLength={20000} placeholder="یادداشت، تصمیم یا اقدام جلسه را ثبت کنید..." required />
        <div><select value={type} onChange={(event) => setType(event.target.value)}><option value="GENERAL">یادداشت عمومی</option><option value="ACTION_ITEM">اقدام</option><option value="DECISION">تصمیم</option></select><button className="primary-action-btn" type="submit" disabled={isMutating || !currentUserId}><i className={isMutating ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'} /> ثبت یادداشت</button></div>
      </form>}
    </div>
  );
}

function TasksTab({ tasks }) {
  if (!tasks.length) return <EmptySection icon="fas fa-list-check">تسکی از این جلسه ثبت نشده است.</EmptySection>;
  return (
    <div className="meeting-task-list">
      {tasks.map((task) => (
        <article key={task.id}>
          <span className={`meeting-task-priority ${String(task.priority || 'MEDIUM').toLowerCase()}`}><i className="fas fa-flag" /></span>
          <div><strong>{task.title}</strong><p>{task.description || 'بدون توضیح'}</p><span><i className="far fa-calendar" /> {formatDateTime(task.dueDate)}</span></div>
          <div className="meeting-task-progress"><strong className="fa-num">{task.progress || 0}٪</strong><span><i style={{ width: `${task.progress || 0}%` }} /></span><small>{task.status}</small></div>
        </article>
      ))}
    </div>
  );
}

export default function MeetingDetails({
  meeting, notes, tasks, currentUserId, canUpdate, canDelete, isLoading, isMutating,
  onClose, onEdit, onCancel, onDelete, onRsvp, onAttendance, onAddAgenda, onAddNote,
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const status = meetingStatusMeta[meeting?.status] || meetingStatusMeta.SCHEDULED;
  const canEditContent = !['COMPLETED', 'CANCELLED'].includes(meeting?.status);
  const availableTabs = useMemo(() => tabs.map((tab) => ({
    ...tab,
    count: tab.key === 'agenda' ? meeting?.agendaItems?.length
      : tab.key === 'participants' ? meeting?.participants?.length
        : tab.key === 'notes' ? notes.length
          : tab.key === 'tasks' ? tasks.length : null,
  })), [meeting, notes.length, tasks.length]);

  if (isLoading) return <aside className="meeting-detail-panel"><div className="meeting-empty"><i className="fas fa-spinner fa-spin" /><span>در حال دریافت جزئیات...</span></div></aside>;
  if (!meeting) return null;

  return (
    <aside className="meeting-detail-panel animate-in">
      <header className="meeting-detail-header">
        <div className="meeting-detail-title">
          <span className={`meeting-status ${status.tone}`}><i className={status.icon} /> {status.label}</span>
          <h2>{meeting.title}</h2>
          <p>{meeting.teamName}</p>
        </div>
        <div className="meeting-detail-actions">
          {canUpdate && canEditContent && <button type="button" className="meeting-icon-btn" onClick={onEdit} title="ویرایش"><i className="fas fa-pen" /></button>}
          {canUpdate && !['COMPLETED', 'CANCELLED'].includes(meeting.status) && <button type="button" className="meeting-icon-btn warning" onClick={onCancel} title="لغو"><i className="fas fa-ban" /></button>}
          {canDelete && <button type="button" className="meeting-icon-btn danger" onClick={onDelete} title="حذف"><i className="fas fa-trash" /></button>}
          <button type="button" className="meeting-icon-btn" onClick={onClose} title="بستن"><i className="fas fa-xmark" /></button>
        </div>
      </header>

      <nav className="meeting-detail-tabs">
        {availableTabs.map((tab) => <button key={tab.key} type="button" className={activeTab === tab.key ? 'active' : ''} onClick={() => setActiveTab(tab.key)}><i className={tab.icon} /><span>{tab.label}</span>{tab.count != null && <b className="fa-num">{tab.count}</b>}</button>)}
      </nav>

      <div className="meeting-detail-body">
        {activeTab === 'overview' && <OverviewTab meeting={meeting} />}
        {activeTab === 'agenda' && <AgendaTab meeting={meeting} canEdit={canUpdate && canEditContent} onAddAgenda={onAddAgenda} isMutating={isMutating} />}
        {activeTab === 'participants' && <ParticipantsTab meeting={meeting} canUpdate={canUpdate} currentUserId={currentUserId} onRsvp={onRsvp} onAttendance={onAttendance} isMutating={isMutating} />}
        {activeTab === 'notes' && <NotesTab notes={notes} currentUserId={currentUserId} onAddNote={onAddNote} isMutating={isMutating} canUpdate={canUpdate} />}
        {activeTab === 'tasks' && <TasksTab tasks={tasks} />}
      </div>
    </aside>
  );
}
