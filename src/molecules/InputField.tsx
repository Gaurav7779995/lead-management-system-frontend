import Input from "../atoms/Input.tsx";

type Props = {
  label: string;
  type: string;
  value: string;
  onChange: (e: any) => void;
};

const InputField = ({ label, type, value, onChange }: Props) => {
  return (
    <div className="input-group">
      <Input type={type} value={value} onChange={onChange} />
      <label>{label}</label>
    </div>
  );
};

export default InputField;