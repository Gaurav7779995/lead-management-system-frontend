import { useContext, useState } from "react";
import type { ElementType, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { loginUser } from "../api/auth.api";
import { AuthContext } from "../components/context/AuthContext";
import InputField from "../molecules/InputField";
import Button from "../atoms/Button";
import logo from "../assets/images/1.jpeg";

const EyeIcon = FaEye as ElementType;
const EyeSlashIcon = FaEyeSlash as ElementType;

const LoginForm = () => {
  const navigate = useNavigate();
  const context = useContext(AuthContext);

  const [form, setForm] = useState({
    email: localStorage.getItem("rememberedEmail") || "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem("rememberedEmail"));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!context) return null;

  const { login } = context;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    const email = form.email.trim();
    const password = form.password.trim();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const data = await loginUser({
        email,
        password,
      });

      if (!data?.accessToken || !data?.user?.role) {
        throw new Error("Invalid response from server");
      }

      login(data);
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      console.log("Login successful. User role:", data.user.role);
      console.log("User data:", data.user);

      if (data.user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (data.user.role === "manager") {
        navigate("/manager/dashboard", { replace: true });
      } else if (data.user.role === "agent") {
        navigate("/agent/dashboard", { replace: true });
      } else {
        console.error("Unknown role:", data.user.role);
        navigate("/login", { replace: true });
      }
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      let friendlyMessage = serverMessage;

      if (status === 400 || status === 401) {
        friendlyMessage = "Incorrect email or password. Please try again.";
      } else if (status === 404) {
        friendlyMessage = "Login service was not found. Please check the API URL and try again.";
      } else if (status === 0 || err?.code === "ERR_NETWORK") {
        friendlyMessage = "Cannot reach the server. Please make sure the backend is running.";
      } else if (status >= 500) {
        friendlyMessage = "Server error while logging in. Please try again in a moment.";
      }

      setError(
        friendlyMessage ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-left">
        <img src={logo} alt="logo" className="logo" />
        <h1>Welcome Back</h1>
        <p>Manage your leads smartly</p>
        <p className="quote">
          "Success is built on consistent follow-ups and smart decisions."
        </p>
        <p>Stay organized, track every lead, and turn opportunities into results.</p>
        <p>Manage leads efficiently and grow faster.</p>
        <p>A smarter way to manage, track, and grow your business.</p>
      </div>

      <div className="login-right">
        <h2>Login</h2>

        {error && (
          <p className="error-text" role="alert" aria-live="polite">
            {error}
          </p>
        )}

        <form autoComplete="off" onSubmit={handleLogin}>
          <InputField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <div className="input-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              className="input"
              value={form.password}
              placeholder="Password"
              autoComplete="new-password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <label>Password</label>

            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </span>
          </div>

          <div className="auth-form-row">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
              />
              Remember me
            </label>
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </button>
          </div>

          <Button
            text={loading ? "Logging in..." : "Login"}
            type="submit"
            disabled={loading}
          />
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
