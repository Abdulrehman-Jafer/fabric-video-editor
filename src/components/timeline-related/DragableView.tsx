import React, { useEffect, useRef } from "react";

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
  }>({
    div: null,
    isDragging: false,
    initialMouseX: 0,
  });
  const { current: data } = ref;

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseUp, handleMouseMove]);

  function handleMouseDown(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    if (!data.div) return;
    if (props.disabled) return;
    data.isDragging = true;
    data.initialMouseX = event.clientX;
  }

  function handleMouseMove(event: MouseEvent) {
    if (!data.div) return;
    if (!data.isDragging) return;
    const newClientX = calculateNewValue(event.clientX);
    const { stopDrag } = props.onChange(newClientX);
    if (stopDrag) return;

    data.div.style.left = `${(newClientX / props.total) * 100}%`;
    event.stopPropagation();
    event.preventDefault();
  }

  function handleMouseUp(event: MouseEvent) {
    if (!data.div) return;
    if (!data.isDragging) return;
    data.isDragging = false;
    props.onChange(calculateNewValue(event.clientX));
    event.stopPropagation();
    event.preventDefault();
  }

  function calculateNewValue(mouseX: number): number {
    if (!data.div) return 0;
    const deltaX = mouseX - data.initialMouseX;
    const deltaValue =
      (deltaX / data.div.parentElement!.clientWidth) * props.total;
    return props.value + deltaValue;
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
