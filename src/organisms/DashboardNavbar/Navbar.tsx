import { logout } from "../../services/authService";
import { useNavigate } from "react-router-dom";

const Navbar = ({ user }: any) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="navbar glass">
      <h2>Dashboard</h2>

      <div className="profile">
        <span>{user?.name}</span>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;