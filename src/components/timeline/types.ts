export type ActivityType =
  | 'lead_created'
  | 'lead_assigned'
  | 'call_completed'
  | 'followup_scheduled'
  | 'email_sent'
  | 'meeting_done'
  | 'status_changed'
  | 'payment_received'
  | 'lead_closed'
  | 'note_added'
  | 'file_uploaded';

export interface TimelineActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  status?: string;
  notes?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface TimelineDateGroup {
  dateLabel: string;
  activities: TimelineActivity[];
}
