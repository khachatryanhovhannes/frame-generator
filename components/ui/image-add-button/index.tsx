import React, { ChangeEvent } from "react";
import { RiImageAddFill } from "react-icons/ri";

interface IImageAddButton {
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

function ImageAddButton({ handleFileChange }: IImageAddButton) {
  return (
    <>
      <button>
        <label
          data-tooltip-target="tooltip-default"
          htmlFor="upload"
          className="text-2xl p-2 sm:text-3xl sm:p-3 md:text-4xl md:p-4 xl:text-5xl 3xl:text-6xl
          border-2 rounded-full border-gray-400 bg-white cursor-pointer block"        >
          <RiImageAddFill />
        </label>
        <input
          id="upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </button>
      <div
        id="tooltip-default"
        role="tooltip"
        className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700"
      >
        Tooltip content
        <div className="tooltip-arrow" data-popper-arrow></div>
      </div>
    </>
  );
}

export default ImageAddButton;
