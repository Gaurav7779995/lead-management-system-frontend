import { useState } from "react";
import InputField from "../molecules/InputField.tsx";
import Button from "../atoms/Button.tsx";
import Select from "../atoms/Select.tsx";
import logo from "../assets/images/1.jpeg";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginForm = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "agent",
  });

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-card">
      {/* LEFT SIDE */}
      <div className="login-left">
        <img src={logo} alt="logo" className="logo" />
        <h1>Welcome Back</h1>
        <p>Manage your leads smartly</p>

        {/* ✨ QUOTE */}
        <p className="quote">
          "Success is built on consistent follow-ups and smart decisions."
        </p>
        <p className="sub-quote">
          Stay organized, track every lead, and turn opportunities into results.
        </p>
        <p className="sub-quote">
          Manage leads efficiently and grow faster.
        </p>
        <p className="sub-quote">
          A smarter way to manage, track, and grow your business.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">
        <h2>Login</h2>

        <form autoComplete="off">
          <InputField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          {/* PASSWORD WITH TOGGLE */}
          <div className="input-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              className="input"
              value={form.password}
              placeholder="password"
              title="Enter your password"
              autoComplete="new-password"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
            <label>Password</label>

            {/* 👁 TOGGLE BUTTON */}
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="input-group">
            <Select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
              }
            />
          </div>

          <Button text="Login" />

          {/* 🔐 FORGOT PASSWORD */}
          <p className="forgot-password">Forgot Password?</p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;

// import { useState } from "react";
// import InputField from "../molecules/InputField.tsx";
// import Button from "../atoms/Button.tsx";
// import Select from "../atoms/Select.tsx";
// import logo from "../assets/images/1.jpeg";

// const LoginForm = () => {
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//     role: "agent",
//   });

//   return (
//     <div className="login-card">
//       {/* LEFT SIDE */}
//       <div className="login-left">
//         <img src={logo} alt="logo" className="logo" />
//         <h1>Welcome Back</h1>
//         <p>Manage your leads smartly</p>
//       </div>

//       {/* RIGHT SIDE */}
//       <div className="login-right">
//         <h2>Login</h2>

//         <form>
//           <InputField
//             label="Email"
//             type="email"
//             value={form.email}
//             onChange={(e) =>
//               setForm({ ...form, email: e.target.value })
//             }
//           />

//           <InputField
//             label="Password"
//             type="password"
//             value={form.password}
//             onChange={(e) =>
//               setForm({ ...form, password: e.target.value })
//             }
//           />

//           <div className="input-group">
//             <Select
//               value={form.role}
//               onChange={(e) =>
//                 setForm({ ...form, role: e.target.value })
//               }
//             />
//           </div>

//           <Button text="Login" />
//         </form>

//         {/* 🔐 FORGOT PASSWORD */}
//         <p className="forgot-password">Forgot Password?</p>
//         {/* <p className="footer-text">
//           Don’t have an account? <span>Register</span>
//         </p> */}
//       </div>
//     </div>
//   );
// };

// export default LoginForm;