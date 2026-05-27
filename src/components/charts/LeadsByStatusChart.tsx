import React from 'react';

interface LeadsByStatusChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const LeadsByStatusChart: React.FC<LeadsByStatusChartProps> = ({ data }) => {
  const colors: Record<string, string> = {
    new: '#7C6DDD',
    contacted: '#4ECDC4',
    won: '#4CAF7D',
    lost: '#FF6B6B',
    interested: '#FFD93D',
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="chart-card">
      <h3 className="chart-title">Leads by Status</h3>
      <div className="donut-chart-container">
        <svg viewBox="0 0 100 100" className="donut-chart">
          {data.map((item, index) => {
            const percent = item.value / total;
            const startPercent = cumulativePercent;
            const endPercent = cumulativePercent + percent;
            cumulativePercent = endPercent;

            const [startX, startY] = getCoordinatesForPercent(startPercent);
            const [endX, endY] = getCoordinatesForPercent(endPercent);
            const largeArcFlag = percent > 0.5 ? 1 : 0;

            const pathData = [
              `M 50 50`,
              `L ${50 + 40 * startX} ${50 + 40 * startY}`,
              `A 40 40 0 ${largeArcFlag} 1 ${50 + 40 * endX} ${50 + 40 * endY}`,
              'Z',
            ].join(' ');

            return (
              <path
                key={index}
                d={pathData}
                fill={colors[item.name] || colors.new}
                stroke="var(--surface)"
                strokeWidth="0"
                style={{ opacity: 0.9 }}
              />
            );
          })}
          <circle cx="50" cy="50" r="25" fill="var(--surface)" />
        </svg>
        <div className="donut-center">
          <div className="donut-total">{total}</div>
          <div className="donut-label">total</div>
        </div>
      </div>
      <div className="donut-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <div 
              className="legend-dot" 
              style={{ backgroundColor: colors[item.name] || colors.new }}
            />
            <div className="legend-info">
              <span className="legend-label">{item.name}</span>
              <span className="legend-value">{item.value}</span>
              <span className="legend-percent">{Math.round((item.value / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadsByStatusChart;
