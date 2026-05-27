import React from 'react';

interface Performer {
  rank: number;
  name: string;
  role: string;
  initials: string;
  wins: number;
  maxWins: number;
  color: string;
}

interface TopPerformersTableProps {
  data: Performer[];
}

const TopPerformersTable: React.FC<TopPerformersTableProps> = ({ data }) => {
  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return 'var(--text-muted)';
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  if (!data || data.length === 0) {
    return (
      <div className="performers-list empty-state">
        <p className="empty-state-text">No managers found</p>
      </div>
    );
  }

  return (
    <div className="performers-list">
      {data.map((performer, index) => (
        <div key={index} className="performer-item">
          <div 
            className="performer-rank"
            style={{ color: getRankColor(performer.rank) }}
          >
            #{performer.rank}
          </div>
          <div 
            className="performer-avatar"
            style={{ 
              background: `linear-gradient(135deg, ${performer.color} 0%, ${performer.color}80 100%)`
            }}
          >
            <span className="performer-initials">{getInitials(performer.name)}</span>
          </div>
          <div className="performer-info">
            <div className="performer-name">{performer.name}</div>
            <div className="performer-role">{performer.role}</div>
          </div>
          <div className="performer-progress-container">
            <div 
              className="performer-progress-bar"
              style={{ 
                width: `${(performer.wins / performer.maxWins) * 100}%`,
                background: `linear-gradient(90deg, ${performer.color} 0%, ${performer.color}80 100%)`
              }}
            />
          </div>
          <div 
            className="performer-wins"
            style={{ color: performer.color }}
          >
            {performer.wins}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopPerformersTable;
