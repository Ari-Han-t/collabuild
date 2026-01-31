/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/useRedux";
import { updateShape, addShape, selectShape, deleteShape } from "../store/canvasSlice";
import { drawRect, drawCircle, drawLine, drawText, drawFreehand } from "../canvas/shapes";
import type { DrawingShape } from "../types";
import { v4 as uuidv4 } from "uuid";

interface CanvasProps {
  projectId: string;
  onShapeUpdate?: (shape: DrawingShape) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ projectId, onShapeUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useAppDispatch();
  const { shapes, selectedShapeId, zoom, panX, panY } = useAppSelector(
    (state) => state.canvas
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<
    "select" | "rect" | "circle" | "line" | "text" | "freehand" | "eraser"
  >("select");
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [freehandPoints, setFreehandPoints] = useState<{ x: number; y: number }[]>([]);

  const [textInput, setTextInput] = useState<{ x: number; y: number; value: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 0.5;
    const gridSize = 20;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw shapes
    ctx.save();
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    shapes.forEach((shape) => {
      if (shape.type === "rect") {
        drawRect(ctx, shape.x, shape.y, shape.width, shape.height, shape.fill, shape.stroke, shape.strokeWidth);
      } else if (shape.type === "circle") {
        drawCircle(ctx, shape.x, shape.y, shape.width, shape.height, shape.fill, shape.stroke, shape.strokeWidth);
      } else if (shape.type === "line") {
        drawLine(ctx, shape.x, shape.y, shape.width, shape.height, shape.stroke, shape.strokeWidth);
      } else if (shape.type === "text") {
        drawText(ctx, shape.x, shape.y, shape.data?.text || "Text", shape.fill, 16);
      } else if (shape.type === "freehand") {
        drawFreehand(ctx, shape.data?.points || [], shape.stroke, shape.strokeWidth);
      }

      // Highlight selected
      if (shape.id === selectedShapeId) {
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 2;
        const padding = 5;
        // Basic bounds approximation for highlight
        if (shape.type === 'freehand') {
          // Should calculate bounds but for now just showing a noticeable box or nothing
          // Improvement: calculate bounding box of points
        } else {
          ctx.strokeRect(shape.x - padding, shape.y - padding, shape.width + padding * 2, shape.height + padding * 2);
        }
      }
    });

    ctx.restore();
  }, [shapes, selectedShapeId, zoom, panX, panY]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    // If placing text, don't start drawing shape
    if (currentTool === 'text') {
      if (textInput) {
        handleTextSubmit();
      } else {
        setTextInput({ x: coords.x, y: coords.y, value: "" });
      }
      return;
    }

    setStartPos(coords);
    setIsDrawing(true);

    if (currentTool === "freehand") {
      setFreehandPoints([coords]);
    } else if (currentTool === "select" || currentTool === "eraser") {
      // Hit testing
      const clickedShape = [...shapes].reverse().find(shape => {
        // Simple bounds check with some tolerance
        const padding = 10;
        return coords.x >= shape.x - padding &&
          coords.x <= shape.x + shape.width + padding &&
          coords.y >= shape.y - padding &&
          coords.y <= shape.y + shape.height + padding;
      });

      console.log("Clicked Shape:", clickedShape);

      if (currentTool === "eraser" && clickedShape) {
        dispatch(deleteShape(clickedShape.id));
        // Also clear selection if we deleted the selected shape
        if (selectedShapeId === clickedShape.id) {
          dispatch(selectShape(null));
        }
        setIsDrawing(false); // Don't drag after delete
        return;
      }

      if (clickedShape) {
        dispatch(selectShape(clickedShape.id));
      } else {
        dispatch(selectShape(null));
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;

    const coords = getCanvasCoords(e);
    setCurrentPos(coords);

    if (currentTool === "freehand") {
      setFreehandPoints((prev) => [...prev, coords]);
      // Redraw immediately for responsiveness
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.save();
          ctx.translate(panX, panY);
          ctx.scale(zoom, zoom);
          ctx.beginPath();
          ctx.moveTo(freehandPoints[freehandPoints.length - 1]?.x || coords.x, freehandPoints[freehandPoints.length - 1]?.y || coords.y);
          ctx.lineTo(coords.x, coords.y);
          ctx.strokeStyle = currentColor;
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.stroke();
          ctx.restore();
        }
      }
      return;
    }

    const width = Math.abs(coords.x - startPos.x);
    const height = Math.abs(coords.y - startPos.y);
    const x = Math.min(coords.x, startPos.x);
    const y = Math.min(coords.y, startPos.y);

    if (currentTool !== "select" && currentTool !== "text" && currentTool !== "eraser") {
      // ... (rest of logic handles preview)
    }
  };

