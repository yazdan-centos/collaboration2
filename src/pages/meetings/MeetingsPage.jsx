import React, { useCallback, useEffect, useMemo, useState } from 'react';
import MeetingDetails from '../../components/meetings/MeetingDetails';
import MeetingFormModal from '../../components/meetings/MeetingFormModal';
import MeetingList from '../../components/meetings/MeetingList';
import MeetingStats from '../../components/meetings/MeetingStats';
import meetingService from '../../services/meetingService';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/apiError';
import { hasPermission, hasRole, USER_ROLES } from '../../utils/authorization';

const statusFilters = [
  { value: 'ALL', label: 'همه وضعیت‌ها' },
  { value: 'SCHEDULED', label: 'برنامه‌ریزی‌شده' },
  { value: 'IN_PROGRESS', label: 'در حال برگزاری' },
  { value: 'COMPLETED', label: 'تکمیل‌شده' },
  { value: 'CANCELLED', label: 'لغوشده' },
];

export default function MeetingsPage({ searchQuery = '' }) {
  const { auth, userId } = useAuth();
  const canCreate = hasPermission(auth, 'MEETING_CREATE');
  const canUpdate = hasPermission(auth, 'MEETING_UPDATE');
  const canDelete = hasPermission(auth, 'MEETING_DELETE');
  const canChooseOrganizer = hasRole(auth, USER_ROLES.TEAM_MANAGER);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [meetings, setMeetings] = useState([]);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [formState, setFormState] = useState({ open: false, meeting: null });

  const loadTeams = useCallback(async () => {
    setIsLoadingTeams(true);
    setError('');
    try {
      const page = await meetingService.getTeams({ page: 0, size: 100, sort: 'name,asc' });
      const detailedTeams = await Promise.all(page.content.map(async (team) => {
        if (Array.isArray(team.members) && team.members.length) return team;
        try { return await meetingService.getTeam(team.id); } catch { return team; }
      }));
      setTeams(detailedTeams);
      setSelectedTeamId((current) => current || String(detailedTeams[0]?.id || ''));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'دریافت تیم‌ها انجام نشد.'));
    } finally {
      setIsLoadingTeams(false);
    }
  }, []);

  const loadMeetings = useCallback(async () => {
    if (!selectedTeamId) {
      setMeetings([]);
      return;
    }
    setIsLoadingMeetings(true);
    setError('');
    try {
      const page = await meetingService.getTeamMeetings(selectedTeamId, { page: 0, size: 100, sort: 'startTime,asc' });
      setMeetings(page.content);
      setSelectedMeeting((current) => current && page.content.some((meeting) => meeting.id === current.id) ? current : null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'دریافت جلسات انجام نشد.'));
    } finally {
      setIsLoadingMeetings(false);
    }
  }, [selectedTeamId]);

  useEffect(() => { loadTeams(); }, [loadTeams]);
  useEffect(() => { loadMeetings(); }, [loadMeetings]);

  const openMeeting = useCallback(async (meeting) => {
    setSelectedMeeting(meeting);
    setIsLoadingDetails(true);
    setActionError('');
    try {
      const [details, meetingNotes, meetingTasks] = await Promise.all([
        meetingService.getById(meeting.id),
        meetingService.getNotes(meeting.id),
        meetingService.getTasks(meeting.id).catch(() => []),
      ]);
      setSelectedMeeting(details);
      setNotes(meetingNotes);
      setTasks(meetingTasks);
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, 'دریافت جزئیات جلسه انجام نشد.'));
    } finally {
      setIsLoadingDetails(false);
    }
  }, []);

  const refreshSelected = useCallback(async () => {
    if (!selectedMeeting?.id) return;
    await openMeeting(selectedMeeting);
    await loadMeetings();
  }, [loadMeetings, openMeeting, selectedMeeting]);

  const filteredMeetings = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('fa');
    return meetings.filter((meeting) => {
      const statusMatches = statusFilter === 'ALL' || meeting.status === statusFilter;
      const textMatches = !query || [meeting.title, meeting.description, meeting.location, meeting.organizerName]
        .some((value) => String(value || '').toLocaleLowerCase('fa').includes(query));
      return statusMatches && textMatches;
    });
  }, [meetings, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const now = Date.now();
    return {
      total: meetings.length,
      upcoming: meetings.filter((meeting) => meeting.status === 'SCHEDULED' && new Date(meeting.startTime).getTime() > now).length,
      inProgress: meetings.filter((meeting) => meeting.status === 'IN_PROGRESS').length,
      completed: meetings.filter((meeting) => meeting.status === 'COMPLETED').length,
    };
  }, [meetings]);

  async function runMutation(action, fallbackMessage, refresh = true) {
    setIsMutating(true);
    setActionError('');
    try {
      const result = await action();
      if (refresh) await refreshSelected();
      return result;
    } catch (requestError) {
      const message = getApiErrorMessage(requestError, fallbackMessage, { 409: 'زمان جلسه با یک جلسه دیگر تداخل دارد یا وضعیت جلسه قابل تغییر نیست.' });
      setActionError(message);
      const localizedError = new Error(message);
      localizedError.cause = requestError;
      throw localizedError;
    } finally {
      setIsMutating(false);
    }
  }

  async function saveMeeting(payload) {
    if (formState.meeting) {
      const updated = await runMutation(() => meetingService.update(formState.meeting.id, payload), 'ویرایش جلسه انجام نشد.', false);
      setFormState({ open: false, meeting: null });
      await loadMeetings();
      await openMeeting(updated);
      return;
    }
    const created = await runMutation(() => meetingService.create(payload), 'ایجاد جلسه انجام نشد.', false);
    setSelectedTeamId(String(created.teamId));
    setFormState({ open: false, meeting: null });
    await loadMeetings();
    await openMeeting(created);
  }

  async function cancelMeeting() {
    if (!window.confirm('این جلسه لغو شود؟')) return;
    await runMutation(() => meetingService.cancel(selectedMeeting.id), 'لغو جلسه انجام نشد.');
  }

  async function deleteMeeting() {
    if (!window.confirm('این جلسه حذف شود؟ سوابق آن در گزارش‌ها به‌صورت غیرفعال باقی می‌ماند.')) return;
    await runMutation(() => meetingService.delete(selectedMeeting.id), 'حذف جلسه انجام نشد.', false);
    setSelectedMeeting(null);
    setNotes([]);
    setTasks([]);
    await loadMeetings();
  }

  const selectedTeam = teams.find((team) => String(team.id) === String(selectedTeamId));

  return (
    <div className="meetings-page">
      <MeetingStats stats={stats} />

      <section className="meeting-workspace">
        <div className="meeting-directory">
          <header className="meeting-directory-header">
            <div><span>برنامه جلسات</span><h1>{selectedTeam?.name || 'جلسات تیمی'}</h1></div>
            {canCreate && <button type="button" className="primary-action-btn" onClick={() => setFormState({ open: true, meeting: null })} disabled={!teams.length || isLoadingTeams}>
              <i className="fas fa-plus" /> جلسه جدید
            </button>}
          </header>

          <div className="meeting-toolbar">
            <label><i className="fas fa-people-group" /><select value={selectedTeamId} onChange={(event) => setSelectedTeamId(event.target.value)} disabled={isLoadingTeams}>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></label>
            <label><i className="fas fa-filter" /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{statusFilters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}</select></label>
            <button type="button" className="meeting-refresh-btn" onClick={loadMeetings} disabled={isLoadingMeetings}><i className={isLoadingMeetings ? 'fas fa-spinner fa-spin' : 'fas fa-rotate'} /> تازه‌سازی</button>
          </div>

          {actionError && <div className="meeting-alert"><i className="fas fa-circle-exclamation" /><span>{actionError}</span><button type="button" onClick={() => setActionError('')}><i className="fas fa-xmark" /></button></div>}
          <MeetingList meetings={filteredMeetings} selectedId={selectedMeeting?.id} onSelect={openMeeting} isLoading={isLoadingMeetings || isLoadingTeams} error={error} onRetry={selectedTeamId ? loadMeetings : loadTeams} />
        </div>

        {selectedMeeting && (
          <MeetingDetails
            meeting={selectedMeeting}
            notes={notes}
            tasks={tasks}
            currentUserId={userId}
            canUpdate={canUpdate}
            canDelete={canDelete}
            isLoading={isLoadingDetails}
            isMutating={isMutating}
            onClose={() => setSelectedMeeting(null)}
            onEdit={() => setFormState({ open: true, meeting: selectedMeeting })}
            onCancel={cancelMeeting}
            onDelete={deleteMeeting}
            onRsvp={(response) => runMutation(() => meetingService.respondToInvite(selectedMeeting.id, userId, response), 'ثبت پاسخ دعوت انجام نشد.')}
            onAttendance={(participantId, attended) => runMutation(() => meetingService.markAttendance(selectedMeeting.id, participantId, attended), 'ثبت حضور انجام نشد.')}
            onAddAgenda={(payload) => runMutation(() => meetingService.addAgendaItem(selectedMeeting.id, payload), 'افزودن موضوع انجام نشد.')}
            onAddNote={(payload) => runMutation(() => meetingService.addNote(selectedMeeting.id, payload), 'ثبت یادداشت انجام نشد.')}
          />
        )}
      </section>

      {(canCreate || canUpdate) && <MeetingFormModal
        open={formState.open}
        meeting={formState.meeting}
        teams={teams}
        currentUserId={userId}
        canChooseOrganizer={canChooseOrganizer}
        onClose={() => !isMutating && setFormState({ open: false, meeting: null })}
        onSubmit={saveMeeting}
        isSaving={isMutating}
      />}
    </div>
  );
}
