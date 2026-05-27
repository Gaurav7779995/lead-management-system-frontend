import React from 'react';

interface LeadSource {
  label: string;
  count: number;
  percent: number;
  color: string;
}

interface LeadsBySourceChartProps {
  data: LeadSource[];
}

const LeadsBySourceChart: React.FC<LeadsBySourceChartProps> = ({ data }) => {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Lead Sources</h3>
      <div className="sources-list">
        {data.map((source, index) => (
          <div key={index} className="source-item">
            <div className="source-info">
              <span className="source-label">{source.label}</span>
              <span className="source-stats">
                {source.count} · {source.percent}%
              </span>
            </div>
            <div className="source-progress">
              <div 
                className="source-progress-bar" 
                style={{ 
                  width: `${source.percent}%`,
                  backgroundColor: source.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadsBySourceChart;
