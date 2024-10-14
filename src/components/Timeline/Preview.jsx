import React, { useState, useEffect, useRef, useContext } from "react";
import { Stage, Rect, Layer, Image } from "react-konva";
import useImage from "use-image";
// import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile /*toBlobURL*/ } from "@ffmpeg/util";
import { AiOutlineClose } from "react-icons/ai";
import { RiVideoDownloadFill } from "react-icons/ri";
import { FaPlayCircle } from "react-icons/fa";
import { getFFmpegInstance } from "../../utils/ffmpegSingleton";
import Login from "./Login";
import { getToken } from "../../services/localStorage";
import { PlaylistContext } from "../../App";

// Utility function to convert seconds to MM:SS format
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

const Preview = ({ layout, onClose, divisionsMedia = {} }) => {
  // for api authentication start
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [ffmpegInstance, setFfmpegInstance] = useState(null); // Add state

  // i want to chnage code for download button disable
  const [isDownloading, setIsDownloading] = useState(false); // Add this line
  const [isUploading, setisUploading] = useState(false); // Add this line
  const [isPlaying, setIsPlaying] = useState(false); // New state for play button

  // for api upload video playlistname start
  const { playlistName } = useContext(PlaylistContext) || {};
  const videoName = playlistName?.trim() || `default-playlist-${Date.now()}`;
  // for api upload video playlistname end
  // for api authentication end

  const resolutionMap = {
    hd: { width: 1280, height: 720 },
    fullhd: { width: 1920, height: 1080 },
    fourk: { width: 3840, height: 2160 },
    Vhd: { width: 720, height: 1280 },
    Vfullhd: { width: 1080, height: 1920 },
    Vfourk: { width: 2160, height: 3840 },
  };

  const selectedResolution = layout.resolution || "hd"; // Default to full HD
  //  i want to change in code for v orientation
  const { width: layoutWidth, height: layoutHeight } =
    resolutionMap[selectedResolution];

  // play layout again code start
  const handlePlay = () => {
    if (isPlaying) return;

    setIsPlaying(true);
    setStartTime(Date.now());
    setProgress(0);
    setShouldStopCycling(false);
    // Automatically stop cycling when progress bar reaches 100%
    setTimeout(() => {
      setShouldStopCycling(true);
      setIsPlaying(false);
    }, totalDuration * 1000);
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

  // const ffmpegRef = useRef(new FFmpeg());

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    let ffmpeg = ffmpegInstance;
    if (!ffmpeg) {
      ffmpeg = await getFFmpegInstance();
      setFfmpegInstance(ffmpeg); // Save FFmpeg instance for future use
    }

    if (recordedChunksRef.current.length === 0) {
      alert("No recording available to download!");
      setIsDownloading(false);
      return;
    }

    try {
      console.log("Creating WebM Blob from recorded chunks...");
      const webmBlob = new Blob(recordedChunksRef.current, {
        type: "video/webm",
      });

      console.log(`WebM Blob created, size: ${webmBlob.size} bytes`);

      const webmData = await fetchFile(webmBlob);
      await ffmpeg.writeFile("input.webm", webmData);

      const videoElement = document.createElement("video");
      videoElement.src = URL.createObjectURL(webmBlob);

      console.log("Starting FFmpeg transcode from WebM to MP4...");
      await ffmpeg.exec([
        "-i",
        "input.webm",
        "-vf",
        `scale=${
          layout.orientation === "vertical"
            ? `${layoutHeight}:${layoutWidth}`
            : `${layoutWidth}:${layoutHeight}`
        }`,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "30",
        "-preset",
        "ultrafast",
        "-movflags",
        "faststart",
        "output.mp4",
      ]);

      const mp4Data = await ffmpeg.readFile("output.mp4");
      const mp4Blob = new Blob([mp4Data.buffer], { type: "video/mp4" });
      const mp4Url = URL.createObjectURL(mp4Blob);

      const aMp4 = document.createElement("a");
      aMp4.href = mp4Url;
      aMp4.download = "canvas-recording.mp4";
      document.body.appendChild(aMp4);
      aMp4.click();
      document.body.removeChild(aMp4);

      console.log("MP4 download triggered successfully.");
      recordedChunksRef.current = [];
    } catch (error) {
      console.error("Error during transcoding:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveAndOpenVideo = async () => {
    if (isUploading) return;
    setisUploading(true);

    const token = getToken(); // Fetch token from localStorage
    if (!token) {
      setShowLogin(true);
      setisUploading(false);
      return;
    }

    try {
      // Check if recording exists
      if (recordedChunksRef.current.length === 0) {
        alert("No recording available to upload!");
        setisUploading(false);
        return;
      }

      console.log("Creating WebM Blob from recorded chunks...");
      const webmBlob = new Blob(recordedChunksRef.current, {
        type: "video/webm",
      });

      let ffmpeg = ffmpegInstance;
      if (!ffmpeg) {
        ffmpeg = await getFFmpegInstance();
        setFfmpegInstance(ffmpeg); // Save FFmpeg instance for future use
      }

      const webmData = await fetchFile(webmBlob);
      await ffmpeg.writeFile("input.webm", webmData);

      // Transcode the WebM file to MP4 using FFmpeg
      await ffmpeg.exec([
        "-i",
        "input.webm",
        "-vf",
        `scale=${
          layout.orientation === "vertical"
            ? `${layoutHeight}:${layoutWidth}`
            : `${layoutWidth}:${layoutHeight}`
        }`,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-crf",
        "30",
        "-preset",
        "ultrafast",
        "-movflags",
        "faststart",
        "output.mp4",
      ]);

      const mp4Data = await ffmpeg.readFile("output.mp4");
      const mp4Blob = new Blob([mp4Data.buffer], { type: "video/mp4" });
      const fileSize = mp4Blob.size;
      const fileName = `${videoName || "default-video"}.mp4`;
      let w = 0,
        h = 0;

      const videoElement = document.createElement("video");
      videoElement.src = URL.createObjectURL(mp4Blob);
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = () => {
          w = videoElement.videoWidth;
          h = videoElement.videoHeight;
          resolve();
        };
      });

      const newFile = {
        width: w,
        height: h,
        src: "",
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        rotation: 0,
        animation: null,
        draggable: true,
        type: "video",
        name: fileName,
        // id: Date.now(),
      };

      console.log("newFile :>>>", newFile);
      const fileJSONString = JSON.stringify(newFile);
      const fileJSON = new Blob([fileJSONString], {
        type: "application/json",
      });

      // Creating the form data to upload
      const formData = new FormData();
      formData.append("file", mp4Blob, fileName); // Video file
      formData.append("file_size", fileSize); // Size of the file
      formData.append("file_json", fileJSON, "file-json.json"); // File JSON metadata
      formData.append("name", fileName); // Dummy name if not present

      console.log("fileName :>>>>> ", fileName);
      // Perform the upload request to your server
      const uploadResponse = await fetch(
        "https://dev.app.hd2.menu/api/files/store",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Token from localStorage
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload failed response:", errorText);
        throw new Error("File upload failed: " + errorText);
      }

      const uploadResult = await uploadResponse.json(); // Parse response
      console.log("Upload Result:", uploadResult);

      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error in uploading file:", error);
      alert("Error in uploading file");
    } finally {
      setisUploading(false); // Re-enable the save button after upload
    }
  };

  // Update the handleDownload function to download recorded video end

  // startRecording useEffect
  useEffect(() => {
    const startRecording = () => {
      const canvas = layoutRef.current.querySelector("canvas");
      if (!canvas) return;

      // Get browser capabilities start
      const videoCapabilities =
        navigator.mediaDevices.getSupportedConstraints();

      let canvasWidth = layoutWidth;
      let canvasHeight = layoutHeight;

      // Handle vertical orientation by swapping width and height
      if (layout.orientation === "vertical") {
        canvasWidth = layoutHeight; // Swap width with height
        canvasHeight = layoutWidth; // Swap height with width
      }

      // Check if browser supports 4K or necessary resolutions
      if (
        canvasWidth >= 3840 &&
        canvasHeight >= 2160 &&
        videoCapabilities.width &&
        videoCapabilities.height
      ) {
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

      const ctx = canvas.getContext("2d");

      // Set background color to white for the recording
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight); // Adjust canvas size based on orientation

      const stream = canvas.captureStream();
      const mediaRecorder = new MediaRecorder(stream);
      recordedChunksRef.current = []; // Reset recorded chunks

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();

      // const recordingDuration = totalDuration * 1000; // Convert total duration to milliseconds
      const bufferDuration = 200; // 1 second buffer for recording

      setTimeout(() => {
        mediaRecorder.stop();
      }, totalDuration * 1000 + bufferDuration); // Ensure the recording stops exactly at the total duration

      // Clean up function when component unmounts
      return () => {
        mediaRecorder.stop();
      };
    };

    // console.log("debug totalDuration : ", totalDuration);
    if (totalDuration > 0) {
      startRecording(); // Start recording as soon as the total duration is set
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
        // console.log("No videoSrc provided");
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

  // for layout orientation for h or v
  const scaleX = layoutWidth / 400; // Calculate scaling factor for width
  const scaleY = layoutHeight / 300; // Calculate scaling factor for height
  const extraPadding = 130; // Add padding to fit the icons/buttons

  // Modify layout dimensions based on orientation
  let modifiedLayoutWidth = layoutWidth;
  let modifiedLayoutHeight = layoutHeight;

  // If the layout is in vertical orientation, swap the width and height
  if (layout.orientation === "vertical") {
    modifiedLayoutWidth = layoutHeight;
    modifiedLayoutHeight = layoutWidth;
  }

  // i want to apply zoom in and out for resolution 720

  useEffect(() => {
    // Check for resolution and apply zoom based on the orientation and selected resolution
    if (layout.orientation === "vertical") {
      if (selectedResolution === "hd") {
        // alert("Vhd V orientation");
        document.body.style.zoom = "40%"; // Apply 50% zoom for vertical 720p layout
      } else if (selectedResolution === "fullhd") {
        document.body.style.zoom = "27%"; // Apply 50% zoom for vertical 1080p layout
      } else if (selectedResolution === "fourk") {
        document.body.style.zoom = "13%"; // Apply 50% zoom for vertical 4K layout
      }
    } else {
      // For horizontal layouts, keep the original zoom logic
      if (selectedResolution === "hd") {
        document.body.style.zoom = "67%"; // Set zoom to 67% for horizontal 720p
      } else if (selectedResolution === "fullhd") {
        document.body.style.zoom = "45%"; // Set zoom to 45% for horizontal 1080p
      } else if (selectedResolution === "fourk") {
        document.body.style.zoom = "22%"; // Set zoom to 22% for horizontal 4K
      }
    }

    // Clean up function to reset the zoom when the component is unmounted
    return () => {
      document.body.style.zoom = "100%"; // Reset zoom to 100% on popup close
    };
  }, [selectedResolution, layout.orientation]); // Run this effect when the resolution or orientation changes

  useEffect(() => {
    return () => {
      if (layoutRef.current) {
        const canvas = layoutRef.current.querySelector("canvas");
        if (canvas) {
          const context = canvas.getContext("2d");
          context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
          canvas.width = 0; // Release the canvas memory
          canvas.height = 0;
        }
      }
    };
  }, []);

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
          width: modifiedLayoutWidth + extraPadding + "px",
          height: modifiedLayoutHeight + extraPadding + "px",
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
              className={`w-15 h-15 bg-green-500 px-4 py-2 ${
                isPlaying
                  ? "cursor-not-allowed bg-gray-400" // Show disabled cursor and gray background
                  : "hover:bg-green-600 cursor-pointer"
              } text-white rounded`}
              onClick={handlePlay}
              disabled={isPlaying} // Disable the button when the video is playing
            >
              <FaPlayCircle className="text-3xl" />
            </button>

            <button
              className={`w-15 h-15 px-4 py-2 ${
                isDownloading
                  ? "bg-gray-400 cursor-not-allowed" // Change cursor to 'not-allowed' when downloading
                  : "bg-blue-500 hover:bg-blue-700 cursor-pointer"
              } text-white rounded`}
              onClick={handleDownload}
              disabled={isDownloading} // Disable the button when downloading
            >
              <RiVideoDownloadFill className="text-3xl" />
            </button>

            <button
              onClick={handleSaveAndOpenVideo}
              className={`w-15 h-15 px-4 py-2 ${
                isUploading
                  ? "bg-gray-400 cursor-not-allowed" // Change cursor to 'not-allowed' when uploading
                  : "bg-blue-500 hover:bg-blue-700 cursor-pointer"
              } text-white rounded`}
              disabled={isUploading} // Disable the button when uploading
            >
              <p className="text-xl">save</p>
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
            width={
              layout.orientation === "vertical" ? layoutHeight : layoutWidth
            } // Swap for vertical
            height={
              layout.orientation === "vertical" ? layoutWidth : layoutHeight
            } // Swap for vertical
            style={{ border: "3px solid black", backgroundColor: "white" }}
          >
            <Layer ref={layerRef}>
              <Rect
                x={0}
                y={0}
                width={
                  layout.orientation === "vertical" ? layoutHeight : layoutWidth
                } // Swap for vertical
                height={
                  layout.orientation === "vertical" ? layoutWidth : layoutHeight
                } // Swap for vertical
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

                let divisionX = d?.x * scaleX;
                let divisionY = d?.y * scaleY;
                let divisionWidth = d?.width * scaleX;
                let divisionHeight = d?.height * scaleY;

                // Swap width and height if layout is in vertical orientation
                if (layout.orientation === "vertical") {
                  divisionX = d?.y * scaleY; // Swap X and Y positions
                  divisionY = d?.x * scaleX;
                  divisionWidth = d?.height * scaleY; // Swap width and height
                  divisionHeight = d?.width * scaleX;
                }

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
                        x={divisionX} // Use modified x
                        y={divisionY} // Use modified y
                        width={divisionWidth} // Use modified width
                        height={divisionHeight} // Use modified height
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

          {showLogin && (
            <Login
              onLogin={() => {
                setIsLoggedIn(true);
                setShowLogin(false); // Close the login modal after successful login
                handleSaveAndOpenVideo(); // Retry save after login
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Preview;
