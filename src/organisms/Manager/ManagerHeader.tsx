import { useNavigate } from "react-router-dom";
import { FaSyncAlt, FaPlus, FaUserTie } from "react-icons/fa";

const ManagerHeader = ({ refresh }: any) => {
  const navigate = useNavigate();

  return (
    <div className="manager-page-header">
      <div className="manager-header-main">
        <div className="manager-header-title-section">
          <div className="manager-header-icon">
            <FaUserTie />
          </div>
          <div className="manager-header-text">
            <h2 className="manager-main-title">Manager Management</h2>
            <p className="manager-subtitle">Manage your team leaders and their assignments</p>
          </div>
        </div>

        <div className="manager-header-actions">
          <button className="btn-refresh" onClick={refresh}>
            <FaSyncAlt className="btn-icon" /> Refresh
          </button>

          <button
            className="btn-add-manager"
            onClick={() => navigate("/admin/managers/add")}
          >
            <FaPlus className="btn-icon" /> Add Manager
          </button>
        </div>
      </div>
    </div>
  );
};
export default ManagerHeader;




// type ManagerHeaderProps = {
//   refresh: () => Promise<void>;
// };

// const ManagerHeader = ({ refresh }: ManagerHeaderProps) => {
//   return (
//     <div className="navbar">
//       <h2>Manager Management</h2>

//       <div style={{ display: "flex", gap: "10px" }}>
//         {/* 🔄 Refresh Button */}
//         <button className="refresh-btn" onClick={refresh}>
//           🔄 Refresh
//         </button>

//         {/* ➕ Add Manager */}
//         <button className="add-btn">
//           + Add Manager
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ManagerHeader;







