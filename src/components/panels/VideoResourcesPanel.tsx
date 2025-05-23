"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { VideoResource } from "../entity/VideoResource";
import { UploadButton } from "../shared/UploadButton";

export const VideoResourcesPanel = observer(() => {
  const store = React.useContext(StoreContext);

  // const saveFileToTheServer = async (file: File) => {
  //   const form_data = new FormData();
  //   form_data.append("file", file);
  //   const headers = new Headers();
  //   headers.append("Content-Type", "multipart/form-data");
  //   const res = await fetch("/api/video/store", {
  //     method: "POST",
  //     body: form_data,
  //     headers: headers,
  //   });

  //   const json = await res.json();

  //   console.log(json, "Json");
  //   return json;
  // };

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;
  //   // saveFileToTheServer(file);
  //   store.addVideoResource(URL.createObjectURL(file));
  // };

  const getFileDirectlyFromThePublic = () => {
    store.addVideoResource("/file_example_MP4_480_1_5MG.mp4");
  };

  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Videos
      </div>
      {store.videos.map((video, index) => {
        return <VideoResource key={video} video={video} index={index} />;
      })}
      {/* <UploadButton
        accept="video/mp4,video/x-m4v,video/*"
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-center mx-2 py-2 px-4 rounded cursor-pointer"
        onChange={handleFileChange}
      /> */}
      <button
        onClick={getFileDirectlyFromThePublic}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-center mx-2 py-2 px-4 rounded cursor-pointer"
      >
        Get Video
      </button>
    </>
  );
});
