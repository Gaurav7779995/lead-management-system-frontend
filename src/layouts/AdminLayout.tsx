import Sidebar from "../organisms/DashboardSidebar/Sidebar";
import Navbar from "../organisms/DashboardNavbar/Navbar";
import "../assets/styles/Dashboard.css";
import "../assets/styles/admin-layout.css";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="admin-layout manager-dashboard-shell">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="admin-content manager-dashboard-theme">
        <Navbar />
        <div className="admin-page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
