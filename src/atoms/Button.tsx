type Props = {
  text: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
};

const Button = ({
  text,
  type = "button",
  onClick,
  disabled = false,
}: Props) => {
  return (
    <button
      type={type}
      className="btn"
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;