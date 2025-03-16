import { cn } from "@/lib/utils";
import React from "react";

interface DropdownProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
}

const StyledDropdown = ({
  options,
  selected,
  onChange,
  className,
}: DropdownProps) => {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className={cn("w-full input-with-lime-focus animate-fade-in", className)}
    >
      <option value="" disabled>
        Select an option
      </option>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

export default StyledDropdown;
