"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { v4 as uuid } from "uuid";
import {
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Undo,
  Redo,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Type as TypeIcon,
  Square,
  Download,
} from "lucide-react";

// --- CONSTANTS ---
const INITIAL_BANNER_WIDTH = 1584;
const INITIAL_BANNER_HEIGHT = 396;
const CANVAS_BG = "#f0f2f5";
const HANDLE_SIZE = 12;
const ROTATION_HANDLE_OFFSET = 30;
const FONT_LIST = [
  "Arial",
  "Verdana",
  "Georgia",
  "Times New Roman",
  "Impact",
  "Comic Sans MS",
  "Montserrat",
  "Roboto",
  "Lato",
  "Oswald",
];
const SNAP_THRESHOLD = 8;

const CANVAS_PRESETS = {
  "linkedin-banner": { name: "LinkedIn Banner", width: 1584, height: 396 },
  "facebook-cover": { name: "Facebook Cover", width: 851, height: 315 },
  "twitter-header": { name: "Twitter Header", width: 1500, height: 500 },
  "youtube-channel-art": {
    name: "YouTube Channel Art",
    width: 2560,
    height: 1440,
  },
};

// --- TYPE DEFINITIONS ---
type LayerType = "image" | "text" | "shape";
type ShapeType = "rectangle" | "circle" | "triangle";
type FontFamily = (typeof FONT_LIST)[number];
type FontWeight = "normal" | "bold";
type TextAlign = "left" | "center" | "right";
type DragType =
  | "move"
  | "rotate"
  | "resize-tl"
  | "resize-tr"
  | "resize-bl"
  | "resize-br"
  | "resize-t"
  | "resize-b"
  | "resize-l"
  | "resize-r"
  | "text-w";

interface BaseLayer {
  id: string;
  type: LayerType;
  position: { x: number; y: number };
  rotation: number;
  zIndex: number;
  opacity: number;
  visible: boolean;
  isLocked?: boolean;
}

interface ImageLayer extends BaseLayer {
  type: "image";
  src: string;
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
  crop: { top: number; right: number; bottom: number; left: number };
  filters: {
    brightness: number;
    contrast: number;
    saturate: number;
    grayscale: number;
    blur: number;
  };
}

interface TextLayer extends BaseLayer {
  type: "text";
  text: string;
  font: FontFamily;
  color: string;
  size: number;
  fontWeight: FontWeight;
  italic: boolean;
  underline: boolean;
  shadow: boolean;
  maxWidth: number;
  textAlign: TextAlign;
  lineHeight: number;
}

interface ShapeLayer extends BaseLayer {
  type: "shape";
  shapeType: ShapeType;
  width: number;
  height: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  borderRadius?: number; // Percentage from 0 to 100
}

type Layer = ImageLayer | TextLayer | ShapeLayer;

type HistoryState = {
  layers: Layer[];
  activeLayerId: string | null;
  canvasWidth: number;
  canvasHeight: number;
};

type Point = { x: number; y: number };

type LayerBounds = {
  w: number;
  h: number;
  corners: {
    tl: Point;
    tr: Point;
    br: Point;
    bl: Point;
  };
};

type DragState = {
  id: string;
  type: DragType;
  start: Point;
  layerStart: Layer & { bounds?: LayerBounds };
  pivot?: Point;
} | null;

// --- HELPER FUNCTIONS ---
function getRelativePos(
  e: React.MouseEvent | MouseEvent,
  canvas: HTMLCanvasElement
): Point {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function rotatePoint(point: Point, origin: Point, angle: number): Point {
  const angleRad = (angle * Math.PI) / 180;
  const s = Math.sin(angleRad);
  const c = Math.cos(angleRad);
  const px = point.x - origin.x;
  const py = point.y - origin.y;
  const xnew = px * c - py * s;
  const ynew = px * s + py * c;
  return { x: xnew + origin.x, y: ynew + origin.y };
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeightMultiplier: number
): { lines: string[]; textHeight: number; lineHeight: number } {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  const metrics = ctx.measureText("M");
  const lineHeight =
    (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) *
    lineHeightMultiplier;
  const textHeight = lines.length * lineHeight;
  return { lines, textHeight, lineHeight };
}

// --- UI COMPONENTS ---
interface TopControlPanelProps {
  onImageAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextAdd: () => void;
  onShapeAdd: (shapeType: ShapeType) => void;
  onDownload: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSizeChange: (presetKey: string) => void;
}

const TopControlPanel: React.FC<TopControlPanelProps> = ({
  onImageAdd,
  onTextAdd,
  onShapeAdd,
  onDownload,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSizeChange,
}) => (
  <div className="bg-gray-800/90 rounded-xl p-3 shadow-lg flex items-center justify-between gap-4 mb-4">
    <div className="flex items-center gap-2">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        title="Undo (Ctrl+Z)"
      >
        <Undo size={20} />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        title="Redo (Ctrl+Y)"
      >
        <Redo size={20} />
      </button>
      <div className="w-[1px] h-6 bg-gray-600 mx-2"></div>
      <select
        onChange={(e) => onSizeChange(e.target.value)}
        className="bg-gray-700 text-white text-sm rounded-lg p-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Object.entries(CANVAS_PRESETS).map(
          ([key, { name, width, height }]) => (
            <option key={key} value={key}>
              {name} ({width}x{height})
            </option>
          )
        )}
      </select>
      <div className="w-[1px] h-6 bg-gray-600 mx-2"></div>
      <button
        className="bg-blue-600 rounded-lg px-4 py-2 font-semibold text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        onClick={onTextAdd}
      >
        <TypeIcon size={18} /> Text
      </button>
      <label className="bg-purple-600 rounded-lg px-4 py-2 font-semibold text-white hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 cursor-pointer">
        <ImageIcon size={18} /> Image
        <input
          type="file"
          accept="image/*"
          onChange={onImageAdd}
          className="hidden"
        />
      </label>
      <button
        className="bg-teal-600 rounded-lg px-4 py-2 font-semibold text-white hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
        onClick={() => onShapeAdd("rectangle")}
      >
        <Square size={18} /> Shape
      </button>
    </div>
    <button
      className="bg-green-600 rounded-lg px-4 py-2 font-semibold text-white hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
      onClick={onDownload}
    >
      <Download size={18} /> Download
    </button>
  </div>
);

