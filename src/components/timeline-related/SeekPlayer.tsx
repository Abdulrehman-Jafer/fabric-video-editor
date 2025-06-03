"use client";

import { StoreContext } from "@/store";
import { formatTimeToMinSecMili } from "@/utils";
import { observer } from "mobx-react-lite";
import { useContext } from "react";
import { MdPlayArrow, MdPause } from "react-icons/md";
import { ScaleRangeInput } from "./ScaleRangeInput";

export type SeekPlayerProps = {};

export const SeekPlayer = observer((_props: SeekPlayerProps) => {
  const store = useContext(StoreContext);
  const Icon = store.playing ? MdPause : MdPlayArrow;
  const formattedTime = formatTimeToMinSecMili(store.currentTimeInMs);
  const formattedMaxTime = formatTimeToMinSecMili(store.maxTime);

  return (
    <div className="seek-player flex flex-col">
      <section className="w-full flex justify-between">
        <div className="flex flex-row items-center px-2">
          <button
            className="w-[80px] rounded  px-2 py-2"
            onClick={() => {
              store.setPlaying(!store.playing);
            }}
          >
            <Icon size="40"></Icon>
          </button>
          <span className="font-mono">{formattedTime}</span>
          <div className="w-[1px] h-[25px] bg-slate-300 mx-[10px]"></div>
          <span className="font-mono">{formattedMaxTime}</span>
        </div>

        <div className="flex gap-2">
          <button
            className="bg-black text-white rounded-full w-[50px] h-[50px] hover:bg-white hover:text-black"
            onClick={() => {
              store.setMarkings(true);
            }}
          >
            +
          </button>
          <button
            className="bg-black text-white rounded-full w-[50px] h-[50px] hover:bg-white hover:text-black"
            onClick={() => {
              store.setMarkings(false);
            }}
          >
            -
          </button>
        </div>
      </section>

      <ScaleRangeInput
        onChange={(value) => {
          store.handleSeek(value);
        }}
        height={30}
        backgroundColor="white"
      />
    </div>
  );
});
