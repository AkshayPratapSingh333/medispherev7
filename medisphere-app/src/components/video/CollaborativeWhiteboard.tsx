"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { Socket } from "socket.io-client";

interface WhiteboardProps {
  socket: Socket | null;
  roomId: string;
}

interface Point {
  x: number;
  y: number;
}

interface DrawOp {
  type: "draw" | "clear";
  from?: Point;
  to?: Point;
  color?: string;
  width?: number;
}

export default function CollaborativeWhiteboard({ socket, roomId }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const [color, setColor] = useState("#22d3ee");
  const [width, setWidth] = useState(2);

  const drawLine = useCallback(
    (from: Point, to: Point, strokeColor = color, strokeWidth = width) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    },
    [color, width]
  );

  const clearBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getPoint = (event: MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const onMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    drawingRef.current = true;
    lastPointRef.current = getPoint(event);
  };

  const onMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !lastPointRef.current) return;
    const nextPoint = getPoint(event);
    const from = lastPointRef.current;
    drawLine(from, nextPoint, color, width);

    socket?.emit("whiteboard:op", {
      roomId,
      op: {
        type: "draw",
        from,
        to: nextPoint,
        color,
        width,
      },
    });

    lastPointRef.current = nextPoint;
  };

  const onMouseUp = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const handleClear = () => {
    clearBoard();
    socket?.emit("whiteboard:op", {
      roomId,
      op: { type: "clear" },
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const image = canvas.toDataURL();
      canvas.width = Math.max(800, parent.clientWidth - 2);
      canvas.height = 360;

      if (image !== "data:,") {
        const img = new Image();
        img.onload = () => {
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = image;
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleOp = ({ op }: { op: DrawOp }) => {
      if (op.type === "clear") {
        clearBoard();
        return;
      }

      if (op.type === "draw" && op.from && op.to) {
        drawLine(op.from, op.to, op.color || "#22d3ee", op.width || 2);
      }
    };

    socket.on("whiteboard:op", handleOp);
    return () => {
      socket.off("whiteboard:op", handleOp);
    };
  }, [socket, drawLine]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="mb-2 flex items-center gap-2">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border"
          title="Pen color"
        />
        <input
          type="range"
          min={1}
          max={10}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          title="Pen width"
        />
        <button
          onClick={handleClear}
          className="ml-auto rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
        >
          Clear
        </button>
      </div>

      <div className="w-full overflow-hidden rounded border border-gray-300">
        <canvas
          ref={canvasRef}
          className="h-[360px] w-full cursor-crosshair bg-white"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
      </div>
    </div>
  );
}
