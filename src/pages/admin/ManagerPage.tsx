import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import ManagerHeader from "../../organisms/Manager/ManagerHeader";
import ManagerTable from "../../organisms/Manager/ManagerTable";

import "../../assets/styles/AdminDashboard.css";

const ManagerPage = () => {

  const managers = [
    { name: "Rajesh", email: "rajesh@gmail.com", team: 5 },
    { name: "Amit", email: "amit@gmail.com", team: 3 },
    { name: "Neha", email: "neha@gmail.com", team: 4 },
  ];

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <Navbar user={{ name: "Admin" }} />

        <ManagerHeader />

        <ManagerTable managers={managers} />
      </div>
    </div>
  );
};

export default ManagerPage;