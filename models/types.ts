export interface CanvasEditorProps {
  imageSrc: string;
  frameColor: string;
  frameWidth: number;
  text: string;
  textColor: string;
  textSize: number;
  fontFamily: string;
  fontWeight: string;
  angleDeg: number;
  fadeZone?: number;
  fadePadDeg?: number;
  scale: number;
  setScale: (v: number) => void;
}
