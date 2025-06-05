"use client";
import React, { useMemo } from "react";
import { EditorElement } from "@/types";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import DragableView from "./DragableView";

/**
 * What I need to do I need a way to calculate total width
 *
 * which can be calculated by using maxTime on TimeFrame * zoom
 */

export const TimeFrameView = observer(
  ({ element }: { element: EditorElement }) => {
    const store = React.useContext(StoreContext);

    const { zoomPercent, maxTime, selectedElement } = store;

    const mediaElementWidth = useMemo(() => {
      // intiial wdith percentage
      const widthPercentage =
        ((element.timeFrame.end - element.timeFrame.start) / maxTime) * 100;

      const zoomX = zoomPercent / 100;

      return widthPercentage * zoomX;
    }, [element.timeFrame.end, element.timeFrame.start, maxTime, zoomPercent]);

    const disabled = element.type === "audio";
    const isSelected = selectedElement?.id === element.id;
    const bgColorOnSelected = isSelected ? "bg-slate-800" : "bg-slate-600";
    const disabledCursor = disabled ? "cursor-no-drop" : "cursor-ew-resize";

    return (
      <div
        onClick={() => {
          store.setSelectedElement(element);
        }}
        key={element.id}
        className={`relative h-[50px] width-full my-2 ${
          isSelected ? "border-2 border-indigo-600 bg-slate-200" : ""
        }`}
      >
        <DragableView
          className="z-10"
          value={element.timeFrame.start}
          total={maxTime}
          disabled={disabled}
          onChange={(value) => {
            // Check if video can be extended in left
            let changeInCrop = value - element.timeFrame.start;
            const cropFromTheLeft = element.crop?.fromStart!;

            if (changeInCrop < 0 && cropFromTheLeft === 0)
              return {
                stopDrag: true,
              };
            // If going left but video is already complete
            else if (changeInCrop < 0 && cropFromTheLeft > 0) {
              // If going left and there is some crop value
              value = Math.max(
                value,
                element.timeFrame.start! - cropFromTheLeft
              );
            }
            store.updateEditorElementCrop(element, {
              fromStart: changeInCrop, // From Start New Value will be greater than Current Time Frame Start
            });
            store.updateEditorElementTimeFrame(element, {
              start: value,
            });

            return {
              stopDrag: false,
            };
          }}
        >
          <div
            className={`bg-white border-2 border-blue-400 w-[10px] h-[10px] mt-[calc(25px/2)] translate-y-[-50%] transform translate-x-[-50%] ${disabledCursor}`}
          ></div>
        </DragableView>
        <DragableView
          className={disabled ? "cursor-no-drop" : "cursor-col-resize"}
          value={element.timeFrame.start}
          disabled={disabled}
          style={{
            width: `${mediaElementWidth}%`,
          }}
          total={maxTime}
          onChange={(value) => {
            const { start, end } = element.timeFrame;
            if (value < 0)
              return {
                stopDrag: true,
              };

            store.updateEditorElementTimeFrame(element, {
              start: value,
              end: value + (end - start),
            });

            return {
              stopDrag: false,
            };
          }}
        >
          <div
            className={`${bgColorOnSelected} h-full w-full text-white text-center text-xs min-w-[0px] px-2 leading-[25px] select-none`}
          >
            {element.name}
          </div>
        </DragableView>
        <DragableView
          className="z-10"
          disabled={disabled}
          value={element.timeFrame.end}
          total={maxTime}
          onChange={(new_end) => {
            const croppedTotalDuration =
              element.timeFrame.totalDurationInMs! - element.crop?.fromStart!;

            const maxDurationOnTimeline =
              element.timeFrame.start + croppedTotalDuration;

            if (new_end - element.timeFrame.start > croppedTotalDuration)
              new_end = maxDurationOnTimeline;

            store.updateEditorElementCrop(element, {
              fromEnd: element.timeFrame.end - new_end, // From end timeFrame Will be greater than crop value
            });

            store.updateEditorElementTimeFrame(element, {
              end: new_end,
            });

            return {
              stopDrag: false,
            };
          }}
        >
          <div
            className={`bg-white border-2 border-blue-400 w-[10px] h-[10px] mt-[calc(25px/2)] translate-y-[-50%] transform translate-x-[-50%] ${disabledCursor}`}
          ></div>
        </DragableView>
      </div>
    );
  }
);
