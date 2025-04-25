"use client";

import React, { useState, useRef, useEffect } from "react";
import { RiFontFamily } from "react-icons/ri";

interface IFontFamilyButtonProps {
  fontFamily: string;
  setFontFamily: (val: string) => void;
}

const FONT_FAMILIES = [
  "Arial",
  "Georgia",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Comic Sans MS",
  "Montserrat",
  "Roboto",
];

function FontFamilyButton({
  fontFamily,
  setFontFamily,
}: IFontFamilyButtonProps) {
  const [isSelectVisible, setIsSelectVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsSelectVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFontFamily(e.target.value);
  };

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        onClick={() => setIsSelectVisible(!isSelectVisible)}
        className="text-2xl p-2 sm:text-3xl sm:p-3 md:text-4xl md:p-4 xl:text-5xl 3xl:text-6xl
        border-2 rounded-full border-gray-400 bg-white cursor-pointer block"
      >
        <RiFontFamily />
      </button>

      {isSelectVisible && (
        <select
          value={fontFamily}
          onChange={handleChange}
          autoFocus
          className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-3 py-1 rounded border border-gray-300 bg-white text-black shadow-md w-48"
        >
          {FONT_FAMILIES.map((family) => (
            <option key={family} value={family} style={{ fontFamily: family }}>
              {family}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default FontFamilyButton;
