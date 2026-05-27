import { useEffect, useState } from "react";
import {
  FaBell,
  FaCalendarAlt,
  FaCheckCircle,
  FaEnvelope,
  FaHistory,
  FaPhoneAlt,
  FaShieldAlt,
  FaUserTie,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import { getProfileSettings } from "../../services/profileSettingsService";

const API_BASE = (process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api").replace("/api", "");
const Icon = ({ as: Component, className, size }: { as: any; className?: string; size?: number }) => <Component className={className} size={size} />;

const InfoCard = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950">
      <Icon as={icon} size={14} />
    </div>
    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 break-words text-sm font-extrabold text-slate-800 dark:text-white">{value || "-"}</p>
  </div>
);

const MyProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProfileSettings();
        setProfile(res.data);
      } catch {
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : {};
        setProfile({
          name: user.name || "User",
          email: user.email || "",
          role: user.role || "manager",
          status: "active",
          profileCompletion: 25,
          activityLogs: [],
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const avatarUrl = profile?.profilePhoto
    ? profile.profilePhoto.startsWith("http")
      ? profile.profilePhoto
      : `${API_BASE}${profile.profilePhoto}`
    : "";

  if (loading) {
    return (
      <div className="dashboard bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="main-content min-w-0">
          <Navbar />
          <main className="dashboard-content">
            <div className="h-80 animate-pulse rounded-2xl bg-white dark:bg-slate-900" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="main-content min-w-0">
        <Navbar />
        <main className="dashboard-content min-w-0 max-w-full">
          <div className="space-y-5 pb-10">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="grid gap-0 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="bg-slate-950 p-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">My Profile</p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600 text-3xl font-extrabold">
                      {avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : profile?.name?.slice(0, 2)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h1 className="break-words text-3xl font-extrabold">{profile?.name || "User"}</h1>
                      <p className="mt-1 text-sm text-slate-300">{profile?.email}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold capitalize text-blue-200">{profile?.role}</span>
                        <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold capitalize text-green-200">{profile?.status || "active"}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-300">
                    {profile?.bio || "Manage your team, leads, follow-ups, and reporting from your manager workspace."}
                  </p>
                </div>
                <div className="grid content-center gap-4 p-5">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Profile Completion</span>
                      <span className="text-sm font-extrabold text-blue-600">{profile?.profileCompletion || 0}%</span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${profile?.profileCompletion || 0}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => navigate(`/${profile?.role}/profile-settings`)} className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white">Edit Profile</button>
                    <button onClick={() => navigate(`/${profile?.role}/dashboard`)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 dark:border-slate-700 dark:text-slate-200">Dashboard</button>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoCard icon={FaEnvelope} label="Email Address" value={profile?.email} />
              <InfoCard icon={FaPhoneAlt} label="Mobile Number" value={profile?.phone} />
              <InfoCard icon={FaUserTie} label="Role" value={profile?.role} />
              <InfoCard icon={FaCalendarAlt} label="Created On" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-"} />
            </section>

            <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white"><Icon as={FaCheckCircle} className="text-green-600" /> Account Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><span>Email Status</span><b className="text-green-600">Verified</b></div>
                  <div className="flex justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><span>Account Status</span><b className="capitalize">{profile?.status || "active"}</b></div>
                  <div className="flex justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><span>Username</span><b>{profile?.username || "Not set"}</b></div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white"><Icon as={FaShieldAlt} className="text-blue-600" /> Security Snapshot</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><span>Two-factor Auth</span><b>{profile?.twoFactorEnabled ? "Enabled" : "Disabled"}</b></div>
                  <div className="flex justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><span>Session Timeout</span><b>{profile?.sessionTimeoutMinutes || 30} min</b></div>
                  <div className="flex justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><span>Active Devices</span><b>{profile?.activeDevices?.length || 0}</b></div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white"><Icon as={FaBell} className="text-amber-500" /> Notifications</h2>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {Object.entries(profile?.notificationPreferences || {}).slice(0, 6).map(([key, value]) => (
                    <span key={key} className={`rounded-xl px-3 py-2 ${value ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                  ))}
                </div>
              </motion.div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white"><Icon as={FaHistory} className="text-blue-600" /> Recent Profile Activity</h2>
              {(profile?.activityLogs || []).length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No recent profile activity found.</div>
              ) : (
                <div className="grid gap-3">
                  {profile.activityLogs.slice(0, 6).map((log: any) => (
                    <div key={log._id} className="flex flex-col gap-1 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{log.description}</span>
                      <span className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyProfile;
