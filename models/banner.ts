/**
 * Type definitions for the Banner Generator component
 * Defines all layer types, canvas dimensions, and related interfaces
 */

export type LayerType = "image" | "text" | "shape";
export type ShapeType = "rectangle" | "circle" | "triangle";
export type FontFamily = "Arial" | "Verdana" | "Georgia" | "Times New Roman" | "Impact" | "Comic Sans MS" | "Montserrat" | "Roboto" | "Lato" | "Oswald";
export type FontWeight = "normal" | "bold";
export type TextAlign = "left" | "center" | "right";
export type DragType =
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

export interface Point {
  x: number;
  y: number;
}

export interface BaseLayer {
  id: string;
  type: LayerType;
  position: Point;
  rotation: number;
  zIndex: number;
  opacity: number;
  visible: boolean;
  isLocked?: boolean;
}

export interface ImageLayer extends BaseLayer {
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

export interface TextLayer extends BaseLayer {
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

export interface ShapeLayer extends BaseLayer {
  type: "shape";
  shapeType: ShapeType;
  width: number;
  height: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  borderRadius?: number;
}

export type Layer = ImageLayer | TextLayer | ShapeLayer;

export interface HistoryState {
  layers: Layer[];
  activeLayerId: string | null;
  canvasWidth: number;
  canvasHeight: number;
}

export interface LayerBounds {
  w: number;
  h: number;
  corners: {
    tl: Point;
    tr: Point;
    br: Point;
    bl: Point;
  };
}

export interface DragState {
  id: string;
  type: DragType;
  start: Point;
  layerStart: Layer & { bounds?: LayerBounds };
  pivot?: Point;
}

export interface CanvasPreset {
  name: string;
  width: number;
  height: number;
}
