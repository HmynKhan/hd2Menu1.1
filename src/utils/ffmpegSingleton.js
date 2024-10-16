import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

let ffmpegInstance = null;

export const getFFmpegInstance = async () => {
  if (!ffmpegInstance) {
    // First load, create a new instance
    console.log("Loading FFmpeg...");
    ffmpegInstance = new FFmpeg({ log: true });

    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
    try {
      await ffmpegInstance.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
        workerURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.worker.js`,
          "text/javascript"
        ),
      });
      console.log("FFmpeg loaded globally");
    } catch (error) {
      console.error("Error loading FFmpeg:", error);
    }
  }
  return ffmpegInstance;
};
