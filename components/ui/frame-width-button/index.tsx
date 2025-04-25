"use client";

import React, { useState, useRef, useEffect } from "react";
import { RiFullscreenLine } from "react-icons/ri";

interface IFrameWidthButtonProps {
  frameWidth: number;
  setFrameWidth: (val: number) => void;
}

function FrameWidthButton({
  frameWidth,
  setFrameWidth,
}: IFrameWidthButtonProps) {
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
    setFrameWidth(parseInt(e.target.value, 10));
  };

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        onClick={() => setIsRangeVisible(!isRangeVisible)}
         className="text-2xl p-2 sm:text-3xl sm:p-3 md:text-4xl md:p-4 xl:text-5xl 3xl:text-6xl
        border-2 rounded-full border-gray-400 bg-white cursor-pointer block"
      >
        <RiFullscreenLine />
      </button>

      {isRangeVisible && (
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-4 bg-white p-3 rounded border border-gray-300 shadow-md w-48">
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={frameWidth}
            onChange={handleChange}
            className="w-full"
          />
          <div className="text-sm text-center mt-2 text-gray-700">
            {frameWidth}px
          </div>
        </div>
      )}
    </div>
  );
}

export default FrameWidthButton;
