import { useEffect, useState } from "react";
import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
import Navbar from "../../organisms/DashboardNavbar/Navbar";
import LeadsHeader from "../../organisms/Lead/LeadsHeader";
import LeadsGrid from "../../organisms/Lead/LeadsGrid";
import LeadModal from "../../organisms/Lead/LeadModal";

import { getLeads, Lead } from "../../services/leadService";

import "../../assets/styles/Leads.css";

const Leads = () => {
  // ✅ Proper typing
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // ================= FETCH DATA =================
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const res = await getLeads({
        page: 1,
        limit: 20
      });

      // ✅ IMPORTANT FIX
      setLeads(res.data);
      setFilteredLeads(res.data);

    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================= SEARCH =================
  const handleSearch = (value: string) => {
    if (!value) {
      setFilteredLeads(leads);
      return;
    }

    const filtered = leads.filter((lead) =>
      lead.name.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredLeads(filtered);
  };

  // ================= LOADING UI =================
  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="main">
          <Navbar user={{ name: "Admin" }} />
          <h2 style={{ padding: "20px" }}>Loading Leads...</h2>
        </div>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <Navbar user={{ name: "Admin" }} />

        <LeadsHeader
          onSearch={handleSearch}
          onAdd={() => setOpenModal(true)}
        />

        {/* ✅ Empty State */}
        {filteredLeads.length === 0 ? (
          <h3 style={{ padding: "20px" }}>No leads found</h3>
        ) : (
          <LeadsGrid leads={filteredLeads} />
        )}

        {/* ✅ Modal */}
        {openModal && (
          <LeadModal
            onClose={() => setOpenModal(false)}
            refresh={fetchLeads}
          />
        )}
      </div>
    </div>
  );
};

export default Leads;


// import { useEffect, useState } from "react";
// import Sidebar from "../../organisms/DashboardSidebar/Sidebar";
// import Navbar from "../../organisms/DashboardNavbar/Navbar";
// import LeadsHeader from "../../organisms/Lead/LeadsHeader";
// import LeadsGrid from "../../organisms/Lead/LeadsGrid";
// import LeadModal from "../../organisms/Lead/LeadModal";

// import { getLeads } from "../../services/leadService";

// import "../../assets/styles/Leads.css";

// const Leads = () => {
//   const [leads, setLeads] = useState([]);
//   const [filteredLeads, setFilteredLeads] = useState([]);
//   const [openModal, setOpenModal] = useState(false);

//   useEffect(() => {
//     fetchLeads();
//   }, []);

//   const fetchLeads = async () => {
//     const data = await getLeads();
//     setLeads(data);
//     setFilteredLeads(data);
//   };

//   const handleSearch = (value: string) => {
//     const filtered = leads.filter((lead: any) =>
//       lead.name.toLowerCase().includes(value.toLowerCase())
//     );
//     setFilteredLeads(filtered);
//   };

//   return (
//     <div className="dashboard">
//       <Sidebar />

//       <div className="main">
//         <Navbar user={{ name: "Admin" }} />

//         <LeadsHeader 
//           onSearch={handleSearch}
//           onAdd={() => setOpenModal(true)}
//         />

//         <LeadsGrid leads={filteredLeads} />

//         {openModal && (
//           <LeadModal 
//             onClose={() => setOpenModal(false)} 
//             refresh={fetchLeads}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Leads;