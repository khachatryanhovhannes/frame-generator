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
  return (
    <div className="flex items-center justify-center h-screen  overflow-hidden">
      {isCompactMode ? (
        <>
          <div className="w-full h-full flex flex-wrap justify-between items-center px-2 py-12 gap-6">
            <div className="flex flex-col gap-2 items-start fixed left-2 z-50">
              <EditorButton
                icon={<IoMdColorFill />}
                value={frameColor}
                setValue={(val) => {
                  if (typeof val === "string") {
                    setFrameColor(val);
                  }
                }}
                inputType="color"
              />
              <EditorButton
                icon={<RiFullscreenLine />}
                value={frameWidth}
                setValue={(val) => {
                  if (typeof val === "number") {
                    setFrameWidth(val);
                  }
                }}
                inputType="range"
                min={1}
                max={100}
                step={1}
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
              />
              <ImageAddButton handleFileChange={handleFileChange} />
            </div>
            <div className="flex flex-col gap-2  fixed right-2 z-50">
              <EditorButton
                icon={<IoColorFilterOutline />}
                value={textColor}
                setValue={(val) => {
                  if (typeof val === "string") setTextColor(val);
                }}
                inputType="color"
              />
              <EditorButton
                icon={<RiAiGenerateText />}
                value={text}
                setValue={(val) => {
                  if (typeof val === "string") setText(val);
                }}
                inputType="text"
              />
              <EditorButton
                icon={<RiFontSize />}
                value={textSize}
                setValue={(val) => {
                  if (typeof val === "number") setTextSize(val);
                }}
                inputType="number"
              />
              <EditorButton
                icon={<RiBold />}
                value={fontWeight}
                setValue={(val) => {
                  if (typeof val === "string") setFontWeight(val);
                }}
                inputType="select"
                options={["300", "400", "500", "600", "700", "800", "900"]}
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
              />
            </div>
          </div>

          {/* <button
            className="absolute bg-green-500 px-10 py-3 rounded-lg text-white"
            onClick={downloadImage}
          >
            Download
          </button> */}
        </>
      ) : (
        <CircleMenu
          radius={circleSize / 2}
          size={circleSize}
          className={`border-2 border-secondary rounded-full mt-[-50px]`}
        >
          <EditorButton
            icon={<IoColorFilterOutline />}
            value={textColor}
            setValue={(val) => {
              if (typeof val === "string") setTextColor(val);
            }}
            inputType="color"
          />
          <EditorButton
            icon={<RiAiGenerateText />}
            value={text}
            setValue={(val) => {
              if (typeof val === "string") setText(val);
            }}
            inputType="text"
          />
          <EditorButton
            icon={<RiFontSize />}
            value={textSize}
            setValue={(val) => {
              if (typeof val === "number") setTextSize(val);
            }}
            inputType="number"
          />
          <EditorButton
            icon={<RiBold />}
            value={fontWeight}
            setValue={(val) => {
              if (typeof val === "string") setFontWeight(val);
            }}
            inputType="select"
            options={["300", "400", "500", "600", "700", "800", "900"]}
          />
          {/* <FontFamilyButton
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
          /> */}
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
          />
          <button
            className="absolute bg-green-500 px-10 py-3 rounded-lg text-white"
            onClick={downloadImage}
          >
            Download
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
          />
          <EditorButton
            icon={<RiFullscreenLine />}
            value={frameWidth}
            setValue={(val) => {
              if (typeof val === "number") {
                setFrameWidth(val);
              }
            }}
            inputType="range"
            min={50}
            max={130}
            step={1}
          />
          <EditorButton
            icon={<IoMdColorFill />}
            value={frameColor}
            setValue={(val) => {
              if (typeof val === "string") {
                setFrameColor(val);
              }
            }}
            inputType="color"
          />
        </CircleMenu>
      )}
    </div>
  );
}
