import {
  FaUsers,
  FaUserPlus,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

type Props = {
  title: string;
  value: number | string;
  color: string;
};

const iconMap: any = {
  "Total Leads": <FaUsers />,
  "New Leads": <FaUserPlus />,
  "Converted": <FaCheckCircle />,
  "Lost": <FaTimesCircle />,
};

const Card = ({ title, value, color }: Props) => {
  return (
    <div
      className="card"
      style={{ "--card-color": color } as React.CSSProperties}
    >
      {/* ICON */}
      <div className="card-top">
        <div className="card-icon" style={{ background: color }}>
          {iconMap[title]}
        </div>
      </div>

      {/* TEXT */}
      <h4>{title}</h4>
      <p>{value}</p>
    </div>
  );
};

export default Card;