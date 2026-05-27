import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface KpiStat {
  title: string;
  value: string | number;
  change: string;
  changeType: 'up' | 'down';
  sub: string;
  icon: React.ReactNode;
  accentColor: 'violet' | 'teal' | 'amber' | 'coral';
}

interface StatCardProps {
  data: KpiStat;
}

const StatCard: React.FC<StatCardProps> = ({ data }) => {
  const getColorVar = (color: string) => {
    const colors: Record<string, string> = {
      violet: 'var(--accent)',
      teal: 'var(--accent2)',
      amber: 'var(--accent4)',
      coral: 'var(--accent3)',
    };
    return colors[color] || colors.violet;
  };

  const accentColor = getColorVar(data.accentColor);

  return (
    <div className="kpi-card" style={{ '--card-accent': accentColor } as React.CSSProperties}>
      <div className="kpi-card-header">
        <div className="kpi-icon" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
          {data.icon}
        </div>
        <div className="kpi-badge" style={{ 
          backgroundColor: data.changeType === 'up' ? 'var(--green)' : 'var(--accent3)',
          color: 'white'
        }}>
          {data.changeType === 'up' ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
          <span>{data.change}</span>
        </div>
      </div>
      
      <div className="kpi-label">{data.title}</div>
      
      <div className="kpi-value">{data.value}</div>
      
      <div className="kpi-sub">{data.sub}</div>
    </div>
  );
};

export default StatCard;
