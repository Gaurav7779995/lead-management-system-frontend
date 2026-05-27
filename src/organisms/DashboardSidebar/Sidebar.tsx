import { useLocation, Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import {
  FaBriefcase,
  FaChartBar,
  FaUsers,
  FaUserTie,
  FaTasks,
  FaCog,
  FaPhoneAlt,
  FaCalendarAlt,
  FaFileAlt,
  FaBell,
  FaUserCircle,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { motion } from "framer-motion";
import { AuthContext } from "../../components/context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const authContext = useContext(AuthContext);
  const user = authContext?.user as any;
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [isCompactScreen, setIsCompactScreen] = useState(false);
  const sidebarExpanded = !isCompactScreen && hoverExpanded;

  useEffect(() => {
    const syncSidebar = () => setIsCompactScreen(window.innerWidth < 1024);

    syncSidebar();
    window.addEventListener("resize", syncSidebar);
    return () => window.removeEventListener("resize", syncSidebar);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--dashboard-sidebar-width",
      sidebarExpanded ? "220px" : "72px"
    );
  }, [sidebarExpanded]);

  const getNavItems = (role: string) => {
    if (role === "manager") {
      return [
        {
          section: "Overview",
          items: [
            { icon: MdDashboard, label: "Dashboard", path: "/manager/dashboard", badge: null },
            { icon: FaBriefcase, label: "Leads", path: "/manager/leads", badge: null },
            { icon: FaUsers, label: "Agents", path: "/manager/agents", badge: null },
          ],
        },
        {
          section: "Work",
          items: [
            { icon: FaPhoneAlt, label: "Follow-ups", path: "/manager/followups", badge: null },
            { icon: FaTasks, label: "Tasks", path: "/manager/tasks", badge: null },
            { icon: FaCalendarAlt, label: "Calendar", path: "/manager/calendar", badge: null },
          ],
        },
        {
          section: "Insights",
          items: [
            { icon: FaFileAlt, label: "Reports", path: "/manager/reports", badge: null },
          ],
        },
        {
          section: "System",
          items: [
            { icon: FaCog, label: "Settings", path: "/manager/settings", badge: null },
          ],
        },
      ];
    }
    if (role === "agent") {
      return [
        {
          section: "Overview",
          items: [
            { icon: MdDashboard, label: "Dashboard", path: "/agent/dashboard", badge: null },
            { icon: FaBriefcase, label: "My Leads", path: "/agent/leads", badge: null },
            { icon: FaPhoneAlt, label: "Follow-ups", path: "/agent/followups", badge: null },
          ],
        },
        {
          section: "Work",
          items: [
            { icon: FaTasks, label: "Tasks", path: "/agent/tasks", badge: null },
            { icon: FaCalendarAlt, label: "Calendar", path: "/agent/calendar", badge: null },
            { icon: FaBell, label: "Notifications", path: "/agent/notifications", badge: null },
          ],
        },
        {
          section: "Insights",
          items: [
            { icon: FaChartBar, label: "Reports", path: "/agent/reports", badge: null },
          ],
        },
        {
          section: "System",
          items: [
            { icon: FaCog, label: "Profile & Settings", path: "/agent/profile-settings", badge: null },
          ],
        },
      ];
    }
    return [
      {
        section: "Overview",
        items: [
          { icon: MdDashboard, label: "Dashboard", path: "/admin/dashboard", badge: null },
          { icon: FaBriefcase, label: "Leads", path: "/admin/leads", badge: null },
        ],
      },
      {
        section: "Management",
        items: [
          { icon: FaUsers, label: "Agents", path: "/admin/agents", badge: null },
          { icon: FaUserTie, label: "Managers", path: "/admin/managers", badge: null },
          { icon: FaTasks, label: "Tasks", path: "/admin/tasks", badge: null },
        ],
      },
      {
        section: "System",
        items: [
          { icon: FaCog, label: "Settings", path: "/admin/settings", badge: null },
        ],
      },
    ];
  };

  const navItems = getNavItems(user?.role || "admin");
  const profilePath = user?.role === "agent" ? "/agent/profile-settings" : `/${user?.role || "admin"}/my-profile`;

  const isActive = (path: string) => {
    if (path === "/manager/leads") return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const renderItem = (item: any, key: string | number) => (
    <motion.div
      key={key}
      whileHover={{ x: sidebarExpanded ? 3 : 0, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={item.path}
        title={!sidebarExpanded ? item.label : undefined}
        className={[
          "flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-200 group relative overflow-hidden",
          isActive(item.path)
            ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-500 dark:hover:text-blue-400",
        ].join(" ")}
      >
        {isActive(item.path) && (
          <motion.span
            layoutId="sidebar-active-pill"
            className="absolute inset-0 rounded-xl bg-blue-500"
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          />
        )}
        <item.icon
          size={18}
          className={[
            "relative z-10 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
            isActive(item.path) ? "text-white" : "",
          ].join(" ")}
        />
        {sidebarExpanded && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative z-10 text-sm font-medium truncate"
          >
            {item.label}
          </motion.span>
        )}
        {sidebarExpanded && item.badge && (
          <span className="relative z-10 ml-auto text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-medium">
            {item.badge}
          </span>
        )}
        {!sidebarExpanded && !isCompactScreen && (
          <div className="fixed left-[76px] px-2 py-1 bg-slate-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[1200] shadow-lg">
            {item.label}
          </div>
        )}
      </Link>
    </motion.div>
  );

  return (
    <motion.aside
      onMouseEnter={() => {
        if (!isCompactScreen) setHoverExpanded(true);
      }}
      onMouseLeave={() => {
        if (!isCompactScreen) setHoverExpanded(false);
      }}
      animate={{ width: sidebarExpanded ? 220 : 72 }}
      transition={{ type: "tween", duration: 0.18, ease: "easeOut" }}
      className="dashboard-sidebar fixed left-0 top-0 z-50 h-screen flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/50 shadow-xl overflow-hidden overflow-x-hidden will-change-[width]"
    >
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-1">
        {navItems.map((section, si) => (
          <motion.div
            key={si}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22, delay: si * 0.04 }}
            className="mb-3"
          >
            {sidebarExpanded && (
              <div className="px-3 pb-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  {section.section}
                </span>
              </div>
            )}
            {section.items.map((item, ii) => renderItem(item, `${si}-${ii}`))}
          </motion.div>
        ))}
      </nav>

      <div className="border-t border-slate-200 dark:border-slate-700/50 px-2 py-3">
        {renderItem(
          {
            icon: FaUserCircle,
            label: "Profile",
            path: profilePath,
            badge: null,
          },
          "profile"
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
