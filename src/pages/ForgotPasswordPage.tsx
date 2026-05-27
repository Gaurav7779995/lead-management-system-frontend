import { ElementType, FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCheckCircle, FaEnvelope, FaExclamationCircle, FaSpinner } from "react-icons/fa";
import { forgotPassword } from "../api/auth.api";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ArrowLeftIcon = FaArrowLeft as ElementType;
const CheckCircleIcon = FaCheckCircle as ElementType;
const EnvelopeIcon = FaEnvelope as ElementType;
const ExclamationCircleIcon = FaExclamationCircle as ElementType;
const SpinnerIcon = FaSpinner as ElementType;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isValidEmail = useMemo(() => emailPattern.test(email.trim()), [email]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!isValidEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(email.trim().toLowerCase());
      setSuccess(true);
    } catch (err: any) {
      const message = err?.message || err?.error || "";
      if (message.toLowerCase().includes("no account")) {
        setSuccess(true);
        return;
      }
      setError(message || "Unable to send reset link. Please try again.");
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
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">PulseCRM Security</p>
              <h1 className="mt-4 text-4xl font-black leading-tight">Reset access without slowing down your team.</h1>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Enter your registered email and we will send a secure password reset link to your inbox.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Reset links expire quickly for account safety.
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600">
              <ArrowLeftIcon size={12} /> Back to login
            </Link>

            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">Forgot Password</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">Send reset link</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                If your email exists in our system, a password reset link has been sent.
              </p>
            </div>

            {success && (
              <div className="mt-6 flex gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
                <CheckCircleIcon className="mt-0.5 shrink-0" />
                <span>If your email exists in our system, a password reset link has been sent.</span>
              </div>
            )}

            {error && (
              <div className="mt-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                <ExclamationCircleIcon className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="mt-8 space-y-5">
              <label className="block text-sm font-bold text-slate-700">
                Email address
                <div className="relative mt-2">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="manager@company.com"
                    autoComplete="email"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading || !isValidEmail}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <SpinnerIcon className="animate-spin" />}
                {loading ? "Sending link..." : "Send reset link"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;
