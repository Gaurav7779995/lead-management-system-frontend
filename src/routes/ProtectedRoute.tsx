import { ReactElement, useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../components/context/AuthContext";

interface Props {
  children: ReactElement;
  role?: "admin" | "manager" | "agent";
}

const ProtectedRoute = ({ children, role }: Props) => {
  const context = useContext(AuthContext);

  if (!context) return <Navigate to="/login" replace />;

  const { user, loading } = context;

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h3>Loading...</h3>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
