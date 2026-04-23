import LeadCard from "./LeadCard";
import { motion } from "framer-motion";

const LeadsGrid = ({ leads }: any) => {
  return (
    <motion.div 
      className="leads-grid"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {leads.map((lead: any) => (
        <LeadCard key={lead._id} lead={lead} />
      ))}
    </motion.div>
  );
};

export default LeadsGrid;