import { useContext } from "react";
import { DashboardContext } from "../components/auth/context/DashboardContext";

export const useDashboard = () => {
  return useContext(DashboardContext);
};