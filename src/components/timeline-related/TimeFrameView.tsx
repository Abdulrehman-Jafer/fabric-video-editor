"use client";
import React from "react";
import { EditorElement } from "@/types";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import DragableView from "./DragableView";

export const TimeFrameView = observer((props: { element: EditorElement }) => {
  const store = React.useContext(StoreContext);
  const { element } = props;
  const disabled = element.type === "audio";
  const isSelected = store.selectedElement?.id === element.id;
  const bgColorOnSelected = isSelected ? "bg-slate-800" : "bg-slate-600";
  const disabledCursor = disabled ? "cursor-no-drop" : "cursor-ew-resize";

  return (
    <div
      onClick={() => {
        store.setSelectedElement(element);
      }}
      key={element.id}
      className={`relative width-full h-[25px] my-2 ${
        isSelected ? "border-2 border-indigo-600 bg-slate-200" : ""
      }`}
    >
      <DragableView
        className="z-10"
        value={element.timeFrame.start}
        total={store.maxTime}
        disabled={disabled}
        onChange={(value) => {
          // Check if video can be extended in left
          let changeInCrop = value - element.timeFrame.start;
          const cropFromTheLeft = element.crop?.fromStart!;

          if (changeInCrop < 0 && cropFromTheLeft === 0)
            return; // If going left but video is already complete
          else if (changeInCrop < 0 && cropFromTheLeft > 0) {
            // If going left and there is some crop value
            value = Math.max(value, element.timeFrame.start! - cropFromTheLeft);
          }
          store.updateEditorElementCrop(element, {
            fromStart: changeInCrop, // From Start New Value will be greater than Current Time Frame Start
          });
          store.updateEditorElementTimeFrame(element, {
            start: value,
          });
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
          width: `${
            ((element.timeFrame.end - element.timeFrame.start) /
              store.maxTime) *
            100
          }%`,
        }}
        total={store.maxTime}
        onChange={(value) => {
          const { start, end } = element.timeFrame;
          store.updateEditorElementTimeFrame(element, {
            start: value,
            end: value + (end - start),
          });
        }}
      >
        <div
          className={`${bgColorOnSelected} h-full w-full text-white text-xs min-w-[0px] px-2 leading-[25px]`}
        >
          {element.name}
        </div>
      </DragableView>
      <DragableView
        className="z-10"
        disabled={disabled}
        value={element.timeFrame.end}
        total={store.maxTime}
        onChange={(value) => {
          const elementTotalDurationInMsMinseCropped =
            element.timeFrame.totalDurationInMs! - element.crop?.fromStart!;

          if (
            value - element.timeFrame.start >
            elementTotalDurationInMsMinseCropped
          )
            value =
              element.timeFrame.start + elementTotalDurationInMsMinseCropped;

          store.updateEditorElementCrop(element, {
            fromEnd: element.timeFrame.end - value, // From end timeFrame Will be greater than crop value
          });

          store.updateEditorElementTimeFrame(element, {
            end: value,
          });
        }}
      >
        <div
          className={`bg-white border-2 border-blue-400 w-[10px] h-[10px] mt-[calc(25px/2)] translate-y-[-50%] transform translate-x-[-50%] ${disabledCursor}`}
        ></div>
      </DragableView>
    </div>
  );
});
