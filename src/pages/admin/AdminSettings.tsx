import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { AdminSettingsProvider, useAdminSettings } from "../../contexts/AdminSettingsContext";
import { adminSettingsService } from "../../services/adminSettingsService";
import {
  FaBell,
  FaBuilding,
  FaCloudDownloadAlt,
  FaDatabase,
  FaEye,
  FaEyeSlash,
  FaHistory,
  FaLock,
  FaProjectDiagram,
  FaSave,
  FaSearch,
  FaShieldAlt,
  FaUpload,
  FaUserCog,
  FaUserShield,
  FaUsers,
} from "react-icons/fa";

const sections = [
  ["profile", "Profile Settings", FaUserCog],
  ["company", "Company Settings", FaBuilding],
  ["roles", "User & Role Management", FaUsers],
  ["pipeline", "Lead Pipeline Settings", FaProjectDiagram],
  ["notifications", "Notification Settings", FaBell],
  ["security", "Security Settings", FaShieldAlt],
  ["data", "Data Management", FaDatabase],
  ["logs", "Activity Logs", FaHistory],
  ["backup", "Backup & Restore", FaCloudDownloadAlt],
] as const;

const Field = ({ label, children }: { label: string; children: any }) => (
  <label className="admin-settings-field">
    <span>{label}</span>
    {children}
  </label>
);

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button type="button" onClick={() => onChange(!checked)} className={`admin-settings-toggle ${checked ? "is-on" : ""}`}>
    <span />
  </button>
);

const TextInput = (props: any) => <input {...props} className="admin-settings-input" />;
const Card = ({ title, icon: Icon, children, actions }: any) => (
  <section className="admin-settings-card">
    <div className="admin-settings-card-header">
      <div className="admin-settings-card-title">
        <span><Icon /></span>
        <h2>{title}</h2>
      </div>
      {actions}
    </div>
    {children}
  </section>
);

const Skeleton = () => (
  <div className="admin-settings-skeleton-grid">
    {Array.from({ length: 8 }).map((_, i) => <div key={i} className="admin-settings-skeleton" />)}
  </div>
);

const ConfirmModal = ({ title, message, onConfirm, onCancel }: any) => (
  <div className="admin-settings-modal-backdrop">
    <div className="admin-settings-modal">
      <h3>{title}</h3>
      <p>{message}</p>
      <div>
        <button className="admin-settings-secondary" onClick={onCancel}>Cancel</button>
        <button className="admin-settings-danger" onClick={onConfirm}>Confirm</button>
      </div>
    </div>
  </div>
);

const Toast = () => {
  const { toast, clearToast } = useAdminSettings();
  if (!toast) return null;
  return <button className={`admin-settings-toast ${toast.type}`} onClick={clearToast}>{toast.message}</button>;
};

