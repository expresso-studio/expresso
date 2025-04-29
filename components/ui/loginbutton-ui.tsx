import { ReactNode } from "react";

interface LoginButtonUIProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Renders a login button.
 * @param props - The props for the LoginButtonUI component.
 * @returns The rendered login button component.
 */
export default function LoginButtonUI({
  children,
  onClick,
  className = "",
  disabled = false,
}: LoginButtonUIProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-4 rounded-lg text-xl transition 
            ${disabled ? "bg-gray-400 cursor-not-allowed" : "bg-[#DFCBBF] hover:bg-[#C4A99E]"} 
            text-black ${className}`}
    >
      {children}
    </button>
  );
}
