const ChartCard = ({ title, children }: any) => {
  return (
    <div className="chart-box">
      <h3>{title}</h3>
      {children}
    </div>
  );
};

export default ChartCard;