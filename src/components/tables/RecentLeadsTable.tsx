import { MessageSquare, PhoneCall } from 'lucide-react';

interface LeadRow {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  source: string;
  agent: string;
  status: 'new' | 'won' | 'lost' | 'interested' | 'contacted' | 'follow_up' | 'qualified';
  createdAt?: string;
  followupDate?: string;
}

interface RecentLeadsTableProps {
  data: LeadRow[];
  dateColumnLabel?: string;
  dateField?: 'createdAt' | 'followupDate';
}

const RecentLeadsTable = ({ data, dateColumnLabel = 'Created Date', dateField = 'createdAt' }: RecentLeadsTableProps) => {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; bg: string; label: string }> = {
      new: {
        color: '#2196F3',
        bg: 'rgba(33, 150, 243, 0.1)',
        label: 'New',
      },
      won: {
        color: '#4CAF50',
        bg: 'rgba(76, 175, 80, 0.1)',
        label: 'Won',
      },
      interested: {
        color: '#9C27B0',
        bg: 'rgba(156, 39, 176, 0.1)',
        label: 'Interested',
      },
      lost: {
        color: '#FF5722',
        bg: 'rgba(255, 87, 34, 0.1)',
        label: 'Lost',
      },
      contacted: {
        color: '#FFC107',
        bg: 'rgba(255, 193, 7, 0.1)',
        label: 'Contacted',
      },
      follow_up: {
        color: '#FF9800',
        bg: 'rgba(255, 152, 0, 0.1)',
        label: 'Follow Up',
      },
      qualified: {
        color: '#00BCD4',
        bg: 'rgba(0, 188, 212, 0.1)',
        label: 'Qualified',
      },
    };
    return configs[status] || configs.new;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="professional-table-container">
      <table className="professional-table">
        <thead>
          <tr>
            <th>Lead Name</th>
            <th>Contact</th>
            <th>Source</th>
            <th>Assigned Agent</th>
            <th>Status</th>
            <th>{dateColumnLabel}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((lead, index) => {
            const statusConfig = getStatusConfig(lead.status);

            return (
              <tr key={lead._id || index}>
                <td>
                  <div className="lead-name-cell">
                    {lead.name}
                  </div>
                </td>
                <td>
                  <div className="contact-cell">
                    {lead.email && (
                      <div className="contact-row">
                        <MessageSquare size={14} />
                        <span>{lead.email}</span>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="contact-row">
                        <PhoneCall size={14} />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className="source-cell">{lead.source}</span>
                </td>
                <td>
                  <span className="agent-cell">{lead.agent}</span>
                </td>
                <td>
                  <span
                    className="status-cell"
                    style={{
                      color: statusConfig.color,
                      backgroundColor: statusConfig.bg,
                    }}
                  >
                    {statusConfig.label}
                  </span>
                </td>
                <td>
                  <span className="date-cell">{formatDate(dateField === 'followupDate' ? lead.followupDate : lead.createdAt)}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="empty-table-state">
          <p>No leads found</p>
        </div>
      )}
    </div>
  );
};

export default RecentLeadsTable;
