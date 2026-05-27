import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyTrendsChartProps {
  data: Array<{
    month: string;
    newLeads: number;
    won: number;
  }>;
}

const MonthlyTrendsChart: React.FC<MonthlyTrendsChartProps> = ({ data }) => {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Monthly Lead Trends</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C6DDD" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#7C6DDD" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,45,74,0.5)" />
            <XAxis 
              dataKey="month" 
              stroke="#555880" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#555880" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1C1F38',
                border: '1px solid #2A2D4A',
                borderRadius: '8px',
                color: '#E8EAF6',
                fontSize: '12px',
                fontFamily: 'DM Sans, sans-serif'
              }}
              itemStyle={{ color: '#E8EAF6' }}
            />
            <Area 
              type="monotone" 
              dataKey="newLeads" 
              stroke="#7C6DDD" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorNew)"
            />
            <Area 
              type="monotone" 
              dataKey="won" 
              stroke="#4ECDC4" 
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorWon)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyTrendsChart;
