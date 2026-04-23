import { useState } from "react";
import { createLead } from "../../services/leadService";

const LeadModal = ({ onClose, refresh }: any) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const handleSubmit = async () => {
    await createLead(form);
    refresh();
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add Lead</h2>

        <input 
          placeholder="Name"
          onChange={(e) => setForm({...form, name: e.target.value})}
        />

        <input 
          placeholder="Email"
          onChange={(e) => setForm({...form, email: e.target.value})}
        />

        <input 
          placeholder="Phone"
          onChange={(e) => setForm({...form, phone: e.target.value})}
        />

        <button onClick={handleSubmit}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default LeadModal;