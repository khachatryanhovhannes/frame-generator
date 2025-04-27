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
          className="text-2xl p-1 sm:p-2 sm:text-3xl md:text-4xl md:p-3 2xl:text-5xl flex flex-col
          justify-center items-center md:w-20 md:h-20 xl:w-24 xl:h-24  w-14 h-14 leading-none
           rounded-full bg-primary bg-opacity-90 cursor-pointer"
        >
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
    </>
  );
}

export default ImageAddButton;
