import React, { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface StyledInputProps extends InputHTMLAttributes<HTMLInputElement> {
  validationProps?: any;
  className?: string;
}

const StyledInput = ({
  validationProps,
  className,
  ...props
}: StyledInputProps) => {
  const { value = "", onChange, onBlur } = validationProps || {};

  return (
    <input
      {...props}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={cn("w-full input-with-lime-focus animate-fade-in", className)}
    />
  );
};

export default StyledInput;
