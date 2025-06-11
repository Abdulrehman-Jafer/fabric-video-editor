'use client';
import React, { useMemo } from 'react';
import { EditorElement } from '@/types';
import { StoreContext } from '@/store';
import { observer } from 'mobx-react';
import DragableView from './DragableView';

export const TimeFrameView = observer(({ element }: { element: EditorElement }) => {
    const store = React.useContext(StoreContext);

    const { zoomPercent, maxTime, selectedElement } = store;

    const mediaElementWidth = useMemo(() => {
        // intiial wdith percentage
        const widthPercentage = ((element.timeFrame.end - element.timeFrame.start) / maxTime) * 100;

        return widthPercentage;
    }, [
        element.timeFrame.end,
        element.timeFrame.start,
        element.crop?.fromStart,
        element.crop?.fromEnd,
        maxTime,
        zoomPercent,
    ]);

    const disabled = element.type === 'audio';
    const isSelected = selectedElement?.id === element.id;
    const bgColorOnSelected = isSelected ? 'bg-slate-800' : 'bg-slate-600';
    const disabledCursor = disabled ? 'cursor-no-drop' : 'cursor-ew-resize';

    function fromLeft(new_start: number) {
        // Check if video can be extended in left
        let changeInCrop = new_start - element.timeFrame.start;
        const cropFromTheLeft = element.crop?.fromStart!;

        if (changeInCrop < 0 && cropFromTheLeft === 0)
            return {
                stopDrag: true,
            };
        // If going left but video is already complete
        else if (changeInCrop < 0 && cropFromTheLeft > 0) {
            // If going left and there is some crop value
            new_start = Math.max(new_start, element.timeFrame.start! - cropFromTheLeft);
        }
        store.updateEditorElementCrop(element, {
            fromStart: changeInCrop, // From Start New Value will be greater than Current Time Frame Start
        });
        store.updateEditorElementTimeFrame(element, {
            start: new_start,
        });

        return {
            stopDrag: false,
        };
    }

    function fromRight(new_end: number) {
        const croppedTotalDuration = element.timeFrame.totalDurationInMs! - element.crop?.fromStart!;

        const maxDurationOnTimeline = element.timeFrame.start + croppedTotalDuration;

        if (new_end - element.timeFrame.start > croppedTotalDuration) new_end = maxDurationOnTimeline;

        store.updateEditorElementCrop(element, {
            fromEnd: element.timeFrame.end - new_end, // From end timeFrame Will be greater than crop value
        });

        store.updateEditorElementTimeFrame(element, {
            end: new_end,
        });

        return {
            stopDrag: false,
        };
    }

    function handleVideoDrag(new_start: number) {
        const { start, end } = element.timeFrame;
        store.setPlaying(false);
        if (new_start < 0)
            return {
                stopDrag: true,
            };

        const videoDuration = end - start;

        store.updateEditorElementTimeFrame(element, {
            start: new_start,
            end: new_start + videoDuration,
        });

        return {
            stopDrag: false,
        };
    }

    return (
        <div
            onClick={() => {
                store.setSelectedElement(element);
            }}
            key={element.id}
            className={`relative h-[50px] w-[${100 * (zoomPercent / 100)}%] my-2 ${
                isSelected ? 'border-2 border-indigo-600 bg-slate-200' : ''
            }`}
        >
            <DragableView
                className="z-10"
                value={element.timeFrame.start}
                total={maxTime}
                disabled={disabled}
                onChange={fromLeft}
            >
                <div
                    className={`bg-white border-2 border-blue-400 w-[10px] h-[10px] mt-[calc(25px/2)] translate-y-[-50%] transform translate-x-[-50%] ${disabledCursor}`}
                ></div>
            </DragableView>
            <DragableView
                className={disabled ? 'cursor-no-drop' : 'cursor-col-resize'}
                value={element.timeFrame.start}
                disabled={disabled}
                style={{
                    width: `${mediaElementWidth}%`,
                }}
                total={maxTime}
                onChange={handleVideoDrag}
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
                onChange={fromRight}
            >
                <div
                    className={`bg-white border-2 border-blue-400 w-[10px] h-[10px] mt-[calc(25px/2)] translate-y-[-50%] transform translate-x-[-50%] ${disabledCursor}`}
                ></div>
            </DragableView>
        </div>
    );
});
