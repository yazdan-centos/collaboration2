import React, { useCallback, useEffect, useMemo, useState } from 'react';
import StatsGrid from '../../components/StatsGrid';
import TaskTable from '../../components/TaskTable';
import DonutChart from '../../components/DonutChart';
import ActivityList from '../../components/ActivityList';
import taskService from '../../services/taskService';
import { getApiErrorMessage, isCanceledRequest } from '../../utils/apiError';
import TaskDetails from './TaskDetails';
import TaskEditForm from './TaskEditForm';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../utils/authorization';

const API_TO_UI_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

const UI_TO_API_STATUS = {
  pending: 'PENDING',
  'in-progress': 'IN_PROGRESS',
  completed: 'COMPLETED',
  failed: 'FAILED',
};

const EMPTY_TASK = {
  name: '',
  desc: '',
  status: 'pending',
  priority: 'medium',
  progress: 0,
  deadlineInput: '',
  assignedMemberId: '',
  assignee: '',
};

function formatDueDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function toDateTimeInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 16);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

function normalizeTask(task) {
  const assignedMemberId = task?.assignedMemberId ?? '';
  return {
    id: task?.id,
    name: task?.title || '',
    desc: task?.description || '',
    status: API_TO_UI_STATUS[String(task?.status || '').toUpperCase()] || 'pending',
    priority: String(task?.priority || 'MEDIUM').toLowerCase(),
    progress: Number(task?.progress) || 0,
    deadline: formatDueDate(task?.dueDate),
    deadlineInput: toDateTimeInput(task?.dueDate),
    assignedMemberId,
    assignee: assignedMemberId === '' || assignedMemberId === null ? '' : `عضو #${assignedMemberId}`,
    createdAt: task?.createdAt,
    updatedAt: task?.updatedAt,
  };
}

function toTaskRequest(task) {
  return {
    title: task.name.trim(),
    description: task.desc.trim(),
    status: UI_TO_API_STATUS[task.status] || 'PENDING',
    priority: String(task.priority || 'medium').toUpperCase(),
    progress: Math.max(0, Math.min(100, Number(task.progress) || 0)),
    dueDate: task.deadlineInput ? new Date(task.deadlineInput).toISOString() : null,
    assignedMemberId: task.assignedMemberId === '' ? null : Number(task.assignedMemberId),
  };
}

