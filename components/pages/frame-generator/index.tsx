"use client";
import CanvasEditor from "@/components/ui/canvas-editor";
import ControlsPanel from "@/components/ui/organisms/controls-panel";
import { useEffect, useState } from "react";

export default function FrameGenerator() {
  const [imageSrc, setImageSrc] = useState<string>("/user.png");
  const [frameColor, setFrameColor] = useState("#107038");
  const [frameWidth, setFrameWidth] = useState(70);
  const [text, setText] = useState("#OPENTOWORK");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState(50);
  const [fontFamily, setFontFamily] = useState("Courier New");
  const [fontWeight, setFontWeight] = useState("700");
  const [circleSize, setCircleSize] = useState(0);
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [width, setWidth] = useState(1000);

  const [angleDeg, setAngleDeg] = useState(120);
  const [scale, setScale] = useState(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const downloadImage = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "framed-image.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setWidth(w);
      console.log(" window.innerWidth", window.innerWidth);
      console.log("window.innerHeight", window.innerHeight);
      if (w > h * 1.4) {
        setIsCompactMode(false);
        setCircleSize(h * 1.2);
      } else {
        setIsCompactMode(true);
        setCircleSize(0);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="h-[95vh]  overflow-hidden">
      <ControlsPanel
        handleFileChange={handleFileChange}
        frameColor={frameColor}
        setFrameColor={setFrameColor}
        textColor={textColor}
        setTextColor={setTextColor}
        text={text}
        setText={setText}
        textSize={textSize}
        setTextSize={setTextSize}
        fontWeight={fontWeight}
        setFontWeight={setFontWeight}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        frameWidth={frameWidth}
        setFrameWidth={setFrameWidth}
        angleDeg={angleDeg}
        setAngleDeg={setAngleDeg}
        scale={scale}
        setScale={setScale}
        downloadImage={downloadImage}
        circleSize={circleSize}
        isCompactMode={isCompactMode}
      />
      {isCompactMode ? (
        <div className="flex absolute justify-center items-center top-28 left-16 right-16 -z-0 ">
          <CanvasEditor
            imageSrc={imageSrc}
            frameColor={frameColor}
            frameWidth={frameWidth}
            text={text}
            textColor={textColor}
            textSize={textSize}
            fontFamily={fontFamily}
            fontWeight={fontWeight}
            angleDeg={angleDeg}
            scale={scale}
            setScale={setScale}
          />
        </div>
      ) : (
        <div
          className="flex absolute justify-center items-center top-26"
          style={{
            zIndex: 0,
            left: (width - 600) / 2 + "px",
            right: (width - 600) / 2 + "px",
          }}
        >
          <CanvasEditor
            imageSrc={imageSrc}
            frameColor={frameColor}
            frameWidth={frameWidth}
            text={text}
            textColor={textColor}
            textSize={textSize}
            fontFamily={fontFamily}
            fontWeight={fontWeight}
            angleDeg={angleDeg}
            scale={scale}
            setScale={setScale}
          />
        </div>
      )}
    </div>
  );
}
