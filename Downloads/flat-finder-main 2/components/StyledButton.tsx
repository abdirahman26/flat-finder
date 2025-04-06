import React, { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface StyledButtonProps {
  label: string;
  disabled?: boolean;
  additionalProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  className?: string;
}

const StyledButton: React.FC<StyledButtonProps> = ({
  label,
  disabled = false,
  additionalProps,
  className,
}) => {
  return (
    <button
      disabled={disabled}
      className={cn(
        "cursor-pointer lime-button w-full mt-2 relative overflow-hidden group",
        {
          "opacity-70 cursor-not-allowed": disabled,
        },
        className
      )}
      {...additionalProps}
    >
      <span className="relative z-10">{label}</span>
      <div className="absolute inset-0 h-full w-0 bg-white/20 transition-all duration-300 group-hover:w-full" />
    </button>
  );
};

export default StyledButton;
