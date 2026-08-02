import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { flatNavItems } from "./data/dashboardData";
import Sidebar from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import BackgroundGlow from "./components/BackgroundGlow";
import ClientsPage from "./pages/clients/ClientsPage";
import CustomerTicketPage from "./pages/tickets/CustomerTicketPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import MeetingsPage from "./pages/meetings/MeetingsPage";
import ProjectsPage from "./pages/projects/ProjectsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import UserPermissionsPage from "./pages/users/UserPermissionsPage";
import UserManagementPage from "./pages/users/UserManagementPage";
import IconGalleryPage from "./pages/shared/IconGalleryPage";
import SlaContractEdit from "./pages/sla/SlaContractEdit";
import SlaContractsPage from "./pages/sla/SlaContractsPage";
import TasksPage from "./pages/tasks/TasksPage";
import TeamPage from "./pages/team/TeamPage";
import TicketChatPage from "./pages/tickets/TicketChatPage";
import TicketCreatePage from "./pages/tickets/TicketCreatePage";
import TicketPage from "./pages/tickets/TicketPage";
import Login from "./components/auth/Login";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import { hasRole, USER_ROLES } from "./utils/authorization";
import { useAuth } from "./context/AuthContext";
import "./App.css";
import RoleRoute from "./components/routing/RoleRoute";
import { ManagerRoute } from "./components/routing/RoleRoute";
import WhatsAppClone from "./pages/tickets/WhatsAppChatPage";
import ApplicationGuide from "./pages/applicationGuide/ApplicationGuide.jsx";
import {CalendarPage} from "./pages";

function ApplicationLayout() {
  const location = useLocation();

  // جعبه جستجوی هدر مشترک بین همه صفحات است؛ فقط در صفحه تسک‌ها اثر عملی دارد
  const [searchQuery, setSearchQuery] = useState("");

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
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // عنوان صفحه و بردکرامب بر اساس مسیر فعلی از داده‌های منو استخراج می‌شود
  const isSlaEditPage = /^\/sla-contracts\/[^/]+\/edit$/.test(
    location.pathname,
  );
  const currentNavItem = flatNavItems.find(
    (item) => item.path === location.pathname,
  );
  const pageTitle =
    location.pathname === "/tasks"
      ? "مانیتورینگ تسک‌ها"
      : isSlaEditPage
        ? "ویرایش قرارداد SLA"
        : location.pathname === "/tickets/new"
          ? "ایجاد تیکت"
          : (currentNavItem?.label ?? "");
  const breadcrumbLabel = isSlaEditPage
    ? "قراردادهای SLA"
    : location.pathname === "/tickets/new"
      ? "تیکت‌ها"
      : (currentNavItem?.label ?? "");

  return (
    <>
      <BackgroundGlow />

      <Sidebar
        isOpen={sidebarOpen}
        onNavigate={() => isMobile && setSidebarOpen(false)}
      />

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
          <Route index element={<Navigate to="/tickets" replace />} />
          <Route
            path="tasks"
            element={
              <RoleRoute roles={[USER_ROLES.TEAM_MEMBER, USER_ROLES.TEAM_MANAGER]} permission="TASK_READ">
                <TasksPage searchQuery={searchQuery} />
              </RoleRoute>
            }
          />
          <Route
            path="tickets"
            element={
              <RoleRoute roles={Object.values(USER_ROLES)} permission="TICKET_READ">
                <TicketPageRouter />
              </RoleRoute>
            }
          />
          <Route
            path="tickets/new"
            element={
              <RoleRoute roles={Object.values(USER_ROLES)} permission="TICKET_CREATE">
                <TicketCreatePage />
              </RoleRoute>
            }
          />
          <Route
            path="sla-contracts"
            element={
              <ManagerRoute>
                <SlaContractsPage />
              </ManagerRoute>
            }
          />
          <Route
            path="sla-contracts/:contractId/edit"
            element={
              <ManagerRoute>
                <SlaContractEdit />
              </ManagerRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ManagerRoute>
                <DashboardPage />
              </ManagerRoute>
            }
          />
          <Route
            path="projects"
            element={
              <ManagerRoute>
                <ProjectsPage />
              </ManagerRoute>
            }
          />
          <Route
            path="calendar"
            element={
              <ManagerRoute>
                <CalendarPage />
              </ManagerRoute>
            }
          />
          <Route
            path="meetings"
            element={
              <RoleRoute
                roles={[USER_ROLES.TEAM_MANAGER, USER_ROLES.TEAM_MEMBER]}
                permission="MEETING_READ"
              >
                <MeetingsPage searchQuery={searchQuery} />
              </RoleRoute>
            }
          />
          <Route
            path="reports"
            element={
              <RoleRoute
                roles={[USER_ROLES.TEAM_MANAGER, USER_ROLES.TEAM_MEMBER]}
              >
                <TicketChatPage />
              </RoleRoute>
            }
          />
          <Route
            path="team"
            element={
              <ManagerRoute>
                <TeamPage />
              </ManagerRoute>
            }
          />
          <Route
            path="clients"
            element={
              <ManagerRoute>
                <ClientsPage />
              </ManagerRoute>
            }
          />
          <Route
            path="applicationGuide"
            element={
              <ManagerRoute>
                <ApplicationGuide />
              </ManagerRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ManagerRoute>
                <SettingsPage />
              </ManagerRoute>
            }
          />
          <Route
            path="users"
            element={
              <RoleRoute roles={[USER_ROLES.TEAM_MANAGER]} permission="USER_READ">
                <UserManagementPage />
              </RoleRoute>
            }
          />
          <Route
            path="user-permissions"
            element={
              <ManagerRoute>
                <UserPermissionsPage />
              </ManagerRoute>
            }
          />
          <Route
            path="icons"
            element={
              <RoleRoute roles={Object.values(USER_ROLES)}>
                <IconGalleryPage />
              </RoleRoute>
            }
          />
          <Route path="*" element={<Navigate to="/tickets" replace />} />
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
        element={
          <ProtectedRoute>
            <ApplicationLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
function TicketPageRouter() {
  const { auth } = useAuth();
  return hasRole(auth, USER_ROLES.CUSTOMER) ? (
    <CustomerTicketPage />
  ) : (
    <TicketPage />
  );
}
