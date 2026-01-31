import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { DrawingShape, CanvasState } from "../types";

interface CanvasSliceState extends CanvasState { }

const initialState: CanvasSliceState = {
  shapes: [],
  selectedShapeId: null,
  zoom: 1,
  panX: 0,
  panY: 0,
};

const canvasSlice = createSlice({
  name: "canvas",
  initialState,
  reducers: {
    addShape: (state, action: PayloadAction<DrawingShape>) => {
      state.shapes.push(action.payload);
      state.shapes.sort((a, b) => a.zIndex - b.zIndex);
    },
    updateShape: (state, action: PayloadAction<DrawingShape>) => {
      const index = state.shapes.findIndex((s) => s.id === action.payload.id);
      if (index >= 0) {
        state.shapes[index] = action.payload;
        state.shapes.sort((a, b) => a.zIndex - b.zIndex);
      }
    },
    upsertShape: (state, action: PayloadAction<DrawingShape>) => {
      const index = state.shapes.findIndex((s) => s.id === action.payload.id);
      if (index >= 0) {
        state.shapes[index] = action.payload;
      } else {
        state.shapes.push(action.payload);
      }
      state.shapes.sort((a, b) => a.zIndex - b.zIndex);
    },
    deleteShape: (state, action: PayloadAction<string>) => {
      state.shapes = state.shapes.filter((s) => s.id !== action.payload);
    },
    setShapes: (state, action: PayloadAction<DrawingShape[]>) => {
      state.shapes = action.payload.sort((a, b) => a.zIndex - b.zIndex);
    },
    selectShape: (state, action: PayloadAction<string | null>) => {
      state.selectedShapeId = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = Math.max(0.1, Math.min(5, action.payload));
    },
    setPan: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.panX = action.payload.x;
      state.panY = action.payload.y;
    },
    clearCanvas: (state) => {
      state.shapes = [];
      state.selectedShapeId = null;
    },
  },
});

export const {
  addShape,
  updateShape,
  upsertShape,
  deleteShape,
  setShapes,
  selectShape,
  setZoom,
  setPan,
  clearCanvas,
} = canvasSlice.actions;
export default canvasSlice.reducer;
