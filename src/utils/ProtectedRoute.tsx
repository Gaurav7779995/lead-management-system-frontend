import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }: any) => {
  const userRole = localStorage.getItem("role");

  if (!userRole) {
    return <Navigate to="/" />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;