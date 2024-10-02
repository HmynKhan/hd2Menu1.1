import React, { useState, useEffect, useRef } from "react";
import { Stage, Rect, Layer, Image } from "react-konva";
import useImage from "use-image";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { AiOutlineClose } from "react-icons/ai";
import { RiVideoDownloadFill } from "react-icons/ri";
import { FaPlayCircle } from "react-icons/fa";

// 860762
// Utility function to convert seconds to MM:SS format
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

const Preview = ({ layout, onClose, divisionsMedia = {} }) => {
  const resolutionMap = {
    hd: { width: 1280, height: 720 },
    fullhd: { width: 1920, height: 1080 },
    fourk: { width: 3840, height: 2160 },
  };

  const selectedResolution = layout.resolution || "fullhd"; // Default to full HD
  const { width: layoutWidth, height: layoutHeight } =
    resolutionMap[selectedResolution];

  // play layout again code start
  const handlePlay = () => {
    setStartTime(Date.now()); // Reset the timer
    setProgress(0); // Reset the progress bar
    setShouldStopCycling(false); // Reset cycling globally
    setTimeout(() => setShouldStopCycling(true), totalDuration * 1000); // Automatically stop cycling when progress bar reaches 100%
  };

  // play layout again code end
  const layoutRef = useRef(null);
  const layerRef = useRef(null);

  // in division pause media looping
  const [shouldStopCycling, setShouldStopCycling] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  // Store recorded chunks in a ref to be accessed later
  const recordedChunksRef = useRef([]);

  // video resolution code start

  // video resolution code end
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

  // console.log("totalDuration in review : ", totalDuration);
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
  // now again we change in usemediacycle

  // i want to change
  const useMediaCycler = (
    mediaItems,
    layerRef,
    divisionShouldStopCycling,
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
      // Stop cycling if global or division-specific cycling should stop
      if (
        mediaItems.length === 0 ||
        !layerRef.current ||
        divisionShouldStopCycling ||
        shouldStopCycling
      ) {
        setIsCycling(false);
        return;
      }

      // Get the appearance time (duration) of the current media, or default to 3000ms if undefined
      const mediaDuration = currentMedia?.appearanceTime * 1000 || 3000;

      // Play video if the media is of type 'video'
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

      // Set a timeout for switching to the next media item after the appearance time
      const mediaChangeTimeout = setTimeout(() => {
        setCurrentMediaIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % mediaItems.length; // Loop through media items
          setMediaStartTime(Date.now()); // Reset media start time

          // Reset and pause video if it's a video type media
          if (
            currentMedia?.mediaType === "video" &&
            videoElement instanceof HTMLVideoElement
          ) {
            videoElement.pause();
            videoElement.currentTime = 0; // Reset video to the beginning
          }

          return nextIndex;
        });
      }, mediaDuration); // <-- This ensures each media respects its `appearanceTime`

      return () => {
        clearTimeout(mediaChangeTimeout);
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
      divisionShouldStopCycling,
      shouldStopCycling,
    ]);

    return { currentMediaIndex, isCycling, videoElement };
  };

  // Custom hook to manage media cycling end

  // Update the handleDownload function to download recorded video start

  const ffmpegRef = useRef(new FFmpeg());

  const handleDownload = async () => {
    const ffmpeg = ffmpegRef.current;

    if (!ffmpegLoaded) {
      const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
      try {
        console.log("Loading FFmpeg multi-threaded version...");
        // Load FFmpeg using provided URL
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
      } catch (error) {
        console.error("Error loading FFmpeg:", error);
        alert("Failed to load FFmpeg.");
        return;
      }
    }

    // Check if any recorded chunks are available
    if (recordedChunksRef.current.length === 0) {
      alert("No recording available to download!");
      return;
    }

    try {
      // Create WebM Blob from recorded chunks
      console.log("Creating WebM Blob from recorded chunks...");
      const webmBlob = new Blob(recordedChunksRef.current, {
        type: "video/webm",
      });
      console.log(`WebM Blob created, size: ${webmBlob.size} bytes`);

      if (webmBlob.size === 0) {
        throw new Error("Recorded WebM Blob is empty. No video was captured.");
      }

      // Write WebM data to FFmpeg's virtual file system
      console.log("Writing WebM file to FFmpeg...");
      const webmData = await fetchFile(webmBlob);
      // const webmData = await fetchFile(
      //   "https://raw.githubusercontent.com/ffmpegwasm/testdata/master/Big_Buck_Bunny_180_10s.webm"
      // );

      await ffmpeg.writeFile("input.webm", webmData);

      // Transcode WebM to MP4 using the selected resolution
      console.log("Starting FFmpeg transcode from WebM to MP4...");
      // await ffmpeg.exec([
      //   "-i",
      //   "input.webm",
      //   "-vf",
      //   `scale=${layoutWidth}:${layoutHeight}`,
      //   // ,format=yuv420p`, // Ensure scaling and color format are handled correctly
      //   "-c:v",
      //   "libx264", // Better codec for MP4 encoding
      //   "-crf",
      //   "23", // Quality factor (lower = better quality)
      //   "-preset",
      //   "fast", // Faster encoding for testing
      //   "output.mp4",
      // ]);

      await ffmpeg.exec([
        "-i",
        "input.webm",
        "-vf",
        `scale=${layoutWidth}:${layoutHeight}`,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p", // Ensure YUV color format
        "-crf",
        "23",
        "-preset",
        "fast",
        "-movflags",
        "faststart",
        "output.mp4",
      ]);

      //  `scale=${layoutWidth}:${layoutHeight}`, // Scaling based on layout dimensions

      // Read the resulting MP4 file
      const mp4Data = await ffmpeg.readFile("output.mp4");
      console.log("MP4 file generated, size:", mp4Data.length);

      // Create MP4 Blob and download it
      const mp4Blob = new Blob([mp4Data.buffer], { type: "video/mp4" });
      const mp4Url = URL.createObjectURL(mp4Blob);

      const aMp4 = document.createElement("a");
      aMp4.href = mp4Url;
      aMp4.download = "canvas-recording.mp4";
      document.body.appendChild(aMp4);
      aMp4.click();
      document.body.removeChild(aMp4);

      console.log("MP4 download triggered successfully.");

      ffmpeg.exit(); // Free up memory by unloading FFmpeg
    } catch (error) {
      console.error("Error during transcoding:", error);
      alert("An error occurred during the conversion process.");
    }

    // ffmpeg.exit();
  };

  // Update the handleDownload function to download recorded video end

  // Use effect to start recording when component mounts start
  // for high memory usage
  useEffect(() => {
    if (!ffmpegLoaded) {
      const loadFFmpeg = async () => {
        const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
        const ffmpeg = ffmpegRef.current;

        // Set up log event
        ffmpeg.on("log", ({ message }) => {
          console.log(`[FFmpeg] ${message}`);
        });

        try {
          console.log("Loading FFmpeg in the background...");
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
        } catch (error) {
          console.error("Error loading FFmpeg:", error);
        }
      };

      loadFFmpeg();
    }
  }, [ffmpegLoaded]); // Load FFmpeg in the background

  useEffect(() => {
    const startRecording = () => {
      const canvas = layoutRef.current.querySelector("canvas");
      if (!canvas) return;

      // Get browser capabilities start
      const videoCapabilities =
        navigator.mediaDevices.getSupportedConstraints();

      if (
        layoutWidth >= 3840 &&
        layoutHeight >= 2160 &&
        videoCapabilities.width &&
        videoCapabilities.height
      ) {
        // Check if browser supports 4K
        if (
          !videoCapabilities.width.max ||
          !videoCapabilities.height.max ||
          videoCapabilities.width.max < 3840 ||
          videoCapabilities.height.max < 2160
        ) {
          alert(
            "Your browser does not support recording video at 4K resolution."
          );
          return;
        }
      }

      // Get browser capabilities end

      const ctx = canvas.getContext("2d");

      // Set background color to white
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const stream = canvas.captureStream();
      const mediaRecorder = new MediaRecorder(stream);
      recordedChunksRef.current = []; // Reset recorded chunks

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
          console.log("WebM chunk recorded", event.data);
        }
      };

      console.log("Starting media recording immediately");
      mediaRecorder.start();

      // Stop recording after the total duration of all divisions + buffer
      const recordingDuration = totalDuration * 1000; // Convert to milliseconds
      const bufferDuration = 250; // 1 second buffer

      setTimeout(() => {
        mediaRecorder.stop();
      }, recordingDuration + bufferDuration); // Add buffer to recording duration

      console.log(
        "recordingDuration in canva recorder (with buffer):",
        recordingDuration + bufferDuration
      );

      // Clean up when component unmounts
      return () => {
        mediaRecorder.stop();
      };
    };

    if (totalDuration > 0) {
      startRecording(); // Start recording right away
    }
  }, [totalDuration]);

  // Use effect to start recording when component mounts end

  // to render video in canva start

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
          videoRef.current.pause(); // Stop video playback
          videoRef.current.src = ""; // Remove the video source
        }
      };
    }, [videoSrc]);

    return imageElement; // Return the canvas element for use in Konva
  };
  // to render video in canva end

  // for heavy memory usage
  const scaleX = layoutWidth / 400; // Calculate scaling factor for width
  const scaleY = layoutHeight / 300; // Calculate scaling factor for height
  const extraPadding = 130; // Add padding to fit the icons/buttons

  // i want to apply zoom in and out for resolution 720

  useEffect(() => {
    // Check if the resolution is 720p and apply the zoom level accordingly
    if (selectedResolution === "hd") {
      document.body.style.zoom = "67%"; // Set zoom to 67% when previewing 720p
    } else if (selectedResolution === "fullhd") {
      document.body.style.zoom = "45%"; // Set zoom to 67% when previewing 720p
    } else if (selectedResolution === "fourk") {
      document.body.style.zoom = "22%"; // Set zoom to 67% when previewing 720p
    }

    // Clean up function to reset the zoom when the component is unmounted
    return () => {
      document.body.style.zoom = "100%"; // Reset zoom to 100% on popup close
    };
  }, [selectedResolution]); // Run this effect when the resolution changes

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center", // Vertically center
        width: "100%", // Take full width of the screen
        height: "100%", // Take full height of the screen
      }}
    >
      <div
        className="bg-white p-5  rounded"
        style={{
          width: layoutWidth + extraPadding + "px",
          height: layoutHeight + extraPadding + "px",
          backgroundColor: "#F3E5AB",
        }}
        // style={{ paddingBottom: "20px", backgroundColor: "skyblue" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h1
            className="text-2xl font-bold"
            style={{
              position: "relative", // Absolute positioning relative to the pop-up container
              top: "10px", // Adjust distance from the top
              left: "45px", // Adjust distance from the left
              margin: 0, // Remove any default margin
            }}
          >
            Preview layout: {layout.name}
          </h1>

          <div
            className="ml-auto flex items-center space-x-2"
            style={{ marginRight: "43px" }}
          >
            <button
              className="w-15 h-15 bg-green-500 px-4 py-2 hover:bg-green-600 text-white cursor-pointer rounded"
              onClick={handlePlay}
            >
              <FaPlayCircle className="text-3xl" />
            </button>
            <button
              className="w-15 h-15 px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white cursor-pointer rounded"
              onClick={handleDownload}
            >
              <RiVideoDownloadFill className="text-3xl" />
            </button>

            <button
              onClick={() => {
                document.body.style.zoom = "100%"; // Reset zoom to 100% on close
                onClose(); // Call the existing onClose prop function to handle the rest of the closing logic
              }}
              className="w-15 h-15 bg-red-500 px-4 py-2 hover:bg-red-600 cursor-pointer rounded-md text-white"
            >
              <AiOutlineClose className="text-3xl" />
            </button>
          </div>
        </div>

        <div
          ref={layoutRef}
          className="flex items-center justify-center mb-2 flex-col gap-1"
        >
          <Stage
            width={layoutWidth}
            height={layoutHeight}
            style={{ border: "3px solid black", backgroundColor: "white" }} // Add background color
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

                const [isCycling, setIsCycling] = useState(true); // Start with cycling
                {
                  /* console.log(`Cycling state for division ${index}:`, isCycling); // Debugging */
                }

                // Ensure cycling resets when Play button is pressed
                useEffect(() => {
                  // Reset cycling when Play is triggered
                  setIsCycling(true);

                  // Stop cycling either when total progress finishes or individual division media finishes
                  if (shouldStopCycling) {
                    setIsCycling(false);
                  }
                }, [shouldStopCycling, startTime]); // Trigger this effect when Play is clicked or global cycling should stop

                useEffect(() => {
                  const divisionStartTime = Date.now();
                  const divisionInterval = setInterval(() => {
                    const elapsedDivisionTime =
                      (Date.now() - divisionStartTime) / 1000;
                    if (elapsedDivisionTime >= divisionTotalDuration) {
                      setIsCycling(false); // Stop cycling after duration ends
                      clearInterval(divisionInterval);
                    }
                  }, 100);

                  return () => clearInterval(divisionInterval);
                }, [divisionTotalDuration]);

                const { currentMediaIndex, videoElement } = useMediaCycler(
                  mediaItems,
                  layerRef,
                  !isCycling, // Pass this to handle cycling
                  divisionTotalDuration
                );

                const currentMedia = mediaItems[currentMediaIndex];
                const [image] = useImage(currentMedia?.mediaSrc, "anonymous");

                return (
                  <React.Fragment key={index}>
                    {isCycling && (
                      <Image
                        className="border-2 border-black"
                        image={
                          currentMedia?.mediaType === "video"
                            ? videoElement
                            : image
                        }
                        crossOrigin="anonymous"
                        x={d?.x * scaleX}
                        y={d?.y * scaleY}
                        width={d?.width * scaleX}
                        height={d?.height * scaleY}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </Layer>
          </Stage>

          {/* Progress bar */}
          <div className="relative w-full mb-4 flex justify-center items-center">
            <div className="bg-gray-300 h-2 rounded" style={{ width: "85%" }}>
              <div
                className="bg-green-500 h-full rounded"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {/* Display current time / total duration at the end */}
            <span
              className="text-base ml-2 text-center font-extrabold"
              style={{ whiteSpace: "nowrap" }}
            >
              {formatTime((progress / 100) * totalDuration)} /{" "}
              {formatTime(totalDuration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
