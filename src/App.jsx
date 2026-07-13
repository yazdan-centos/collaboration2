import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { flatNavItems } from './data/dashboardData';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import BackgroundGlow from './components/BackgroundGlow';
import TasksPage from './pages/TasksPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';
import TeamPage from './pages/TeamPage';
import ClientsPage from './pages/ClientsPage';
import DocumentsPage from './pages/DocumentsPage';
import SettingsPage from './pages/SettingsPage';
import TicketPage from './pages/TicketPage';
import SlaContractsPage from './pages/SlaContractsPage';
import Login from './components/auth/Login';
import ProtectedRoute from './components/routing/ProtectedRoute';
import './App.css';

function ApplicationLayout() {
  const location = useLocation();

  // جعبه جستجوی هدر مشترک بین همه صفحات است؛ فقط در صفحه تسک‌ها اثر عملی دارد
  const [searchQuery, setSearchQuery] = useState('');

  // منوی موبایل
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    function checkMobile() {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // عنوان صفحه و بردکرامب بر اساس مسیر فعلی از داده‌های منو استخراج می‌شود
  const currentNavItem = flatNavItems.find((item) => item.path === location.pathname);
  const pageTitle = location.pathname === '/tasks' ? 'مانیتورینگ تسک‌ها' : currentNavItem?.label ?? '';
  const breadcrumbLabel = currentNavItem?.label ?? '';

  return (
    <>
      <BackgroundGlow />

      <Sidebar isOpen={sidebarOpen} onNavigate={() => isMobile && setSidebarOpen(false)} />

      <main className="main-content">
        <TopHeader
          pageTitle={pageTitle}
          breadcrumbLabel={breadcrumbLabel}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isMobile={isMobile}
          onMenuToggleClick={() => setSidebarOpen((open) => !open)}
        />

        <Routes>
          <Route index element={<Navigate to="/tasks" replace />} />
          <Route path="tasks" element={<TasksPage searchQuery={searchQuery} />} />
          <Route path="tickets" element={<TicketPage />} />
          <Route path="sla-contracts" element={<SlaContractsPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={(
          <ProtectedRoute>
            <ApplicationLayout />
          </ProtectedRoute>
        )}
      />
    </Routes>
  );
}
