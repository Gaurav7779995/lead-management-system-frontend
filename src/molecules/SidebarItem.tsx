import { Link } from "react-router-dom";

type Props = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  to?: string;
};

const SidebarItem = ({ icon, label, active, to }: Props) => {
  return (
    <li className={active ? "active" : ""}>
      {to ? (
        <Link to={to}>
          {icon} {label}
        </Link>
      ) : (
        <>
          {icon} {label}
        </>
      )}
    </li>
  );
};

export default SidebarItem;