import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaBell,
  FaMoon,
  FaSun,
  FaChevronDown,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaTimes,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { AuthContext } from "../../components/context/AuthContext";
import { useTheme } from "../../components/context/ThemeContext";
import { getProfileSettings } from "../../services/profileSettingsService";
import axiosInstance from "../../api/axiosInstance";

const apiRoot = (process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const resolvePhotoUrl = (photo?: string) => {
  if (!photo) return "";
  const src = photo.startsWith("http") ? photo : `${apiRoot}${photo}`;
  return `${src}${src.includes("?") ? "&" : "?"}v=${Date.now()}`;
};

const Navbar = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const user = authContext?.user as any;
  const { isDark, toggleTheme } = useTheme();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [now, setNow] = useState(new Date());
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    getProfileSettings()
      .then((res: any) => setProfilePhoto(res?.data?.profilePhoto || ""))
      .catch(() => setProfilePhoto(""));
  }, [user?.id]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const notificationBase = user?.role === "admin" ? "/admin/notifications" : "/manager/notifications";

  const loadNotifications = async () => {
    if (!["admin", "manager"].includes(user?.role)) return;
    try {
      const res = await axiosInstance.get(`${notificationBase}?page=1&limit=10`);
      const data = res.data?.data || {};
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(timer);
  }, [user?.role, user?.id]);

  const getCurrentDate = () =>
    now.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const getGreetingText = () => {
    const h = now.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const notificationColor = (type?: string) => {
    if (String(type).includes("lead")) return "bg-blue-500";
    if (String(type).includes("follow")) return "bg-teal-500";
    if (String(type).includes("task")) return "bg-violet-500";
    if (String(type).includes("note")) return "bg-amber-500";
    return "bg-slate-500";
  };

  const timeAgo = (date?: string) => {
    if (!date) return "";
    const seconds = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const markNotificationRead = async (notification: any) => {
    if (!notification?._id) return;
    if (!notification.isRead) {
      await axiosInstance.put(`${notificationBase}/${notification._id}`).catch(() => null);
      loadNotifications();
    }
    if (notification.actionUrl) navigate(notification.actionUrl);
    setNotifOpen(false);
  };

  return (
    <header className="sticky top-0 z-[1000] max-w-full overflow-visible border-b border-slate-200 bg-white/90 px-3 py-2.5 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/90 md:px-5">
      <div className="flex min-w-0 items-center justify-between gap-2.5">
        {/* Left: Greeting */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <p className="truncate text-sm font-black tracking-tight text-slate-800 dark:text-white">
              {getGreetingText()},{" "}
              <span className="text-blue-500">{user?.name || "Manager"}</span>
            </p>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
              {getCurrentDate()}
            </p>
          </div>
        </div>

        {/* Center: Search Bar (desktop) */}
        <div className="hidden min-w-0 flex-1 max-w-md mx-2 md:flex lg:mx-4">
          <div className="relative w-full">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search leads, agents, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-100 pl-9 pr-4 text-sm font-medium text-slate-700 placeholder-slate-400 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-blue-500"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <FaSearch size={15} />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isDark ? "sun" : "moon"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isDark ? (
                  <FaSun size={15} className="text-yellow-400" />
                ) : (
                  <FaMoon size={15} />
                )}
              </motion.div>
            </AnimatePresence>
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <FaBell size={15} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="fixed right-4 top-[64px] w-[min(20rem,calc(100vw-2rem))] bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[1100]"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
                      Notifications
                    </h3>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                      {unreadCount} new
                    </span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                    {notifications.length === 0 && (
                      <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-300">
                        No notifications yet.
                      </div>
                    )}
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => markNotificationRead(n)}
                        className={[
                          "flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150",
                          !n.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : "",
                        ].join(" ")}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notificationColor(n.type)}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                            {n.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200 leading-tight">
                            {n.message}
                          </p>
                          {n.metadata && Object.keys(n.metadata).length > 0 && (
                            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                              {[
                                n.metadata.actorName && `By: ${n.metadata.actorName}`,
                                n.metadata.entity && `Type: ${n.metadata.entity}`,
                                n.metadata.leadName && `Lead: ${n.metadata.leadName}`,
                                n.metadata.taskTitle && `Task: ${n.metadata.taskTitle}`,
                              ].filter(Boolean).join(" | ")}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-1">
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>
                        {!n.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
                    <button className="w-full text-center text-xs text-blue-500 hover:text-blue-600 font-medium py-1">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <div className="w-8 h-8 overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-md">
                {profilePhoto ? <img src={resolvePhotoUrl(profilePhoto)} alt={user?.name || "User"} className="h-full w-full object-cover" /> : <span className="text-white text-xs font-bold">
                  {getInitials(user?.name || "User")}
                </span>}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-none truncate max-w-[80px]">
                  {user?.name || "User"}
                </p>
                <p className="text-[10px] text-slate-400 capitalize">
                  {user?.role}
                </p>
              </div>
              <FaChevronDown
                size={10}
                className="text-slate-400 hidden sm:block"
              />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="profile-menu-dropdown fixed right-5 top-[72px] w-64 overflow-hidden rounded-2xl border bg-white shadow-xl dark:bg-slate-800 z-[2000]"
                >
                  <div className="profile-menu-header px-4 py-4 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <div className="py-1">
                    {[
                      {
                        icon: FaUserCircle,
                        label: "My Profile",
                        action: () => navigate(`/${user?.role}/my-profile`),
                      },
                      {
                        icon: MdDashboard,
                        label: "Dashboard",
                        action: () => navigate(`/${user?.role}/dashboard`),
                      },
                      {
                        icon: FaCog,
                        label: "Settings",
                        action: () => navigate(`/${user?.role}/profile-settings`),
                      },
                    ].map((item, i) => (
                      <button
                        key={i}
                        onClick={item.action}
                        className="profile-menu-item w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-150"
                      >
                        <item.icon size={14} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-700 py-1">
                    <button
                      onClick={() => {
                        authContext?.logout();
                        navigate("/login");
                      }}
                      className="profile-menu-item profile-menu-danger w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                    >
                      <FaSignOutAlt size={14} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden"
          >
            <div className="relative mt-3">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search leads, agents..."
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FaTimes size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
