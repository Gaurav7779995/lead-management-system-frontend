import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import InputField from "../../molecules/InputField";
import Button from "../../atoms/Button";
import Select from "../../atoms/Select";

import logo from "../assets/images/1.jpeg";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { loginUser } from "../../api/auth.api"; // ✅ API

const LoginPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "agent",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ HANDLE LOGIN
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.email || !form.password || !form.role) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser(form);

      // ✅ store token
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // ✅ role-based navigation
      if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.role === "manager") {
        navigate("/manager/dashboard");
      } else {
        navigate("/agent/dashboard");
      }

    } catch (err: any) {
      alert(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      {/* LEFT SIDE */}
      <div className="login-left">
        <img src={logo} alt="logo" className="logo" />
        <h1>Welcome Back</h1>
        <p>Manage your leads smartly</p>

        <p className="quote">
          "Success is built on consistent follow-ups and smart decisions."
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">
        <h2>Login</h2>

        {/* ✅ IMPORTANT: onSubmit */}
        <form onSubmit={handleLogin} autoComplete="off">

          {/* EMAIL */}
          <InputField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          {/* PASSWORD */}
          <div className="input-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              className="input"
              value={form.password}
              placeholder="password"
              autoComplete="new-password"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, password: e.target.value })
              }
            />
            <label>Password</label>

            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* ROLE */}
          <div className="input-group">
            <Select
              value={form.role}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                setForm({ ...form, role: e.target.value })
              }
            />
          </div>

          {/* ✅ BUTTON (type submit IMPORTANT) */}
          <Button
            text={loading ? "Logging in..." : "Login"}
            type="submit"
          />

          <p className="forgot-password">Forgot Password?</p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;










// import { useState } from "react";
// import "./Login.css";

// const Login = () => {
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//     role: "agent",
//   });

//   return (
//     <div className="login-wrapper">
//       <div className="login-card">
//         {/* LEFT SIDE */}
//         <div className="login-left">
//           <h1>Welcome Back 👋</h1>
//           <p>Login to manage your leads efficiently</p>
//         </div>

//         {/* RIGHT SIDE */}
//         <div className="login-right">
//           <h2>Login</h2>

//           <form>
//             <div className="input-group">
//               <input
//                 type="email"
//                 value={form.email}
//                 placeholder="Email"
//                 required
//                 onChange={(e) =>
//                   setForm({ ...form, email: e.target.value })
//                 }
//               />
//               <label>Email</label>
//             </div>

//             <div className="input-group">
//               <input
//                 type="password"
//                 value={form.password}
//                 placeholder="Password"
//                 required
//                 onChange={(e) =>
//                   setForm({ ...form, password: e.target.value })
//                 }
//               />
//               <label>Password</label>
//             </div>

//             {/* ROLE SELECT */}
//             <div className="input-group">
//               <select
//                 value={form.role}
//                 title="Select your role"
//                 onChange={(e) =>
//                   setForm({ ...form, role: e.target.value })
//                 }
//               >
//                 <option value="admin">Admin</option>
//                 <option value="manager">Manager</option>
//                 <option value="agent">Agent</option>
//               </select>
//             </div>

//             <button type="submit">Login</button>
//           </form>

//           <p className="footer-text">
//             Don’t have an account? <span>Register</span>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;