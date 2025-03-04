import React from "react";

interface SlideContentProps {
  title: string;
  location: string;
  price: string;
  features: string;
  isActive: boolean;
}

const SlideContent: React.FC<SlideContentProps> = ({
  title,
  location,
  price,
  features,
  isActive,
}) => {
  return (
    <div
      className={`slide-content absolute inset-0 flex flex-col justify-center items-center text-center px-4 md:px-10 z-10`}
    >
      <div className="max-w-4xl">
        <span className="inline-block text-custom-lime uppercase tracking-widest mb-2 text-sm md:text-base font-medium">
          {location}
        </span>
        <h1 className="text-4xl md:text-6xl lg:text-7xl text-white font-bold mb-3 tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-white/80 text-xl md:text-2xl mb-6">{features}</p>
        <p className="text-custom-lime text-2xl md:text-3xl font-bold">
          {price}
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button className="px-6 py-3 bg-white text-custom-dark font-bold rounded hover:bg-custom-lime hover:text-black transition-all duration-300">
            View Details
          </button>
          <button className="px-6 py-3 border border-white text-white font-bold rounded hover:bg-white/10 transition-all duration-300">
            Book Viewing
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlideContent;
