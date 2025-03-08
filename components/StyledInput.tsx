import React, { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface StyledInputProps extends InputHTMLAttributes<HTMLInputElement> {
  validationProps?: any;
  className?: string;
}

const StyledInput: React.FC<StyledInputProps> = ({
  validationProps,
  className,
  ...props
}) => {
  return (
    <input
      {...validationProps}
      {...props}
      className={cn("w-full input-with-lime-focus animate-fade-in", className)}
    />
  );
};

export default StyledInput;
