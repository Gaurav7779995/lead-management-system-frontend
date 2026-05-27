import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaBell,
  FaCamera,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaHistory,
  FaLock,
  FaMoon,
  FaSave,
  FaShieldAlt,
  FaSignOutAlt,
  FaTrash,
  FaUserCog,
} from "react-icons/fa";
import { motion } from "framer-motion";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import {
  getProfileSettings,
  logoutAllProfileDevices,
  removeProfilePhoto,
  updateProfilePassword,
  updateProfilePreferences,
  updateProfileSettings,
  uploadProfilePhoto,
} from "../../services/profileSettingsService";

const API_BASE = (process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api").replace("/api", "");
const Icon = ({ as: Component, className, size }: { as: any; className?: string; size?: number }) => <Component className={className} size={size} />;

const fieldClass = "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const areaClass = "min-h-[110px] w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const themeColors: Record<string, string> = {
  blue: "bg-blue-500",
  teal: "bg-teal-500",
  green: "bg-green-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
};

const Section = ({ title, icon, children }: { title: string; icon: any; children: any }) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
  >
    <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-900 dark:text-white">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950">
        <Icon as={icon} size={14} />
      </span>
      {title}
    </h2>
    {children}
  </motion.section>
);

const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
  >
    <span>{label}</span>
    <span className={`flex h-6 w-11 items-center rounded-full p-1 transition ${checked ? "bg-blue-600" : "bg-slate-300"}`}>
      <span className={`h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-5" : ""}`} />
    </span>
  </button>
);