interface LayerPanelProps {
  layers: Layer[];
  activeLayerId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onReorder: (id: string, direction: "forward" | "backward") => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  onSelect,
  onToggleVisibility,
  onReorder,
  onDelete,
  onDuplicate,
  activeLayerId,
}) => (
  <div className="bg-gray-800/90 border border-gray-700 rounded-xl px-2 py-3 shadow-lg flex flex-col gap-1 h-full">
    <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold px-2 flex-shrink-0">
      Layers
    </div>
    <div className="overflow-y-auto flex-grow">
      {layers.length === 0 && (
        <div className="text-center text-sm text-gray-500 py-6">
          No layers yet.
        </div>
      )}
      {layers
        .sort((a, b) => b.zIndex - a.zIndex)
        .map((layer, idx, arr) => (
          <div
            key={layer.id}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer group border ${
              activeLayerId === layer.id
                ? "border-blue-500 bg-blue-900/30"
                : "border-transparent hover:bg-gray-700/50"
            }`}
            onClick={() => onSelect(layer.id)}
          >
            {layer.type === "image" && (
              <ImageIcon className="text-purple-400" size={16} />
            )}
            {layer.type === "text" && (
              <TypeIcon className="text-blue-400" size={16} />
            )}
            {layer.type === "shape" && (
              <Square className="text-teal-400" size={16} />
            )}
            <span className="text-xs flex-1 truncate">
              {layer.type.charAt(0).toUpperCase() + layer.type.slice(1)}{" "}
              {layer.type === "text"
                ? `"${layer.text.substring(0, 10)}..."`
                : `#${arr.length - idx}`}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(layer.id);
                }}
                title={layer.visible ? "Hide Layer" : "Show Layer"}
              >
                {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReorder(layer.id, "forward");
                }}
                title="Bring Forward"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReorder(layer.id, "backward");
                }}
                title="Send Backward"
              >
                <ArrowDown size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(layer.id);
                }}
                title="Duplicate Layer (Ctrl+D)"
              >
                <Copy size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(layer.id);
                }}
                title="Delete Layer"
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
    </div>
  </div>
);

