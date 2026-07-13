import React, { useEffect, useState } from 'react';
import StatsGrid from '../components/StatsGrid';
import TaskTable from '../components/TaskTable';
import DonutChart from '../components/DonutChart';
import ActivityList from '../components/ActivityList';
import { tasks } from '../data/dashboardData';

// صفحه مانیتورینگ تسک‌ها (محتوای اصلی داشبورد قبلی، اکنون در مسیر /tasks)
export default function TasksPage({ searchQuery }) {
  const [activeFilter, setActiveFilter] = useState('all');
  // منبع نمایش فعلی: فیلتر یا جستجو (دقیقا مطابق رفتار نسخه اصلی)
  const [displaySource, setDisplaySource] = useState('filter');

  // جعبه جستجو در هدر مشترک است؛ وقتی متن جستجو تغییر می‌کند این صفحه
  // بین حالت «جستجو» و «فیلتر» سوییچ می‌کند - دقیقا مطابق رفتار نسخه اصلی
  useEffect(() => {
    const query = searchQuery.trim();
    if (query) {
      setDisplaySource('search');
    } else {
      setDisplaySource('filter');
      setActiveFilter('all');
    }
  }, [searchQuery]);

  function handleFilterClick(key) {
    setActiveFilter(key);
    setDisplaySource('filter');
  }

  const displayedTasks =
    displaySource === 'search'
      ? tasks.filter((t) => {
          const q = searchQuery.trim().toLowerCase();
          return (
            t.name.includes(q) ||
            t.desc.includes(q) ||
            t.assignee.includes(q) ||
            t.id.toLowerCase().includes(q)
          );
        })
      : activeFilter === 'all'
      ? tasks
      : tasks.filter((t) => t.status === activeFilter);

  return (
    <>
      <StatsGrid />
      <section className="content-grid">
        <TaskTable
          displayedTasks={displayedTasks}
          activeFilter={displaySource === 'filter' ? activeFilter : null}
          onFilterClick={handleFilterClick}
        />
        <div className="side-panels animate-in delay-6">
          <DonutChart />
          <ActivityList />
        </div>
      </section>
    </>
  );
}