// صفحه مانیتورینگ تسک‌ها (محتوای اصلی داشبورد قبلی، اکنون در مسیر /tasks)
export default function TasksPage({ searchQuery }) {
  const { auth } = useAuth();
  const canCreate = hasPermission(auth, 'TASK_CREATE');
  const canUpdate = hasPermission(auth, 'TASK_UPDATE');
  const canDelete = hasPermission(auth, 'TASK_DELETE');
  const [taskItems, setTaskItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  // منبع نمایش فعلی: فیلتر یا جستجو (دقیقا مطابق رفتار نسخه اصلی)
  const [displaySource, setDisplaySource] = useState('filter');

  // جعبه جستجو در هدر مشترک است؛ وقتی متن جستجو تغییر می‌کند این صفحه
  // بین حالت «جستجو» و «فیلتر» سوییچ می‌کند - دقیقا مطابق رفتار نسخه اصلی
  useEffect(() => {
    const query = String(searchQuery || '').trim();
    if (query) {
      setDisplaySource('search');
    } else {
      setDisplaySource('filter');
      setActiveFilter('all');
    }
  }, [searchQuery]);

  const loadTasks = useCallback(async (signal) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await taskService.getAll({ signal });
      setTaskItems(response.map(normalizeTask));
    } catch (requestError) {
      if (!isCanceledRequest(requestError)) {
        setError(getApiErrorMessage(requestError, 'دریافت فهرست تسک‌ها انجام نشد.'));
      }
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadTasks(controller.signal);
    return () => controller.abort();
  }, [loadTasks]);

  function handleFilterClick(key) {
    setActiveFilter(key);
    setDisplaySource('filter');
  }

  const displayedTasks = useMemo(() => {
    if (displaySource === 'search') {
      const query = String(searchQuery || '').trim().toLowerCase();
      return taskItems.filter((task) => [task.name, task.desc, task.assignee, task.id]
        .some((value) => String(value || '').toLowerCase().includes(query)));
    }
    return activeFilter === 'all' ? taskItems : taskItems.filter((task) => task.status === activeFilter);
  }, [activeFilter, displaySource, searchQuery, taskItems]);

  const selectedTask = useMemo(
    () => taskItems.find((task) => task.id === selectedTaskId) || null,
    [selectedTaskId, taskItems],
  );

  const editingTask = useMemo(
    () => taskItems.find((task) => task.id === editingTaskId) || null,
    [editingTaskId, taskItems],
  );

  async function createTask(task) {
    setIsMutating(true);
    setError('');
    try {
      const createdTask = await taskService.create(toTaskRequest(task));
      setTaskItems((current) => [...current, normalizeTask(createdTask)]);
      setIsCreatingTask(false);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'ایجاد تسک انجام نشد.'));
      throw requestError;
    } finally {
      setIsMutating(false);
    }
  }

  async function updateTask(task) {
    setIsMutating(true);
    setError('');
    try {
      const updatedTask = await taskService.update(task.id, toTaskRequest(task));
      const normalizedTask = normalizeTask(updatedTask);
      setTaskItems((current) => current.map((item) => item.id === task.id ? normalizedTask : item));
      setEditingTaskId(null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'ویرایش تسک انجام نشد.'));
      throw requestError;
    } finally {
      setIsMutating(false);
    }
  }

  async function deleteTask(task) {
    setIsMutating(true);
    setError('');
    try {
      await taskService.delete(task.id);
      setTaskItems((current) => current.filter((item) => item.id !== task.id));
      if (selectedTaskId === task.id) setSelectedTaskId(null);
      if (editingTaskId === task.id) setEditingTaskId(null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'حذف تسک انجام نشد.'));
      throw requestError;
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <>
      <StatsGrid />
      <section className="content-grid">
        <TaskTable
          displayedTasks={displayedTasks}
          selectedTaskId={selectedTaskId}
          onView={(task) => {
            setIsCreatingTask(false);
            setSelectedTaskId(task.id);
            setEditingTaskId(null);
          }}
          onEdit={(task) => {
            if (!canUpdate) return;
            setIsCreatingTask(false);
            setSelectedTaskId(task.id);
            setEditingTaskId(task.id);
            setError('');
          }}
          activeFilter={displaySource === 'filter' ? activeFilter : null}
          onFilterClick={handleFilterClick}
          onCreate={() => {
            if (!canCreate) return;
            setIsCreatingTask(true);
            setSelectedTaskId(null);
            setEditingTaskId(null);
            setError('');
          }}
          onDelete={deleteTask}
          canCreate={canCreate}
          canEdit={canUpdate}
          canDelete={canDelete}
          isLoading={isLoading}
          isMutating={isMutating}
          error={error}
          onRetry={() => loadTasks()}
        />
        <div className="side-panels animate-in delay-6">
          {isCreatingTask ? (
            <TaskEditForm task={EMPTY_TASK} mode="create" submitting={isMutating} error={error} onSubmit={createTask} onCancel={() => setIsCreatingTask(false)} />
          ) : editingTask ? (
            <TaskEditForm task={editingTask} submitting={isMutating} error={error} onSubmit={updateTask} onCancel={() => setEditingTaskId(null)} />
          ) : selectedTask ? (
            <TaskDetails task={selectedTask} canEdit={canUpdate} onEdit={() => setEditingTaskId(selectedTask.id)} onClose={() => setSelectedTaskId(null)} />
          ) : <><DonutChart /><ActivityList /></>}
        </div>
      </section>
    </>
  );
}
