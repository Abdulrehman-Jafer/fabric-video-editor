"use client";
import { StoreContext } from "@/store";
import { useContext, useEffect, useRef, useState } from "react";

export type ScaleRangeInputProps = {
  onChange: (value: number) => void;
  height: number;
  backgroundColor: string;
};

export const ScaleRangeInput = ({
  onChange,
  height,
  backgroundColor,
}: ScaleRangeInputProps) => {
  const { markings, currentTimeInMs, maxTime, elementWidth } =
    useContext(StoreContext);

  const ref = useRef<HTMLCanvasElement>(null);
  const refIsMouseDown = useRef(false);
  const [canvasSize, setCanvasSize] = useState({
    width: 50,
    height: height,
  });

  useEffect(() => {
    // update canvas size based on container size
    const handleResize = () => {
      if (ref.current) {
        setCanvasSize({
          width: ref.current.parentElement?.clientWidth ?? 50,
          height: ref.current.parentElement?.clientHeight ?? height,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (ref.current) {
      const canvas = ref.current;
      // canvas.width = canvasSize.width;
      // canvas.height = canvasSize.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        markings.forEach((marking) => {
          ctx.strokeStyle = marking.color;
          ctx.lineWidth = marking.width;
          ctx.beginPath();
          for (let i = 0; i < maxTime; i += marking.interval) {
            ctx.moveTo((i / maxTime) * canvas.width, 0);
            ctx.lineTo((i / maxTime) * canvas.width, marking.size);
          }
          ctx.stroke();
        });
      }
    }
  }, [markings, backgroundColor, maxTime, canvasSize]);

  const updateFromMouseEvent = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const value = (x / canvasSize.width) * maxTime;
      const normalizedValue = Math.min(maxTime, Math.max(0, value));
      onChange(normalizedValue);
    }
  };

  const canvasWidth =
    ref?.current?.parentElement?.clientWidth! * (elementWidth / 100);

  return (
    <div
      className="relative w-full"
      onMouseDown={(e) => {
        refIsMouseDown.current = true;
        updateFromMouseEvent(e);
      }}
      onMouseUp={() => {
        refIsMouseDown.current = false;
      }}
      onMouseMove={(e) => {
        if (refIsMouseDown.current) {
          updateFromMouseEvent(e);
        }
      }}
      onMouseLeave={(e) => {
        refIsMouseDown.current = false;
      }}
    >
      <canvas height={height} width={canvasWidth} ref={ref}></canvas>
      <div
        className="rounded-full bg-black w-[4px] absolute top-0 left-0"
        style={{
          height: `${height}px`,
          transform: `translateX(${
            (currentTimeInMs / maxTime) * canvasWidth
          }px) translateX(-2px)`,
        }}
      ></div>
    </div>
  );
};
