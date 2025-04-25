"use client";

import React, { useState, useRef, useEffect } from "react";
import { RiFontSize } from "react-icons/ri";

interface ITextSizeButtonProps {
  textSize: number;
  setTextSize: (val: number) => void;
}

function TextSizeButton({ textSize, setTextSize }: ITextSizeButtonProps) {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsInputVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setTextSize(value);
    }
  };

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        onClick={() => setIsInputVisible(!isInputVisible)}
        className="text-2xl p-2 sm:text-3xl sm:p-3 md:text-4xl md:p-4 xl:text-5xl 3xl:text-6xl
        border-2 rounded-full border-gray-400 bg-white cursor-pointer"
      >
        <RiFontSize />
      </button>

      {isInputVisible && (
        <input
          type="number"
          value={textSize}
          onChange={handleChange}
          autoFocus
          className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-3 py-1 rounded border border-gray-300 bg-white text-black shadow-md w-20"
        />
      )}
    </div>
  );
}

export default TextSizeButton;
