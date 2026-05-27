import API from "../api/axiosInstance";

export type ReportFilters = {
  startDate?: string;
  endDate?: string;
  agent?: string;
  status?: string;
  source?: string;
  priority?: string;
  region?: string;
  industry?: string;
  converted?: string;
  followupStatus?: string;
  revenueMin?: string;
  revenueMax?: string;
  leadName?: string;
  companyName?: string;
};

export const getManagerReports = async (filters: ReportFilters) => {
  const res = await API.get("/manager/reports", { params: filters });
  return res.data;
};

export const createScheduledReport = async (payload: {
  reportType: string;
  dateRange: string;
  exportFormat: string;
  recipients: string[];
  frequency: string;
}) => {
  const res = await API.post("/manager/reports/schedules", payload);
  return res.data;
};

export const getExportUrl = (type: string, format: string, filters: ReportFilters) => {
  const base = API.defaults.baseURL || "http://localhost:5000/api";
  const params = new URLSearchParams({ type, format });
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return `${base}/manager/reports/export?${params.toString()}`;
};

export const downloadManagerReport = async (
  type: string,
  format: string,
  filters: ReportFilters
) => {
  const res = await API.get("/manager/reports/export", {
    params: { ...filters, type, format },
    responseType: "blob",
  });

  const disposition = res.headers["content-disposition"] || "";
  const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
  const fallbackExtension = format === "excel" ? "xls" : format === "pdf" ? "html" : "csv";
  const filename =
    filenameMatch?.[1] ||
    `crm-${type}-report-${new Date().toISOString().slice(0, 10)}.${fallbackExtension}`;

  const url = window.URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
