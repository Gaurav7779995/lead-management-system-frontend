import { useNavigate } from "react-router-dom";
import { FaSyncAlt, FaPlus, FaUsers } from "react-icons/fa";

const AgentHeader = ({ refresh }: any) => {
  const navigate = useNavigate();

  return (
    <div className="agent-page-header">
      <div className="agent-header-main">
        <div className="agent-header-title-section">
          <div className="agent-header-icon">
            <FaUsers />
          </div>
          <div className="agent-header-text">
            <h2 className="agent-main-title">Agent Management</h2>
            <p className="agent-subtitle">
              Manage your sales agents, track performance, and monitor lead progress
            </p>
          </div>
        </div>

        <div className="agent-header-actions">
          <button className="btn-refresh" onClick={refresh}>
            <FaSyncAlt className="btn-icon" /> Refresh
          </button>

          <button
            className="btn-add-agent"
            onClick={() => navigate("/admin/agents/add")}
          >
            <FaPlus className="btn-icon" /> Add Agent
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentHeader;
