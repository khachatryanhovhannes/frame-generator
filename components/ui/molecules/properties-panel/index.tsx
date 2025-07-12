/**
 * Properties panel component for the banner editor
 * Displays and allows editing of the selected layer's properties
 */

"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Layer, FontFamily, TextAlign } from "../../../../models/banner";
import { RangeSlider, ColorPicker, Checkbox } from "../../atoms";
import { FONT_LIST } from "../../../../constants/banner";

interface PropertiesPanelProps {
  activeLayer: Layer | undefined;
  onUpdate: (id: string, patch: Partial<Layer>) => void;
}

export default function PropertiesPanel({
  activeLayer,
  onUpdate,
}: PropertiesPanelProps) {
  const t = useTranslations("bannerCreator.propertiesPanel");

  if (!activeLayer) {
    return (
      <div className="bg-primary backdrop-blur-sm rounded-xl p-4 shadow-lg text-sm h-full flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <p className="text-text/60 text-center">
            {t("selectLayer")}
          </p>
        </div>
      </div>
    );
  }

  const renderCommonControls = () => (
    <>
      <RangeSlider
        label={`${t("rotation")}`}
        value={activeLayer.rotation}
        min={-180}
        max={180}
        unit="°"
        onChange={(value) => onUpdate(activeLayer.id, { rotation: value })}
      />
      
      <RangeSlider
        label={`${t("opacity")}`}
        value={Math.round(activeLayer.opacity * 100)}
        min={0}
        max={100}
        unit="%"
        onChange={(value) => onUpdate(activeLayer.id, { opacity: value / 100 })}
      />
    </>
  );

  const renderImageControls = () => {
    if (activeLayer.type !== "image") return null;

    return (
      <>
        <h4 className="font-bold text-xs uppercase text-gray-400 mb-3 mt-4">
          {t("filters")}
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {Object.entries(activeLayer.filters).map(([key, value]) => (
            <RangeSlider
              key={key}
              label={t(key)}
              value={value}
              min={key === "blur" ? 0 : 0}
              max={key === "blur" ? 20 : 200}
              unit={key === "blur" ? "px" : "%"}
              onChange={(newValue) =>
                onUpdate(activeLayer.id, {
                  filters: {
                    ...activeLayer.filters,
                    [key]: newValue,
                  },
                })
              }
            />
          ))}
        </div>
      </>
    );
  };

  const renderTextControls = () => {
    if (activeLayer.type !== "text") return null;

    return (
      <>
        <div className="mb-4 ">
          <label className="block text-xs text-text/70 mb-2 ">{t("textContent")}</label>
          <textarea
            className="w-full p-2 rounded-lg bg-background text-text border border-secondary/50 focus:border-green-500 focus:outline-none resize-none"
            value={activeLayer.text}
            onChange={(e) => onUpdate(activeLayer.id, { text: e.target.value })}
            rows={3}
            placeholder={t("textPlaceholder")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-text/70 mb-1">{t("font")}</label>
            <select
              value={activeLayer.font}
              onChange={(e) =>
                onUpdate(activeLayer.id, { font: e.target.value as FontFamily })
              }
              className="w-full p-2 rounded-lg bg-background text-text border border-secondary/50 focus:border-green-500 focus:outline-none"
            >
              {FONT_LIST.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>
          
          <ColorPicker
            label={t("color")}
            value={activeLayer.color}
            onChange={(value) => onUpdate(activeLayer.id, { color: value })}
          />
        </div>

        <RangeSlider
          label={`${t("size")}`}
          value={activeLayer.size}
          min={10}
          max={300}
          unit="px"
          onChange={(value) => onUpdate(activeLayer.id, { size: value })}
        />

        <RangeSlider
          label={`${t("lineHeight")}`}
          value={activeLayer.lineHeight}
          min={0.8}
          max={2.5}
          step={0.1}
          unit="x"
          onChange={(value) => onUpdate(activeLayer.id, { lineHeight: value })}
        />

        <div className="mb-4">
          <label className="block text-xs text-text/70 mb-2">{t("textAlignment")}</label>
          <div className="grid grid-cols-3 gap-2">
            {(["left", "center", "right"] as TextAlign[]).map((align) => (
              <button
                key={align}
                onClick={() => onUpdate(activeLayer.id, { textAlign: align })}
                className={`
                  p-2 rounded-lg text-xs font-medium transition-colors
                  ${
                    activeLayer.textAlign === align
                      ? "bg-green-600 text-white"
                      : "bg-background text-text/70 hover:bg-background/80"
                  }
                `}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Checkbox
            label={t("bold")}
            checked={activeLayer.fontWeight === "bold"}
            onChange={(checked) =>
              onUpdate(activeLayer.id, {
                fontWeight: checked ? "bold" : "normal",
              })
            }
          />
          
          <Checkbox
            label={t("italic")}
            checked={activeLayer.italic}
            onChange={(checked) => onUpdate(activeLayer.id, { italic: checked })}
          />
          
          <Checkbox
            label={t("underline")}
            checked={activeLayer.underline}
            onChange={(checked) => onUpdate(activeLayer.id, { underline: checked })}
          />
          
          <Checkbox
            label={t("shadow")}
            checked={activeLayer.shadow}
            onChange={(checked) => onUpdate(activeLayer.id, { shadow: checked })}
          />
        </div>
      </>
    );
  };

  const renderShapeControls = () => {
    if (activeLayer.type !== "shape") return null;

    return (
      <>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <ColorPicker
            label={t("fillColor")}
            value={activeLayer.fillColor}
            onChange={(value) => onUpdate(activeLayer.id, { fillColor: value })}
          />
          
          <ColorPicker
            label={t("strokeColor")}
            value={activeLayer.strokeColor}
            onChange={(value) => onUpdate(activeLayer.id, { strokeColor: value })}
          />
        </div>

        <RangeSlider
          label={`${t("strokeWidth")}`}
          value={activeLayer.strokeWidth}
          min={0}
          max={50}
          unit="px"
          onChange={(value) => onUpdate(activeLayer.id, { strokeWidth: value })}
        />

        {activeLayer.shapeType === "rectangle" && (
          <RangeSlider
            label={`${t("borderRadius")}`}
            value={activeLayer.borderRadius || 0}
            min={0}
            max={100}
            unit="%"
            onChange={(value) => onUpdate(activeLayer.id, { borderRadius: value })}
          />
        )}
      </>
    );
  };

  return (
    <div className="bg-primary backdrop-blur-sm rounded-xl p-4 shadow-lg text-sm h-full flex flex-col">
      <div className="overflow-y-auto">
        <h3 className="font-semibold text-lg text-text capitalize mb-4">
          {t(`${activeLayer.type}Settings`)}
        </h3>

        {renderImageControls()}
        {renderTextControls()}
        {renderShapeControls()}
        {renderCommonControls()}
      </div>
    </div>
  );
}
