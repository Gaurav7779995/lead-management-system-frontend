import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WeeklyActivityChartProps {
  data: Array<{
    day: string;
    leads: number;
  }>;
}

const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.8)', 
          color: 'white', 
          padding: '8px 12px', 
          borderRadius: '6px',
          fontSize: '14px'
        }}>
          <p style={{ margin: 0 }}>{`${label}: ${payload[0].value} leads`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="day" 
          tick={{ fontSize: 12 }}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="leads" 
          fill="#3b82f6" 
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeeklyActivityChart;
