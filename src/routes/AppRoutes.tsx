import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "../utils/ProtectedRoute";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ManagerPage from "../pages/admin/ManagerPage";

// dummy dashboards
const Manager = () => <h1>Manager Dashboard</h1>;
const Agent = () => <h1>Agent Dashboard</h1>;

const AppRoutes = () => {
  return (
    <Routes>
      {/* DEFAULT ROUTE */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* LOGIN PAGE */}
      <Route path="/login" element={<LoginPage />} />

      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      <Route path="/admin/managers" element={<ManagerPage />} />

      <Route path="/manager/dashboard" element={
          <ProtectedRoute role="manager">
            <Manager />
          </ProtectedRoute>
        }
      />

      <Route path="/agent/dashboard" element={
          <ProtectedRoute role="agent">
            <Agent />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
