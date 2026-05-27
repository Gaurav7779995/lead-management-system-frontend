import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AgentPerformanceChartProps {
  data: Array<{
    name: string;
    total: number;
    converted: number;
  }>;
}

const AgentPerformanceChart: React.FC<AgentPerformanceChartProps> = ({ data }) => {
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
          <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
          <p style={{ margin: 0, color: '#3b82f6' }}>Total: {payload[0].payload.total}</p>
          <p style={{ margin: 0, color: '#10b981' }}>Converted: {payload[0].payload.converted}</p>
          <p style={{ margin: 0, color: '#f59e0b' }}>
            Rate: {Math.round((payload[0].payload.converted / payload[0].payload.total) * 100)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={data} 
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="total" 
          fill="#3b82f6" 
          name="Total Leads"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="converted" 
          fill="#10b981" 
          name="Converted Leads"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AgentPerformanceChart;
