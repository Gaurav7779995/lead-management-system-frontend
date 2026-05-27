import { useNavigate } from "react-router-dom";
import "./manager.css";

type Manager = {
  _id: string;
  name: string;
  email: string;
  agentsCount?: number;
  assignedLeadsCount?: number;
};

type Props = {
  managers: Manager[];
  onAssignAgent?: (managerId: string) => void;
};

const ManagerCards = ({ managers, onAssignAgent }: Props) => {
  const navigate = useNavigate();

  const handleCardClick = (id: string) => {
    navigate(`/admin/managers/${id}`);
  };

  const handleAssignClick = (
    e: React.MouseEvent,
    managerId: string
  ) => {
    e.stopPropagation(); // 🔥 prevent card click
    if (onAssignAgent) {
      onAssignAgent(managerId);
    }
  };

  return (
    <div className="manager-cards-container">
      {managers.length > 0 ? (
        managers.map((manager) => (
          <div
            key={manager._id}
            className="manager-card"
            onClick={() => handleCardClick(manager._id)}
          >
            {/* Header */}
            <div className="manager-header">
              <div className="avatar">
                {manager.name?.charAt(0).toUpperCase()}
              </div>

              <div>
                <h4>{manager.name}</h4>
                <p>{manager.email}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="manager-stats">
              <p>👥 {manager.agentsCount || 0} Agents</p>
              <p>📌 {manager.assignedLeadsCount || 0} Leads</p>
            </div>

            {/* Action */}
            <button
              className="assign-btn"
              onClick={(e) => handleAssignClick(e, manager._id)}
            >
              Assign Agent
            </button>
          </div>
        ))
      ) : (
        <p style={{ textAlign: "center" }}>No managers found</p>
      )}
    </div>
  );
};

export default ManagerCards;










// import { useNavigate } from "react-router-dom";

// type Manager = {
//   _id: string;
//   name: string;
//   email: string;
//   agentsCount?: number;
//   assignedLeadsCount?: number;
// };

// type Props = {
//   managers: Manager[];
// };

// const ManagerTable = ({ managers }: Props) => {
//   const navigate = useNavigate(); // ✅ ADD

//   return (
//     <div className="table-box">
//       <h3>All Managers</h3>

//       <table>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Email</th>
//             <th>Agents</th>
//             <th>Leads</th>
//             <th></th> {/* ✅ Arrow column */}
//           </tr>
//         </thead>

//         <tbody>
//           {managers.length > 0 ? (
//             managers.map((m) => (
//               <tr
//                 key={m._id}
//                 onClick={() => navigate(`/admin/managers/${m._id}`)} // ✅ CLICK NAVIGATION
//                 style={{ cursor: "pointer" }}
//               >
//                 <td>{m.name}</td>
//                 <td>{m.email}</td>
//                 <td>{m.agentsCount || 0}</td>
//                 <td>{m.assignedLeadsCount || 0}</td>

//                 {/* ✅ ARROW */}
//                 <td style={{ textAlign: "right" }}>
//                   ➜
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={5} style={{ textAlign: "center" }}>
//                 No managers found
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ManagerTable;







// type Manager = {
//   _id: string;
//   name: string;
//   email: string;
//   agentsCount?: number;
//   assignedLeadsCount?: number;
// };

// type Props = {
//   managers: Manager[];
// };

// const ManagerTable = ({ managers }: Props) => {
//   return (
//     <div className="table-box">
//       <h3>All Managers</h3>

//       <table>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Email</th>
//             <th>Agents</th>
//             <th>Leads</th>
//           </tr>
//         </thead>

//         <tbody>
//           {managers.length > 0 ? (
//             managers.map((m) => (
//               <tr key={m._id}>
//                 <td>{m.name}</td>
//                 <td>{m.email}</td>
//                 <td>{m.agentsCount || 0}</td>
//                 <td>{m.assignedLeadsCount || 0}</td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={4} style={{ textAlign: "center" }}>
//                 No managers found
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ManagerTable;