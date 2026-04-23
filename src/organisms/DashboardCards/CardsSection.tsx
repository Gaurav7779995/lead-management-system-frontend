import Card from "../../atoms/Card";

const CardsSection = ({ stats }: any) => {
  return (
    <div className="cards">
      {stats.map((item: any, index: number) => (
        <Card
          key={index}
          title={item.title}
          value={item.value}
          color={item.color}
        />
      ))}
    </div>
  );
};

export default CardsSection;