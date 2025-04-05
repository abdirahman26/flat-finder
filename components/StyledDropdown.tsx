import { cn } from "@/lib/utils";

interface DropdownProps {
  options: ("Consultant" | "Landlord")[]; // Make options array more specific
  selected: "Consultant" | "Landlord"; // Ensure selected value is one of these two
  onChange: (value: "Consultant" | "Landlord") => void; // Update onChange to match
  className?: string;
}

export const StyledDropdown = ({
  options,
  selected,
  onChange,
  className,
}: DropdownProps) => {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value as "Consultant" | "Landlord")}
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
