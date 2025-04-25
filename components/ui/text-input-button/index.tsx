"use client";

import React, { useEffect, useRef, useState } from "react";
import { RiAiGenerateText } from "react-icons/ri";

interface ITextInputButtonProps {
  text: string;
  setText: (val: string) => void;
}

function TextInputButton({ text, setText }: ITextInputButtonProps) {
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

  return (
    <div ref={wrapperRef} className="relative inline-block z-50">
      <button
        onClick={() => setIsInputVisible(!isInputVisible)}
        className="text-2xl p-2 sm:text-3xl sm:p-3 md:text-4xl md:p-4 xl:text-5xl 3xl:text-6xl
        border-2 rounded-full border-gray-400 bg-white cursor-pointer"
       
      >
        <RiAiGenerateText />
      </button>

      {isInputVisible && (
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
          className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-3 py-1 rounded border border-gray-300 bg-white text-black shadow-md"
        />
      )}
    </div>
  );
}

export default TextInputButton;
