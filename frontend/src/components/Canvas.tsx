import React, { useRef, useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/useRedux";
import { setShapes, updateShape, deleteShape } from "../store/canvasSlice";
import { drawRect, drawCircle, drawLine, drawText } from "../canvas/shapes";
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
    "select" | "rect" | "circle" | "line" | "text"
  >("select");
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentColor, setCurrentColor] = useState("#000000");

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
        drawRect(
          ctx,
          shape.x,
          shape.y,
          shape.width,
          shape.height,
          shape.fill,
          shape.stroke,
          shape.strokeWidth
        );
      } else if (shape.type === "circle") {
        drawCircle(
          ctx,
          shape.x,
          shape.y,
          shape.width,
          shape.height,
          shape.fill,
          shape.stroke,
          shape.strokeWidth
        );
      } else if (shape.type === "line") {
        drawLine(ctx, shape.x, shape.y, shape.width, shape.height, shape.stroke, shape.strokeWidth);
      } else if (shape.type === "text") {
        drawText(ctx, shape.x, shape.y, shape.data?.text || "Text", shape.fill, 16);
      }

      // Highlight selected
      if (shape.id === selectedShapeId) {
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 2;
        ctx.strokeRect(shape.x - 5, shape.y - 5, shape.width + 10, shape.height + 10);
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
    setStartPos(coords);
    setIsDrawing(true);

    if (currentTool === "select") {
      // Find clicked shape
      const clicked = shapes.find(
        (shape) =>
          coords.x >= shape.x &&
          coords.x <= shape.x + shape.width &&
          coords.y >= shape.y &&
          coords.y <= shape.y + shape.height
      );
      // dispatch(selectShape(clicked?.id || null));
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;

    const coords = getCanvasCoords(e);
    const width = Math.abs(coords.x - startPos.x);
    const height = Math.abs(coords.y - startPos.y);
    const x = Math.min(coords.x, startPos.x);
    const y = Math.min(coords.y, startPos.y);

    if (currentTool !== "select") {
      // Preview drawing
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.save();
          ctx.translate(panX, panY);
          ctx.scale(zoom, zoom);

          shapes.forEach((shape) => {
            if (shape.type === "rect") {
              drawRect(
                ctx,
                shape.x,
                shape.y,
                shape.width,
                shape.height,
                shape.fill,
                shape.stroke,
                shape.strokeWidth
              );
            }
          });

          if (currentTool === "rect") {
            drawRect(ctx, x, y, width, height, currentColor, "#000000", 2);
          }

          ctx.restore();
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !startPos) return;
    setIsDrawing(false);

    if (currentTool !== "select") {
      const canvas = canvasRef.current;
      if (canvas) {
        const coords = canvas.getBoundingClientRect();
        const endX =
          (getCanvasCoords({ clientX: coords.right, clientY: coords.top } as any).x -
            startPos.x) *
          zoom;
        const endY =
          (getCanvasCoords({ clientX: coords.left, clientY: coords.bottom } as any).y -
            startPos.y) *
          zoom;

        const shape: DrawingShape = {
          id: uuidv4(),
          type: currentTool as any,
          x: startPos.x,
          y: startPos.y,
          width: Math.abs(endX),
          height: Math.abs(endY),
          rotation: 0,
          fill: currentColor,
          stroke: "#000000",
          strokeWidth: 2,
          opacity: 1,
          zIndex: shapes.length,
        };

        dispatch(updateShape(shape));
        onShapeUpdate?.(shape);
      }
    }

    setStartPos(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 bg-gray-100 p-3 rounded-lg">
        <button
          onClick={() => setCurrentTool("select")}
          className={`px-3 py-2 rounded ${currentTool === "select" ? "bg-blue-500 text-white" : "bg-white"}`}
        >
          Select
        </button>
        <button
          onClick={() => setCurrentTool("rect")}
          className={`px-3 py-2 rounded ${currentTool === "rect" ? "bg-blue-500 text-white" : "bg-white"}`}
        >
          Rectangle
        </button>
        <button
          onClick={() => setCurrentTool("circle")}
          className={`px-3 py-2 rounded ${currentTool === "circle" ? "bg-blue-500 text-white" : "bg-white"}`}
        >
          Circle
        </button>
        <input
          type="color"
          value={currentColor}
          onChange={(e) => setCurrentColor(e.target.value)}
          className="ml-auto w-10 h-10 cursor-pointer rounded"
        />
      </div>
      <canvas
        ref={canvasRef}
        width={1200}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="border-2 border-gray-300 cursor-crosshair bg-white rounded-lg"
      />
    </div>
  );
};
