import { useEffect, useState } from "react";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import CardsSection from "../../organisms/DashboardCards/CardsSection";
import ChartsSection from "../../organisms/DashboardCharts/ChartsSection";
import TablesSection from "../../organisms/DashboardTables/TablesSection";

import { getDashboardData } from "../../services/dashboardService";

import "../../assets/styles/AdminDashboard.css";

const AdminDashboard = () => {

  // ✅ STATE
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    leads: [],
    agents: [],
    barChart: [],
    pieChart: [],
  });

  const [loading, setLoading] = useState(true);

  // ✅ FETCH DATA FROM BACKEND
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ LOADING UI
  if (loading) return <h2>Loading Dashboard...</h2>;

  return (
    <div className="dashboard">

      <Sidebar />

      <div className="main">

        <Navbar user={{ name: "Admin" }} />

        <CardsSection stats={dashboardData.stats} />

        <ChartsSection
          barData={dashboardData.barChart}
          pieData={dashboardData.pieChart}
        />

        <TablesSection
          leads={dashboardData.leads}
          agents={dashboardData.agents}
        />

      </div>
    </div>
  );
};

export default AdminDashboard;

// import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
// import Navbar from "../../organisms/DashboardNavbar/Navbar";
// import CardsSection from "../../organisms/DashboardCards/CardsSection";
// import ChartsSection from "../../organisms/DashboardCharts/ChartsSection";
// import TablesSection from "../../organisms/DashboardTables/TablesSection";

// import "../../assets/styles/AdminDashboard.css";

// const AdminDashboard = () => {

//   // ✅ STATIC DATA (UI ONLY)
//   const dashboardData = {
//     stats: [
//       { title: "Total Leads", value: 1200, color: "#6366f1" },
//       { title: "New Leads", value: 250, color: "#3b82f6" },
//       { title: "Converted", value: 600, color: "#22c55e" },
//       { title: "Lost", value: 350, color: "#ef4444" },
//     ],

//     leads: [
//       { name: "John", status: "New", assigned: "Agent A" },
//       { name: "Mike", status: "Converted", assigned: "Agent B" },
//       { name: "David", status: "Lost", assigned: "Agent C" },
//     ],

//     agents: [
//       { name: "Agent A", total: 50, converted: 20 },
//       { name: "Agent B", total: 60, converted: 30 },
//       { name: "Agent C", total: 40, converted: 15 },
//     ],

//     barChart: [
//       { name: "Jan", leads: 40 },
//       { name: "Feb", leads: 60 },
//       { name: "Mar", leads: 80 },
//       { name: "Apr", leads: 50 },
//     ],

//     pieChart: [
//       { name: "Converted", value: 60 },
//       { name: "Lost", value: 30 },
//       { name: "New", value: 10 },
//     ],
//   };

//   return (
//     <div className="dashboard">

//       {/* SIDEBAR */}
//       <Sidebar />

//       {/* MAIN CONTENT */}
//       <div className="main">

//         {/* NAVBAR */}
//         <Navbar user={{ name: "Admin" }} />

//         {/* CARDS */}
//         <CardsSection stats={dashboardData.stats} />

//         {/* CHARTS */}
//         <ChartsSection
//           barData={dashboardData.barChart}
//           pieData={dashboardData.pieChart}
//         />

//         {/* TABLES */}
//         <TablesSection
//           leads={dashboardData.leads}
//           agents={dashboardData.agents}
//         />

//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

