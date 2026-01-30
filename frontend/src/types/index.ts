export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  owner: { id: string; name: string };
}

export interface DrawingShape {
  id: string;
  type: "rect" | "circle" | "line" | "text" | "image" | "freehand";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  zIndex: number;
  data?: any;
}

export interface Comment {
  id: string;
  content: string;
  x?: number;
  y?: number;
  resolved: boolean;
  user: { id: string; name: string; avatar?: string };
  createdAt: string;
}

export interface CanvasState {
  shapes: DrawingShape[];
  selectedShapeId: string | null;
  zoom: number;
  panX: number;
  panY: number;
}
