/**
 * Layer management utilities for the Banner Generator
 * Handles layer creation, manipulation, and property updates
 */

import { v4 as uuid } from "uuid";
import { Layer, ImageLayer, TextLayer, ShapeLayer, ShapeType, Point } from "../models/banner";
import { DEFAULT_TEXT_LAYER, DEFAULT_SHAPE_LAYER, DEFAULT_IMAGE_FILTERS } from "../constants/banner";

/**
 * Get the next available z-index for new layers
 */
export function getNextZIndex(layers: Layer[]): number {
  return layers.length === 0 ? 1 : Math.max(...layers.map((l) => l.zIndex)) + 1;
}

/**
 * Create a new text layer at the specified position
 */
export function createTextLayer(
  position: Point,
  zIndex: number,
  text: string = DEFAULT_TEXT_LAYER.text
): TextLayer {
  return {
    id: uuid(),
    type: "text",
    position,
    zIndex,
    ...DEFAULT_TEXT_LAYER,
    text,
  };
}

/**
 * Create a new shape layer at the specified position
 */
export function createShapeLayer(
  position: Point,
  zIndex: number,
  shapeType: ShapeType
): ShapeLayer {
  return {
    id: uuid(),
    type: "shape",
    shapeType,
    position,
    zIndex,
    ...DEFAULT_SHAPE_LAYER,
  };
}

/**
 * Create a new image layer from an image element
 */
export function createImageLayer(
  img: HTMLImageElement,
  position: Point,
  zIndex: number,
  maxWidth: number = 400,
  maxHeight: number = 300
): ImageLayer {
  const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height);
  
  return {
    id: uuid(),
    type: "image",
    src: img.src,
    position,
    width: img.width * scale,
    height: img.height * scale,
    naturalWidth: img.width,
    naturalHeight: img.height,
    rotation: 0,
    zIndex,
    opacity: 1,
    visible: true,
    crop: { top: 0, right: 0, bottom: 0, left: 0 },
    filters: { ...DEFAULT_IMAGE_FILTERS },
  };
}

/**
 * Update a layer's properties immutably
 */
export function updateLayer<T extends Layer>(
  layers: Layer[],
  id: string,
  patch: Partial<T>
): Layer[] {
  return layers.map((layer) =>
    layer.id === id ? { ...layer, ...patch } : layer
  );
}

/**
 * Reorder layer z-indices for moving forward/backward
 */
export function reorderLayer(
  layers: Layer[],
  id: string,
  direction: "forward" | "backward"
): Layer[] {
  const newLayers = [...layers];
  const sorted = newLayers.sort((a, b) => a.zIndex - b.zIndex);
  const currentIndex = sorted.findIndex((l) => l.id === id);
  
  if (currentIndex === -1) return layers;

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

  return newLayers;
}

/**
 * Duplicate a layer with a new ID and position offset
 */
export function duplicateLayer(layer: Layer, offset: Point = { x: 20, y: 20 }): Layer {
  return {
    ...layer,
    id: uuid(),
    position: {
      x: layer.position.x + offset.x,
      y: layer.position.y + offset.y,
    },
  };
}
