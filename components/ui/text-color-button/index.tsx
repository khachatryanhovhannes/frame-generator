import React from "react";
import { IoColorFilterOutline } from "react-icons/io5";

interface ITextColorButton {
  textColor: string;
  setTextColor: (e: string) => void;
}

function TextColorButton({ textColor, setTextColor }: ITextColorButton) {
  return (
    <button className="">
      <label
        htmlFor="textColor"
        className="text-2xl p-2 sm:text-3xl sm:p-3 md:text-4xl md:p-4 xl:text-5xl 3xl:text-6xl
        border-2 rounded-full border-gray-400 bg-white cursor-pointer block"
      >
        <IoColorFilterOutline />
      </label>
      <input
        type="color"
        id="textColor"
        value={textColor}
        onChange={(e) => setTextColor(e.target.value)}
        accept="image/*"
        className="h-0 w-0 absolute z-100"
      />
    </button>
  );
}

export default TextColorButton;
