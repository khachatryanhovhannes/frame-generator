import React from "react";

type ControlsPanelProps = {
  frameColor: string;
  setFrameColor: (v: string) => void;
  frameWidth: number;
  setFrameWidth: (v: number) => void;
  text: string;
  setText: (v: string) => void;
  textColor: string;
  setTextColor: (v: string) => void;
  textSize: number;
  setTextSize: (v: number) => void;
  fontFamily: string;
  setFontFamily: (v: string) => void;
  fontWeight: string;
  setFontWeight: (v: string) => void;
  angleDeg: number;
  setAngleDeg: (v: number) => void;
  scale: number;
  setScale: (v: number) => void;
};

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  frameColor,
  setFrameColor,
  frameWidth,
  setFrameWidth,
  text,
  setText,
  textColor,
  setTextColor,
  textSize,
  setTextSize,
  fontFamily,
  setFontFamily,
  fontWeight,
  setFontWeight,
  angleDeg,
  setAngleDeg,
  scale,
  setScale,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-gray-700">
          Zoom ({scale.toFixed(2)}x)
        </label>
        <input
          type="range"
          min={0.3}
          max={5}
          step={0.01}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Frame Color</label>
        <input
          type="color"
          value={frameColor}
          onChange={(e) => setFrameColor(e.target.value)}
          className="w-full h-10"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Frame Width</label>
        <input
          type="range"
          min={20}
          max={200}
          value={frameWidth}
          onChange={(e) => setFrameWidth(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Text Color</label>
        <input
          type="color"
          value={textColor}
          onChange={(e) => setTextColor(e.target.value)}
          className="w-full h-10"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Text Size</label>
        <input
          type="number"
          min={10}
          max={200}
          value={textSize}
          onChange={(e) => setTextSize(Number(e.target.value))}
          className="w-full border px-2 py-1 rounded"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Font Family</label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="w-full border px-2 py-1 rounded"
        >
          <option>Segoe UI</option>
          <option>Arial</option>
          <option>Georgia</option>
          <option>Verdana</option>
          <option>Courier New</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Font Weight</label>
        <select
          value={fontWeight}
          onChange={(e) => setFontWeight(e.target.value)}
          className="w-full border px-2 py-1 rounded"
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
          <option value="100">100</option>
          <option value="200">200</option>
          <option value="300">300</option>
          <option value="400">400</option>
          <option value="500">500</option>
          <option value="600">600</option>
          <option value="700">700</option>
          <option value="800">800</option>
          <option value="900">900</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">
          Text Start Angle ({angleDeg}°)
        </label>
        <input
          type="range"
          min={0}
          max={360}
          value={angleDeg}
          onChange={(e) => setAngleDeg(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ControlsPanel;
