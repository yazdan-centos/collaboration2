import React, { useEffect, useMemo, useRef, useState } from 'react';
import { tasks } from '../../data/dashboardData';
import teamMemberService from '../../services/teamMemberService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

function resolveAvatarUrl(avatarUrl) {
  if (!avatarUrl) return null;
  if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;
  return `${API_BASE_URL}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
}

const statusMeta = {
  online: { label: 'آنلاین', className: 'online' },
  AVAILABLE: { label: 'آماده', className: 'online' },
  away: { label: 'دور از سیستم', className: 'away' },
  OFF_DUTY: { label: 'خارج از شیفت', className: 'away' },
  busy: { label: 'مشغول', className: 'busy' },
  BUSY: { label: 'مشغول', className: 'busy' },
  offline: { label: 'آفلاین', className: 'offline' },
  UNAVAILABLE: { label: 'در دسترس نیست', className: 'offline' },
};

function normalizeMember(member, index) {
  const name = member.username || member.name || `عضو ${index + 1}`;
  return {
    ...member,
    name,
    initials: member.initials || name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('.'),
    role: member.jobTitle || member.role || 'عضو تیم پشتیبانی',
    team: member.team || (member.managerId ? `مدیر ${member.managerId}` : 'بدون مدیر'),
    status: member.availabilityStatus || member.status || 'UNAVAILABLE',
    capacity: member.capacity ?? 0,
    avatarColor: member.avatarColor || 'linear-gradient(135deg, #10b981, #059669)',
  };
}

function getMemberTasks(member) {
  return tasks.filter((task) => task.assignee === member.name || task.assignedMemberId === member.id);
}

function MemberAvatar({ member, large = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedAvatarUrl = resolveAvatarUrl(member.avatarUrl);
  const avatarUrl = resolvedAvatarUrl && member.updatedAt
    ? `${resolvedAvatarUrl}${resolvedAvatarUrl.includes('?') ? '&' : '?'}v=${encodeURIComponent(member.updatedAt)}`
    : resolvedAvatarUrl;

  useEffect(() => setImageFailed(false), [avatarUrl]);

  return (
    <div className={`team-avatar${large ? ' large' : ''}`} style={{ background: member.avatarColor }}>
      {avatarUrl && !imageFailed ? (
        <img src={avatarUrl} alt={`تصویر ${member.name}`} onError={() => setImageFailed(true)} />
      ) : member.initials}
      <span className={`presence-dot ${statusMeta[member.status]?.className || 'offline'}`} aria-hidden="true" />
    </div>
  );
}

function MemberCard({ member, isSelected, onSelect }) {
  const memberTasks = getMemberTasks(member);
  const activeCount = memberTasks.filter((task) => task.status !== 'completed').length;
  const completedCount = memberTasks.filter((task) => task.status === 'completed').length;
  const status = statusMeta[member.status] || statusMeta.offline;

  return (
    <button
      type="button"
      className={`team-member-card animate-in${isSelected ? ' selected' : ''}`}
      onClick={() => onSelect(member)}
      aria-pressed={isSelected}
    >
      <div className="team-member-head">
        <MemberAvatar member={member} />
        <div className="team-member-identity">
          <strong>{member.name}</strong>
          <span>{member.role}</span>
        </div>
        <i className="fas fa-chevron-left team-card-arrow" aria-hidden="true" />
      </div>

      <div className="team-member-meta">
        <span><i className="fas fa-users" /> {member.team}</span>
        <span className={`presence-label ${status.className}`}>{status.label}</span>
      </div>

      <div className="team-workload-row">
        <span>ظرفیت کاری</span>
        <b className="fa-num">{member.capacity}٪</b>
      </div>
      <div className="team-workload-track" aria-label={`ظرفیت کاری ${member.capacity} درصد`}>
        <span
          className={member.capacity >= 85 ? 'danger' : member.capacity >= 65 ? 'warning' : ''}
          style={{ width: `${member.capacity}%` }}
        />
      </div>

      <div className="team-task-summary">
        <span><b className="fa-num">{activeCount}</b> تسک فعال</span>
        <span><b className="fa-num">{completedCount}</b> تکمیل‌شده</span>
      </div>
    </button>
  );
}

function MemberDetails({ member, onClose, onAvatarChanged }) {
  const memberTasks = getMemberTasks(member);
  const status = statusMeta[member.status] || statusMeta.offline;
  const fileInputRef = useRef(null);
  const [avatarAction, setAvatarAction] = useState(null);
  const [avatarError, setAvatarError] = useState('');

  async function handleAvatarSelected(event) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('فقط فایل تصویری قابل بارگذاری است.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('حجم تصویر باید کمتر از ۵ مگابایت باشد.');
      return;
    }

    setAvatarAction('upload');
    setAvatarError('');
    try {
      const updatedMember = await teamMemberService.uploadAvatar(member.id, file);
      onAvatarChanged(normalizeMember(updatedMember, 0));
    } catch (error) {
      setAvatarError(getAvatarErrorMessage(error, 'بارگذاری تصویر انجام نشد.'));
    } finally {
      setAvatarAction(null);
    }
  }

  async function handleAvatarDelete() {
    if (!window.confirm('تصویر پروفایل این عضو حذف شود؟')) return;
    setAvatarAction('delete');
    setAvatarError('');
    try {
      await teamMemberService.deleteAvatar(member.id);
      onAvatarChanged({ ...member, avatarUrl: null });
    } catch (error) {
      setAvatarError(getAvatarErrorMessage(error, 'حذف تصویر انجام نشد.'));
    } finally {
      setAvatarAction(null);
    }
  }

  return (
    <aside className="panel team-detail-panel animate-in" aria-label={`جزئیات ${member.name}`}>
      <div className="team-detail-cover">
        <button type="button" className="action-btn team-detail-close" onClick={onClose} aria-label="بستن جزئیات">
          <i className="fas fa-times" />
        </button>
        <MemberAvatar member={member} large />
      </div>

      <div className="team-detail-body">
        <h2>{member.name}</h2>
        <p>{member.role}</p>
        <span className={`team-detail-status ${status.className}`}>
          <span className="dot" /> {status.label}
        </span>

        <div className="team-avatar-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarSelected}
            disabled={Boolean(avatarAction)}
          />
          <button
            type="button"
            className="filter-btn active"
            onClick={() => fileInputRef.current?.click()}
            disabled={Boolean(avatarAction)}
          >
            <i className={avatarAction === 'upload' ? 'fas fa-spinner fa-spin' : 'fas fa-camera'} />
            {avatarAction === 'upload' ? 'در حال بارگذاری...' : member.avatarUrl ? 'تغییر تصویر' : 'بارگذاری تصویر'}
          </button>
          {member.avatarUrl && (
            <button
              type="button"
              className="filter-btn team-avatar-delete"
              onClick={handleAvatarDelete}
              disabled={Boolean(avatarAction)}
            >
              <i className={avatarAction === 'delete' ? 'fas fa-spinner fa-spin' : 'fas fa-trash'} />
              {avatarAction === 'delete' ? 'در حال حذف...' : 'حذف تصویر'}
            </button>
          )}
        </div>
        {avatarError && <div className="team-avatar-error" role="alert">{avatarError}</div>}

        <div className="team-contact-actions">
          <a href={`mailto:${member.email}`} className="filter-btn">
            <i className="fas fa-envelope" /> ارسال ایمیل
          </a>
          <button type="button" className="filter-btn" onClick={() => window.alert('زمان جلسه برای این عضو ثبت شد.') }>
            <i className="fas fa-calendar-plus" /> تنظیم جلسه
          </button>
        </div>

        <div className="team-detail-list">
          <div><span>تیم</span><strong>{member.team}</strong></div>
          <div><span>ایمیل</span><strong dir="ltr">{member.email}</strong></div>
          <div><span>ظرفیت فعلی</span><strong className="fa-num">{member.capacity}٪</strong></div>
        </div>

        <div className="team-assigned-title">
          <strong>تسک‌های واگذار شده</strong>
          <span className="fa-num">{memberTasks.length}</span>
        </div>
        <div className="team-assigned-list">
          {memberTasks.length ? memberTasks.map((task) => (
            <div className="team-assigned-task" key={task.id}>
              <div>
                <strong>{task.name}</strong>
                <span dir="ltr">{task.id}</span>
              </div>
              <span className={`status-badge ${task.status}`}><span className="dot" /></span>
            </div>
          )) : (
            <div className="team-empty compact">تسکی به این عضو واگذار نشده است.</div>
          )}
        </div>
      </div>
    </aside>
  );
}

function getAvatarErrorMessage(error, fallback) {
  if (error.status === 401) return 'نشست کاربری منقضی شده است؛ دوباره وارد شوید.';
  if (error.status === 403) return 'اجازه تغییر تصویر این عضو را ندارید.';
  if (error.status === 404) return 'عضو تیم پیدا نشد.';
  if (error.status === 413) return 'حجم تصویر بیش از حد مجاز است.';
  if (error.status === 400) return 'فایل انتخاب‌شده معتبر نیست.';
  return error.message || fallback;
}

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  async function loadMembers() {
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await teamMemberService.getAllMembers();
      const normalizedMembers = response.map(normalizeMember);
      setMembers(normalizedMembers);
      setSelectedMember((current) => normalizedMembers.find((member) => member.id === current?.id) || normalizedMembers[0] || null);
    } catch (error) {
      setLoadError(error.status === 401
        ? 'برای مشاهده اعضای تیم باید وارد حساب کاربری شوید.'
        : error.status === 403
          ? 'حساب شما اجازه مشاهده فهرست اعضای تیم را ندارد.'
          : 'دریافت اطلاعات اعضای تیم با خطا مواجه شد.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  function handleAvatarChanged(updatedMember) {
    setMembers((current) => current.map((member) => member.id === updatedMember.id ? { ...member, ...updatedMember } : member));
    setSelectedMember((current) => current?.id === updatedMember.id ? { ...current, ...updatedMember } : current);
  }

  const teams = [...new Set(members.map((member) => member.team))];
  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return members.filter((member) => {
      const matchesTeam = teamFilter === 'all' || member.team === teamFilter;
      const matchesQuery = !normalizedQuery || [member.name, member.role, member.team]
        .some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesTeam && matchesQuery;
    });
  }, [query, teamFilter]);

  const onlineCount = members.filter((member) => ['online', 'AVAILABLE'].includes(member.status)).length;
  const busyCount = members.filter((member) => ['busy', 'BUSY'].includes(member.status)).length;
  const activeTasks = tasks.filter((task) => task.status !== 'completed').length;

  return (
    <section className="team-page">
      <div className="team-stats-grid">
        <div className="stat-card green animate-in delay-1">
          <div className="stat-header"><div className="stat-icon green"><i className="fas fa-user-group" /></div></div>
          <div className="stat-value fa-num">{members.length}</div>
          <div className="stat-label">کل اعضای تیم</div>
        </div>
        <div className="stat-card cyan animate-in delay-2">
          <div className="stat-header"><div className="stat-icon cyan"><i className="fas fa-signal" /></div></div>
          <div className="stat-value fa-num">{onlineCount}</div>
          <div className="stat-label">اعضای آنلاین</div>
        </div>
        <div className="stat-card amber animate-in delay-3">
          <div className="stat-header"><div className="stat-icon amber"><i className="fas fa-gauge-high" /></div></div>
          <div className="stat-value fa-num">{busyCount}</div>
          <div className="stat-label">اعضای مشغول</div>
        </div>
        <div className="stat-card red animate-in delay-4">
          <div className="stat-header"><div className="stat-icon red"><i className="fas fa-list-check" /></div></div>
          <div className="stat-value fa-num">{activeTasks}</div>
          <div className="stat-label">تسک در جریان</div>
        </div>
      </div>

      <div className={`team-content${selectedMember ? ' has-details' : ''}`}>
        <div className="panel team-directory animate-in delay-5">
          <div className="panel-header team-directory-header">
            <div>
              <div className="panel-title">اعضای تیم</div>
              <div className="team-results-count fa-num">{filteredMembers.length} عضو نمایش داده می‌شود</div>
            </div>
            <div className="panel-actions team-toolbar">
              <label className="team-search">
                <i className="fas fa-search" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="جستجوی نام، نقش یا تیم..."
                  aria-label="جستجوی اعضای تیم"
                />
              </label>
              <select value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)} aria-label="فیلتر تیم">
                <option value="all">همه تیم‌ها</option>
                {teams.map((team) => <option value={team} key={team}>تیم {team}</option>)}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="team-empty">
              <div className="stat-icon cyan"><i className="fas fa-spinner fa-spin" /></div>
              <strong>در حال دریافت اعضای تیم...</strong>
            </div>
          ) : loadError ? (
            <div className="team-empty" role="alert">
              <div className="stat-icon red"><i className="fas fa-triangle-exclamation" /></div>
              <strong>امکان نمایش اعضای تیم نیست</strong>
              <span>{loadError}</span>
              <button type="button" className="filter-btn" onClick={loadMembers}>تلاش دوباره</button>
            </div>
          ) : filteredMembers.length ? (
            <div className="team-members-grid">
              {filteredMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isSelected={selectedMember?.id === member.id}
                  onSelect={setSelectedMember}
                />
              ))}
            </div>
          ) : (
            <div className="team-empty">
              <div className="stat-icon cyan"><i className="fas fa-user-slash" /></div>
              <strong>عضوی پیدا نشد</strong>
              <span>عبارت جستجو یا فیلتر تیم را تغییر دهید.</span>
              <button type="button" className="filter-btn" onClick={() => { setQuery(''); setTeamFilter('all'); }}>
                پاک کردن فیلترها
              </button>
            </div>
          )}
        </div>

        {selectedMember && (
          <MemberDetails
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
            onAvatarChanged={handleAvatarChanged}
          />
        )}
      </div>
    </section>
  );
}
