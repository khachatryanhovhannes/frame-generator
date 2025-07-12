/**
 * Custom hook for managing banner canvas interactions
 * Handles dragging, snapping, and mouse/touch events on the canvas
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  DragState,
  Layer,
  Point,
  LayerBounds,
  LayerType,
} from "../models/banner";
import { getRelativePos, getLayerBounds, getAABB } from "../utils/canvas";
import {
  HANDLE_SIZE,
  ROTATION_HANDLE_OFFSET,
  SNAP_THRESHOLD,
} from "../constants/banner";

interface UseCanvasInteractionProps {
  layers: Layer[];
  activeLayerId: string | null;
  canvasWidth: number;
  canvasHeight: number;
  onLayerUpdate: (id: string, patch: Partial<Layer>) => void;
  onLayerSelect: (id: string | null) => void;
  onInteractionComplete: () => void;
}

interface UseCanvasInteractionReturn {
  dragging: DragState | null;
  snapLines: { x?: number[]; y?: number[] };
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: () => void;
  getHandlePositions: (
    bounds: LayerBounds,
    type: LayerType
  ) => Record<string, Point>;
  getRotationHandlePos: (bounds: LayerBounds) => Point;
}

export function useCanvasInteraction({
  layers,
  activeLayerId,
  canvasWidth: _canvasWidth,
  canvasHeight: _canvasHeight,
  onLayerUpdate,
  onLayerSelect,
  onInteractionComplete,
}: UseCanvasInteractionProps): UseCanvasInteractionReturn {
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [snapLines, setSnapLines] = useState<{ x?: number[]; y?: number[] }>(
    {}
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const getHandlePositions = useCallback(
    (bounds: LayerBounds, type: LayerType): Record<string, Point> => {
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
    },
    []
  );

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

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      canvasRef.current = canvas;
      const pos = getRelativePos(e, canvas);
      const ctx = canvas.getContext("2d")!;

      const activeLayer = layers.find((l) => l.id === activeLayerId);

      // Check for handle interactions on active layer
      if (activeLayer && activeLayer.visible) {
        const bounds = getLayerBounds(ctx, activeLayer);

        // Check rotation handle
        const rotHandle = getRotationHandlePos(bounds);
        if (
          Math.hypot(pos.x - rotHandle.x, pos.y - rotHandle.y) < HANDLE_SIZE
        ) {
          setDragging({
            id: activeLayer.id,
            type: "rotate",
            start: pos,
            layerStart: activeLayer,
          });
          return;
        }

        // Check resize handles
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
              type: type as
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
                | "text-w",
              start: pos,
              layerStart: { ...activeLayer, bounds },
              pivot,
            });
            return;
          }
        }
      }

      // Check for layer selection
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
        onLayerSelect(topLayer.id);
        setDragging({
          id: topLayer.id,
          type: "move",
          start: pos,
          layerStart: topLayer,
        });
      }
    },
    [
      layers,
      activeLayerId,
      getHandlePositions,
      getRotationHandlePos,
      onLayerSelect,
    ]
  );

  // Extract drag movement logic to be reusable for both canvas and global events
  const processDragMovement = useCallback(
    (pos: Point) => {
      if (!dragging || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")!;
      const dx = pos.x - dragging.start.x;
      const dy = pos.y - dragging.start.y;
      const layer = dragging.layerStart;

      switch (dragging.type) {
        case "move": {
          let newX = layer.position.x + dx;
          let newY = layer.position.y + dy;

          // Snapping logic
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

          const targetSnapPointsX: number[] = [];
          const targetSnapPointsY: number[] = [];

          layers
            .filter((l) => l.id !== dragging.id && l.visible)
            .forEach((otherLayer) => {
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

          // Apply snapping
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
          onLayerUpdate(dragging.id, { position: { x: newX, y: newY } });
          break;
        }

        case "rotate": {
          const angle = Math.atan2(
            pos.y - layer.position.y,
            pos.x - layer.position.x
          );
          onLayerUpdate(dragging.id, {
            rotation: Math.round((angle * 180) / Math.PI) - 90,
          });
          break;
        }

        // Handle all resize cases...
        case "resize-tl":
        case "resize-tr":
        case "resize-bl":
        case "resize-br": {
          if (layer.type === "text") break;
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

          onLayerUpdate(dragging.id, {
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
          if (layer.type === "text") break;

          const rotationRad = (layer.rotation * Math.PI) / 180;
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

          // Special handling for image layers - adjust crop instead of just scaling
          if (layer.type === "image") {
            const imageLayer = layer as Layer & {
              crop: {
                left: number;
                right: number;
                top: number;
                bottom: number;
              };
            };
            const currentCrop = imageLayer.crop;
            const uncroppedWidth =
              layer.width / (1 - currentCrop.left - currentCrop.right);
            const uncroppedHeight =
              layer.height / (1 - currentCrop.top - currentCrop.bottom);

            const newCroppedWidth = newWidth;
            const newCroppedHeight = newHeight;

            const newCropLeft = currentCrop.left;
            const newCropRight = Math.max(
              0,
              1 - newCroppedWidth / uncroppedWidth - newCropLeft
            );
            const newCropTop = currentCrop.top;
            const newCropBottom = Math.max(
              0,
              1 - newCroppedHeight / uncroppedHeight - newCropTop
            );

            (
              patch as Layer & {
                crop: {
                  left: number;
                  right: number;
                  top: number;
                  bottom: number;
                };
              }
            ).crop = {
              left: newCropLeft,
              right: newCropRight,
              top: newCropTop,
              bottom: newCropBottom,
            };
          }

          onLayerUpdate(dragging.id, patch);
          break;
        }

        case "text-w": {
          if (layer.type !== "text") break;
          const rotationRad = (layer.rotation * Math.PI) / 180;
          const localDx =
            dx * Math.cos(-rotationRad) - dy * Math.sin(-rotationRad);
          const newMaxWidth = Math.max(50, layer.maxWidth + localDx);
          const actualDWidth = newMaxWidth - layer.maxWidth;
          const shiftX = actualDWidth / 2;
          const cos = Math.cos(rotationRad);
          const sin = Math.sin(rotationRad);
          onLayerUpdate(dragging.id, {
            maxWidth: newMaxWidth,
            position: {
              x: layer.position.x + shiftX * cos,
              y: layer.position.y + shiftX * sin,
            },
          });
          break;
        }
      }
    },
    [dragging, layers, onLayerUpdate, setSnapLines]
  );

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      onInteractionComplete();
      setDragging(null);
      setSnapLines({});
    }
  }, [dragging, onInteractionComplete]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!dragging || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const pos = getRelativePos(e, canvas);
      processDragMovement(pos);
    },
    [dragging, processDragMovement]
  );

  // Set up global mouse event listeners during drag operations
  useEffect(() => {
    if (!dragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;

      // Convert global mouse position to canvas-relative position
      const canvas = canvasRef.current;
      const pos = getRelativePos(e, canvas);
      processDragMovement(pos);
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    // Add global event listeners
    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [dragging, processDragMovement, handleMouseUp]);

  return {
    dragging,
    snapLines,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getHandlePositions,
    getRotationHandlePos,
  };
}
