import React, { ReactNode } from "react";

interface SeperatorProps {
  children: ReactNode;
}

const Seperator: React.FC<SeperatorProps> = ({ children }) => {
  return (
    <div className="flex items-center my-6 animate-fade-in">
      <div className="flex-grow h-px bg-white/20"></div>
      <span className="px-4 text-white/60 text-sm">{children}</span>
      <div className="flex-grow h-px bg-white/20"></div>
    </div>
  );
};

export default Seperator;
