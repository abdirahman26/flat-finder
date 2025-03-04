import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface NavigationProps {
  total: number;
  current: number;
  onNext: () => void;
  onPrev: () => void;
  onDotClick: (index: number) => void;
  progress: number;
}

const Navigation = ({
  total,
  current,
  onNext,
  onPrev,
  onDotClick,
  progress,
}: NavigationProps) => {
  return (
    <>
      {/* Progress bar */}
      <div className="slide-indicator">
        <div
          className="slide-indicator-inner"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Navigation arrows */}
      <button
        onClick={onPrev}
        className="fixed left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white transition-all duration-300 hover:bg-white/20"
        aria-label="Previous property"
      >
        <ArrowLeft size={20} />
      </button>

      <button
        onClick={onNext}
        className="fixed right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white transition-all duration-300 hover:bg-white/20"
        aria-label="Next property"
      >
        <ArrowRight size={20} />
      </button>

      {/* Navigation dots */}
      <div className="nav-dots">
        {Array.from({ length: total }).map((_, index) => (
          <button
            key={index}
            onClick={() => onDotClick(index)}
            className={`nav-dot ${current === index ? "active" : ""}`}
            aria-label={`Go to property ${index + 1}`}
          />
        ))}
      </div>
    </>
  );
};

export default Navigation;
