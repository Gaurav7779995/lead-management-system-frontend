import { createContext, useState, useEffect } from "react";
import { getDashboardData } from "../../services/dashboardService";

export const DashboardContext = createContext<any>(null);

export const DashboardProvider = ({ children }: any) => {
  const [data, setData] = useState({
    stats: [],
    leads: [],
    agents: [],
    barChart: [],
    pieChart: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // ✅ Don't fetch if not logged in
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await getDashboardData();
        setData(res);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardContext.Provider value={{ data, loading }}>
      {children}
    </DashboardContext.Provider>
  );
};










// import { createContext, useState, useEffect } from "react";
// import { getDashboardData } from "../../services/dashboardService";

// export const DashboardContext = createContext<any>(null);

// export const DashboardProvider = ({ children }: any) => {
//   const [data, setData] = useState({
//     stats: [],
//     leads: [],
//     agents: [],
//     barChart: [],
//     pieChart: [],
//   });

//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await getDashboardData();
//         setData(res);
//       } catch (error) {
//         console.error("Dashboard fetch error:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <DashboardContext.Provider value={{ data, loading }}>
//       {children}
//     </DashboardContext.Provider>
//   );
// };