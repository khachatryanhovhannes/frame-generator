/**
 * Banner Canvas component - handles the main canvas rendering and drawing logic
 * Manages layer rendering, selection handles, and visual feedback
 */

"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Layer, LayerBounds, LayerType, Point } from "../../../../models/banner";
import { getLayerBounds, wrapText } from "../../../../utils/canvas";
import { CANVAS_BG, HANDLE_SIZE, ROTATION_HANDLE_OFFSET } from "../../../../constants/banner";

interface BannerCanvasProps {
  layers: Layer[];
  activeLayerId: string | null;
  canvasWidth: number;
  canvasHeight: number;
  snapLines: { x?: number[]; y?: number[] };
  imageCache: Map<string, HTMLImageElement>;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  style?: React.CSSProperties;
}

export default function BannerCanvas({
  layers,
  activeLayerId,
  canvasWidth,
  canvasHeight,
  snapLines,
  imageCache,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  style,
}: BannerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawLayer = useCallback((ctx: CanvasRenderingContext2D, layer: Layer) => {
    if (!layer.visible) return;

    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.translate(layer.position.x, layer.position.y);
    ctx.rotate((layer.rotation * Math.PI) / 180);

    switch (layer.type) {
      case "image": {
        const img = imageCache.get(layer.id);
        if (img) {
          ctx.filter = `brightness(${layer.filters.brightness}%) contrast(${layer.filters.contrast}%) saturate(${layer.filters.saturate}%) grayscale(${layer.filters.grayscale}%) blur(${layer.filters.blur}px)`;
          
          const sx = layer.naturalWidth * layer.crop.left;
          const sy = layer.naturalHeight * layer.crop.top;
          const sWidth = layer.naturalWidth * (1 - layer.crop.left - layer.crop.right);
          const sHeight = layer.naturalHeight * (1 - layer.crop.top - layer.crop.bottom);
          
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
        break;
      }
      
      case "text": {
        ctx.font = `${layer.fontWeight} ${layer.italic ? "italic " : ""}${layer.size}px ${layer.font}`;
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
            if (layer.textAlign === "center") ctx.moveTo(-metrics.width / 2, lineY);
            if (layer.textAlign === "left") ctx.moveTo(startX, lineY);
            if (layer.textAlign === "right") ctx.moveTo(startX - metrics.width, lineY);
            ctx.lineTo(startX + metrics.width, lineY);
            ctx.stroke();
          }
        });
        break;
      }
      
      case "shape": {
        ctx.fillStyle = layer.fillColor;
        ctx.strokeStyle = layer.strokeColor;
        ctx.lineWidth = layer.strokeWidth;
        
        ctx.beginPath();
        
        switch (layer.shapeType) {
          case "rectangle": {
            const x = -layer.width / 2;
            const y = -layer.height / 2;
            const width = layer.width;
            const height = layer.height;
            const maxRadius = Math.min(width, height) / 2;
            const radius = maxRadius * ((layer.borderRadius || 0) / 100);

            if (radius > 0) {
              ctx.moveTo(x + radius, y);
              ctx.lineTo(x + width - radius, y);
              ctx.arcTo(x + width, y, x + width, y + radius, radius);
              ctx.lineTo(x + width, y + height - radius);
              ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
              ctx.lineTo(x + radius, y + height);
              ctx.arcTo(x, y + height, x, y + height - radius, radius);
              ctx.lineTo(x, y + radius);
              ctx.arcTo(x, y, x + radius, y, radius);
              ctx.closePath();
            } else {
              ctx.rect(x, y, width, height);
            }
            break;
          }
          
          case "circle":
            ctx.arc(0, 0, layer.width / 2, 0, 2 * Math.PI);
            break;
            
          case "triangle":
            ctx.moveTo(0, -layer.height / 2);
            ctx.lineTo(layer.width / 2, layer.height / 2);
            ctx.lineTo(-layer.width / 2, layer.height / 2);
            ctx.closePath();
            break;
        }
        
        ctx.fill();
        if (layer.strokeWidth > 0) ctx.stroke();
        break;
      }
    }

    ctx.restore();
  }, [imageCache]);

  const drawSelectionHandles = useCallback((
    ctx: CanvasRenderingContext2D,
    bounds: LayerBounds,
    type: LayerType
  ) => {
    ctx.save();
    
    // Draw selection outline
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bounds.corners.tl.x, bounds.corners.tl.y);
    ctx.lineTo(bounds.corners.tr.x, bounds.corners.tr.y);
    ctx.lineTo(bounds.corners.br.x, bounds.corners.br.y);
    ctx.lineTo(bounds.corners.bl.x, bounds.corners.bl.y);
    ctx.closePath();
    ctx.stroke();

    // Draw resize handles
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

    // Draw rotation handle
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
  }, []);

  const getHandlePositions = useCallback((bounds: LayerBounds, type: LayerType): Record<string, Point> => {
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
  }, []);

  const getRotationHandlePos = useCallback((bounds: LayerBounds): Point => {
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
  }, []);

  // Main render effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw background
    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw layers in z-index order
    [...layers]
      .sort((a, b) => a.zIndex - b.zIndex)
      .forEach((layer) => drawLayer(ctx, layer));

    // Draw selection handles for active layer
    const activeLayer = layers.find((l) => l.id === activeLayerId);
    if (activeLayer && activeLayer.visible) {
      const bounds = getLayerBounds(ctx, activeLayer);
      drawSelectionHandles(ctx, bounds, activeLayer.type);
    }

    // Draw snap lines
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
  }, [
    layers,
    activeLayerId,
    snapLines,
    canvasWidth,
    canvasHeight,
    drawLayer,
    drawSelectionHandles,
    getHandlePositions,
    getRotationHandlePos,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className="absolute top-0 left-0 w-full h-full cursor-crosshair"
      style={style}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    />
  );
}
