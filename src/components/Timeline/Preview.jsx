import React, { useState, useMemo, useEffect, useRef } from "react";
import { Stage, Rect, Layer, Image } from "react-konva";
import useImage from "use-image";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const Preview = ({ layout, onClose, divisionsMedia = {} }) => {
  const layoutWidth = 400;
  const layoutHeight = 300;
  const layoutRef = useRef(null);
  const layerRef = useRef(null);

  // in division pause media looping
  const [shouldStopCycling, setShouldStopCycling] = useState(false);

  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  // Store recorded chunks in a ref to be accessed later
  const recordedChunksRef = useRef([]);

  const calculateDivisionDuration = (mediaItems) => {
    return mediaItems.reduce((total, item) => total + item.appearanceTime, 0);
  };

  // Function to calculate the total duration of the layout based on the longest division start
  const calculateTotalDuration = () => {
    if (!divisionsMedia || Object.keys(divisionsMedia).length === 0) {
      return 0; // Return 0 if divisionsMedia is empty
    }

    // Calculate the longest time for each division's media items
    const maxDivisionDuration = Object.values(divisionsMedia).reduce(
      (maxDuration, mediaItems) => {
        if (!Array.isArray(mediaItems)) return maxDuration;
        // Calculate the total appearanceTime for the division's media items
        const divisionDuration = mediaItems.reduce(
          (total, item) => total + item.appearanceTime,
          0
        );
        return Math.max(maxDuration, divisionDuration); // Keep track of the maximum division duration
      },
      0
    );
    // console.log("maxDivisionDuration : ", maxDivisionDuration);

    return maxDivisionDuration;
  };
  // Function to calculate the total duration of the layout based on the longest division end

  const totalDuration = calculateTotalDuration(); // Total duration in seconds
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    if (totalDuration === 0) return;

    const intervalId = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000; // Convert to seconds
      const progressPercentage = Math.min(
        (elapsedTime / totalDuration) * 100,
        100
      );
      setProgress(progressPercentage);

      // Stop media cycling and video when progress reaches 100%
      if (progressPercentage >= 100) {
        clearInterval(intervalId);
        setShouldStopCycling(true); // Stop cycling
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [startTime, totalDuration]);

  // Custom hook to manage media cycling start

  const useMediaCycler = (
    mediaItems,
    layerRef,
    divisionShouldStopCycling, // Make this specific for each division
    divisionTotalDuration
  ) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [mediaStartTime, setMediaStartTime] = useState(Date.now());
    const [isCycling, setIsCycling] = useState(true);

    const currentMedia = mediaItems[currentMediaIndex];
    const videoElement = useVideoElement(
      currentMedia?.mediaType === "video" ? currentMedia.mediaSrc : null,
      layerRef
    );

    useEffect(() => {
      if (
        mediaItems.length === 0 ||
        !layerRef.current ||
        divisionShouldStopCycling
      ) {
        setIsCycling(false); // Stop cycling when this specific division should stop
        return;
      }

      const mediaDuration = currentMedia?.appearanceTime * 1000 || 3000;

      if (
        currentMedia?.mediaType === "video" &&
        videoElement instanceof HTMLVideoElement
      ) {
        videoElement.play();
        const anim = new Konva.Animation(() => {
          layerRef.current.batchDraw();
        }, layerRef.current);
        anim.start();
      }

      const startTime = Date.now();
      const intervalId = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000;

        if (elapsedTime >= divisionTotalDuration) {
          setIsCycling(false);
          clearInterval(intervalId);
          return;
        }

        const mediaElapsedTime = Date.now() - mediaStartTime;
        if (mediaElapsedTime >= mediaDuration) {
          setCurrentMediaIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % mediaItems.length;
            setMediaStartTime(Date.now());

            if (
              currentMedia?.mediaType === "video" &&
              videoElement instanceof HTMLVideoElement
            ) {
              videoElement.pause();
              videoElement.currentTime = 0;
            }

            if (
              mediaItems[nextIndex]?.mediaType === "video" &&
              videoElement instanceof HTMLVideoElement
            ) {
              videoElement.play();
            }

            return nextIndex;
          });
        }
      }, 100);

      return () => {
        clearInterval(intervalId);
        if (videoElement instanceof HTMLVideoElement) {
          videoElement.pause();
        }
      };
    }, [
      mediaItems,
      currentMediaIndex,
      mediaStartTime,
      videoElement,
      currentMedia,
      layerRef,
      divisionShouldStopCycling, // Use this for the specific division
      divisionTotalDuration,
    ]);

    return { currentMediaIndex, isCycling, videoElement };
  };

  // Custom hook to manage media cycling end

  // Use effect to start recording when component mounts start
  useEffect(() => {
    if (totalDuration === 0) return;

    // Reset progress to 0 before starting
    setProgress(0);
    setStartTime(Date.now()); // Reset start time

    const canvas = layoutRef.current.querySelector("canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Set background color to white
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const stream = canvas.captureStream();
    const mediaRecorder = new MediaRecorder(stream);
    recordedChunksRef.current = []; // Reset chunks

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
        console.log("WebM chunk recorded", event.data); // Add this to verify chunks are recorded
      }
    };

    mediaRecorder.start();

    // Stop recording after the total duration
    const recordingDuration = totalDuration * 1000; // Convert to milliseconds
    setTimeout(() => {
      mediaRecorder.stop();
    }, recordingDuration);

    // console.log("totalDuration in recording useffect : ", totalDuration);
    // Progress bar logic
    const intervalId = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000; // Convert to seconds
      const progressPercentage = Math.min(
        (elapsedTime / totalDuration) * 100,
        100
      );
      setProgress(progressPercentage);

      // console.log("intervalId in useffect recording : ", intervalId);
      // console.log("progressPercentage in liast effect : ", progressPercentage);
      if (progressPercentage >= 100) {
        clearInterval(intervalId);
      }
    }, 100);

    return () => {
      clearInterval(intervalId);
      mediaRecorder.stop(); // Stop recording on component unmount
    };
  }, [totalDuration]);
  // Use effect to start recording when component mounts end

  // Update the handleDownload function to download recorded video start

  const ffmpegRef = useRef(new FFmpeg());

  const handleDownload = async () => {
    const ffmpeg = ffmpegRef.current;

    console.log("Starting download process...");

    // Check if FFmpeg is already loaded, otherwise load it
    if (!ffmpegLoaded) {
      const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
      console.log("Loading FFmpeg (multi-threaded)...");

      const retryLoadFFmpeg = async (retries, delay) => {
        for (let i = 0; i < retries; i++) {
          try {
            ffmpeg.on("log", ({ message }) => {
              console.log(`[FFmpeg] ${message}`); // Log FFmpeg messages in real-time
            });

            // Load FFmpeg with multi-threaded core
            console.log("Attempting to load FFmpeg...");
            await ffmpeg.load({
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

            setFfmpegLoaded(true);
            console.log("FFmpeg loaded successfully.");
            return;
          } catch (error) {
            console.error(`FFmpeg load attempt ${i + 1} failed:`, error);
            if (i < retries - 1) {
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        }
        alert("Failed to load FFmpeg after several attempts.");
        return;
      };

      await retryLoadFFmpeg(3, 5000);
      if (!ffmpegLoaded) {
        return;
      }
    }

    // Check if any recorded chunks are available
    if (recordedChunksRef.current.length === 0) {
      alert("No recording available to download!");
      return;
    }

    try {
      // Log before creating WebM Blob
      console.log("Creating WebM Blob from recorded chunks...");
      const webmBlob = new Blob(recordedChunksRef.current, {
        type: "video/webm",
      });
      console.log(`WebM Blob created, size: ${webmBlob.size} bytes`);

      if (webmBlob.size === 0) {
        throw new Error("Recorded WebM Blob is empty. No video was captured.");
      }

      // Log before writing WebM data to FFmpeg's virtual file system
      console.log("Writing WebM file to FFmpeg...");
      const webmData = await fetchFile(webmBlob);
      await ffmpeg.writeFile("input.webm", webmData);
      console.log("WebM file written to FFmpeg virtual filesystem.");

      // Log before transcoding
      console.log("Starting FFmpeg multi-threaded conversion to MP4...");
      const startTime = Date.now(); // Track start time for performance
      await ffmpeg.exec([
        "-i",
        "input.webm", // Input file
        "-c:v",
        "libx264", // Video codec
        "-crf",
        "28", // Quality level
        "-preset",
        "fast", // Preset for faster conversion
        "-threads",
        "4", // Multi-threading enabled
        "output.mp4", // Output file
      ]);
      const conversionTime = Date.now() - startTime;
      console.log(
        `FFmpeg conversion completed in ${conversionTime / 1000} seconds.`
      );

      // Log before reading the resulting MP4 file
      console.log("Reading MP4 output from FFmpeg...");
      const mp4Data = ffmpeg.readFile("output.mp4");

      if (!mp4Data || mp4Data.length === 0) {
        throw new Error("MP4 file is empty. FFmpeg conversion failed.");
      }
      console.log("MP4 file read successfully from FFmpeg virtual filesystem.");

      // Create MP4 Blob and download link
      const mp4Blob = new Blob([mp4Data.buffer], { type: "video/mp4" });
      const mp4Url = URL.createObjectURL(mp4Blob);

      // Log before triggering download
      console.log("MP4 Blob created, initiating download...");
      const aMp4 = document.createElement("a");
      aMp4.href = mp4Url;
      aMp4.download = "canvas-recording.mp4";
      document.body.appendChild(aMp4);
      aMp4.click();
      document.body.removeChild(aMp4);

      console.log("MP4 download successfully triggered.");
    } catch (error) {
      console.error("Error during FFmpeg conversion:", error);
      alert("An error occurred during the conversion process.");
    }
  };

  // Update the handleDownload function to download recorded video end

  // to render video in canva start

  // Comment out FFmpeg conversion temporarily for testing WebM download

  const useVideoElement = (videoSrc, layerRef) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(document.createElement("canvas")); // Create a canvas to draw video
    const [imageElement, setImageElement] = useState(null); // The canvas that Konva will use

    useEffect(() => {
      if (!videoSrc) {
        console.log("No videoSrc provided");
        return; // Return early if no video source
      }

      const videoElement = document.createElement("video"); // Create a video element
      videoElement.src = videoSrc;
      videoElement.muted = true; // Mute the video
      videoElement.crossOrigin = "Anonymous"; // Handle cross-origin video

      videoElement.addEventListener("loadeddata", () => {
        const canvas = canvasRef.current;
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        const ctx = canvas.getContext("2d");

        const updateCanvas = () => {
          if (!videoElement.paused && !videoElement.ended) {
            // Only update if the video is playing
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height); // Draw video frame to canvas
            setImageElement(canvas); // Update the canvas to Konva
            layerRef.current?.batchDraw(); // Ensure Konva layer updates
          }
          requestAnimationFrame(updateCanvas); // Continuously update the canvas
        };

        videoElement.play(); // Start playing the video
        updateCanvas(); // Start updating the canvas with video frames

        console.log("Video is playing with src:", videoSrc);
      });

      videoRef.current = videoElement;

      return () => {
        if (videoRef.current) {
          videoRef.current.pause(); // Stop the video when component is unmounted
        }
      };
    }, [videoSrc]);

    return imageElement; // Return the canvas element for use in Konva
  };
  // to render video in canva end

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-5 w-[500px] h-[450px] rounded">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Preview layout: {layout.name}</h1>
          <button
            onClick={onClose}
            className="bg-red-500 px-3 py-1 hover:bg-red-600 cursor-pointer rounded-md text-white"
          >
            Close
          </button>
        </div>

        <div
          ref={layoutRef}
          className="flex items-center justify-center mb-2 flex-col gap-1"
        >
          <Stage
            width={layoutWidth}
            height={layoutHeight}
            style={{ border: "1px solid black", backgroundColor: "white" }} // Add background color
          >
            <Layer ref={layerRef}>
              <Rect
                x={0}
                y={0}
                width={layoutWidth}
                height={layoutHeight}
                fill="white" // This will ensure the background is white
              />

              {layout?.divisions?.map((d, index) => {
                const mediaItems = divisionsMedia[index] || [];
                const divisionTotalDuration =
                  calculateDivisionDuration(mediaItems);

                const [
                  divisionShouldStopCycling,
                  setDivisionShouldStopCycling,
                ] = useState(false);

                useEffect(() => {
                  const divisionInterval = setInterval(() => {
                    const elapsedDivisionTime = (Date.now() - startTime) / 1000;

                    if (elapsedDivisionTime >= divisionTotalDuration) {
                      setDivisionShouldStopCycling(true);
                      clearInterval(divisionInterval);
                    }
                  }, 100);

                  return () => clearInterval(divisionInterval);
                }, [startTime, divisionTotalDuration]);

                const { currentMediaIndex, isCycling, videoElement } =
                  useMediaCycler(
                    mediaItems,
                    layerRef,
                    divisionShouldStopCycling, // Pass division-specific stop flag
                    divisionTotalDuration
                  );

                const currentMedia = mediaItems[currentMediaIndex];
                const [image] = useImage(currentMedia?.mediaSrc, "anonymous");

                return (
                  <React.Fragment key={index}>
                    {isCycling && (
                      <Image
                        image={
                          currentMedia?.mediaType === "video"
                            ? videoElement
                            : image
                        }
                        crossOrigin="anonymous"
                        x={d?.x}
                        y={d?.y}
                        width={d?.width}
                        height={d?.height}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </Layer>
          </Stage>

          {/* Progress bar */}
          <div
            className="bg-gray-300 h-2 rounded mb-4"
            style={{ width: "88%" }}
          >
            <div
              className="bg-green-500 h-full rounded"
              style={{ width: `${progress}%` }}
            ></div>
            <p className="text-center text-xs">{Math.round(progress)}%</p>
          </div>
        </div>

        {/* Download button */}
        <button
          className="px-2 py-1 bg-blue-500 hover:bg-blue-700 text-white cursor-pointer rounded mb-2"
          onClick={handleDownload}
        >
          Download as WebM
        </button>
        {/* <button
          className="px-2 py-1 bg-green-500 hover:bg-green-700 text-white cursor-pointer rounded"
          onClick={handleDownloadMP4}
        >
          {loading ? "Loading..." : "Download as MP4"}
        </button> */}
      </div>
    </div>
  );
};

export default Preview;
