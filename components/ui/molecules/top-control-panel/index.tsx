/**
 * Top control panel for the banner editor
 * Contains main toolbar with undo/redo, add elements, canvas size, and download functionality
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Undo,
  Redo,
  Type as TypeIcon,
  Image as ImageIcon,
  Square,
  Download,
} from "lucide-react";
import { ActionButton, FileUploadButton } from "../../atoms";
import { ShapeType } from "../../../../models/banner";
import { CANVAS_PRESETS } from "../../../../constants/banner";

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

export default function TopControlPanel({
  onImageAdd,
  onTextAdd,
  onShapeAdd,
  onDownload,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSizeChange,
}: TopControlPanelProps) {
  const t = useTranslations("bannerCreator.topPanel");

  return (
    <div className="bg-primary backdrop-blur-sm rounded-xl p-3 shadow-lg flex flex-wrap items-center justify-between gap-4 mb-4">
      {/* History Controls */}
      <div className="flex items-center gap-2 base:flex-nowrap flex-wrap">
        <ActionButton
          icon={Undo}
          label={t("undo")}
          onClick={onUndo}
          disabled={!canUndo}
          tooltip={t("undo")}
        />
        <ActionButton
          icon={Redo}
          label={t("redo")}
          onClick={onRedo}
          disabled={!canRedo}
          tooltip={t("redo")}
        />

        <div className="w-px h-6 bg-background/30 mx-2" />

        {/* Canvas Size Selector */}
        <select
          onChange={(e) => onSizeChange(e.target.value)}
          className="bg-background text-text text-sm rounded-lg p-2 hover:bg-background/80 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          aria-label="Canvas size preset"
        >
          {Object.entries(CANVAS_PRESETS).map(
            ([key, { name, width, height }]) => (
              <option key={key} value={key}>
                {name} ({width}×{height})
              </option>
            )
          )}
        </select>

        <div className="w-px h-6 bg-background/30 mx-2" />
      </div>

      {/* Add Elements Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <ActionButton
          icon={TypeIcon}
          label={t("addText")}
          onClick={onTextAdd}
          variant="primary"
        />

        <FileUploadButton
          icon={ImageIcon}
          label={t("addImage")}
          accept="image/*"
          onChange={onImageAdd}
          variant="primary"
          className="bg-green-600 hover:bg-green-700"
        />

        <ActionButton
          icon={Square}
          label={t("addShape")}
          onClick={() => onShapeAdd("rectangle")}
          variant="primary"
          className="bg-green-700 hover:bg-green-800"
        />
      </div>

      {/* Download Control */}
      <ActionButton
        icon={Download}
        label={t("download")}
        onClick={onDownload}
        variant="success"
      />
    </div>
  );
}
