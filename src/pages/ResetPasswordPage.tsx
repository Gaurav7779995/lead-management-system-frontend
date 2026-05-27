import { ElementType, FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaEye, FaEyeSlash, FaLock, FaShieldAlt, FaSpinner, FaTimesCircle } from "react-icons/fa";
import { resetPassword } from "../api/auth.api";

const rules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "Uppercase and lowercase letters", test: (value: string) => /[A-Z]/.test(value) && /[a-z]/.test(value) },
  { label: "At least one number", test: (value: string) => /\d/.test(value) },
  { label: "At least one special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];
const ArrowLeftIcon = FaArrowLeft as ElementType;
const CheckCircleIcon = FaCheckCircle as ElementType;
const EyeIcon = FaEye as ElementType;
const EyeSlashIcon = FaEyeSlash as ElementType;
const LockIcon = FaLock as ElementType;
const ShieldIcon = FaShieldAlt as ElementType;
const SpinnerIcon = FaSpinner as ElementType;
const TimesCircleIcon = FaTimesCircle as ElementType;

const ResetPasswordPage = () => {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passedRules = useMemo(() => rules.filter((rule) => rule.test(form.newPassword)).length, [form.newPassword]);
  const passwordsMatch = form.confirmPassword.length > 0 && form.newPassword === form.confirmPassword;
  const canSubmit = token && passedRules === rules.length && passwordsMatch && !loading;
  const strengthLabel = ["Weak", "Fair", "Good", "Strong"][Math.max(passedRules - 1, 0)] || "Weak";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Reset token is missing. Please use the link from your email.");
      return;
    }
    if (passedRules !== rules.length) {
      setError("Please create a stronger password before continuing.");
      return;
    }
    if (!passwordsMatch) {
      setError("Confirm password must match the new password.");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, form);
      setSuccess("Password reset successful. Redirecting to login...");
      window.setTimeout(() => navigate("/login", { replace: true }), 1400);
    } catch (err: any) {
      setError(err?.message || err?.error || "Invalid or expired reset link. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl md:grid-cols-[0.9fr_1.1fr]">
          <div className="hidden bg-slate-950 p-10 text-white md:flex md:flex-col md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">Secure Reset</p>
              <h1 className="mt-4 text-4xl font-black leading-tight">Create a strong password for your CRM account.</h1>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Your new password is sent securely to the backend and stored using the existing protected reset flow.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Use a mix of letters, numbers, and symbols for better protection.
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600">
              <ArrowLeftIcon size={12} /> Back to login
            </Link>

            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Reset Password</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Set new password</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                Enter and confirm your new password. Expired or invalid links will be rejected securely.
              </p>
            </div>

            {success && (
              <div className="mt-6 flex gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
                <CheckCircleIcon className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="mt-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                <TimesCircleIcon className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="mt-8 space-y-5">
              {[
                ["newPassword", "New password"],
                ["confirmPassword", "Confirm password"],
              ].map(([key, label]) => (
                <label key={key} className="block text-sm font-bold text-slate-700">
                  {label}
                  <div className="relative mt-2">
                    <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={(form as any)[key]}
                      onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                      placeholder={label}
                      autoComplete="new-password"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </label>
              ))}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-700">
                    <ShieldIcon className="text-blue-600" /> Password strength
                  </span>
                  <span className="text-xs font-black uppercase text-blue-600">{strengthLabel}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((item) => (
                    <span key={item} className={`h-2 rounded-full ${passedRules > item ? "bg-blue-600" : "bg-slate-200"}`} />
                  ))}
                </div>
                <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-500 sm:grid-cols-2">
                  {rules.map((rule) => (
                    <span key={rule.label} className={rule.test(form.newPassword) ? "text-green-600" : ""}>
                      {rule.test(form.newPassword) ? "✓" : "•"} {rule.label}
                    </span>
                  ))}
                  <span className={passwordsMatch ? "text-green-600" : ""}>
                    {passwordsMatch ? "✓" : "•"} Confirm password matches
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <SpinnerIcon className="animate-spin" />}
                {loading ? "Updating password..." : "Reset password"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ResetPasswordPage;
