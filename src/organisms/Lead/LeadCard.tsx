import { motion } from "framer-motion";

const LeadCard = ({ lead }: any) => {
  return (
    <motion.div 
      className="lead-card"
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3>{lead.name}</h3>
      <p>{lead.email || lead.phone}</p>

      <span className={`status ${lead.status}`}>
        {lead.status}
      </span>

      <div className="meta">
        <span>{lead.source}</span>
        <span>{lead.isClosed ? "Closed" : "Open"}</span>
      </div>
    </motion.div>
  );
};

export default LeadCard;