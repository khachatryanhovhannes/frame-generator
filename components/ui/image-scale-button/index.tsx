"use client";

import React, { useState, useRef, useEffect } from "react";
import { TiZoomIn } from "react-icons/ti";

interface IImageScaleButtonProps {
  scale: number;
  setScale: (val: number) => void;
}

function ImageScaleButton({ scale, setScale }: IImageScaleButtonProps) {
  const [isRangeVisible, setIsRangeVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsRangeVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScale(parseFloat(e.target.value));
  };

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        onClick={() => setIsRangeVisible(!isRangeVisible)}
        className="text-2xl p-2 sm:text-3xl sm:p-3 md:text-4xl md:p-4 xl:text-5xl 3xl:text-6xl
        border-2 rounded-full border-gray-400 bg-white cursor-pointer block"
      >
        <TiZoomIn />
      </button>

      {isRangeVisible && (
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-4 bg-white p-3 rounded border border-gray-300 shadow-md w-48">
          <input
            type="range"
            min={0.1}
            max={3}
            step={0.1}
            value={scale}
            onChange={handleChange}
            className="w-full"
          />
          <div className="text-sm text-center mt-2 text-gray-700">
            {scale.toFixed(1)}x
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageScaleButton;
