import { motion } from "framer-motion";

const LeadsHeader = ({ onSearch, onAdd }: any) => {
  return (
    <motion.div 
      className="leads-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <input 
        placeholder="Search leads..."
        onChange={(e) => onSearch(e.target.value)}
      />

      <button onClick={onAdd}>+ Add Lead</button>
    </motion.div>
  );
};

export default LeadsHeader;