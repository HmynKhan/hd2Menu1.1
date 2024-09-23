import React, { useState, useMemo, useEffect, useRef } from "react";
import { Stage, Rect, Layer, Image } from "react-konva";
import useImage from "use-image";
// import { FFmpeg } from "@ffmpeg/ffmpeg";
// import { fetchFile, toBlobURL } from "@ffmpeg/util";

const Preview = ({ layout, onClose, divisionsMedia = {} }) => {
  const layoutWidth = 400;
  const layoutHeight = 300;
  const layoutRef = useRef(null);
  const layerRef = useRef(null);

  // const [ffmpegLoaded, setFfmpegLoaded] = useState(false); // Add this line

  // Store recorded chunks in a ref to be accessed later
  const recordedChunksRef = useRef([]);

  // Function to calculate the total duration of the layout based on the longest division start
  const calculateTotalDuration = () => {
    if (!divisionsMedia || Object.keys(divisionsMedia).length === 0) {
      return 0; // Return 0 if divisionsMedia is empty
    }

    // Calculate the maximum time for any division's media items
    const maxDivisionDuration = Object.values(divisionsMedia).reduce(
      (maxDuration, mediaItems) => {
        if (!Array.isArray(mediaItems)) return maxDuration;
        // Sum the total appearanceTime for each division's media items
        const divisionDuration = mediaItems.reduce(
          (total, item) => total + item.appearanceTime,
          0
        );
        // Return the maximum duration between divisions
        return Math.max(maxDuration, divisionDuration);
      },
      0
    );

    console.log("maxDivisionDuration in total(): ", maxDivisionDuration);
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

      // Stop the interval once progress reaches 100%
      if (progressPercentage >= 100) {
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [startTime, totalDuration]);

  // Custom hook to manage media cycling start
  const useMediaCycler = (mediaItems, layerRef) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [mediaStartTime, setMediaStartTime] = useState(Date.now());
    const [isCycling, setIsCycling] = useState(true);

    const currentMedia = mediaItems[currentMediaIndex];
    const videoElement = useVideoElement(
      currentMedia?.mediaType === "video" ? currentMedia.mediaSrc : null,
      layerRef
    );

    useEffect(() => {
      if (mediaItems.length === 0 || !layerRef.current) return;
      const mediaDuration = currentMedia?.appearanceTime * 1000 || 0;

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

      const intervalId = setInterval(() => {
        const elapsedTime = Date.now() - mediaStartTime;
        if (elapsedTime >= mediaDuration) {
          setCurrentMediaIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % mediaItems.length;
            setMediaStartTime(Date.now());

            // Pause the current video
            if (
              currentMedia?.mediaType === "video" &&
              videoElement instanceof HTMLVideoElement
            ) {
              videoElement.pause();
              videoElement.currentTime = 0;
            }

            // Play the next video if the next media is a video
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
    }, [mediaItems, currentMediaIndex, mediaStartTime, videoElement, layerRef]);

    return { currentMediaIndex, isCycling, videoElement };
  };

  // Custom hook to manage media cycling end

  // Use effect to start recording when component mounts start
  useEffect(() => {
    if (totalDuration === 0) return;

    console.log("totalDuration in useffect : ", totalDuration);
    setProgress(0);
    setStartTime(Date.now());

    const canvas = layoutRef.current.querySelector("canvas");
    if (!canvas) return;

    const stream = canvas.captureStream();
    const mediaRecorder = new MediaRecorder(stream);
    recordedChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
        console.log("WebM chunk recorded", event.data);
      }
    };

    mediaRecorder.start();

    // Stop recording after the calculated total duration
    const recordingDuration = totalDuration * 1000; // Convert to milliseconds
    setTimeout(() => {
      mediaRecorder.stop();
    }, recordingDuration);

    const intervalId = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const progressPercentage = Math.min(
        (elapsedTime / totalDuration) * 100,
        100
      );
      setProgress(progressPercentage);

      if (progressPercentage >= 100) {
        clearInterval(intervalId);
      }
    }, 100);

    return () => {
      clearInterval(intervalId);
      mediaRecorder.stop();
    };
  }, [totalDuration]);

  // Use effect to start recording when component mounts end

  // Update the handleDownload function to download recorded video start

  // const ffmpegRef = useRef(new FFmpeg());

  const handleDownloadAsWebM = async () => {
    if (recordedChunksRef.current.length === 0) {
      alert("No recording available to download!");
      return;
    }

    try {
      // Save as WebM
      const webmBlob = new Blob(recordedChunksRef.current, {
        type: "video/webm",
      });

      // console.log(WebM Blob size: ${webmBlob.size} bytes);
      if (webmBlob.size === 0) {
        throw new Error("Recorded WebM Blob is empty. No video was captured.");
      }

      // Create WebM download link
      const webmUrl = URL.createObjectURL(webmBlob);
      const aWebM = document.createElement("a");
      aWebM.href = webmUrl;
      aWebM.download = "canvas-recording.webm"; // Save as .webm
      document.body.appendChild(aWebM);
      aWebM.click();
      document.body.removeChild(aWebM);

      console.log("WebM downloaded successfully.");
    } catch (error) {
      console.error("Error during WebM download:", error);
      alert("An error occurred during the WebM download process.");
    }
  };

  const handleDownloadAsMP4 = async () => {
    if (recordedChunksRef.current.length === 0) {
      alert("No recording available to download!");
      return;
    }

    try {
      // Save as WebM but rename as MP4
      const webmBlob = new Blob(recordedChunksRef.current, {
        type: "video/webm",
      });

      // console.log(`WebM Blob size: ${webmBlob.size} bytes`);
      if (webmBlob.size === 0) {
        throw new Error("Recorded WebM Blob is empty. No video was captured.");
      }

      // Rename WebM Blob as MP4 (this doesn't convert the format)
      const mp4Url = URL.createObjectURL(webmBlob);
      const aMp4 = document.createElement("a");
      aMp4.href = mp4Url;
      aMp4.download = "canvas-recording.mp4"; // Rename extension to .mp4
      document.body.appendChild(aMp4);
      aMp4.click();
      document.body.removeChild(aMp4);

      console.log("MP4 downloaded successfully.");
    } catch (error) {
      console.error("Error during simple WebM rename to MP4:", error);
      alert("An error occurred during the MP4 download process.");
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

                // Log to ensure media items are correct
                {
                  /* console.log("divisionsMedia[index]:", divisionsMedia[index]); */
                }

                const { currentMediaIndex, isCycling, videoElement } =
                  useMediaCycler(mediaItems, layerRef);

                const currentMedia = mediaItems[currentMediaIndex];
                {
                  /* console.log("currentMedia:", currentMedia); // Log current media */
                }

                const [image] = useImage(currentMedia?.mediaSrc, "anonymous");

                return (
                  <React.Fragment key={index}>
                    {isCycling && (
                      <Image
                        image={
                          currentMedia?.mediaType === "video"
                            ? videoElement
                            : image
                        } // Use videoElement if it's a video, otherwise use image
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

        {/* Download buttons */}
        <button
          className="px-2 py-1 bg-blue-500 hover:bg-blue-700 text-white cursor-pointer rounded mb-2"
          onClick={handleDownloadAsWebM}
        >
          Download as WebM
        </button>
        <button
          className="px-2 py-1 bg-green-500 hover:bg-green-700 text-white cursor-pointer rounded"
          onClick={handleDownloadAsMP4}
        >
          Download as MP4
        </button>
      </div>
    </div>
  );
};

export default Preview;
