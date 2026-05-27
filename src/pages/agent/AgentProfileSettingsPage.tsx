import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Camera,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import "../../assets/styles/Dashboard.css";
import {
  getProfileSettings,
  logoutAllProfileDevices,
  removeProfilePhoto,
  updateProfilePassword,
  updateProfilePreferences,
  updateProfileSettings,
  uploadProfilePhoto,
} from "../../services/profileSettingsService";

const apiRoot = (process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

const fieldClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950";

const Toggle = ({ checked, onChange, label, hint }: any) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left transition hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-900/60 dark:hover:bg-blue-950/30"
  >
    <span>
      <span className="block text-sm font-black text-slate-800 dark:text-white">{label}</span>
      <span className="mt-0.5 block text-xs font-medium text-slate-500 dark:text-slate-400">{hint}</span>
    </span>
    <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} />
    </span>
  </button>
);

const Card = ({ icon: Icon, title, children, accent = "from-blue-500 to-cyan-400" }: any) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -3 }}
    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
  >
    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-blue-600 dark:bg-slate-950">
        <Icon size={18} />
      </span>
      <h2 className="text-base font-black text-slate-900 dark:text-white">{title}</h2>
    </div>
    {children}
  </motion.section>
);

const PasswordInput = ({ placeholder, value, onChange, visible, onToggle }: any) => (
  <label className="block">
    <span className="mb-1 block text-xs font-black uppercase text-slate-400">{placeholder}</span>
    <span className="relative block">
      <input
        type={visible ? "text" : "password"}
        className={`agent-password-input ${fieldClass} pr-11`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
        title={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </span>
  </label>
);

const AgentProfileSettingsPage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [photoPreview, setPhotoPreview] = useState("");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const notify = (type: "success" | "error", text: string) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 3200);
  };

  const photoUrl = useMemo(() => {
    const photo = photoPreview || profile?.profilePhoto || form.profilePhoto;
    if (!photo) return "";
    if (String(photo).startsWith("blob:")) return photo;
    const src = String(photo).startsWith("http") ? photo : `${apiRoot}${photo}`;
    return `${src}${src.includes("?") ? "&" : "?"}v=${profile?.updatedAt || Date.now()}`;
  }, [photoPreview, profile?.profilePhoto, profile?.updatedAt, form.profilePhoto]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getProfileSettings();
      const data = res?.data || {};
      setProfile(data);
      setForm({
        name: data.name || "",
        email: data.email || "",
        currentEmail: data.email || "",
        phone: data.phone || "",
        username: data.username || "",
        designation: data.designation || "Agent",
        role: data.role || "agent",
        profilePhoto: data.profilePhoto || "",
        bio: data.bio || "",
        notificationPreferences: {
          email: true,
          browser: true,
          followUpReminders: true,
          taskDeadlines: true,
          leadAssignments: true,
          ...(data.notificationPreferences || {}),
        },
        appearancePreferences: {
          mode: "system",
          themeColor: "blue",
          dashboardLayout: "comfortable",
          sidebarCollapsed: false,
          ...(data.appearancePreferences || {}),
        },
        twoFactorEnabled: Boolean(data.twoFactorEnabled),
        sessionTimeoutMinutes: data.sessionTimeoutMinutes || 30,
      });
    } catch (error: any) {
      notify("error", error?.response?.data?.message || "Profile settings API is not available.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const patchForm = (key: string, value: any) => setForm((prev: any) => ({ ...prev, [key]: value }));
  const patchNested = (group: string, key: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [group]: { ...(prev[group] || {}), [key]: value } }));

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await updateProfileSettings({
        name: form.name,
        email: form.email,
        currentEmail: form.currentEmail,
        phone: form.phone,
        username: form.username,
        designation: form.designation,
        bio: form.bio,
      });
      setProfile(res.data);
      setForm((prev: any) => ({ ...prev, ...(res.data || {}), currentEmail: res.data?.email || prev.currentEmail }));
      notify("success", "Profile updated successfully");
    } catch (error: any) {
      notify("error", error?.response?.data?.message || "Unable to update profile");
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const res = await updateProfilePreferences({
        notificationPreferences: form.notificationPreferences,
        appearancePreferences: form.appearancePreferences,
        twoFactorEnabled: form.twoFactorEnabled,
        sessionTimeoutMinutes: Number(form.sessionTimeoutMinutes) || 30,
      });
      setProfile(res.data);
      setForm((prev: any) => ({
        ...prev,
        notificationPreferences: res.data?.notificationPreferences || prev.notificationPreferences,
        appearancePreferences: res.data?.appearancePreferences || prev.appearancePreferences,
        twoFactorEnabled: Boolean(res.data?.twoFactorEnabled),
        sessionTimeoutMinutes: res.data?.sessionTimeoutMinutes || prev.sessionTimeoutMinutes,
      }));
      notify("success", "Settings saved");
    } catch (error: any) {
      notify("error", error?.response?.data?.message || "Unable to save settings");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!password.currentPassword || !password.newPassword || !password.confirmPassword) {
      notify("error", "Please fill all password fields");
      return;
    }
    setSaving(true);
    try {
      await updateProfilePassword(password);
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      notify("success", "Password changed successfully");
    } catch (error: any) {
      notify("error", error?.response?.data?.message || "Unable to change password");
    } finally {
      setSaving(false);
    }
  };

  const onPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
    try {
      const res = await uploadProfilePhoto(file);
      setProfile(res.data);
      setForm((prev: any) => ({ ...prev, profilePhoto: res.data?.profilePhoto || prev.profilePhoto }));
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...storedUser, profilePhoto: res.data?.profilePhoto || "" }));
      setPhotoPreview("");
      notify("success", "Profile photo updated");
    } catch (error: any) {
      setPhotoPreview("");
      notify("error", error?.response?.data?.message || "Unable to upload photo");
    } finally {
      event.target.value = "";
    }
  };

  const removePhoto = async () => {
    try {
      const res = await removeProfilePhoto();
      setProfile(res.data);
      setForm((prev: any) => ({ ...prev, profilePhoto: "" }));
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...storedUser, profilePhoto: "" }));
      setPhotoPreview("");
      notify("success", "Profile photo removed");
    } catch (error: any) {
      notify("error", error?.response?.data?.message || "Unable to remove photo");
    }
  };

  const logoutDevices = async () => {
    try {
      await logoutAllProfileDevices();
      notify("success", "Other sessions cleared");
    } catch (error: any) {
      notify("error", error?.response?.data?.message || "Unable to clear sessions");
    }
  };

  return (
    <div className="dashboard agent-dashboard-shell overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="main-content min-w-0 overflow-x-hidden">
        <Navbar />
        <main className="dashboard-content agent-dashboard-theme min-w-0 max-w-full overflow-x-hidden">
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`fixed right-5 top-20 z-[1400] rounded-2xl px-4 py-3 text-sm font-black shadow-2xl ${
                notice.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
              }`}
            >
              {notice.text}
            </motion.div>
          )}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-lg dark:border-blue-500/20 dark:bg-slate-900"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(37,99,235,0.16),transparent_34%),radial-gradient(circle_at_90%_0%,rgba(20,184,166,0.13),transparent_30%)]" />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-lg font-black text-white shadow-xl">
                    {photoUrl ? <img src={photoUrl} alt={form.name} className="h-full w-full object-cover" /> : (form.name || "A").slice(0, 2).toUpperCase()}
                  </div>
                  <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg transition hover:scale-105 dark:bg-blue-600" title="Upload profile photo">
                    <Camera size={14} />
                    <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
                  </label>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-500">Agent Profile Center</p>
                  <h1 className="break-words text-xl font-black text-slate-950 dark:text-white md:text-2xl">{form.name || "Profile & Settings"}</h1>
                  <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-300">Update profile, security, reminders, and notifications.</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:min-w-[330px]">
                {[
                  ["Complete", `${profile?.profileCompletion || 0}%`],
                  ["Role", String(profile?.role || form.role || "agent").replace(/\b\w/g, (c) => c.toUpperCase())],
                  ["Verified", profile?.emailVerified ? "Yes" : "No"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-white/70 p-2.5 dark:border-slate-700 dark:bg-slate-950/50">
                    <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
                    <b className="block truncate text-base text-slate-900 dark:text-white">{value}</b>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-900">Loading profile settings...</div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <Card icon={UserRound} title="Profile Information">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label><span className="mb-1 block text-xs font-black uppercase text-slate-400">Full Name</span><input className={fieldClass} placeholder="Full name" value={form.name || ""} onChange={(e) => patchForm("name", e.target.value)} /></label>
                    <label><span className="mb-1 block text-xs font-black uppercase text-slate-400">Username</span><input className={fieldClass} placeholder="Username" value={form.username || ""} onChange={(e) => patchForm("username", e.target.value)} /></label>
                    <label><span className="mb-1 block text-xs font-black uppercase text-slate-400">Email Address</span><input className={fieldClass} placeholder="Email address" value={form.email || ""} onChange={(e) => patchForm("email", e.target.value)} /></label>
                    <label><span className="mb-1 block text-xs font-black uppercase text-slate-400">Phone Number</span><input className={fieldClass} placeholder="Phone number" value={form.phone || ""} onChange={(e) => patchForm("phone", e.target.value)} /></label>
                    <label><span className="mb-1 block text-xs font-black uppercase text-slate-400">Role</span><input className={`${fieldClass} bg-slate-100 text-slate-500 dark:bg-slate-900`} value={String(form.role || "agent").replace(/\b\w/g, (c) => c.toUpperCase())} readOnly /></label>
                    <label><span className="mb-1 block text-xs font-black uppercase text-slate-400">Designation</span><input className={fieldClass} placeholder="Designation" value={form.designation || ""} onChange={(e) => patchForm("designation", e.target.value)} /></label>
                    <div className="flex gap-2">
                      <button onClick={saveProfile} disabled={saving} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 disabled:opacity-60">
                        <Save size={16} /> Save Profile
                      </button>
                      {photoUrl && <button onClick={removePhoto} className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:-translate-y-0.5" title="Remove photo"><Trash2 size={16} /></button>}
                    </div>
                    <label className="md:col-span-2"><span className="mb-1 block text-xs font-black uppercase text-slate-400">Short Bio</span><textarea className={`${fieldClass} min-h-[110px] py-3`} placeholder="Short bio" value={form.bio || ""} onChange={(e) => patchForm("bio", e.target.value)} /></label>
                  </div>
                </Card>

                <Card icon={Bell} title="Notification & Reminder Settings" accent="from-cyan-500 to-emerald-400">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Toggle checked={form.notificationPreferences?.email} onChange={(v: boolean) => patchNested("notificationPreferences", "email", v)} label="Email notifications" hint="Receive lead, task and report alerts by email." />
                    <Toggle checked={form.notificationPreferences?.browser} onChange={(v: boolean) => patchNested("notificationPreferences", "browser", v)} label="Browser notifications" hint="Show CRM alerts while dashboard is open." />
                    <Toggle checked={form.notificationPreferences?.followUpReminders} onChange={(v: boolean) => patchNested("notificationPreferences", "followUpReminders", v)} label="Followup reminders" hint="Notify before upcoming calls, meetings and emails." />
                    <Toggle checked={form.notificationPreferences?.taskDeadlines} onChange={(v: boolean) => patchNested("notificationPreferences", "taskDeadlines", v)} label="Task deadline alerts" hint="Remind when assigned work is near due date." />
                    <Toggle checked={form.notificationPreferences?.leadAssignments} onChange={(v: boolean) => patchNested("notificationPreferences", "leadAssignments", v)} label="New lead assignment" hint="Alert when a manager assigns a new lead." />
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                      <label className="text-xs font-black uppercase text-slate-400">Session reminder timeout</label>
                      <select className={`${fieldClass} mt-2`} value={form.sessionTimeoutMinutes} onChange={(e) => patchForm("sessionTimeoutMinutes", e.target.value)}>
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                      </select>
                    </div>
                    <button onClick={savePreferences} disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:opacity-60 md:col-span-2">
                      <CheckCircle2 size={16} /> Save Settings
                    </button>
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <Card icon={KeyRound} title="Change Password" accent="from-amber-500 to-orange-400">
                  <div className="grid gap-3">
                    <PasswordInput placeholder="Current Password" value={password.currentPassword} visible={Boolean(showPassword.currentPassword)} onToggle={() => setShowPassword((prev) => ({ ...prev, currentPassword: !prev.currentPassword }))} onChange={(e: any) => setPassword((prev) => ({ ...prev, currentPassword: e.target.value }))} />
                    <PasswordInput placeholder="New Password" value={password.newPassword} visible={Boolean(showPassword.newPassword)} onToggle={() => setShowPassword((prev) => ({ ...prev, newPassword: !prev.newPassword }))} onChange={(e: any) => setPassword((prev) => ({ ...prev, newPassword: e.target.value }))} />
                    <PasswordInput placeholder="Confirm New Password" value={password.confirmPassword} visible={Boolean(showPassword.confirmPassword)} onToggle={() => setShowPassword((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))} onChange={(e: any) => setPassword((prev) => ({ ...prev, confirmPassword: e.target.value }))} />
                    <button onClick={changePassword} disabled={saving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:opacity-60">
                      <Lock size={16} /> Update Password
                    </button>
                  </div>
                </Card>

                <Card icon={ShieldCheck} title="Security Settings" accent="from-emerald-500 to-teal-400">
                  <div className="space-y-3">
                    <Toggle checked={form.twoFactorEnabled} onChange={(v: boolean) => patchForm("twoFactorEnabled", v)} label="Two-factor security" hint="Keep an extra verification layer on this account." />
                    <button onClick={logoutDevices} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                      <ShieldCheck size={16} /> Logout All Devices
                    </button>
                  </div>
                </Card>

                <Card icon={Clock} title="Recent Activity" accent="from-slate-500 to-blue-400">
                  <div className="space-y-2">
                    {(profile?.activityLogs || []).slice(0, 4).map((log: any) => (
                      <div key={log._id} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                        <p className="text-sm font-black text-slate-800 dark:text-white">{log.description || log.action}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{log.createdAt ? new Date(log.createdAt).toLocaleString("en-IN") : ""}</p>
                      </div>
                    ))}
                    {!(profile?.activityLogs || []).length && <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm font-semibold text-slate-500 dark:border-slate-700">No recent activity yet.</div>}
                  </div>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AgentProfileSettingsPage;
