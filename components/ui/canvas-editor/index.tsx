"use client";

import {
  useRef,
  useEffect,
  PointerEvent,
  WheelEvent,
  TouchEvent,
  useState,
} from "react";

interface CanvasRenderingContext2DWithConic extends CanvasRenderingContext2D {
  createConicGradient?(
    startAngle: number,
    x: number,
    y: number
  ): CanvasGradient;
}

interface Point {
  x: number;
  y: number;
}

export interface CanvasEditorProps {
  imageSrc: string;
  frameColor: string;
  frameWidth: number;
  text: string;
  textColor: string;
  textSize: number;
  fontFamily: string;
  fontWeight: string;
  angleDeg: number;
  fadeZone?: number;
  fadePadDeg?: number;
  scale: number;
  setScale: (v: number) => void;
}

const FIXED_CANVAS_SIZE = 600;

export default function CanvasEditor({
  imageSrc,
  frameColor,
  frameWidth,
  text,
  textColor,
  textSize,
  fontFamily,
  fontWeight,
  angleDeg,
  fadeZone = 0.25,
  fadePadDeg = 5,
  scale,
  setScale,
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [imgDims, setImgDims] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });

  const isDragging = useRef(false);
  const lastPos = useRef<Point>({ x: 0, y: 0 });
  const pinchPrev = useRef<number | null>(null);

  const clamp = (v: number, mn: number, mx: number): number =>
    Math.min(Math.max(v, mn), mx);

  const clampScale = (s: number): number => clamp(s, 0.3, 5);

  const clampOffset = (raw: Point): Point => {
    const r = FIXED_CANVAS_SIZE / 2 - frameWidth;
    const half = (FIXED_CANVAS_SIZE * scale) / 2;
    const max = Math.max(0, half - r);
    return { x: clamp(raw.x, -max, max), y: clamp(raw.y, -max, max) };
  };

  const hexToRGBA = (hex: string, a: number): string => {
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.fillStyle = hex;
    const match = ctx.fillStyle.match(/rgba?\((\d+), (\d+), (\d+)/);
    return match
      ? `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${a})`
      : `rgba(0,0,0,${a})`;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext(
      "2d"
    ) as CanvasRenderingContext2DWithConic | null;
    const img = imgRef.current;
    if (!canvas || !ctx || !img || !img.complete) return;

    const S = FIXED_CANVAS_SIZE;
    canvas.width = S;
    canvas.height = S;

    const cx = S / 2;
    const cy = S / 2;
    const radius = cx - frameWidth;

    ctx.clearRect(0, 0, S, S);

    const clipR = radius + frameWidth;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, clipR, 0, Math.PI * 2);
    ctx.clip();

    ctx.save();
    ctx.translate(cx + offset.x, cy + offset.y);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);

    const scaleToFit = S / Math.min(img.width, img.height);
    const w = img.width * scaleToFit;
    const h = img.height * scaleToFit;
    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      cx - w / 2,
      cy - h / 2,
      w,
      h
    );
    ctx.restore();

    const rFrame = radius + frameWidth / 2;
    ctx.lineWidth = frameWidth;
    ctx.lineCap = "round";

    ctx.font = `${fontWeight} ${textSize}px ${fontFamily}`;
    const linearLen = ctx.measureText(text).width;
    const textAngLen = linearLen / rFrame;

    const fadeAng = textAngLen * fadeZone + (fadePadDeg * Math.PI) / 180;
    const startAng = (angleDeg * Math.PI) / 180 - textAngLen / 2 - fadeAng;
    // const endAng = startAng + textAngLen + 2 * fadeAng;

    const supportsConic = typeof ctx.createConicGradient === "function";

    if (supportsConic) {
      const grad = ctx.createConicGradient!(startAng, cx, cy);
      grad.addColorStop(0, hexToRGBA(frameColor, 0));
      grad.addColorStop(fadeAng / (2 * Math.PI), frameColor);
      grad.addColorStop((fadeAng + textAngLen) / (2 * Math.PI), frameColor);
      grad.addColorStop(
        (fadeAng + textAngLen + fadeAng) / (2 * Math.PI),
        hexToRGBA(frameColor, 0)
      );
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, rFrame, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (text) {
      ctx.save();
      ctx.font = `${fontWeight} ${textSize}px ${fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      const rText = rFrame;
      let current = (angleDeg * Math.PI) / 180 - textAngLen / 2;

      for (const ch of text.split("").reverse()) {
        const wChar = ctx.measureText(ch).width;
        const ang = wChar / rText;
        const mid = current + ang / 2;

        ctx.save();
        ctx.translate(cx + rText * Math.cos(mid), cy + rText * Math.sin(mid));
        ctx.rotate(mid - Math.PI / 2); // նախկինում + էր, փոխեցինք -ով
        ctx.fillText(ch, 0, 0);
        ctx.restore();

        current += ang;
      }

      ctx.restore();
    }

    // if (text) {
    //   ctx.save();
    //   ctx.font = `${fontWeight} ${textSize}px ${fontFamily}`;
    //   ctx.fillStyle = textColor;
    //   ctx.textAlign = "center";
    //   ctx.textBaseline = "middle";

    //   const offsetRatio = 0.05;
    //   const K = 85e-5;
    //   const textWidth = ctx.measureText(text).width;
    //   const totalRotation = (K * textWidth + offsetRatio) * Math.PI;

    //   const rText = 0.86 * rFrame;
    //   ctx.translate(cx, cy);
    //   ctx.rotate(totalRotation);

    //   const rotation = Math.PI * -K + 0.5;
    //   for (const ch of text.split("")) {
    //     const charWidth = ctx.measureText(ch).width;
    //     const angle = rotation * charWidth;

    //     ctx.rotate(angle);
    //     ctx.save();
    //     ctx.translate(0, rText);
    //     ctx.fillText(ch, 0, 0);
    //     ctx.restore();
    //   }

    //   ctx.restore();
    // }

    // if (text) {
    //   ctx.save();
    //   ctx.font = `${fontWeight} ${textSize}px ${fontFamily}`;
    //   ctx.fillStyle = textColor;
    //   ctx.textBaseline = "middle";

    //   let current = (angleDeg * Math.PI) / 180 + textAngLen / 2;
    //   for (let i = 0; i < text.length; i++) {
    //     const ch = text[i];
    //     const wChar = ctx.measureText(ch).width;
    //     const ang = wChar / rFrame;
    //     const mid = current - ang / 2;

    //     ctx.save();
    //     ctx.translate(cx + rFrame * Math.cos(mid), cy + rFrame * Math.sin(mid));
    //     ctx.rotate(mid - Math.PI / 2);
    //     ctx.fillText(ch, 0, 0);
    //     ctx.restore();

    //     current -= ang;
    //   }

    //   ctx.restore();
    // }

    ctx.restore();
  };

  useEffect(draw, [
    frameColor,
    frameWidth,
    text,
    textColor,
    textSize,
    fontFamily,
    fontWeight,
    angleDeg,
    fadeZone,
    fadePadDeg,
    scale,
    offset,
    imgDims,
  ]);

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>): void => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>): void => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset((prev) => clampOffset({ x: prev.x + dx, y: prev.y + dy }));
  };

  const endDrag = (e: PointerEvent<HTMLCanvasElement>): void => {
    isDragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onWheel = (e: WheelEvent<HTMLCanvasElement>): void => {
    e.preventDefault();
    // const ns = clampScale(scale - e.deltaY * 0.001);
    // setScale(ns);
    setOffset((prev) => clampOffset(prev));
  };

  const onTouchMove = (e: TouchEvent<HTMLCanvasElement>): void => {
    if (e.touches.length === 2) {
      const [a, b] = e.touches;
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

      if (pinchPrev.current === null) pinchPrev.current = d;

      const delta = d - pinchPrev.current;
      pinchPrev.current = d;

      const ns = clampScale(scale + delta * 0.005);
      setScale(ns);
      setOffset((prev) => clampOffset(prev));
    }
  };

  const onTouchEnd = (): void => {
    pinchPrev.current = null;
  };

  return (
    <div className="flex justify-center items-center select-none">
      <img
        ref={imgRef}
        src={imageSrc}
        alt="hidden"
        style={{ display: "none" }}
        onLoad={(e) => {
          const i = e.currentTarget;
          setImgDims({ w: i.naturalWidth, h: i.naturalHeight });
          setScale(1);
          setOffset({ x: 0, y: 0 });
        }}
      />
      <canvas
        ref={canvasRef}
        className="rounded-full overflow-hidden shadow max-w-full touch-none bg-white"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onWheel={onWheel}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />
    </div>
  );
}
