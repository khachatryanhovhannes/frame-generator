/**
 * Layer panel component for the banner editor
 * Displays and manages layers with visibility, reordering, and deletion controls
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Type as TypeIcon,
  Square,
} from "lucide-react";
import { Layer } from "../../../../models/banner";

interface LayerPanelProps {
  layers: Layer[];
  activeLayerId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onReorder: (id: string, direction: "forward" | "backward") => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export default function LayerPanel({
  layers,
  onSelect,
  onToggleVisibility,
  onReorder,
  onDelete,
  onDuplicate,
  activeLayerId,
}: LayerPanelProps) {
  const t = useTranslations("bannerCreator.layerPanel");

  const getLayerIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="text-green-500" size={16} />;
      case "text":
        return <TypeIcon className="text-green-600" size={16} />;
      case "shape":
        return <Square className="text-green-700" size={16} />;
      default:
        return <Square className="text-text/50" size={16} />;
    }
  };

  const getLayerName = (layer: Layer, index: number) => {
    const baseName = t(`${layer.type}LayerName`);
    if (layer.type === "text") {
      const truncatedText = layer.text.length > 10 
        ? `${layer.text.substring(0, 10)}...` 
        : layer.text;
      return `${baseName} "${truncatedText}"`;
    }
    return `${baseName} #${layers.length - index}`;
  };

  return (
    <div className="bg-primary backdrop-blur-sm border border-secondary/30 rounded-xl px-2 py-3 shadow-lg flex flex-col gap-1 h-full">
      <div className="text-xs text-text/60 mb-2 uppercase tracking-wider font-bold px-2 flex-shrink-0">
        {t("title")}
      </div>
      
      <div className="overflow-y-auto flex-grow">
        {layers.length === 0 && (
          <div className="text-center text-sm text-text/50 py-6">
            {t("noLayers")}
          </div>
        )}
        
        {layers
          .sort((a, b) => b.zIndex - a.zIndex)
          .map((layer, idx) => (
            <div
              key={layer.id}
              className={`
                flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer group border
                transition-all duration-200
                ${
                  activeLayerId === layer.id
                    ? "border-green-500 bg-green-900/30"
                    : "border-transparent hover:bg-secondary/50"
                }
              `}
              onClick={() => onSelect(layer.id)}
            >
              {getLayerIcon(layer.type)}
              
              <span className="text-xs flex-1 truncate">
                {getLayerName(layer, idx)}
              </span>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility(layer.id);
                  }}
                  title={layer.visible ? t("hideLayer") : t("showLayer")}
                  className="p-1 hover:bg-secondary/60 rounded transition-colors"
                >
                  {layer.visible ? <Eye size={14} className="text-text/70" /> : <EyeOff size={14} className="text-text/40" />}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorder(layer.id, "forward");
                  }}
                  title={t("bringForward")}
                  className="p-1 hover:bg-secondary/60 rounded transition-colors"
                >
                  <ArrowUp size={14} className="text-text/70" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorder(layer.id, "backward");
                  }}
                  title={t("sendBackward")}
                  className="p-1 hover:bg-secondary/60 rounded transition-colors"
                >
                  <ArrowDown size={14} className="text-text/70" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate(layer.id);
                  }}
                  title={t("duplicate")}
                  className="p-1 hover:bg-secondary/60 rounded transition-colors"
                >
                  <Copy size={14} className="text-text/70" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(layer.id);
                  }}
                  title={t("delete")}
                  className="p-1 hover:bg-red-600 rounded transition-colors text-red-400 hover:text-red-300"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
