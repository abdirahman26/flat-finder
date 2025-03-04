"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import SlideContent from "@components/SlideContent";

// Property data
const properties = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=2070&auto=format&fit=crop",
    title: "Charming Victorian Terraced House",
    location: "Islington, London",
    price: "£785,000",
    features: "3 Bedrooms • 1 Bathroom • 1,100 sq ft",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=2070&auto=format&fit=crop",
    title: "Modern Apartment with Balcony",
    location: "Canary Wharf, London",
    price: "£450,000",
    features: "2 Bedrooms • 2 Bathrooms • 850 sq ft",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop",
    title: "Modest Garden Flat",
    location: "Hackney, London",
    price: "£425,000",
    features: "1 Bedroom • 1 Bathroom • 550 sq ft",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop",
    title: "Cozy Mews House with Character",
    location: "Notting Hill, London",
    price: "£895,000",
    features: "3 Bedrooms • 2 Bathrooms • 1,200 sq ft",
  },
];

// Slider component
const PropertySlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");
  const [progress, setProgress] = useState(0);
  const [sliding, setSliding] = useState(false);

  const SLIDE_DURATION = 7000; // 7 seconds per slide

  const nextSlide = useCallback(() => {
    if (sliding) return;
    setSliding(true);
    setSlideDirection("next");
    setCurrentSlide((prev) => (prev + 1) % properties.length);
    setTimeout(() => setSliding(false), 700); // Match transition duration
  }, [sliding]);

  const prevSlide = useCallback(() => {
    if (sliding) return;
    setSliding(true);
    setSlideDirection("prev");
    setCurrentSlide(
      (prev) => (prev - 1 + properties.length) % properties.length
    );
    setTimeout(() => setSliding(false), 700); // Match transition duration
  }, [sliding]);

  const goToSlide = useCallback(
    (index: number) => {
      if (sliding || index === currentSlide) return;
      setSliding(true);
      setSlideDirection(index > currentSlide ? "next" : "prev");
      setCurrentSlide(index);
      setTimeout(() => setSliding(false), 700); // Match transition duration
    },
    [currentSlide, sliding]
  );

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + 100 / (SLIDE_DURATION / 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [nextSlide]);

  // Reset progress when slide changes
  useEffect(() => {
    setProgress(0);
  }, [currentSlide]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Property slides */}
      {properties.map((property, index) => {
        // Calculate classes for slide transitions
        const isActive = index === currentSlide;
        const direction = slideDirection === "next" ? 1 : -1;
        const transform = isActive
          ? "translate-x-0"
          : index ===
            (currentSlide + direction + properties.length) % properties.length
          ? "translate-x-full"
          : "translate-x-[-100%]";

        return (
          <div
            key={property.id}
            className={`property-slide absolute inset-0 transition-all duration-700 ease-in-out ${
              isActive ? "z-10 opacity-100 slide-active" : "opacity-0"
            } ${sliding && !isActive ? "slide-exit" : ""}`}
            style={{ transform }}
          >
            <div className="relative h-full">
              <img
                src={property.image}
                alt={property.title}
                className="property-image"
                loading="lazy"
              />
              <div className="property-overlay" />
              <SlideContent
                title={property.title}
                location={property.location}
                price={property.price}
                features={property.features}
                isActive={isActive}
              />
            </div>
          </div>
        );
      })}

      {/* Navigation controls */}
      <Navigation
        total={properties.length}
        current={currentSlide}
        onNext={nextSlide}
        onPrev={prevSlide}
        onDotClick={goToSlide}
        progress={progress}
      />
    </div>
  );
};

export default PropertySlider;
