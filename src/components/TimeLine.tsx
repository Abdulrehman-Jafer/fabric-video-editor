'use client';
import React, { useEffect, useMemo } from 'react';
import { SeekPlayer } from './timeline-related/SeekPlayer';
import { StoreContext } from '@/store';
import { observer } from 'mobx-react';
import { TimeFrameView } from './timeline-related/TimeFrameView';

export const TimeLine = observer(() => {
    const { currentTimeInMs, maxTime, zoomPercent, editorElements } = React.useContext(StoreContext);

    const cursorPostionFromLeft = useMemo(() => {
        const positionPercent = (currentTimeInMs / maxTime) * 100;

        const zoomX = zoomPercent / 100;

        return positionPercent * zoomX;
    }, [currentTimeInMs, maxTime, zoomPercent]);

    return (
        <div className="flex flex-col">
            <SeekPlayer />
            <div className="flex-1 relative">
                {editorElements.map((element) => {
                    return <TimeFrameView key={element.id} element={element} />;
                })}
                <div
                    className="w-[2px] bg-red-400 absolute top-0 bottom-0 z-20"
                    style={{
                        left: `${cursorPostionFromLeft}%`,
                    }}
                ></div>
            </div>
        </div>
    );
});
