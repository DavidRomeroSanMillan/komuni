import React from "react";

type LoginButtonProps = {
  onClick?: () => void;
  label?: string;
};

const LoginButton: React.FC<LoginButtonProps> = ({ onClick, label = "Iniciar sesión" }) => (
  <button
    onClick={onClick}
    className="btn-primary" // Cambia esto por la clase que usan tus otros botones
    type="button"
  >
    {label}
  </button>
);

export default LoginButton;