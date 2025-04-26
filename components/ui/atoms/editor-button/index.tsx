"use client";

import React, { useEffect, useRef, useState } from "react";

type InputType = "color" | "number" | "range" | "file" | "text" | "select";

interface UniversalEditorButtonPropsBase {
  icon: React.ReactNode;
  inputType: InputType;
  extraClassName?: string;
  accept?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[]; // ✅ Ավելացրինք SELECT-ի համար
}

type ValueType<T extends InputType> = T extends "file"
  ? File | null
  : T extends "color"
  ? string
  : T extends "text"
  ? string
  : T extends "select"
  ? string
  : T extends "number"
  ? number
  : T extends "range"
  ? number
  : never;

interface UniversalEditorButtonProps<T extends InputType>
  extends UniversalEditorButtonPropsBase {
  value: ValueType<T>;
  setValue: (value: ValueType<T>) => void;
}

function EditorButton<T extends InputType>({
  icon,
  value,
  setValue,
  inputType,
  min,
  max,
  step,
  accept,
  options,
  extraClassName,
}: UniversalEditorButtonProps<T>) {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (inputType === "file") {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setValue(file as ValueType<T>);
    } else if (inputType === "number" || inputType === "range") {
      setValue(parseFloat(e.target.value) as ValueType<T>);
    } else {
      setValue(e.target.value as ValueType<T>);
    }
  };

  const handleButtonClick = () => {
    if (inputType === "color" || inputType === "file") {
      hiddenInputRef.current?.click();
    } else {
      setIsInputVisible((prev) => !prev);
    }
  };

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <button
        type="button"
        onClick={handleButtonClick}
        className={`text-2xl p-2 sm:text-3xl sm:p-3 md:text-4xl md:p-4 xl:text-5xl 3xl:text-6xl
          border-2 rounded-full  bg-primary cursor-pointer block ${
            extraClassName || ""
          }`}
      >
        {icon}
      </button>

      {(inputType === "color" || inputType === "file") && (
        <input
          ref={hiddenInputRef}
          type={inputType}
          accept={accept}
          onChange={handleChange}
          className="w-0 h-o"
        />
      )}

      {isInputVisible && (
        <>
          {inputType === "range" ? (
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-4 bg-primary  p-3 rounded border shadow-md w-48">
              <input
                type="range"
                min={min}
                max={max}
                step={step || 1}
                value={value as number}
                onChange={handleChange}
                className="w-full"
              />
              {typeof value === "string" || typeof value === "number" ? (
                <div className="text-sm text-center mt-2 text-gray-700">
                  {value}
                </div>
              ) : null}
            </div>
          ) : inputType === "select" ? (
            <select
              value={value as string}
              onChange={handleChange}
              autoFocus
              className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-3 py-1 rounded border border-gray-300 bg-white text-black shadow-md w-48"
            >
              {options?.map((opt) => (
                <option
                  key={opt}
                  value={opt}
                  style={
                    inputType === "select" && value === opt
                      ? { fontWeight: "bold" }
                      : {}
                  }
                >
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={inputType}
              value={value as string | number}
              onChange={handleChange}
              autoFocus
              className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-3 py-1 rounded border border-gray-300 bg-white text-black shadow-md w-24"
            />
          )}
        </>
      )}
    </div>
  );
}

export default EditorButton;
