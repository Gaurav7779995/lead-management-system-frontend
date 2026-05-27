import { motion } from "framer-motion";

const LeadsHeader = ({ onSearch, view, setView, onAddLead }: any) => {
  return (
    <motion.div
      className="leads-header"
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* SEARCH */}
      <input
        className="search-input"
        placeholder="Search leads by name, email, phone..."
        onChange={(e) => onSearch(e.target.value)}
      />

      {/* ACTIONS */}
      <div className="header-actions">
        
        {/* VIEW TOGGLE */}
        <div className="view-toggle">
          <button
            className={view === "card" ? "active" : ""}
            onClick={() => setView("card")}
          >
            Card
          </button>

          <button
            className={view === "table" ? "active" : ""}
            onClick={() => setView("table")}
          >
            Table
          </button>
        </div>

        {/* ✅ ADD LEAD BUTTON FIXED */}
        <button
          className="add-btn"
          onClick={onAddLead}
        >
          + Add Lead
        </button>

      </div>
    </motion.div>
  );
};

export default LeadsHeader;







// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";

// const LeadsHeader = ({ onSearch, view, setView }: any) => {
//   const navigate = useNavigate();

//   return (
//     <motion.div
//       className="leads-header"
//       initial={{ opacity: 0, y: -15 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3 }}
//     >
//       {/* SEARCH */}
//       <input
//         className="search-input"
//         placeholder="Search leads by name, email, phone..."
//         onChange={(e) => onSearch(e.target.value)}
//       />

//       {/* ACTIONS */}
//       <div className="header-actions">
//         {/* VIEW TOGGLE */}
//         <div className="view-toggle">
//           <button
//             className={view === "card" ? "active" : ""}
//             onClick={() => setView("card")}
//           >
//             Card
//           </button>

//           <button
//             className={view === "table" ? "active" : ""}
//             onClick={() => setView("table")}
//           >
//             Table
//           </button>
//         </div>

//         {/* ADD LEAD BUTTON */}
//         <button
//           className="add-btn"
//           onClick={() => navigate("/admin/leads/create")}
//         >
//           + Add Lead
//         </button>
//       </div>
//     </motion.div>
//   );
// };

// export default LeadsHeader;