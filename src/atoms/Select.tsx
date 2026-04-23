type Props = {
  value: string;
  onChange: (e: any) => void;
};

const Select = ({ value, onChange }: Props) => {
  return (
    <select value={value} onChange={onChange} title="Select an option" className="input">
      <option value="admin">Admin</option>
      <option value="manager">Manager</option>
      <option value="agent">Agent</option>
    </select>
  );
};

export default Select;