const SettingsContent = () => {
  const { data, loading, reload, notify } = useAdminSettings();
  const [active, setActive] = useState("profile");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<any>({});
  const [confirm, setConfirm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => {
    if (!data) return;
    const settings = data.settings || {};
    const company = settings.company || {};
    setForm({
      profile: data.profile || {},
      ...settings,
      company: {
        ...company,
        businessHours: !company.businessHours || company.businessHours === "10 to 19" ? "10 to 7" : company.businessHours,
      },
      adminDraft: { name: "", email: "", phone: "", password: "" },
      password: { currentPassword: "", newPassword: "" },
    });
  }, [data]);

  const filteredSections = useMemo(() => sections.filter(([, label]) => label.toLowerCase().includes(query.toLowerCase())), [query]);
  const setSection = (key: string, patch: any) => setForm((prev: any) => ({ ...prev, [key]: { ...(prev[key] || {}), ...patch } }));

  const saveSection = async (key: string) => {
    try {
      setSaving(true);
      if (key === "profile") await adminSettingsService.updateProfile(form.profile);
      else await adminSettingsService.updateSection(key, form[key] || {});
      notify("success", "Settings saved");
      await reload();
    } catch (error: any) {
      notify("error", error?.response?.data?.message || "Unable to save settings");
    } finally {
      setSaving(false);
    }
  };

  const createAdmin = async () => {
    if (!form.adminDraft?.name || !form.adminDraft?.email || !form.adminDraft?.phone || !form.adminDraft?.password) {
      return notify("error", "Admin name, email, phone and password are required");
    }

    await adminSettingsService.createAdmin({
      name: form.adminDraft.name.trim(),
      email: form.adminDraft.email.trim(),
      phone: form.adminDraft.phone.trim(),
      password: form.adminDraft.password,
    });
    notify("success", "Admin created");
    setSection("adminDraft", { name: "", email: "", phone: "", password: "" });
    reload();
  };

  const getPipelineStageName = (stage: any) => stage?.name || stage?.stageName || stage?.title || stage?.status || "Pipeline Stage";
  const getPipelinePercent = (value: any) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    const percentage = numeric > 0 && numeric <= 1 ? numeric * 100 : numeric;
    return Math.max(0, Math.min(100, Math.round(percentage)));
  };

  const renderProfile = () => (
    <div className="admin-settings-grid">
      <Card title="Admin Profile" icon={FaUserShield} actions={<button onClick={() => saveSection("profile")} className="admin-settings-primary"><FaSave /> Save</button>}>
        <div className="admin-settings-profile-row">
          <div className="admin-settings-avatar">{(form.profile?.name || "A").slice(0, 2).toUpperCase()}</div>
          <Field label="Photo Upload"><input type="file" onChange={async (e) => {
            const file = e.target.files?.[0]; if (!file) return;
            const res = await adminSettingsService.uploadAsset(file);
            setSection("profile", { profilePhoto: res.data.fileUrl });
            notify("success", "Photo uploaded");
          }} /></Field>
        </div>
        <div className="admin-settings-form-grid">
          <Field label="Name"><TextInput value={form.profile?.name || ""} onChange={(e: any) => setSection("profile", { name: e.target.value })} /></Field>
          <Field label="Email"><TextInput value={form.profile?.email || ""} onChange={(e: any) => setSection("profile", { email: e.target.value })} /></Field>
          <Field label="Mobile Number"><TextInput value={form.profile?.phone || ""} onChange={(e: any) => setSection("profile", { phone: e.target.value })} /></Field>
          <Field label="Designation"><TextInput value={form.profile?.designation || ""} onChange={(e: any) => setSection("profile", { designation: e.target.value })} /></Field>
        </div>
        <div className="admin-settings-row"><span>Two-factor authentication</span><Toggle checked={!!form.profile?.twoFactorEnabled} onChange={(v) => setSection("profile", { twoFactorEnabled: v })} /></div>
      </Card>
      <Card title="Password & Sessions" icon={FaLock} actions={<button onClick={async () => {
        await adminSettingsService.changePassword(form.password);
        notify("success", "Password changed");
        setSection("password", { currentPassword: "", newPassword: "" });
      }} className="admin-settings-primary">Change</button>}>
        <div className="admin-settings-form-grid">
          <Field label="Current Password">
            <div className="admin-settings-password-wrap">
              <TextInput type={showCurrentPassword ? "text" : "password"} value={form.password?.currentPassword || ""} onChange={(e: any) => setSection("password", { currentPassword: e.target.value })} />
              <button type="button" aria-label={showCurrentPassword ? "Hide current password" : "Show current password"} onClick={() => setShowCurrentPassword((value) => !value)}>
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </Field>
          <Field label="New Password">
            <div className="admin-settings-password-wrap">
              <TextInput type={showNewPassword ? "text" : "password"} value={form.password?.newPassword || ""} onChange={(e: any) => setSection("password", { newPassword: e.target.value })} />
              <button type="button" aria-label={showNewPassword ? "Hide new password" : "Show new password"} onClick={() => setShowNewPassword((value) => !value)}>
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </Field>
        </div>
        <div className="admin-settings-meta-grid">
          <span>Last login: {data?.profile?.lastLoginAt ? new Date(data.profile.lastLoginAt).toLocaleString() : "No recent login"}</span>
          <span>Devices: {data?.profile?.activeDevices?.length || 0}</span>
        </div>
      </Card>
    </div>
  );

  const renderCompany = () => (
    <Card title="Company Settings" icon={FaBuilding} actions={<button onClick={() => saveSection("company")} className="admin-settings-primary"><FaSave /> Save</button>}>
      <div className="admin-settings-form-grid three">
        {["companyName", "gstNumber", "website", "supportEmail", "timezone", "currency", "businessHours"].map((key) => (
          <Field key={key} label={key.replace(/([A-Z])/g, " $1")}><TextInput value={form.company?.[key] || ""} onChange={(e: any) => setSection("company", { [key]: e.target.value })} /></Field>
        ))}
        <Field label="Address"><TextInput value={form.company?.address || ""} onChange={(e: any) => setSection("company", { address: e.target.value })} /></Field>
      </div>
      <div className="admin-settings-preview">Preview: {form.company?.companyName || "Company"} CRM Workspace</div>
    </Card>
  );

  const renderRoles = () => (
    <div className="admin-settings-grid admin-settings-single-grid">
      <Card title="Create Admin" icon={FaUserShield}>
        <div className="admin-settings-form-grid">
          <Field label="Admin Name"><TextInput value={form.adminDraft?.name || ""} onChange={(e: any) => setSection("adminDraft", { name: e.target.value })} /></Field>
          <Field label="Admin Email"><TextInput type="email" value={form.adminDraft?.email || ""} onChange={(e: any) => setSection("adminDraft", { email: e.target.value })} /></Field>
          <Field label="Phone"><TextInput value={form.adminDraft?.phone || ""} onChange={(e: any) => setSection("adminDraft", { phone: e.target.value })} /></Field>
          <Field label="Password">
            <div className="admin-settings-password-wrap">
              <TextInput type={showAdminPassword ? "text" : "password"} value={form.adminDraft?.password || ""} onChange={(e: any) => setSection("adminDraft", { password: e.target.value })} />
              <button type="button" aria-label={showAdminPassword ? "Hide admin password" : "Show admin password"} onClick={() => setShowAdminPassword((value) => !value)}>
                {showAdminPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </Field>
        </div>
        <button type="button" onClick={createAdmin} className="admin-settings-primary admin-settings-full-action">Create Admin</button>
      </Card>
    </div>
  );

  const renderPipeline = () => {
    const stages = data?.pipelines || [];

    return (
      <Card title="Lead Pipeline Settings" icon={FaProjectDiagram}>
        {stages.length ? (
          <div className="admin-settings-pipeline">
            {stages.map((stage: any, index: number) => {
              const percentage = getPipelinePercent(stage.actualPercentage ?? stage.percentage ?? stage.progress ?? stage.probability);
              const color = stage.color || "#3db0a6";

              return (
                <div className="admin-settings-pipeline-stage" key={stage._id || stage.id || `${getPipelineStageName(stage)}-${index}`}>
                  <div className="admin-settings-pipeline-stage-head">
                    <span style={{ background: color }} />
                    <strong>{getPipelineStageName(stage)}</strong>
                    <b>{percentage}%</b>
                  </div>
                  <small>{stage.leadCount || 0} leads</small>
                  <div className="admin-settings-pipeline-progress">
                    <i style={{ width: `${percentage}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="admin-settings-empty">No pipeline data found.</div>
        )}
      </Card>
    );
  };

  const renderSwitchSection = (key: string, title: string, icon: any, items: string[], sectionKey = key) => (
    <Card title={title} icon={icon} actions={<button onClick={() => saveSection(sectionKey)} className="admin-settings-primary"><FaSave /> Save</button>}>
      <div className="admin-settings-switch-grid">{items.map((item) => <div key={item} className="admin-settings-row"><span>{item}</span><Toggle checked={!!form[sectionKey]?.[item]} onChange={(v) => setSection(sectionKey, { [item]: v })} /></div>)}</div>
    </Card>
  );

  const renderData = () => (
    <Card title="Data Management" icon={FaDatabase} actions={<button onClick={() => adminSettingsService.exportData().then(() => notify("success", "Export prepared"))} className="admin-settings-primary">Export</button>}>
      <label className="admin-settings-drop"><FaUpload /> Drop CSV here or click to import<input type="file" accept=".csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) adminSettingsService.importCsv(f).then(() => { notify("success", "Import queued"); reload(); }); }} /></label>
      <div className="admin-settings-table-wrap"><table><thead><tr><th>File</th><th>Status</th><th>Date</th></tr></thead><tbody>{(form.data?.importHistory || []).map((row: any, i: number) => <tr key={i}><td>{row.fileName}</td><td>{row.status}</td><td>{new Date(row.date).toLocaleString()}</td></tr>)}</tbody></table></div>
    </Card>
  );

  const renderLogs = () => (
    <Card title="Activity Logs" icon={FaHistory}>
      <div className="admin-settings-table-wrap"><table><thead><tr><th>Action</th><th>User</th><th>IP</th><th>Date</th></tr></thead><tbody>{(data?.logs || []).map((log: any) => <tr key={log._id}><td>{log.message || log.action}</td><td>{log.actor?.name || "System"}</td><td>{log.ipAddress || "-"}</td><td>{new Date(log.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>
    </Card>
  );

  const renderBackup = () => (
    <Card title="Backup & Restore" icon={FaCloudDownloadAlt} actions={<button onClick={() => adminSettingsService.createBackup({ name: "Manual backup" }).then(() => { notify("success", "Backup queued"); reload(); })} className="admin-settings-primary">Manual Backup</button>}>
      <div className="admin-settings-table-wrap"><table><thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Date</th></tr></thead><tbody>{(data?.backups || []).map((b: any) => <tr key={b._id}><td>{b.name}</td><td>{b.type}</td><td>{b.status}</td><td>{new Date(b.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>
    </Card>
  );

  const renderActive = () => {
    if (loading || !data) return <Skeleton />;
    if (active === "profile") return renderProfile();
    if (active === "company") return renderCompany();
    if (active === "roles") return renderRoles();
    if (active === "pipeline") return renderPipeline();
    if (active === "notifications") return renderSwitchSection("notifications", "Notification Settings", FaBell, ["email", "browser", "sms", "whatsapp", "sound"]);
    if (active === "security") return <Card title="Security Settings" icon={FaShieldAlt} actions={<button onClick={() => saveSection("security")} className="admin-settings-primary">Save</button>}><div className="admin-settings-form-grid three">{["sessionTimeoutMinutes", "minPasswordLength", "ipWhitelist", "loginAttemptLimit"].map((key) => <Field key={key} label={key.replace(/([A-Z])/g, " $1")}><TextInput value={form.security?.[key] || ""} onChange={(e: any) => setSection("security", { [key]: e.target.value })} /></Field>)}</div></Card>;
    if (active === "data") return renderData();
    if (active === "logs") return renderLogs();
    if (active === "backup") return renderBackup();
    return renderProfile();
  };

  return (
    <AdminLayout>
      <div className="admin-settings-page">
        <Toast />
        {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}
        <header className="admin-settings-hero">
          <div><p>Enterprise Control Center</p><h1>Admin Settings</h1><span>Configure profile, company, users, roles, pipeline, notifications, security, data, activity logs and backup preferences.</span></div>
          <div className="admin-settings-health"><b>{data?.health?.api || "..."}</b><small>System Health</small></div>
        </header>
        <div className="admin-settings-shell">
          <aside className="admin-settings-nav">
            <div className="admin-settings-search"><FaSearch /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search settings..." /></div>
            {filteredSections.map(([key, label, Icon]) => <button key={key} className={active === key ? "active" : ""} onClick={() => setActive(key)}><Icon /><span>{label}</span></button>)}
          </aside>
          <main className="admin-settings-main">
            <div className="admin-settings-main-head"><div><p>Settings Area</p><h2>{sections.find(([key]) => key === active)?.[1]}</h2></div>{saving && <span>Saving...</span>}</div>
            {renderActive()}
          </main>
        </div>
      </div>
    </AdminLayout>
  );
};

const AdminSettings = () => (
  <AdminSettingsProvider>
    <SettingsContent />
  </AdminSettingsProvider>
);

export default AdminSettings;
