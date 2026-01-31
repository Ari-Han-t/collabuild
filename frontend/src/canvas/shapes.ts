export const drawRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke: string,
  strokeWidth: number
) => {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeWidth;
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);
};

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke: string,
  strokeWidth: number
) => {
  const radius = Math.max(width, height) / 2;
  ctx.beginPath();
  ctx.arc(x + width / 2, y + height / 2, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeWidth;
  ctx.stroke();
};

export const drawLine = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  stroke: string,
  strokeWidth: number
) => {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y + height);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeWidth;
  ctx.stroke();
};

export const drawText = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  fill: string,
  fontSize: number = 16
) => {
  ctx.fillStyle = fill;
  ctx.font = `${fontSize}px Arial`;
  ctx.fillText(text, x, y);
};

export const drawFreehand = (
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  stroke: string,
  strokeWidth: number
) => {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.strokeStyle = stroke;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
};
