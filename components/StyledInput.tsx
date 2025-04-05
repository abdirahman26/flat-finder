import React, { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface StyledInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  // Removed validationProps
}

const StyledInput = ({
  className,
  value, // Take value, onChange, and onBlur from props directly
  onChange,
  onBlur,
  ...props
}: StyledInputProps) => {
  return (
    <input
      {...props} // Spread other input props like type, placeholder, etc.
      value={value} // Controlled value
      onChange={onChange} // Controlled onChange
      onBlur={onBlur} // Controlled onBlur
      className={cn("w-full input-with-lime-focus animate-fade-in", className)} // Add custom classes
    />
  );
};

export default StyledInput;
