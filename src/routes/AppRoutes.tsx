import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import Dashboard from "../pages/Dashboard";
import LeadsPage from "../pages/admin/Leads";
import ManagerPage from "../pages/admin/ManagerPage";
import AdminSettings from "../pages/admin/AdminSettings";
import AdminTasksPage from "../pages/admin/AdminTasksPage";
import AdminTaskCreatePage from "../pages/admin/AdminTaskCreatePage";
import AddManager from "../pages/admin/AddManager";
import CreateLead from "../pages/admin/CreateLead";
import LeadDetailsPage from "../organisms/Lead/LeadDetailsPage";
import ManagerDetailsPage from "../organisms/Manager/ManagerDetailsPage";
import AgentPage from "../pages/admin/AgentPage";
import AddAgent from "../pages/admin/AddAgent";
import EditAgent from "../pages/admin/EditAgent";
import AdminAgentLeadDetailsPage from "../pages/admin/AdminAgentLeadDetailsPage";
import AdminManagerOverviewPage from "../pages/admin/AdminManagerOverviewPage";
import ManagerAgentDashboard from "../pages/manager/ManagerAgentDashboard";
import ManagerAgentLeadsPage from "../pages/manager/AgentLeadsPage";
import ManagerLeadDetailPage from "../pages/manager/ManagerLeadDetailPage";
import ManagerCreateLead from "../pages/manager/ManagerCreateLead";
import ManagerLeadsPage from "../pages/manager/ManagerLeadsPage";
import ManagerFollowUpsPage from "../pages/manager/ManagerFollowUpsPage";
import ManagerFollowUpDetailsPage from "../pages/manager/ManagerFollowUpDetailsPage";
import Reports from "../pages/manager/Reports";
import ProfileSettings from "../pages/manager/ProfileSettings";
import MyProfile from "../pages/manager/MyProfile";
import ManagerTasksPage from "../pages/manager/ManagerTasksPage";
import ManagerCalendarPage from "../pages/manager/ManagerCalendarPage";
import AgentModulePage from "../pages/agent/AgentModulePage";
import AgentLeadsPage from "../pages/agent/AgentLeadsPage";
import AgentFollowupsPage from "../pages/agent/AgentFollowupsPage";
import AgentTasksPage from "../pages/agent/AgentTasksPage";
import AgentReportsPage from "../pages/agent/AgentReportsPage";
import AgentProfileSettingsPage from "../pages/agent/AgentProfileSettingsPage";
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leads"
        element={
          <ProtectedRoute role="admin">
            <LeadsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leads/create"
        element={
          <ProtectedRoute role="admin">
            <CreateLead />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leads/:id"
        element={
          <ProtectedRoute role="admin">
            <LeadDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/managers"
        element={
          <ProtectedRoute role="admin">
            <ManagerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/managers/add"
        element={
          <ProtectedRoute role="admin">
            <AddManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/managers/:id/overview"
        element={
          <ProtectedRoute role="admin">
            <AdminManagerOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/managers/:id"
        element={
          <ProtectedRoute role="admin">
            <ManagerDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/agents"
        element={
          <ProtectedRoute role="admin">
            <AgentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/agents/add"
        element={
          <ProtectedRoute role="admin">
            <AddAgent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/agents/:id/leads"
        element={
          <ProtectedRoute role="admin">
            <AdminAgentLeadDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute role="admin">
            <AdminSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tasks"
        element={
          <ProtectedRoute role="admin">
            <AdminTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tasks/create"
        element={
          <ProtectedRoute role="admin">
            <AdminTaskCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/my-profile"
        element={
          <ProtectedRoute role="admin">
            <MyProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile-settings"
        element={
          <ProtectedRoute role="admin">
            <ProfileSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/agents/:id"
        element={
          <ProtectedRoute role="admin">
            <EditAgent />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute role="manager">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/agents"
        element={
          <ProtectedRoute role="manager">
            <ManagerAgentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/agents/:agentId"
        element={
          <ProtectedRoute role="manager">
            <ManagerAgentLeadsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/leads"
        element={
          <ProtectedRoute role="manager">
            <ManagerLeadsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/leads/create"
        element={
          <ProtectedRoute role="manager">
            <ManagerCreateLead />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/leads/edit/:leadId"
        element={
          <ProtectedRoute role="manager">
            <ManagerLeadDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/leads/:leadId"
        element={
          <ProtectedRoute role="manager">
            <ManagerLeadDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/my-profile"
        element={
          <ProtectedRoute role="manager">
            <MyProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/profile-settings"
        element={
          <ProtectedRoute role="manager">
            <ProfileSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/settings"
        element={
          <ProtectedRoute role="manager">
            <ProfileSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/reports"
        element={
          <ProtectedRoute role="manager">
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/tasks"
        element={
          <ProtectedRoute role="manager">
            <ManagerTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/followups"
        element={
          <ProtectedRoute role="manager">
            <ManagerFollowUpsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/followups/create"
        element={
          <ProtectedRoute role="manager">
            <ManagerFollowUpsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/followups/edit/:followUpId"
        element={
          <ProtectedRoute role="manager">
            <ManagerFollowUpsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/followups/:followUpId"
        element={
          <ProtectedRoute role="manager">
            <ManagerFollowUpDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/calendar"
        element={
          <ProtectedRoute role="manager">
            <ManagerCalendarPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agent/dashboard"
        element={
          <ProtectedRoute role="agent">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/leads"
        element={
          <ProtectedRoute role="agent">
            <AgentLeadsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/followups"
        element={
          <ProtectedRoute role="agent">
            <AgentFollowupsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/tasks"
        element={
          <ProtectedRoute role="agent">
            <AgentTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/reports"
        element={
          <ProtectedRoute role="agent">
            <AgentReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/profile-settings"
        element={
          <ProtectedRoute role="agent">
            <AgentProfileSettingsPage />
          </ProtectedRoute>
        }
      />
      {[
        ["calendar", "calendar"],
        ["notifications", "notifications"],
        ["settings", "settings"],
      ].map(([path, module]) => (
        <Route
          key={path}
          path={`/agent/${path}`}
          element={
            <ProtectedRoute role="agent">
              <AgentModulePage module={module as any} />
            </ProtectedRoute>
          }
        />
      ))}

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
