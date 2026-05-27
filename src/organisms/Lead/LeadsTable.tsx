import { useState } from "react";
import { deleteLead, updateLead } from "../../services/leadService";
import { Lead } from "../../services/leadService";

type Props = {
  leads: Lead[];
  refresh: () => void;
};

const statusOptions = [
  "new",
  "contacted",
  "interested",
  "not_interested",
  "qualified",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
];

const LeadsTable = ({ leads, refresh }: Props) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [loadingId, setLoadingId] = useState<string | null>(null);

  // ================= DELETE =================
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Delete this lead?");
    if (!confirmDelete) return;

    try {
      setLoadingId(id);
      await deleteLead(id);
      refresh();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setLoadingId(null);
    }
  };

  // ================= STATUS UPDATE =================
  const handleStatus = async (id: string, status: string) => {
    try {
      setLoadingId(id);
      await updateLead(id, { status });
      refresh();
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="table-wrapper">
      <table className="leads-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Source</th>
            <th>State</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead, index) => (
            <tr key={lead._id}>
              <td>
                <span className="lead-index-cell">{index + 1}</span>
              </td>

              {/* NAME */}
              <td>{lead.name}</td>

              {/* PHONE */}
              <td>
                <span className="lead-phone-cell">{lead.phone || "-"}</span>
              </td>

              {/* STATUS DROPDOWN (🔥 IMPROVED) */}
              <td>
                <select
                  aria-label="Lead Status"   // ✅ FIX
                  value={lead.status}
                  onChange={(e) =>
                    handleStatus(lead._id, e.target.value)
                  }
                  disabled={loadingId === lead._id}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>

              {/* SOURCE */}
              <td>{lead.source}</td>

              {/* STATE */}
              <td>
                <span
                  className={
                    lead.isClosed ? "badge closed" : "badge open"
                  }
                >
                  {lead.isClosed ? "Closed" : "Open"}
                </span>
              </td>

              {/* ACTIONS */}
              <td>
                {user.role === "admin" && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(lead._id)}
                    disabled={loadingId === lead._id}
                  >
                    {loadingId === lead._id ? "Deleting..." : "Delete"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* EMPTY STATE */}
      {leads.length === 0 && (
        <div className="empty-state">
          <p>No leads available</p>
        </div>
      )}
    </div>
  );
};

export default LeadsTable;





















// import { deleteLead, updateLead } from "../../services/leadService";

// const LeadsTable = ({ leads, refresh }: any) => {
//   const user = JSON.parse(localStorage.getItem("user") || "{}");

//   const handleDelete = async (id: string) => {
//     if (!window.confirm("Delete this lead?")) return;
//     await deleteLead(id);
//     refresh();
//   };

//   const handleStatus = async (id: string) => {
//     const status = prompt("Enter status:");
//     if (!status) return;
//     await updateLead(id, { status });
//     refresh();
//   };

//   return (
//     <div className="table-wrapper">
//       <table className="leads-table">
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Email</th>
//             <th>Status</th>
//             <th>Source</th>
//             <th>State</th>
//             <th>Actions</th>
//           </tr>
//         </thead>

//         <tbody>
//           {leads.map((lead: any) => (
//             <tr key={lead._id}>
//               <td>{lead.name}</td>
//               <td>{lead.email || lead.phone}</td>
//               <td>{lead.status}</td>
//               <td>{lead.source}</td>
//               <td>{lead.isClosed ? "Closed" : "Open"}</td>

//               <td>
//                 <button onClick={() => handleStatus(lead._id)}>
//                   Update
//                 </button>

//                 {user.role === "admin" && (
//                   <button onClick={() => handleDelete(lead._id)}>
//                     Delete
//                   </button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default LeadsTable;
