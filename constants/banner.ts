/**
 * Constants and configuration for the Banner Generator
 * Contains canvas presets, default values, and theme colors
 */

import { FontFamily, CanvasPreset } from "../models/banner";

// Canvas dimensions and styling
export const INITIAL_BANNER_WIDTH = 1584;
export const INITIAL_BANNER_HEIGHT = 396;
export const CANVAS_BG = "#f0f2f5";

// Interaction constants
export const HANDLE_SIZE = 12;
export const ROTATION_HANDLE_OFFSET = 30;
export const SNAP_THRESHOLD = 8;

// Available fonts for text layers
export const FONT_LIST: FontFamily[] = [
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

// Predefined canvas size presets for different social media platforms
export const CANVAS_PRESETS: Record<string, CanvasPreset> = {
  "linkedin-banner": { name: "LinkedIn Banner", width: 1584, height: 396 },
  "facebook-cover": { name: "Facebook Cover", width: 851, height: 315 },
  "twitter-header": { name: "Twitter Header", width: 1500, height: 500 },
  "youtube-channel-art": {
    name: "YouTube Channel Art",
    width: 2560,
    height: 1440,
  },
};

// Default layer properties
export const DEFAULT_TEXT_LAYER = {
  text: "New Text",
  font: "Montserrat" as FontFamily,
  color: "#333333",
  size: 70,
  fontWeight: "bold" as const,
  italic: false,
  underline: false,
  shadow: true,
  maxWidth: 400,
  opacity: 1,
  visible: true,
  textAlign: "center" as const,
  lineHeight: 1.2,
  rotation: 0,
};

export const DEFAULT_SHAPE_LAYER = {
  width: 150,
  height: 150,
  fillColor: "#3b82f6",
  strokeColor: "#1e40af",
  strokeWidth: 0,
  rotation: 0,
  opacity: 1,
  visible: true,
  borderRadius: 0,
};

export const DEFAULT_IMAGE_FILTERS = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  blur: 0,
};
