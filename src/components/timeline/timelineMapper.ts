import { TimelineActivity, ActivityType } from "./types";

/**
 * Maps backend timeline entry type to frontend ActivityType.
 */
const backendTypeToActivityType = (backendType: string): ActivityType => {
  const map: Record<string, ActivityType> = {
    created: "lead_created",
    assigned: "lead_assigned",
    call_logged: "call_completed",
    follow_up_added: "followup_scheduled",
    meeting_scheduled: "meeting_done",
    status_changed: "status_changed",
    closed: "lead_closed",
    note_added: "note_added",
    file_uploaded: "file_uploaded",
  };
  return map[backendType] || "lead_created";
};

/**
 * Derives a user-friendly title from the backend timeline entry.
 */
const deriveTitle = (item: any): string => {
  if (item.type === "created") return "New Lead Created";
  if (item.type === "assigned") return "Lead Assigned";
  if (item.type === "call_logged") return "Call Logged";
  if (item.type === "follow_up_added") return "Follow-up Scheduled";
  if (item.type === "meeting_scheduled") return "Meeting Scheduled";
  if (item.type === "status_changed") return "Status Changed";
  if (item.type === "closed") return "Lead Closed";
  if (item.type === "note_added") return "Note Added";
  if (item.type === "file_uploaded") return "File Uploaded";
  return item.message || "Activity";
};

/**
 * Derives a status badge label from the backend timeline entry.
 */
const deriveStatus = (item: any): string | undefined => {
  if (item.meta?.newStatus) return item.meta.newStatus;
  if (item.meta?.oldStatus && item.meta?.newStatus) {
    return `${item.meta.oldStatus} → ${item.meta.newStatus}`;
  }
  return undefined;
};

/**
 * Converts backend timeline array to frontend TimelineActivity array.
 */
const getRoleLabel = (role?: string): string => {
  if (!role) return "";
  const map: Record<string, string> = {
    admin: "(Admin)",
    manager: "(Manager)",
    agent: "(Agent)",
  };
  return map[role] || "";
};

export const mapBackendTimelineToActivities = (
  timeline: any[] | undefined,
): TimelineActivity[] => {
  if (!Array.isArray(timeline)) return [];

  return timeline.map((item, index) => {
    const rawName = item.addedBy?.name || "System";
    const roleLabel = getRoleLabel(item.addedBy?.role);
    const addedByName = roleLabel ? `${rawName} ${roleLabel}` : rawName;
    const metaFlat: Record<string, string | number | boolean> = {};

    if (item.meta && typeof item.meta === "object") {
      Object.entries(item.meta).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          metaFlat[key] = value as string | number | boolean;
        }
      });
    }

    return {
      id: item._id || `timeline-${index}`,
      type: backendTypeToActivityType(item.type),
      title: deriveTitle(item),
      description: item.message || "",
      userName: addedByName,
      timestamp: item.createdAt || new Date().toISOString(),
      status: deriveStatus(item),
      notes: undefined,
      metadata: Object.keys(metaFlat).length > 0 ? metaFlat : undefined,
    };
  });
};
