"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { VideoResourceV2 } from "@/components/entity/VideoResourceV2";

export const VideoResourcesPanelV2 = observer(() => {
  const store = React.useContext(StoreContext);

  const getFileDirectlyFromThePublic = () => {
    store.addVideoResource("/file_example_MP4_480_1_5MG___2.mp4");
  };

  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Videos
      </div>
      {store.videos.map((video, index) => {
        return <VideoResourceV2 key={video} video={video} index={index} />;
      })}
      <button
        onClick={getFileDirectlyFromThePublic}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-center mx-2 py-2 px-4 rounded cursor-pointer"
      >
        Get Video
      </button>
    </>
  );
});