const ProfileSettings = () => {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyProfile = (nextProfile: any, fallbackPhoto?: string) => {
    const normalized = {
      ...nextProfile,
      profilePhoto: nextProfile?.profilePhoto || fallbackPhoto || form.profilePhoto || profile?.profilePhoto || "",
    };
    setProfile(normalized);
    setForm(normalized);
    return normalized;
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getProfileSettings();
      applyProfile(res.data);
    } catch (error: any) {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : {};
      const fallbackProfile = {
        name: user.name || "",
        email: user.email || "",
        phone: "",
        role: user.role || "manager",
        status: "active",
        createdAt: new Date().toISOString(),
        profileCompletion: 25,
        notificationPreferences: {
          email: true,
          sms: false,
          browser: true,
          followUpReminders: true,
          leadAssignments: true,
          taskDeadlines: true,
        },
        appearancePreferences: {
          mode: "system",
          themeColor: "blue",
          dashboardLayout: "comfortable",
          sidebarCollapsed: false,
        },
        activityLogs: [],
        activeDevices: [],
      };
      setProfile(fallbackProfile);
      setForm(fallbackProfile);
      setToast("Profile API not found yet. Restart backend and refresh this page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (!Object.keys(form).length) return;
    const timeout = window.setTimeout(() => {
      localStorage.setItem("managerProfileSettingsDraft", JSON.stringify(form));
    }, 800);
    return () => window.clearTimeout(timeout);
  }, [form]);

  const completion = profile?.profileCompletion || 0;
  const passwordStrength = useMemo(() => {
    const value = password.newPassword;
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return score;
  }, [password.newPassword]);

  const avatarUrl =
    photoPreview ||
    (form.profilePhoto
      ? form.profilePhoto.startsWith("http")
        ? form.profilePhoto
        : `${API_BASE}${form.profilePhoto}`
      : "");

  const saveProfile = async () => {
    if (!form.name?.trim() || !form.email?.trim() || !form.phone?.trim()) {
      setToast("Name, email, and mobile number are required.");
      return;
    }
    setSaving(true);
    try {
      const currentPhoto = form.profilePhoto || profile?.profilePhoto || "";
      const res = await updateProfileSettings({ ...form, profilePhoto: currentPhoto, currentEmail: profile?.email });
      applyProfile(res.data, currentPhoto);
      setToast("Profile saved successfully");
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async (patch: any) => {
    const next = { ...form, ...patch };
    setForm(next);
    const res = await updateProfilePreferences(patch);
    setProfile(res.data);
    setForm(res.data);
    setToast("Preferences updated");
  };

  const changePassword = async () => {
    try {
      await updateProfilePassword(password);
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setToast("Password updated successfully");
    } catch (error: any) {
      setToast(error?.response?.data?.message || "Password update failed");
    }
  };

  const handlePhoto = async (file?: File) => {
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    const res = await uploadProfilePhoto(file);
    applyProfile(res.data);
    setPhotoPreview("");
    setToast("Profile photo updated");
  };

  const removePhoto = async () => {
    const res = await removeProfilePhoto();
    setPhotoPreview("");
    setProfile(res.data);
    setForm(res.data);
    setToast("Profile photo removed");
  };

  const logoutAll = async () => {
    const res = await logoutAllProfileDevices();
    setProfile(res.data);
    setForm(res.data);
    setConfirmLogout(false);
    setToast("All active devices logged out");
  };

  if (loading) {
    return (
      <div className="dashboard manager-dashboard-shell manager-settings-theme bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="main-content min-w-0">
          <Navbar />
          <main className="dashboard-content manager-dashboard-theme">
            <div className="grid gap-4 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-52 animate-pulse rounded-2xl bg-white shadow-sm dark:bg-slate-900" />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard manager-dashboard-shell manager-settings-theme bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="main-content min-w-0">
        <Navbar />
        <main className="dashboard-content manager-dashboard-theme min-w-0 max-w-full">
          <div className="manager-settings-page space-y-5 pb-24">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="grid gap-0 xl:grid-cols-[1fr_0.75fr]">
                <div className="bg-slate-950 p-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Navbar Settings</p>
                  <h1 className="mt-2 text-3xl font-extrabold">Profile Settings</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                    Manage your manager profile, security, notifications, appearance, and account activity from one CRM-grade workspace.
                  </p>
                </div>
                <div className="p-5">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Profile Completion</span>
                      <span className="text-sm font-extrabold text-blue-600">{completion}%</span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${completion}%` }} />
                    </div>
                    <p className="mt-3 text-sm text-slate-500">Complete your photo, bio, preferences, and verification details.</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <div className="space-y-5 xl:col-span-2">
                <Section title="Profile Information" icon={FaUserCog}>
                  <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
                    <div className="flex flex-col items-center rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-2xl font-extrabold text-white">
                        {avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : form.name?.slice(0, 2)?.toUpperCase()}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(e.target.files?.[0])} />
                      <button onClick={() => fileInputRef.current?.click()} className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white"><Icon as={FaCamera} /> Upload</button>
                      <button onClick={removePhoto} className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-600"><Icon as={FaTrash} /> Remove</button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <input className={fieldClass} placeholder="Full name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      <input className={fieldClass} placeholder="Email address" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                      <input className={fieldClass} placeholder="Mobile number" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                      <input className={`${fieldClass} cursor-not-allowed bg-slate-100 font-semibold capitalize text-slate-500 dark:bg-slate-900`} placeholder="Role" value={form.role || "manager"} readOnly />
                      <textarea className={`${areaClass} md:col-span-2`} placeholder="Bio / About" value={form.bio || ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => setForm(profile)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 dark:border-slate-700">Cancel</button>
                    <button onClick={saveProfile} disabled={saving} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"><Icon as={FaSave} /> Save</button>
                  </div>
                </Section>

                <Section title="Change Password" icon={FaLock}>
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      ["currentPassword", "Current password"],
                      ["newPassword", "New password"],
                      ["confirmPassword", "Confirm password"],
                    ].map(([key, label]) => (
                      <div key={key} className="relative">
                        <input type={showPassword ? "text" : "password"} className={`${fieldClass} pr-10`} placeholder={label} value={(password as any)[key]} onChange={(e) => setPassword({ ...password, [key]: e.target.value })} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <Icon as={showPassword ? FaEyeSlash : FaEye} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {[0, 1, 2, 3].map((item) => <span key={item} className={`h-2 flex-1 rounded-full ${passwordStrength > item ? "bg-green-500" : "bg-slate-200"}`} />)}
                    <span className="text-xs font-bold text-slate-500">{["Weak", "Fair", "Good", "Strong"][Math.max(passwordStrength - 1, 0)]}</span>
                  </div>
                  <button onClick={changePassword} className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">Update Password</button>
                </Section>

                <Section title="Activity & Audit Logs" icon={FaHistory}>
                  {(profile?.activityLogs || []).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No account activity yet.</div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-400 dark:bg-slate-950">
                          <tr><th className="p-3">Activity</th><th className="p-3">Device / IP</th><th className="p-3">Date & Time</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {profile.activityLogs.map((log: any) => (
                            <tr key={log._id}>
                              <td className="p-3 font-semibold text-slate-700 dark:text-slate-200">{log.description}</td>
                              <td className="p-3 text-slate-500">{log.ipAddress || "-"}<br /><span className="text-xs">{log.device?.slice(0, 58) || "-"}</span></td>
                              <td className="p-3 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Section>
              </div>

              <div className="space-y-5">
                <Section title="Account Settings" icon={FaCheckCircle}>
                  <div className="space-y-3">
                    <input className={fieldClass} placeholder="Username" value={form.username || ""} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                    <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950"><b>Role:</b> {form.role}</div>
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950">
                      <span><b>Email:</b> {form.email}</span>
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                        Verified
                      </span>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950"><b>Created:</b> {new Date(form.createdAt).toLocaleDateString()}</div>
                    <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950"><b>Status:</b> {form.status}</div>
                  </div>
                </Section>

                <Section title="Security Settings" icon={FaShieldAlt}>
                  <div className="space-y-3">
                    <Toggle checked={!!form.twoFactorEnabled} label="Two-factor authentication" onChange={(value) => savePreferences({ twoFactorEnabled: value })} />
                    <select className={fieldClass} value={form.sessionTimeoutMinutes || 30} onChange={(e) => savePreferences({ sessionTimeoutMinutes: Number(e.target.value) })}>
                      <option value={15}>15 minute session timeout</option>
                      <option value={30}>30 minute session timeout</option>
                      <option value={60}>60 minute session timeout</option>
                    </select>
                    <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-950">
                      {(form.activeDevices || []).length ? `${form.activeDevices.length} active device(s)` : "No active devices recorded yet."}
                    </div>
                    <button onClick={() => setConfirmLogout(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600"><Icon as={FaSignOutAlt} /> Logout from all devices</button>
                  </div>
                </Section>

                <Section title="Notification Preferences" icon={FaBell}>
                  <div className="space-y-2">
                    {[
                      ["email", "Email notifications"],
                      ["sms", "SMS notifications"],
                      ["browser", "Browser notifications"],
                      ["followUpReminders", "Follow-up reminders"],
                      ["leadAssignments", "Lead assignment alerts"],
                      ["taskDeadlines", "Task deadline alerts"],
                    ].map(([key, label]) => (
                      <Toggle key={key} checked={!!form.notificationPreferences?.[key]} label={label} onChange={(value) => savePreferences({ notificationPreferences: { ...form.notificationPreferences, [key]: value } })} />
                    ))}
                  </div>
                </Section>

                <Section title="Appearance Preferences" icon={FaMoon}>
                  <div className="space-y-3">
                    <select className={fieldClass} value={form.appearancePreferences?.mode || "system"} onChange={(e) => savePreferences({ appearancePreferences: { ...form.appearancePreferences, mode: e.target.value } })}>
                      <option value="system">System mode</option>
                      <option value="light">Light mode</option>
                      <option value="dark">Dark mode</option>
                    </select>
                    <div className="grid grid-cols-5 gap-2">
                      {Object.entries(themeColors).map(([color, className]) => (
                        <button key={color} onClick={() => savePreferences({ appearancePreferences: { ...form.appearancePreferences, themeColor: color } })} className={`h-9 rounded-xl border-2 ${form.appearancePreferences?.themeColor === color ? "border-slate-950" : "border-transparent"} ${className}`} title={color} />
                      ))}
                    </div>
                    <select className={fieldClass} value={form.appearancePreferences?.dashboardLayout || "comfortable"} onChange={(e) => savePreferences({ appearancePreferences: { ...form.appearancePreferences, dashboardLayout: e.target.value } })}>
                      <option value="comfortable">Comfortable dashboard</option>
                      <option value="compact">Compact dashboard</option>
                    </select>
                    <Toggle checked={!!form.appearancePreferences?.sidebarCollapsed} label="Sidebar collapsed by default" onChange={(value) => savePreferences({ appearancePreferences: { ...form.appearancePreferences, sidebarCollapsed: value } })} />
                  </div>
                </Section>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[900] border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
        <div className="ml-[220px] flex justify-end gap-2">
          <button onClick={() => setForm(profile)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 dark:border-slate-700">Cancel</button>
          <button onClick={saveProfile} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Save Profile</button>
        </div>
      </div>

      {confirmLogout && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Logout from all devices?</h3>
            <p className="mt-2 text-sm text-slate-500">This will clear active device sessions and require users to login again.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmLogout(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">Cancel</button>
              <button onClick={logoutAll} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <button onClick={() => setToast("")} className="fixed bottom-20 right-5 z-[1300] rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-xl">
          {toast}
        </button>
      )}
    </div>
  );
};

export default ProfileSettings;
