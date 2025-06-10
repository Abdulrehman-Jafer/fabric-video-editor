"use client";
import { StoreContext } from "@/store";
import { useContext, useEffect, useRef, useState, useMemo } from "react";

export type ScaleRangeInputProps = {
  height: number;
  backgroundColor: string;
};

/**
 *
 * canvas width
 *
 * maxTime duration
 *
 * zoom
 */

export const ScaleRangeInput = ({
  height,
  backgroundColor,
}: ScaleRangeInputProps) => {
  const store = useContext(StoreContext);

  const { markings, currentTimeInMs, maxTime, zoomPercent } = store;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const canvasWidth = useMemo(() => {
    const zoomX = zoomPercent / 100;
    return containerWidth * zoomX;
  }, [containerWidth]);

  // On containerSizeChange
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.clientWidth;
        setContainerWidth(newWidth);
      }
    };

    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updateSize();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasWidth <= 0) return;

    canvas.width = canvasWidth;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, height);

    markings.forEach((marking) => {
      if (marking.interval <= 0) return;

      ctx.strokeStyle = marking.color;
      ctx.lineWidth = marking.width;
      ctx.beginPath();

      const zoomX = zoomPercent / 100;
      const intervalWithZoom = marking.interval * zoomX;
      const maxTimeZoomX = maxTime * zoomX;

      for (let time = 0; time <= maxTimeZoomX; time += intervalWithZoom) {
        const x = (time / maxTimeZoomX) * canvasWidth;
        const xWithZoom = x * zoomX;
        ctx.moveTo(xWithZoom, 0);
        ctx.lineTo(xWithZoom, marking.size);
      }

      ctx.stroke();
    });
  }, [markings, backgroundColor, maxTime, canvasWidth, height, zoomPercent]);

  const onMouseClickOrMoveToNewPosition = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!isMouseDownRef.current || !containerRef.current || canvasWidth <= 0)
      return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    const scrollLeft = containerRef.current.scrollLeft;
    const actualX = x + scrollLeft;

    const timeValue = (actualX / canvasWidth) * maxTime;

    const zoomX = zoomPercent / 100;
    const timeValueWithOutZoomX = timeValue / zoomX;

    const normalizedValue = Math.max(
      0,
      Math.min(maxTime, timeValueWithOutZoomX)
    );

    store.handleSeek(normalizedValue);
  };

  const cursorPosition = useMemo(() => {
    if (canvasWidth <= 0 || maxTime <= 0) return 0;

    const positionWithoutZoom = (currentTimeInMs / maxTime) * canvasWidth;
    const zoomX = zoomPercent / 100;
    return positionWithoutZoom * zoomX;
  }, [currentTimeInMs, maxTime, canvasWidth, zoomPercent]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: `${height}px` }}
      onMouseDown={() => {
        isMouseDownRef.current = true;
      }}
      onMouseUp={(e) => {
        onMouseClickOrMoveToNewPosition(e);
        isMouseDownRef.current = false;
      }}
      onMouseLeave={() => {
        isMouseDownRef.current = false;
      }}
      onMouseMove={onMouseClickOrMoveToNewPosition}
    >
      <div
        style={{
          width: `${canvasWidth * (zoomPercent / 100)}px`,
          height: `${height}px`,
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 bg-white"
          style={{ display: "block" }}
        />

        <div
          className="absolute top-0 w-[4px] bg-black rounded-full pointer-events-none"
          style={{
            height: `${height}px`,
            left: `${cursorPosition - 2}px`,
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
};
