"use client";
import { CanvasEditor, ControlsPanel } from "@/components/ui/organisms";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("generator");

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
    <div className="h-[95vh] sm:h-[120vh] md:h-[95vh]   overflow-hidden">
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
        <>
          <div className=" absolute top-[25%] left-18 right-18 -z-0 ">
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
            <div className="w-full text-center mt-5">💡 {t("tip")}</div>
            <div className="w-full flex justify-center my-5">
              <button
                className="absolute inline-block bg-green-700 hover:bg-green-800 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition cursor-pointer"
                onClick={downloadImage}
              >
                {t("controls.download")}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div
          className=" absolute top-26 "
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

          <div className="w-full text-center mt-5">💡 {t("tip")}</div>
        </div>
      )}
    </div>
  );
}
