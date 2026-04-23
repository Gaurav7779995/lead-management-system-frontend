import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

import ChartCard from "../../molecules/ChartCard";

const ChartsSection = ({ barData, pieData }: any) => {
  const COLORS = ["#4CAF50", "#EF4444", "#3B82F6"];

  return (
    <div className="charts">

      <ChartCard title="Leads Overview">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="leads" fill="#6366f1" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Lead Status">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} dataKey="value" outerRadius={90}>
              {pieData.map((_: any, index: number) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  );
};

export default ChartsSection;