import React, { useEffect, useRef, useCallback } from "react";

function DragableView(props: {
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  value: number;
  total: number;
  onChange: (value: number) => { stopDrag: boolean };
}) {
  const ref = useRef<{
    div: HTMLDivElement | null;
    isDragging: boolean;
    initialMouseX: number;
    initialValue: number;
  }>({
    div: null,
    isDragging: false,
    initialMouseX: 0,
    initialValue: 0,
  });

  const { current: data } = ref;

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!data.div || !data.isDragging) return;

      const deltaX = event.clientX - data.initialMouseX;
      const deltaValue =
        (deltaX / data.div.parentElement!.clientWidth) * props.total;
      const newValue = data.initialValue + deltaValue;

      const { stopDrag } = props.onChange(newValue);
      if (stopDrag) {
        data.isDragging = false;
        return;
      }

      event.stopPropagation();
      event.preventDefault();
    },
    [props.total, props.onChange]
  );

  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (!data.isDragging) return;

    data.isDragging = false;
    event.stopPropagation();
    event.preventDefault();
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  function handleMouseDown(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    if (!data.div || props.disabled) return;

    data.isDragging = true;
    data.initialMouseX = event.clientX;
    data.initialValue = props.value; // Store the initial value when drag starts

    event.stopPropagation();
    event.preventDefault();
  }

  return (
    <div
      ref={(r) => {
        data.div = r;
      }}
      className={`absolute height-100 ${props.className}`}
      style={{
        left: (props.value / props.total) * 100 + "%",
        top: 0,
        bottom: 0,
        ...props.style,
      }}
      onMouseDown={handleMouseDown}
    >
      {props.children}
    </div>
  );
}

export default DragableView;
