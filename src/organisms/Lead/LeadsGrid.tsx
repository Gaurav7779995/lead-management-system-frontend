import LeadCard from "./LeadCard";
import { motion } from "framer-motion";
import { Lead } from "../../services/leadService";

type Props = {
  leads: Lead[];
  refresh: () => void;
};

const LeadsGrid = ({ leads, refresh }: Props) => {
  return (
    <motion.div
      className="leads-grid"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {leads && leads.length > 0 ? (
        leads.map((lead, index) => (
          <LeadCard
            key={lead._id || lead.id || index}
            lead={lead}
            refresh={refresh}
          />
        ))
      ) : (
        <div className="empty-state">
          <h3>No Leads Found</h3>
          <p>Create a new lead to get started 🚀</p>
        </div>
      )}
    </motion.div>
  );
};

export default LeadsGrid;






// import LeadCard from "./LeadCard";
// import { motion } from "framer-motion";

// const LeadsGrid = ({ leads, refresh }: any) => {
//   return (
//     <motion.div
//       className="leads-grid"
//       initial="hidden"
//       animate="visible"
//       variants={{
//         visible: {
//           transition: {
//             staggerChildren: 0.1,
//           },
//         },
//       }}
//     >
//       {leads && leads.length > 0 ? (
//         leads.map((lead: any) => (
//           <LeadCard
//             key={lead._id}
//             lead={lead}
//             refresh={refresh}   // ✅ Important Fix
//           />
//         ))
//       ) : (
//         <p style={{ padding: "20px", color: "#6b7280" }}>
//           No leads found
//         </p>
//       )}
//     </motion.div>
//   );
// };

// export default LeadsGrid;
