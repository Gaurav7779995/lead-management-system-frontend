type Props = {
  type: string;
  value: string;
  onChange: (e: any) => void;
};

const Input = ({ type, value, onChange }: Props) => {
  return (
    <input
      type={type}
      value={value}
      autoComplete="off"
      onChange={onChange}
      placeholder={type}
      title={`Enter ${type}`}
      required
      className="input"
    />
  );
};

export default Input;