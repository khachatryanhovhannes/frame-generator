"use client";

import React, { ChangeEvent } from "react";
import { EditorButton, ImageAddButton } from "../../atoms";
import { IoMdColorFill } from "react-icons/io";
import {
  RiAiGenerateText,
  RiBold,
  RiFontFamily,
  RiFontSize,
  RiFullscreenLine,
  RiRotateLockLine,
} from "react-icons/ri";
import { IoColorFilterOutline } from "react-icons/io5";
import { TiZoomIn } from "react-icons/ti";
import { CircleMenu } from "@/hoc";
import { useTranslations } from "next-intl";

interface IControlsPanelProps {
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  frameColor: string;
  setFrameColor: (e: string) => void;
  textColor: string;
  setTextColor: (e: string) => void;
  text: string;
  setText: (val: string) => void;
  textSize: number;
  setTextSize: (val: number) => void;
  fontWeight: string;
  setFontWeight: (val: string) => void;
  fontFamily: string;
  setFontFamily: (val: string) => void;
  frameWidth: number;
  setFrameWidth: (val: number) => void;
  angleDeg: number;
  setAngleDeg: (val: number) => void;
  scale: number;
  setScale: (val: number) => void;
  downloadImage: () => void;
  isCompactMode: boolean;
  circleSize: number;
}

export default function ControlsPanel({
  handleFileChange,
  frameColor,
  setFrameColor,
  textColor,
  setTextColor,
  text,
  setText,
  textSize,
  setTextSize,
  fontWeight,
  setFontWeight,
  fontFamily,
  setFontFamily,
  frameWidth,
  setFrameWidth,
  angleDeg,
  setAngleDeg,
  scale,
  setScale,
  downloadImage,
  isCompactMode,
  circleSize,
}: IControlsPanelProps) {
  const tControls = useTranslations("generator.controls");

  return (
    <div className="flex items-center justify-center h-screen overflow-hidden">
      {isCompactMode ? (
        <>
          <div className="w-full h-full  px-2 py-12 gap-6 mt-20 relative">
            <div className="flex flex-col justify-between h-[50vh] gap-2 absolute left-2 z-50">
              <EditorButton
                icon={<IoMdColorFill />}
                value={frameColor}
                setValue={(val) => {
                  if (typeof val === "string") setFrameColor(val);
                }}
                inputType="color"
                text={tControls("frameColor")}
              />
              <EditorButton
                icon={<RiFullscreenLine />}
                value={frameWidth}
                setValue={(val) => {
                  if (typeof val === "number") setFrameWidth(val);
                }}
                inputType="range"
                min={50}
                max={130}
                step={1}
                text={tControls("frameWidth")}
              />
              <EditorButton
                icon={<RiRotateLockLine />}
                value={angleDeg}
                setValue={(val) => {
                  if (typeof val === "number") setAngleDeg(val);
                }}
                inputType="range"
                min={0}
                max={360}
                step={1}
                text={tControls("startAngle")}
              />
              <EditorButton
                icon={<TiZoomIn />}
                value={scale}
                setValue={(val) => {
                  if (typeof val === "number") setScale(val);
                }}
                inputType="range"
                min={0.1}
                max={3}
                step={0.1}
                text={tControls("zoom")}
              />
              <ImageAddButton handleFileChange={handleFileChange} />
            </div>

            <div className="flex flex-col justify-between h-[50vh] gap-2 absolute  right-2 z-50">
              <EditorButton
                icon={<IoColorFilterOutline />}
                value={textColor}
                setValue={(val) => {
                  if (typeof val === "string") setTextColor(val);
                }}
                inputType="color"
                text={tControls("textColor")}
              />
              <EditorButton
                icon={<RiAiGenerateText />}
                value={text}
                setValue={(val) => {
                  if (typeof val === "string") setText(val);
                }}
                inputType="text"
                text={tControls("text")}
              />
              <EditorButton
                icon={<RiFontSize />}
                value={textSize}
                setValue={(val) => {
                  if (typeof val === "number") setTextSize(val);
                }}
                inputType="number"
                text={tControls("fontSize")}
              />
              <EditorButton
                icon={<RiBold />}
                value={fontWeight}
                setValue={(val) => {
                  if (typeof val === "string") setFontWeight(val);
                }}
                inputType="select"
                options={["300", "400", "500", "600", "700", "800", "900"]}
                text={tControls("fontWeight")}
              />
              <EditorButton
                icon={<RiFontFamily />}
                value={fontFamily}
                setValue={(val) => {
                  if (typeof val === "string") setFontFamily(val);
                }}
                inputType="select"
                options={[
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
                ]}
                text={tControls("fontFamily")}
              />
            </div>
          </div>
        </>
      ) : (
        <CircleMenu
          radius={circleSize / 2}
          size={circleSize}
          className="border-2 border-secondary rounded-full mt-[-50px]"
        >
          <EditorButton
            icon={<IoColorFilterOutline />}
            value={textColor}
            setValue={(val) => {
              if (typeof val === "string") setTextColor(val);
            }}
            inputType="color"
            text={tControls("textColor")}
          />
          <EditorButton
            icon={<RiAiGenerateText />}
            value={text}
            setValue={(val) => {
              if (typeof val === "string") setText(val);
            }}
            inputType="text"
            text={tControls("text")}
          />
          <EditorButton
            icon={<RiFontSize />}
            value={textSize}
            setValue={(val) => {
              if (typeof val === "number") setTextSize(val);
            }}
            inputType="number"
            text={tControls("fontSize")}
          />
          <EditorButton
            icon={<RiBold />}
            value={fontWeight}
            setValue={(val) => {
              if (typeof val === "string") setFontWeight(val);
            }}
            inputType="select"
            options={["300", "400", "500", "600", "700", "800", "900"]}
            text={tControls("fontWeight")}
          />
          <EditorButton
            icon={<RiFontFamily />}
            value={fontFamily}
            setValue={(val) => {
              if (typeof val === "string") setFontFamily(val);
            }}
            inputType="select"
            options={[
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
            ]}
            text={tControls("fontFamily")}
          />
          <button
            className="absolute -ml-16  inline-block bg-green-700 cursor-pointer hover:bg-green-800 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition"
            onClick={downloadImage}
          >
            {tControls("download")}
          </button>
          <ImageAddButton handleFileChange={handleFileChange} />
          <EditorButton
            icon={<TiZoomIn />}
            value={scale}
            setValue={(val) => {
              if (typeof val === "number") setScale(val);
            }}
            inputType="range"
            min={0.1}
            max={3}
            step={0.1}
            text={tControls("zoom")}
          />
          <EditorButton
            icon={<RiRotateLockLine />}
            value={angleDeg}
            setValue={(val) => {
              if (typeof val === "number") setAngleDeg(val);
            }}
            inputType="range"
            min={0}
            max={360}
            step={1}
            text={tControls("startAngle")}
          />
          <EditorButton
            icon={<RiFullscreenLine />}
            value={frameWidth}
            setValue={(val) => {
              if (typeof val === "number") setFrameWidth(val);
            }}
            inputType="range"
            min={50}
            max={130}
            step={1}
            text={tControls("frameWidth")}
          />
          <EditorButton
            icon={<IoMdColorFill />}
            value={frameColor}
            setValue={(val) => {
              if (typeof val === "string") setFrameColor(val);
            }}
            inputType="color"
            text={tControls("frameColor")}
          />
        </CircleMenu>
      )}
    </div>
  );
}
