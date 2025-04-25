import React, { ChangeEvent, ReactElement } from "react";
import ImageAddButton from "../image-add-button";
import BackgroundButton from "../background-button";
import TextColorButton from "../text-color-button";
import TextInputButton from "../text-input-button";
import TextSizeButton from "../text-size-button";
import TextWeightButton from "../font-weight-button";
import FontFamilyButton from "../font-family-button";
import FrameWidthButton from "../frame-width-button";
import TextStartAngleButton from "../text-start-angle-button";
import ImageScaleButton from "../image-scale-button";

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
    <div className="flex items-center justify-center h-screen bg-gray-50 overflow-hidden">
      {isCompactMode ? (
        <>
          <div className="w-full h-full flex flex-wrap justify-between items-center px-2 py-12 gap-6">
            <div className="flex flex-col gap-2 items-start fixed left-2 z-50">
              <BackgroundButton
                frameColor={frameColor}
                setFrameColor={setFrameColor}
              />
              <FrameWidthButton
                frameWidth={frameWidth}
                setFrameWidth={setFrameWidth}
              />
              <TextStartAngleButton
                angleDeg={angleDeg}
                setAngleDeg={setAngleDeg}
              />
              <ImageScaleButton scale={scale} setScale={setScale} />
              <ImageAddButton handleFileChange={handleFileChange} />
            </div>
            <div className="flex flex-col gap-2  fixed right-2 z-50">
              <TextColorButton
                textColor={textColor}
                setTextColor={setTextColor}
              />
              <TextInputButton text={text} setText={setText} />
              <TextSizeButton textSize={textSize} setTextSize={setTextSize} />
              <TextWeightButton
                fontWeight={fontWeight}
                setFontWeight={setFontWeight}
              />
              <FontFamilyButton
                fontFamily={fontFamily}
                setFontFamily={setFontFamily}
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
          className={`border-2 border-gray-800 rounded-full mt-[-50px]`}
        >
          <TextColorButton textColor={textColor} setTextColor={setTextColor} />
          <TextInputButton text={text} setText={setText} />
          <TextSizeButton textSize={textSize} setTextSize={setTextSize} />
          <TextWeightButton
            fontWeight={fontWeight}
            setFontWeight={setFontWeight}
          />
          <FontFamilyButton
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
          />
          <button
            className="absolute bg-green-500 px-10 py-3 rounded-lg text-white"
            onClick={downloadImage}
          >
            Download
          </button>
          <ImageAddButton handleFileChange={handleFileChange} />
          <ImageScaleButton scale={scale} setScale={setScale} />
          <TextStartAngleButton angleDeg={angleDeg} setAngleDeg={setAngleDeg} />
          <FrameWidthButton
            frameWidth={frameWidth}
            setFrameWidth={setFrameWidth}
          />
          <BackgroundButton
            frameColor={frameColor}
            setFrameColor={setFrameColor}
          />
        </CircleMenu>
      )}
    </div>
  );
}

function CircleMenu({
  radius = 300,
  size = 0,
  className = "",
  children,
  arcSpan = 70,
}: {
  radius: number;
  size: number;
  className: string;
  children: ReactElement | ReactElement[];
  arcSpan?: number;
}) {
  console.log(size);

  const items = React.Children.toArray(children);
  const mid = Math.ceil(items.length / 2);
  const rightItems = items.slice(0, mid);
  const leftItems = items.slice(mid);

  return (
    <div
      className={`relative ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: size,
        width: size,
      }}
    >
      {rightItems.map((child, i) => {
        const count = rightItems.length;
        const startAngle = 90 - arcSpan / 2;
        const angle = count > 1 ? startAngle + (arcSpan / (count - 1)) * i : 90;
        const transform =
          `translate(-50%, -50%) ` +
          `rotate(${angle}deg) ` +
          `translate(0, -${radius}px) ` +
          `rotate(${-angle}deg)`;
        return (
          <div
            key={`r${i}`}
            className="absolute  z-50"
            style={{ top: "50%", left: "50%", transform }}
          >
            {child}
          </div>
        );
      })}

      {leftItems.map((child, i) => {
        const count = leftItems.length;
        const startAngle = 270 - arcSpan / 2;
        const angle =
          count > 1 ? startAngle + (arcSpan / (count - 1)) * i : 270;
        const transform =
          `translate(-50%, -50%) ` +
          `rotate(${angle}deg) ` +
          `translate(0, -${radius}px) ` +
          `rotate(${-angle}deg)`;
        return (
          <div
            key={`l${i}`}
            className="absolute z-50"
            style={{ top: "50%", left: "50%", transform }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