interface PropertiesPanelProps {
  activeLayer: Layer | undefined;
  onUpdate: (id: string, patch: Partial<Layer>) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  activeLayer,
  onUpdate,
}) => {
  const commonControls = activeLayer && (
    <>
      <div className="mb-3">
        <label className="text-xs">Rotation: {activeLayer.rotation}°</label>
        <input
          type="range"
          min={-180}
          max={180}
          value={activeLayer.rotation}
          onChange={(e) =>
            onUpdate(activeLayer.id, { rotation: Number(e.target.value) })
          }
          className="w-full"
        />
      </div>
      <div className="mb-3">
        <label className="text-xs">
          Opacity: {Math.round(activeLayer.opacity * 100)}%
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={activeLayer.opacity}
          onChange={(e) =>
            onUpdate(activeLayer.id, { opacity: Number(e.target.value) })
          }
          className="w-full"
        />
      </div>
    </>
  );

  return (
    <div className="bg-gray-800/90 rounded-xl p-4 shadow-lg text-sm h-full flex flex-col">
      {!activeLayer ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-400 text-center">
            Select a layer to see its properties.
          </p>
        </div>
      ) : (
        <div className="overflow-y-auto">
          <h3 className="font-semibold text-lg capitalize mb-4">
            {activeLayer.type} Settings
          </h3>
          {activeLayer.type === "image" && (
            <>
              <h4 className="font-bold text-xs uppercase text-gray-400 mb-2">
                Filters
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                {Object.entries(activeLayer.filters).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-xs capitalize">
                      {key}: {value}
                      {key === "blur" ? "px" : "%"}
                    </label>
                    <input
                      type="range"
                      min={key === "blur" ? 0 : 0}
                      max={key === "blur" ? 20 : 200}
                      value={value}
                      onChange={(e) =>
                        onUpdate(activeLayer.id, {
                          filters: {
                            ...activeLayer.filters,
                            [key]: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
          {activeLayer.type === "text" && (
            <>
              <textarea
                className="w-full p-2 mb-2 rounded bg-gray-700 text-white border border-gray-600"
                value={activeLayer.text}
                onChange={(e) =>
                  onUpdate(activeLayer.id, { text: e.target.value })
                }
                rows={3}
              />
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-xs">Font</label>
                  <select
                    value={activeLayer.font}
                    onChange={(e) =>
                      onUpdate(activeLayer.id, {
                        font: e.target.value as FontFamily,
                      })
                    }
                    className="w-full p-1 rounded bg-gray-700 text-white border border-gray-600"
                  >
                    {FONT_LIST.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <label className="text-xs">Color</label>
                  <input
                    type="color"
                    value={activeLayer.color}
                    onChange={(e) =>
                      onUpdate(activeLayer.id, { color: e.target.value })
                    }
                    className="w-8 h-8 p-0 border-none rounded bg-gray-700"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="text-xs">Size: {activeLayer.size}px</label>
                <input
                  type="range"
                  min={10}
                  max={300}
                  value={activeLayer.size}
                  onChange={(e) =>
                    onUpdate(activeLayer.id, { size: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
              <div className="mb-2">
                <label className="text-xs">
                  Line Height: {activeLayer.lineHeight}x
                </label>
                <input
                  type="range"
                  min={0.8}
                  max={2.5}
                  step={0.1}
                  value={activeLayer.lineHeight}
                  onChange={(e) =>
                    onUpdate(activeLayer.id, {
                      lineHeight: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {(["left", "center", "right"] as TextAlign[]).map((align) => (
                  <button
                    key={align}
                    onClick={() =>
                      onUpdate(activeLayer.id, {
                        textAlign: align,
                      })
                    }
                    className={`p-1 rounded ${
                      activeLayer.textAlign === align
                        ? "bg-blue-600"
                        : "bg-gray-700"
                    }`}
                  >
                    {align.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={activeLayer.fontWeight === "bold"}
                    onChange={() =>
                      onUpdate(activeLayer.id, {
                        fontWeight:
                          activeLayer.fontWeight === "bold" ? "normal" : "bold",
                      })
                    }
                  />
                  <span className="font-bold">Bold</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={activeLayer.italic}
                    onChange={() =>
                      onUpdate(activeLayer.id, { italic: !activeLayer.italic })
                    }
                  />
                  <span className="italic">Italic</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={activeLayer.underline}
                    onChange={() =>
                      onUpdate(activeLayer.id, {
                        underline: !activeLayer.underline,
                      })
                    }
                  />
                  <span className="underline">Underline</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={activeLayer.shadow}
                    onChange={() =>
                      onUpdate(activeLayer.id, { shadow: !activeLayer.shadow })
                    }
                  />
                  <span>Shadow</span>
                </label>
              </div>
            </>
          )}
          {activeLayer.type === "shape" && (
            <>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-xs">Fill Color</label>
                  <input
                    type="color"
                    value={activeLayer.fillColor}
                    onChange={(e) =>
                      onUpdate(activeLayer.id, { fillColor: e.target.value })
                    }
                    className="w-full h-8 p-0 border-none rounded bg-gray-700"
                  />
                </div>
                <div>
                  <label className="text-xs">Stroke Color</label>
                  <input
                    type="color"
                    value={activeLayer.strokeColor}
                    onChange={(e) =>
                      onUpdate(activeLayer.id, { strokeColor: e.target.value })
                    }
                    className="w-full h-8 p-0 border-none rounded bg-gray-700"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="text-xs">
                  Stroke Width: {activeLayer.strokeWidth}px
                </label>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={activeLayer.strokeWidth}
                  onChange={(e) =>
                    onUpdate(activeLayer.id, {
                      strokeWidth: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
              {activeLayer.shapeType === "rectangle" && (
                <div className="mb-3">
                  <label className="text-xs">
                    Border Radius: {activeLayer.borderRadius || 0}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={activeLayer.borderRadius || 0}
                    onChange={(e) =>
                      onUpdate(activeLayer.id, {
                        borderRadius: Number(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
              )}
            </>
          )}
          {commonControls}
        </div>
      )}
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function BannerPage() {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<DragState>(null);
  const [snapLines, setSnapLines] = useState<{ x?: number[]; y?: number[] }>(
    {}
  );
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [clipboard, setClipboard] = useState<Layer | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(INITIAL_BANNER_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(INITIAL_BANNER_HEIGHT);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCache = useRef(new Map<string, HTMLImageElement>());
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const layersPanelRef = useRef<HTMLDivElement>(null);
  const topPanelRef = useRef<HTMLDivElement>(null);

  // --- HISTORY MANAGEMENT ---
  const recordHistory = (newLayers: Layer[], newActiveId: string | null) => {
    const currentState = { layers, activeLayerId, canvasWidth, canvasHeight };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setLayers(newLayers);
    setActiveLayerId(newActiveId);
  };

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const prevState = history[newIndex];
      setLayers(prevState.layers);
      setActiveLayerId(prevState.activeLayerId);
      setCanvasWidth(prevState.canvasWidth);
      setCanvasHeight(prevState.canvasHeight);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setLayers(nextState.layers);
      setActiveLayerId(nextState.activeLayerId);
      setCanvasWidth(nextState.canvasWidth);
      setCanvasHeight(nextState.canvasHeight);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  // --- LAYER MANAGEMENT ---
  const getNextZIndex = useCallback(
    () =>
      layers.length === 0 ? 1 : Math.max(...layers.map((l) => l.zIndex)) + 1,
    [layers]
  );
  const selectLayer = (id: string | null) => setActiveLayerId(id);

  const deleteLayer = (id: string) => {
    const newLayers = layers.filter((l) => l.id !== id);
    recordHistory(newLayers, null);
    imageCache.current.delete(id);
  };

  const handleCopy = () => {
    if (!activeLayerId) return;
    const layerToCopy = layers.find((l) => l.id === activeLayerId);
    if (layerToCopy) {
      setClipboard(layerToCopy);
    }
  };

  const handleCut = () => {
    if (!activeLayerId) return;
    handleCopy();
    deleteLayer(activeLayerId);
  };

  const handlePaste = () => {
    if (!clipboard) return;
    const newId = uuid();
    const newLayer: Layer = {
      ...clipboard,
      id: newId,
      position: { x: canvasWidth / 2, y: canvasHeight / 2 },
      zIndex: getNextZIndex(),
    };
    if (newLayer.type === "image") {
      const img = new window.Image();
      img.src = newLayer.src;
      img.onload = () => {
        imageCache.current.set(newId, img);
        recordHistory([...layers, newLayer], newId);
      };
    } else {
      recordHistory([...layers, newLayer], newId);
    }
  };

  const duplicateLayer = (id: string) => {
    const layerToDup = layers.find((l) => l.id === id);
    if (!layerToDup) return;
    setClipboard(layerToDup);
    setTimeout(() => handlePaste(), 0);
  };

  const updateLayer = (id: string, patch: Partial<Layer>) =>
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l))
    );
  const commitUpdate = () => recordHistory(layers, activeLayerId);

  const handleReorder = (id: string, direction: "forward" | "backward") => {
    const newLayers = [...layers];
    const sorted = newLayers.sort((a, b) => a.zIndex - b.zIndex);
    const currentIndex = sorted.findIndex((l) => l.id === id);
    if (currentIndex === -1) return;
    if (direction === "forward" && currentIndex < sorted.length - 1) {
      const nextLayer = sorted[currentIndex + 1];
      [sorted[currentIndex].zIndex, nextLayer.zIndex] = [
        nextLayer.zIndex,
        sorted[currentIndex].zIndex,
      ];
    } else if (direction === "backward" && currentIndex > 0) {
      const prevLayer = sorted[currentIndex - 1];
      [sorted[currentIndex].zIndex, prevLayer.zIndex] = [
        prevLayer.zIndex,
        sorted[currentIndex].zIndex,
      ];
    }
    recordHistory(newLayers, activeLayerId);
  };

  const handleToggleVisibility = (id: string) => {
    const newLayers = layers.map((l) =>
      l.id === id ? { ...l, visible: !l.visible } : l
    );
    recordHistory(newLayers, activeLayerId);
  };

  // --- ADDING NEW LAYERS ---
  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.src = reader.result as string;
      img.onload = () => {
        const id = uuid();
        imageCache.current.set(id, img);
        const scale = Math.min(1, 400 / img.width, 300 / img.height);
        const newLayer: ImageLayer = {
          id,
          type: "image",
          src: img.src,
          position: { x: canvasWidth / 2, y: canvasHeight / 2 },
          width: img.width * scale,
          height: img.height * scale,
          naturalWidth: img.width,
          naturalHeight: img.height,
          rotation: 0,
          zIndex: getNextZIndex(),
          opacity: 1,
          visible: true,
          crop: { top: 0, right: 0, bottom: 0, left: 0 },
          filters: {
            brightness: 100,
            contrast: 100,
            saturate: 100,
            grayscale: 0,
            blur: 0,
          },
        };
        recordHistory([...layers, newLayer], id);
      };
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAddText = () => {
    const id = uuid();
    const newLayer: TextLayer = {
      id,
      type: "text",
      text: "New Text",
      position: { x: canvasWidth / 2, y: canvasHeight / 2 },
      rotation: 0,
      font: "Montserrat",
      color: "#333333",
      size: 70,
      fontWeight: "bold",
      italic: false,
      underline: false,
      shadow: true,
      maxWidth: 400,
      zIndex: getNextZIndex(),
      opacity: 1,
      visible: true,
      textAlign: "center",
      lineHeight: 1.2,
    };
    recordHistory([...layers, newLayer], id);
  };

  const handleAddShape = (shapeType: ShapeType) => {
    const id = uuid();
    const newLayer: ShapeLayer = {
      id,
      type: "shape",
      shapeType,
      position: { x: canvasWidth / 2, y: canvasHeight / 2 },
      width: 150,
      height: 150,
      fillColor: "#3b82f6",
      strokeColor: "#1e40af",
      strokeWidth: 0,
      rotation: 0,
      zIndex: getNextZIndex(),
      opacity: 1,
      visible: true,
      borderRadius: 0,
    };
    recordHistory([...layers, newLayer], id);
  };

  // --- CANVAS SIZING ---
  const applyCanvasSize = (newWidth: number, newHeight: number) => {
    const oldWidth = canvasWidth;
    const oldHeight = canvasHeight;

    const scaledLayers = layers.map((layer) => ({
      ...layer,
      position: {
        x: layer.position.x * (newWidth / oldWidth),
        y: layer.position.y * (newHeight / oldHeight),
      },
    }));

    setCanvasWidth(newWidth);
    setCanvasHeight(newHeight);
    recordHistory(scaledLayers, activeLayerId);
  };

  const handleCanvasSizeChange = (presetKey: string) => {
    const preset = CANVAS_PRESETS[presetKey as keyof typeof CANVAS_PRESETS];
    if (preset) {
      applyCanvasSize(preset.width, preset.height);
    }
  };

  // --- CANVAS DRAWING & INTERACTION ---
  const getLayerBounds = (
    ctx: CanvasRenderingContext2D,
    layer: Layer
  ): LayerBounds => {
    const { x, y } = layer.position;
    let w, h;
    if (layer.type === "image" || layer.type === "shape") {
      w = layer.width;
      h = layer.height;
    } else {
      ctx.save();
      ctx.font = `${layer.fontWeight} ${layer.italic ? "italic" : ""} ${
        layer.size
      }px ${layer.font}`;
      const { textHeight } = wrapText(
        ctx,
        layer.text,
        layer.maxWidth,
        layer.lineHeight
      );
      w = layer.maxWidth;
      h = textHeight;
      ctx.restore();
    }
    const corners = {
      tl: { x: x - w / 2, y: y - h / 2 },
      tr: { x: x + w / 2, y: y - h / 2 },
      br: { x: x + w / 2, y: y + h / 2 },
      bl: { x: x - w / 2, y: y + h / 2 },
    };
    return {
      w,
      h,
      corners: {
        tl: rotatePoint(corners.tl, layer.position, layer.rotation),
        tr: rotatePoint(corners.tr, layer.position, layer.rotation),
        br: rotatePoint(corners.br, layer.position, layer.rotation),
        bl: rotatePoint(corners.bl, layer.position, layer.rotation),
      },
    };
  };

  const getAABB = (ctx: CanvasRenderingContext2D, layer: Layer) => {
    const { corners } = getLayerBounds(ctx, layer);
    const xs = [corners.tl.x, corners.tr.x, corners.br.x, corners.bl.x];
    const ys = [corners.tl.y, corners.tr.y, corners.br.y, corners.bl.y];
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      minX,
      maxX,
      minY,
      maxY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
    };
  };

  const drawLayer = (ctx: CanvasRenderingContext2D, layer: Layer) => {
    if (!layer.visible) return;
    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.translate(layer.position.x, layer.position.y);
    ctx.rotate((layer.rotation * Math.PI) / 180);

    if (layer.type === "image") {
      const img = imageCache.current.get(layer.id);
      if (img) {
        ctx.filter = `brightness(${layer.filters.brightness}%) contrast(${layer.filters.contrast}%) saturate(${layer.filters.saturate}%) grayscale(${layer.filters.grayscale}%) blur(${layer.filters.blur}px)`;
        const sx = layer.naturalWidth * layer.crop.left;
        const sy = layer.naturalHeight * layer.crop.top;
        const sWidth =
          layer.naturalWidth * (1 - layer.crop.left - layer.crop.right);
        const sHeight =
          layer.naturalHeight * (1 - layer.crop.top - layer.crop.bottom);
        ctx.drawImage(
          img,
          sx,
          sy,
          sWidth,
          sHeight,
          -layer.width / 2,
          -layer.height / 2,
          layer.width,
          layer.height
        );
      }
    } else if (layer.type === "text") {
      ctx.font = `${layer.fontWeight} ${layer.italic ? "italic " : ""}${
        layer.size
      }px ${layer.font}`;
      ctx.fillStyle = layer.color;
      ctx.textBaseline = "middle";
      ctx.textAlign = layer.textAlign;
      if (layer.shadow) {
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }
      const { lines, textHeight, lineHeight } = wrapText(
        ctx,
        layer.text,
        layer.maxWidth,
        layer.lineHeight
      );
      let startX = 0;
      if (layer.textAlign === "left") startX = -layer.maxWidth / 2;
      if (layer.textAlign === "right") startX = layer.maxWidth / 2;
      lines.forEach((line, index) => {
        const yPos = -textHeight / 2 + index * lineHeight + lineHeight / 2;
        ctx.fillText(line, startX, yPos);
        if (layer.underline) {
          ctx.strokeStyle = layer.color;
          ctx.lineWidth = Math.max(1, layer.size / 20);
          const metrics = ctx.measureText(line);
          const lineY = yPos + (layer.size / 2) * 0.9;
          ctx.beginPath();
          if (layer.textAlign === "center")
            ctx.moveTo(-metrics.width / 2, lineY);
          if (layer.textAlign === "left") ctx.moveTo(startX, lineY);
          if (layer.textAlign === "right")
            ctx.moveTo(startX - metrics.width, lineY);
          ctx.lineTo(startX + metrics.width, lineY);
          ctx.stroke();
        }
      });
    } else if (layer.type === "shape") {
      ctx.fillStyle = layer.fillColor;
      ctx.strokeStyle = layer.strokeColor;
      ctx.lineWidth = layer.strokeWidth;
      ctx.beginPath();
      if (layer.shapeType === "rectangle") {
        const x = -layer.width / 2;
        const y = -layer.height / 2;
        const width = layer.width;
        const height = layer.height;
        const maxRadius = Math.min(width, height) / 2;
        const radius = maxRadius * ((layer.borderRadius || 0) / 100);

        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(
          x + width,
          y + height,
          x + width - radius,
          y + height,
          radius
        );
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
      } else if (layer.shapeType === "circle") {
        ctx.arc(0, 0, layer.width / 2, 0, 2 * Math.PI);
      } else if (layer.shapeType === "triangle") {
        ctx.moveTo(0, -layer.height / 2);
        ctx.lineTo(layer.width / 2, layer.height / 2);
        ctx.lineTo(-layer.width / 2, layer.height / 2);
        ctx.closePath();
      }
      ctx.fill();
      if (layer.strokeWidth > 0) ctx.stroke();
    }
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    [...layers]
      .sort((a, b) => a.zIndex - b.zIndex)
      .forEach((layer) => drawLayer(ctx, layer));
    const activeLayer = layers.find((l) => l.id === activeLayerId);
    if (activeLayer && activeLayer.visible) {
      const bounds = getLayerBounds(ctx, activeLayer);
      drawSelectionHandles(ctx, bounds, activeLayer.type);
    }
    ctx.save();
    ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    (snapLines.x || []).forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    });
    (snapLines.y || []).forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
      ctx.stroke();
    });
    ctx.restore();
  }, [layers, activeLayerId, snapLines, canvasWidth, canvasHeight]);

  const drawSelectionHandles = (
    ctx: CanvasRenderingContext2D,
    bounds: LayerBounds,
    type: LayerType
  ) => {
    ctx.save();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bounds.corners.tl.x, bounds.corners.tl.y);
    ctx.lineTo(bounds.corners.tr.x, bounds.corners.tr.y);
    ctx.lineTo(bounds.corners.br.x, bounds.corners.br.y);
    ctx.lineTo(bounds.corners.bl.x, bounds.corners.bl.y);
    ctx.closePath();
    ctx.stroke();

    const handles = getHandlePositions(bounds, type);
    Object.values(handles).forEach((pos: Point) => {
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, HANDLE_SIZE / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });

    const rotHandle = getRotationHandlePos(bounds);
    ctx.beginPath();
    ctx.moveTo(
      (bounds.corners.tl.x + bounds.corners.tr.x) / 2,
      (bounds.corners.tl.y + bounds.corners.tr.y) / 2
    );
    ctx.lineTo(rotHandle.x, rotHandle.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(rotHandle.x, rotHandle.y, HANDLE_SIZE / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  const getHandlePositions = (
    bounds: LayerBounds,
    type: LayerType
  ): Record<string, Point> => {
    const { tl, tr, br, bl } = bounds.corners;
    const handles: Record<string, Point> = {
      "resize-tl": tl,
      "resize-tr": tr,
      "resize-br": br,
      "resize-bl": bl,
      "resize-t": { x: (tl.x + tr.x) / 2, y: (tl.y + tr.y) / 2 },
      "resize-r": { x: (tr.x + br.x) / 2, y: (tr.y + br.y) / 2 },
      "resize-b": { x: (bl.x + br.x) / 2, y: (bl.y + br.y) / 2 },
      "resize-l": { x: (tl.x + bl.x) / 2, y: (tl.y + bl.y) / 2 },
    };
    if (type === "text") {
      delete handles["resize-t"];
      delete handles["resize-b"];
      delete handles["resize-l"];
      handles["text-w"] = handles["resize-r"];
      delete handles["resize-r"];
    }
    return handles;
  };

  const getRotationHandlePos = (bounds: LayerBounds): Point => {
    const topCenterX = (bounds.corners.tl.x + bounds.corners.tr.x) / 2;
    const topCenterY = (bounds.corners.tl.y + bounds.corners.tr.y) / 2;
    const angleRad = Math.atan2(
      bounds.corners.tr.y - bounds.corners.tl.y,
      bounds.corners.tr.x - bounds.corners.tl.x
    );
    return {
      x: topCenterX - ROTATION_HANDLE_OFFSET * Math.sin(angleRad),
      y: topCenterY + ROTATION_HANDLE_OFFSET * Math.cos(angleRad),
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const pos = getRelativePos(e, canvas);
    const ctx = canvas.getContext("2d")!;
    const activeLayer = layers.find((l) => l.id === activeLayerId);
    if (activeLayer && activeLayer.visible) {
      const bounds = getLayerBounds(ctx, activeLayer);
      const rotHandle = getRotationHandlePos(bounds);
      if (Math.hypot(pos.x - rotHandle.x, pos.y - rotHandle.y) < HANDLE_SIZE) {
        setDragging({
          id: activeLayer.id,
          type: "rotate",
          start: pos,
          layerStart: activeLayer,
        });
        return;
      }
      const handles = getHandlePositions(bounds, activeLayer.type);
      for (const [type, handlePos] of Object.entries(handles)) {
        if (
          Math.hypot(pos.x - handlePos.x, pos.y - handlePos.y) < HANDLE_SIZE
        ) {
          let pivot;
          if (type.startsWith("resize-")) {
            if (type === "resize-br") pivot = bounds.corners.tl;
            else if (type === "resize-bl") pivot = bounds.corners.tr;
            else if (type === "resize-tr") pivot = bounds.corners.bl;
            else if (type === "resize-tl") pivot = bounds.corners.br;
          }
          setDragging({
            id: activeLayer.id,
            type: type as DragType,
            start: pos,
            layerStart: { ...activeLayer, bounds },
            pivot,
          });
          return;
        }
      }
    }
    const topLayer = [...layers]
      .filter((l) => l.visible)
      .sort((a, b) => b.zIndex - a.zIndex)
      .find((layer) => {
        const bounds = getLayerBounds(ctx, layer);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(bounds.corners.tl.x, bounds.corners.tl.y);
        ctx.lineTo(bounds.corners.tr.x, bounds.corners.tr.y);
        ctx.lineTo(bounds.corners.br.x, bounds.corners.br.y);
        ctx.lineTo(bounds.corners.bl.x, bounds.corners.bl.y);
        ctx.closePath();
        const isHit = ctx.isPointInPath(pos.x, pos.y);
        ctx.restore();
        return isHit;
      });
    if (topLayer) {
      selectLayer(topLayer.id);
      setDragging({
        id: topLayer.id,
        type: "move",
        start: pos,
        layerStart: topLayer,
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging) return;
    const canvas = canvasRef.current!;
    const pos = getRelativePos(e, canvas);
    const dx = pos.x - dragging.start.x;
    const dy = pos.y - dragging.start.y;
    const layer = dragging.layerStart;
    const ctx = canvas.getContext("2d")!;
    const rotationRad = (layer.rotation * Math.PI) / 180;

    switch (dragging.type) {
      case "move": {
        let newX = layer.position.x + dx;
        let newY = layer.position.y + dy;
        const newSnapLines: { x: number[]; y: number[] } = { x: [], y: [] };
        const draggedAABB = getAABB(ctx, {
          ...layer,
          position: { x: newX, y: newY },
        });
        const draggedSnapPointsX = [
          draggedAABB.minX,
          draggedAABB.centerX,
          draggedAABB.maxX,
        ];
        const draggedSnapPointsY = [
          draggedAABB.minY,
          draggedAABB.centerY,
          draggedAABB.maxY,
        ];
        const targetSnapPointsX = [0, canvasWidth / 2, canvasWidth];
        const targetSnapPointsY = [0, canvasHeight / 2, canvasHeight];
        layers.forEach((otherLayer) => {
          if (otherLayer.id === dragging.id || !otherLayer.visible) return;
          const otherAABB = getAABB(ctx, otherLayer);
          targetSnapPointsX.push(
            otherAABB.minX,
            otherAABB.centerX,
            otherAABB.maxX
          );
          targetSnapPointsY.push(
            otherAABB.minY,
            otherAABB.centerY,
            otherAABB.maxY
          );
        });
        for (const p of draggedSnapPointsX) {
          for (const t of targetSnapPointsX) {
            if (Math.abs(p - t) < SNAP_THRESHOLD) {
              newX += t - p;
              newSnapLines.x.push(t);
              break;
            }
          }
          if (newSnapLines.x.length > 0) break;
        }
        for (const p of draggedSnapPointsY) {
          for (const t of targetSnapPointsY) {
            if (Math.abs(p - t) < SNAP_THRESHOLD) {
              newY += t - p;
              newSnapLines.y.push(t);
              break;
            }
          }
          if (newSnapLines.y.length > 0) break;
        }
        setSnapLines(newSnapLines);
        updateLayer(dragging.id, { position: { x: newX, y: newY } });
        break;
      }
      case "rotate": {
        const angle = Math.atan2(
          pos.y - layer.position.y,
          pos.x - layer.position.x
        );
        updateLayer(dragging.id, {
          rotation: Math.round((angle * 180) / Math.PI) - 90,
        });
        break;
      }
      case "resize-tl":
      case "resize-tr":
      case "resize-bl":
      case "resize-br": {
        if (layer.type === "text") break; // Should not happen with current handle logic
        const pivot = dragging.pivot!;
        const v_pivot_to_mouse = { x: pos.x - pivot.x, y: pos.y - pivot.y };

        const originalBounds = dragging.layerStart.bounds!;
        let originalHandlePos: Point;
        if (dragging.type === "resize-tl")
          originalHandlePos = originalBounds.corners.tl;
        else if (dragging.type === "resize-tr")
          originalHandlePos = originalBounds.corners.tr;
        else if (dragging.type === "resize-bl")
          originalHandlePos = originalBounds.corners.bl;
        else originalHandlePos = originalBounds.corners.br;

        const v_pivot_to_handle_orig = {
          x: originalHandlePos.x - pivot.x,
          y: originalHandlePos.y - pivot.y,
        };
        const originalDist = Math.hypot(
          v_pivot_to_handle_orig.x,
          v_pivot_to_handle_orig.y
        );

        if (originalDist < 1) break;

        const dotProduct =
          v_pivot_to_mouse.x * v_pivot_to_handle_orig.x +
          v_pivot_to_mouse.y * v_pivot_to_handle_orig.y;
        const projectedDist = dotProduct / originalDist;
        const scale = projectedDist / originalDist;

        const newWidth = layer.width * scale;
        const newHeight = layer.height * scale;

        const newCenter = {
          x: pivot.x + (layer.position.x - pivot.x) * scale,
          y: pivot.y + (layer.position.y - pivot.y) * scale,
        };

        updateLayer(dragging.id, {
          position: newCenter,
          width: Math.max(20, newWidth),
          height: Math.max(20, newHeight),
        });
        break;
      }
      case "resize-t":
      case "resize-b":
      case "resize-l":
      case "resize-r": {
        if (layer.type === "text") break; // Should not happen

        const localDx =
          dx * Math.cos(-rotationRad) - dy * Math.sin(-rotationRad);
        const localDy =
          dx * Math.sin(-rotationRad) + dy * Math.cos(-rotationRad);

        let dWidth = 0,
          dHeight = 0;
        if (dragging.type === "resize-l") dWidth = -localDx;
        if (dragging.type === "resize-r") dWidth = localDx;
        if (dragging.type === "resize-t") dHeight = -localDy;
        if (dragging.type === "resize-b") dHeight = localDy;

        const newWidth = Math.max(20, layer.width + dWidth);
        const newHeight = Math.max(20, layer.height + dHeight);

        const actualDWidth = newWidth - layer.width;
        const actualDHeight = newHeight - layer.height;

        const shiftX = actualDWidth / 2;
        const shiftY = actualDHeight / 2;

        const cos = Math.cos(rotationRad);
        const sin = Math.sin(rotationRad);

        let newPosX = layer.position.x;
        let newPosY = layer.position.y;

        if (dragging.type === "resize-l") {
          newPosX -= shiftX * cos;
          newPosY -= shiftX * sin;
        } else if (dragging.type === "resize-r") {
          newPosX += shiftX * cos;
          newPosY += shiftX * sin;
        } else if (dragging.type === "resize-t") {
          newPosX += shiftY * sin;
          newPosY -= shiftY * cos;
        } else if (dragging.type === "resize-b") {
          newPosX -= shiftY * sin;
          newPosY += shiftY * cos;
        }

        const patch: Partial<Layer> = {
          width: newWidth,
          height: newHeight,
          position: { x: newPosX, y: newPosY },
        };

        if (layer.type === "image") {
          const currentCrop = layer.crop;
          const uncroppedWidth =
            layer.width / (1 - currentCrop.left - currentCrop.right);
          const uncroppedHeight =
            layer.height / (1 - currentCrop.top - currentCrop.bottom);

          const dCropX = -actualDWidth / uncroppedWidth;
          const dCropY = -actualDHeight / uncroppedHeight;

          const newCrop = { ...currentCrop };
          if (dragging.type === "resize-l")
            newCrop.left = Math.max(
              0,
              Math.min(1 - newCrop.right, newCrop.left + dCropX)
            );
          if (dragging.type === "resize-r")
            newCrop.right = Math.max(
              0,
              Math.min(1 - newCrop.left, newCrop.right + dCropX)
            );
          if (dragging.type === "resize-t")
            newCrop.top = Math.max(
              0,
              Math.min(1 - newCrop.bottom, newCrop.top + dCropY)
            );
          if (dragging.type === "resize-b")
            newCrop.bottom = Math.max(
              0,
              Math.min(1 - newCrop.top, newCrop.bottom + dCropY)
            );

          (patch as Partial<ImageLayer>).crop = newCrop;
        }

        updateLayer(dragging.id, patch);
        break;
      }
      case "text-w": {
        if (layer.type !== "text") break; // Should not happen
        const rotationRad = (-layer.rotation * Math.PI) / 180;
        const projectedDx =
          dx * Math.cos(rotationRad) - dy * Math.sin(rotationRad);
        const newMaxWidth = Math.max(50, layer.maxWidth + projectedDx * 2);
        updateLayer(dragging.id, { maxWidth: newMaxWidth });
        break;
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (dragging) {
      commitUpdate();
      setDragging(null);
      setSnapLines({});
    }
  };
  const handleDownload = () => {
    const currentActiveId = activeLayerId;
    selectLayer(null);
    setTimeout(() => {
      const canvas = canvasRef.current!;
      const link = document.createElement("a");
      link.download = "banner.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      if (currentActiveId) {
        selectLayer(currentActiveId);
      }
    }, 100);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "TEXTAREA"
      )
        return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") {
          e.preventDefault();
          handleUndo();
        } else if (
          e.key === "y" ||
          (e.metaKey && e.shiftKey && e.key === "z")
        ) {
          e.preventDefault();
          handleRedo();
        } else if (e.key === "d") {
          e.preventDefault();
          if (activeLayerId) duplicateLayer(activeLayerId);
        } else if (e.key === "c") {
          e.preventDefault();
          handleCopy();
        } else if (e.key === "x") {
          e.preventDefault();
          handleCut();
        } else if (e.key === "v") {
          e.preventDefault();
          handlePaste();
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (activeLayerId) deleteLayer(activeLayerId);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (canvasRef.current?.contains(target)) return;
      if (propertiesPanelRef.current?.contains(target)) return;
      if (layersPanelRef.current?.contains(target)) return;
      if (topPanelRef.current?.contains(target)) return;

      selectLayer(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    activeLayerId,
    handleUndo,
    handleRedo,
    duplicateLayer,
    deleteLayer,
    handleCopy,
    handleCut,
    handlePaste,
  ]);

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-2 md:p-4 font-sans flex flex-col">
      <div ref={topPanelRef}>
        <TopControlPanel
          onImageAdd={handleAddImage}
          onTextAdd={handleAddText}
          onShapeAdd={handleAddShape}
          onDownload={handleDownload}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onSizeChange={handleCanvasSizeChange}
        />
      </div>
      <div className="flex-1 grid grid-cols-[auto_1fr_auto] gap-4 max-w-[1920px] mx-auto w-full">
        {/* Column 1: Properties Panel */}
        <div ref={propertiesPanelRef} className="w-72 flex-shrink-0">
          <PropertiesPanel activeLayer={activeLayer} onUpdate={updateLayer} />
        </div>

        {/* Column 2: Canvas */}
        <div className="flex-1 flex items-center justify-center min-w-0">
          <div
            className="relative w-full bg-gray-700"
            style={{
              aspectRatio: `${canvasWidth} / ${canvasHeight}`,
              boxShadow: "0 4px 32px #0005",
              userSelect: "none",
            }}
          >
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="absolute top-0 left-0 w-full h-full"
              style={{ cursor: dragging ? "grabbing" : "default" }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
          </div>
        </div>

        {/* Column 3: Layers Panel */}
        <div ref={layersPanelRef} className="w-60 flex-shrink-0">
          <LayerPanel
            layers={layers}
            onSelect={selectLayer}
            onToggleVisibility={handleToggleVisibility}
            onReorder={handleReorder}
            onDelete={deleteLayer}
            onDuplicate={duplicateLayer}
            activeLayerId={activeLayerId}
          />
        </div>
      </div>
    </div>
  );
}
