/**
 * Banner Editor Page Component
 * Main component that orchestrates the entire banner editing experience
 * Manages state, handles user interactions, and coordinates between all sub-components
 */

"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Layer, ShapeType } from "../../../models/banner";
import { 
  INITIAL_BANNER_WIDTH, 
  INITIAL_BANNER_HEIGHT, 
  CANVAS_PRESETS,
} from "../../../constants/banner";
import { 
  createTextLayer, 
  createShapeLayer, 
  createImageLayer, 
  updateLayer,
  reorderLayer,
  duplicateLayer,
  getNextZIndex,
} from "../../../utils/layers";
import { useHistory } from "../../../hooks/useHistory";
import { useCanvasInteraction } from "../../../hooks/useCanvasInteraction";
import { TopControlPanel, LayerPanel, PropertiesPanel } from "../../ui/molecules";
import { BannerCanvas } from "../../ui/organisms";

export default function BannerEditorPage() {
  const t = useTranslations("bannerCreator");
  
  // Core state
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(INITIAL_BANNER_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(INITIAL_BANNER_HEIGHT);
  
  // Refs
  const imageCache = useRef(new Map<string, HTMLImageElement>());
  const propertiesPanelRef = useRef<HTMLDivElement>(null);
  const layersPanelRef = useRef<HTMLDivElement>(null);
  const topPanelRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const {
    canUndo,
    canRedo,
    recordHistory,
    undo,
    redo,
  } = useHistory();

  // Layer management functions
  const handleLayerUpdate = useCallback((id: string, patch: Partial<Layer>) => {
    setLayers(prev => updateLayer(prev, id, patch));
  }, []);

  const commitLayerUpdate = useCallback(() => {
    recordHistory(layers, activeLayerId, canvasWidth, canvasHeight);
  }, [layers, activeLayerId, canvasWidth, canvasHeight, recordHistory]);

  const selectLayer = useCallback((id: string | null) => {
    setActiveLayerId(id);
  }, []);

  // Canvas interaction
  const {
    dragging,
    snapLines,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useCanvasInteraction({
    layers,
    activeLayerId,
    canvasWidth,
    canvasHeight,
    onLayerUpdate: handleLayerUpdate,
    onLayerSelect: selectLayer,
    onInteractionComplete: commitLayerUpdate,
  });

  // History management
  const handleUndo = useCallback(() => {
    const prevState = undo();
    if (prevState) {
      setLayers(prevState.layers);
      setActiveLayerId(prevState.activeLayerId);
      setCanvasWidth(prevState.canvasWidth);
      setCanvasHeight(prevState.canvasHeight);
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setLayers(nextState.layers);
      setActiveLayerId(nextState.activeLayerId);
      setCanvasWidth(nextState.canvasWidth);
      setCanvasHeight(nextState.canvasHeight);
    }
  }, [redo]);

  // Layer creation functions
  const handleAddText = useCallback(() => {
    const newLayer = createTextLayer(
      { x: canvasWidth / 2, y: canvasHeight / 2 },
      getNextZIndex(layers)
    );
    const newLayers = [...layers, newLayer];
    setLayers(newLayers);
    setActiveLayerId(newLayer.id);
    recordHistory(newLayers, newLayer.id, canvasWidth, canvasHeight);
  }, [layers, canvasWidth, canvasHeight, recordHistory]);

  const handleAddShape = useCallback((shapeType: ShapeType) => {
    const newLayer = createShapeLayer(
      { x: canvasWidth / 2, y: canvasHeight / 2 },
      getNextZIndex(layers),
      shapeType
    );
    const newLayers = [...layers, newLayer];
    setLayers(newLayers);
    setActiveLayerId(newLayer.id);
    recordHistory(newLayers, newLayer.id, canvasWidth, canvasHeight);
  }, [layers, canvasWidth, canvasHeight, recordHistory]);

  const handleAddImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        const newLayer = createImageLayer(
          img,
          { x: canvasWidth / 2, y: canvasHeight / 2 },
          getNextZIndex(layers)
        );
        imageCache.current.set(newLayer.id, img);
        
        const newLayers = [...layers, newLayer];
        setLayers(newLayers);
        setActiveLayerId(newLayer.id);
        recordHistory(newLayers, newLayer.id, canvasWidth, canvasHeight);
      };
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [layers, canvasWidth, canvasHeight, recordHistory]);

  // Layer manipulation functions
  const handleDeleteLayer = useCallback((id: string) => {
    const newLayers = layers.filter(l => l.id !== id);
    setLayers(newLayers);
    setActiveLayerId(null);
    imageCache.current.delete(id);
    recordHistory(newLayers, null, canvasWidth, canvasHeight);
  }, [layers, canvasWidth, canvasHeight, recordHistory]);

  const handleDuplicateLayer = useCallback((id: string) => {
    const layerToDuplicate = layers.find(l => l.id === id);
    if (!layerToDuplicate) return;

    const newLayer = {
      ...duplicateLayer(layerToDuplicate),
      zIndex: getNextZIndex(layers),
    };

    // Handle image layer duplication
    if (newLayer.type === "image") {
      const img = imageCache.current.get(id);
      if (img) {
        imageCache.current.set(newLayer.id, img);
      }
    }

    const newLayers = [...layers, newLayer];
    setLayers(newLayers);
    setActiveLayerId(newLayer.id);
    recordHistory(newLayers, newLayer.id, canvasWidth, canvasHeight);
  }, [layers, recordHistory, canvasWidth, canvasHeight]);

  const handleReorderLayer = useCallback((id: string, direction: "forward" | "backward") => {
    const newLayers = reorderLayer(layers, id, direction);
    setLayers(newLayers);
    recordHistory(newLayers, activeLayerId, canvasWidth, canvasHeight);
  }, [layers, activeLayerId, canvasWidth, canvasHeight, recordHistory]);

  const handleToggleVisibility = useCallback((id: string) => {
    const newLayers = layers.map(layer => 
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    );
    setLayers(newLayers);
    recordHistory(newLayers, activeLayerId, canvasWidth, canvasHeight);
  }, [layers, activeLayerId, canvasWidth, canvasHeight, recordHistory]);

  // Canvas management
  const handleCanvasSizeChange = useCallback((presetKey: string) => {
    const preset = CANVAS_PRESETS[presetKey as keyof typeof CANVAS_PRESETS];
    if (!preset) return;

    const scaleX = preset.width / canvasWidth;
    const scaleY = preset.height / canvasHeight;

    const scaledLayers = layers.map(layer => ({
      ...layer,
      position: {
        x: layer.position.x * scaleX,
        y: layer.position.y * scaleY,
      },
    }));

    setCanvasWidth(preset.width);
    setCanvasHeight(preset.height);
    setLayers(scaledLayers);
    recordHistory(scaledLayers, activeLayerId, preset.width, preset.height);
  }, [layers, activeLayerId, canvasWidth, canvasHeight, recordHistory]);

  // Download functionality
  const handleDownload = useCallback(() => {
    const currentActiveId = activeLayerId;
    setActiveLayerId(null);
    
    setTimeout(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (canvas) {
        const link = document.createElement('a');
        link.download = 'banner.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
      setActiveLayerId(currentActiveId);
    }, 100);
  }, [activeLayerId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || 
          (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            handleRedo();
            break;
          case 'd':
            e.preventDefault();
            if (activeLayerId) handleDuplicateLayer(activeLayerId);
            break;
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (activeLayerId) handleDeleteLayer(activeLayerId);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      
      if (propertiesPanelRef.current?.contains(target) ||
          layersPanelRef.current?.contains(target) ||
          topPanelRef.current?.contains(target) ||
          canvasContainerRef.current?.contains(target)) {
        return;
      }
      
      setActiveLayerId(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeLayerId, handleUndo, handleRedo, handleDuplicateLayer, handleDeleteLayer]);

  const activeLayer = layers.find(l => l.id === activeLayerId);

  return (
    <div className="min-h-screen bg-background text-text p-2 md:p-4 font-sans flex flex-col">
      {/* Top Control Panel */}
      <div ref={topPanelRef}>
        <TopControlPanel
          onImageAdd={handleAddImage}
          onTextAdd={handleAddText}
          onShapeAdd={handleAddShape}
          onDownload={handleDownload}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onSizeChange={handleCanvasSizeChange}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr_250px] gap-4 max-w-[1920px] mx-auto w-full">
        {/* Properties Panel */}
        <div ref={propertiesPanelRef} className="order-3 lg:order-1">
          <PropertiesPanel
            activeLayer={activeLayer}
            onUpdate={handleLayerUpdate}
          />
        </div>

        {/* Canvas Area */}
        <div className="order-1 lg:order-2 flex items-center justify-center min-w-0">
          <div
            ref={canvasContainerRef}
            className="relative w-full bg-primary shadow-2xl rounded-xl"
            style={{
              aspectRatio: `${canvasWidth} / ${canvasHeight}`,
              maxHeight: '70vh',
              userSelect: 'none',
            }}
          >
            <BannerCanvas
              layers={layers}
              activeLayerId={activeLayerId}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              snapLines={snapLines}
              imageCache={imageCache.current}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: dragging ? 'grabbing' : 'default' }}
            />
          </div>
        </div>

        {/* Layers Panel */}
        <div ref={layersPanelRef} className="order-2 lg:order-3">
          <LayerPanel
            layers={layers}
            activeLayerId={activeLayerId}
            onSelect={selectLayer}
            onToggleVisibility={handleToggleVisibility}
            onReorder={handleReorderLayer}
            onDelete={handleDeleteLayer}
            onDuplicate={handleDuplicateLayer}
          />
        </div>
      </div>
    </div>
  );
}