  // ... (useEffects)

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    setIsDrawing(false);

    let endX = 0; let endY = 0;
    if (e && e.type !== 'mouseleave') {
      const coords = getCanvasCoords(e);
      endX = coords.x;
      endY = coords.y;
    } else if (currentPos) {
      endX = currentPos.x;
      endY = currentPos.y;
    } else {
      endX = startPos.x;
      endY = startPos.y;
    }

    if (currentTool === "freehand") {
      // ... (freehand logic)
      const shape: DrawingShape = {
        id: uuidv4(),
        type: "freehand",
        x: 0, y: 0, width: 0, height: 0, rotation: 0,
        fill: "transparent",
        stroke: currentColor,
        strokeWidth: 2,
        opacity: 1,
        zIndex: shapes.length,
        data: { points: freehandPoints }
      };
      dispatch(addShape(shape));
      onShapeUpdate?.(shape);
      setFreehandPoints([]);
    } else if (currentTool !== "select" && currentTool !== "text" && currentTool !== "eraser") {
      const width = Math.abs(endX - startPos.x);
      const height = Math.abs(endY - startPos.y);
      const x = Math.min(endX, startPos.x);
      const y = Math.min(endY, startPos.y);

      if (width > 2 && height > 2) {
        const shape: DrawingShape = {
          id: uuidv4(),
          type: currentTool as any,
          x, y, width, height, rotation: 0,
          fill: currentTool === 'line' ? 'transparent' : currentColor, // Fix fill for line
          stroke: currentTool === 'line' ? currentColor : "#000000",
          strokeWidth: 2,
          opacity: 1,
          zIndex: shapes.length,
        };
        dispatch(addShape(shape));
        onShapeUpdate?.(shape);
      }
    }

    setStartPos(null);
    setCurrentPos(null);
  };

  const handleTextSubmit = () => {
    // ...
    setTextInput(null);
    setCurrentTool('select');
  };

  return (
    <div className="flex flex-col gap-4 relative">
      <div className="flex gap-2 bg-gray-100 p-3 rounded-lg overflow-x-auto">
        <button title="Select Tool" onClick={() => setCurrentTool("select")} className={`px-3 py-2 rounded ${currentTool === "select" ? "bg-blue-500 text-white" : "bg-white"}`}>Select</button>
        <button title="Rectangle Tool" onClick={() => setCurrentTool("rect")} className={`px-3 py-2 rounded ${currentTool === "rect" ? "bg-blue-500 text-white" : "bg-white"}`}>Rect</button>
        <button title="Circle Tool" onClick={() => setCurrentTool("circle")} className={`px-3 py-2 rounded ${currentTool === "circle" ? "bg-blue-500 text-white" : "bg-white"}`}>Circle</button>
        <button title="Freehand Pen" onClick={() => setCurrentTool("freehand")} className={`px-3 py-2 rounded ${currentTool === "freehand" ? "bg-blue-500 text-white" : "bg-white"}`}>Pen</button>
        <button title="Text Tool" onClick={() => setCurrentTool("text")} className={`px-3 py-2 rounded ${currentTool === "text" ? "bg-blue-500 text-white" : "bg-white"}`}>Text</button>
        <button title="Eraser Tool" onClick={() => setCurrentTool("eraser")} className={`px-3 py-2 rounded ${currentTool === "eraser" ? "bg-blue-500 text-white" : "bg-white"}`}>Eraser</button>
        <input title="Color Picker" type="color" value={currentColor} onChange={(e) => setCurrentColor(e.target.value)} className="ml-auto w-10 h-10 cursor-pointer rounded" />
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={1200}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="border-2 border-gray-300 cursor-crosshair bg-white rounded-lg block"
        />
        {textInput && (
          <input
            autoFocus
            type="text"
            value={textInput.value}
            onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTextSubmit();
              if (e.key === 'Escape') setTextInput(null);
            }}
            className="absolute p-2 border-2 border-blue-500 rounded shadow-lg bg-white text-black"
            style={{
              left: (textInput.x * zoom + panX) + "px",
              top: (textInput.y * zoom + panY) + "px",
              zIndex: 1000,
              minWidth: "150px"
            }}
          />
        )}
      </div>
    </div>
  );
};
