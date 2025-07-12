/**
 * Canvas utility functions for the Banner Generator
 * Handles canvas interactions, geometry calculations, and drawing operations
 */

import { Point, Layer, LayerBounds } from "../models/banner";

/**
 * Get mouse position relative to canvas element
 */
export function getRelativePos(
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

/**
 * Rotate a point around an origin by a given angle
 */
export function rotatePoint(point: Point, origin: Point, angle: number): Point {
  const angleRad = (angle * Math.PI) / 180;
  const s = Math.sin(angleRad);
  const c = Math.cos(angleRad);
  const px = point.x - origin.x;
  const py = point.y - origin.y;
  const xnew = px * c - py * s;
  const ynew = px * s + py * c;
  return { x: xnew + origin.x, y: ynew + origin.y };
}

/**
 * Wrap text to fit within a maximum width and calculate dimensions
 */
export function wrapText(
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

/**
 * Calculate layer bounds including rotation
 */
export function getLayerBounds(
  ctx: CanvasRenderingContext2D,
  layer: Layer
): LayerBounds {
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
}

/**
 * Get axis-aligned bounding box for a layer
 */
export function getAABB(ctx: CanvasRenderingContext2D, layer: Layer) {
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
}
