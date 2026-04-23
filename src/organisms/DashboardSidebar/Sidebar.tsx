import {
  FaTachometerAlt,
  FaChartBar,
  FaUserTie,
} from "react-icons/fa";

import SidebarItem from "../../molecules/SidebarItem";
import { useLocation, Link } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <h2>Admin Panel</h2>

      <ul>

        {/* DASHBOARD */}
        <Link to="/admin/dashboard">
          <SidebarItem
            icon={<FaTachometerAlt />}
            label="Dashboard"
            active={location.pathname === "/admin/dashboard"}
          />
        </Link>

        {/* LEADS */}
        <Link to="/admin/leads">
          <SidebarItem
            icon={<FaUserTie />}
            label="Leads"
            active={location.pathname === "/admin/leads"}
          />
        </Link>

        {/* MANAGER (NEW) */}
        <Link to="/admin/managers">
          <SidebarItem
            icon={<FaUserTie />}
            label="Managers"
            active={location.pathname === "/admin/managers"}
          />
        </Link>

        {/* REPORTS */}
        <Link to="/admin/reports">
          <SidebarItem
            icon={<FaChartBar />}
            label="Reports"
            active={location.pathname === "/admin/reports"}
          />
        </Link>

      </ul>
    </aside>
  );
};

export default Sidebar;


// import {
//   FaTachometerAlt,
//   FaChartBar,
//   FaUserTie,
// } from "react-icons/fa";

// import SidebarItem from "../../molecules/SidebarItem";

// import { Link } from "react-router-dom";


// const Sidebar = () => {
//   return (
//     <aside className="sidebar">
//       <h2>Admin Panel</h2>

//       <ul>
//         <SidebarItem icon={<FaTachometerAlt />} label="Dashboard" active />

//         <SidebarItem icon={<FaUserTie />} label="Leads" />

//         {/* <SidebarItem icon={<FaUsers />} label="Users" /> */}

//         {/* ✅ ADD THIS */}
//         <SidebarItem icon={<FaUserTie />} label="Manager" />

//         <SidebarItem icon={<FaChartBar />} label="Reports" />
//       </ul>
//     </aside>
//   );
// };

// export default Sidebar;