// import { useContext } from "react";
// import { Navigate } from "react-router-dom";
// import { AuthContext } from "../components/context/AuthContext";

// const AuthRedirect = () => {
//   const { user, loading } = useContext(AuthContext);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   switch (user.role) {
//     case "admin":
//       return <Navigate to="/admin/dashboard" replace />;
//     case "manager":
//       return <Navigate to="/manager/dashboard" replace />;
//     case "agent":
//       return <Navigate to="/agent/dashboard" replace />;
//     default:
//       return <Navigate to="/login" replace />;
//   }
// };

// export default AuthRedirect;